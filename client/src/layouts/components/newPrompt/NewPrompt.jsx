import { useEffect, useMemo, useRef } from "react";
import "./newPrompt.css";
import { useState } from "react";
import { IKImage } from "imagekitio-react";
import Upload from "../upLoad/UpLoad.jsx";
// import model from "../../../lib/gemini.js";
import { geminiFlash, geminiPro, modelConfig } from "../../../lib/gemini.js";
import { deepSeekChat, deepSeekConfig } from "../../../lib/deepseek.js";
import Markdown from "react-markdown";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Select, Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import { GenerativeModel } from "@google/generative-ai";
import { DeepSeekModel } from "../../../lib/deepseek.js";
import { ai } from "../../../lib/newGemini.js";
// 定义模型接口
const NewPrompt = ({ data }) => {
  const [img, setImg] = useState({
    isLoading: false,
    error: "",
    dbData: {},
    aiData: {},
  });

  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false); //对话加载状态

  const [selectedModel, setSelectedModel] = useState("gemini-pro"); // 模型选择

  const endRef = useRef(null);
  const formRef = useRef(null);
  const currentChatRef = useRef(null);

  useEffect(() => {
    endRef.current.scrollIntoView({ behavior: "smooth" });
  }, [data, question, answer, img.dbData]);

  const chat = useMemo(() => {
    // 选择对应的模型
    let selectedModelInstance;
    switch (selectedModel) {
      case "gemini-pro":
        selectedModelInstance = geminiPro;
        break;
      case "gemini-flash":
        selectedModelInstance = geminiFlash;
        break;
      case "deepseek":
        selectedModelInstance = deepSeekChat;
        console.log("使用了deepseek模型");
        break;
      default:
        selectedModelInstance = geminiPro;
    }
    // 保存当前聊天实例引用
    currentChatRef.current = selectedModelInstance;
    // 将配置好的模型返回
    return selectedModelInstance.startChat({
      history: data?.history.map(({ role, parts }) => ({
        role,
        parts: [{ text: parts[0].text }],
      })),
      generationConfig: {
        // maxOutputTokens: 100,
      },
    });
  }, [selectedModel, data?.history]);
  
  const handleChange = (value) => {
    console.log(`selected ${value}`);
    setSelectedModel(value);
  };
  const handleOnSubmit = async (e) => {
    e.preventDefault();

    const text = e.target.text.value;
    if (!text) return;

    add(text, false);
  };

  // 添加取消请求的函数
  const cancelRequest = async () => {
    if (currentChatRef.current && currentChatRef.current.cancelRequest) {
      try {
        await currentChatRef.current.cancelRequest();
        setIsChatLoading(false);
        console.log("请求已取消");
      } catch (error) {
        console.error("取消请求时出错:", error);
      }
    }
  };
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async () => {
      return fetch(`${import.meta.env.VITE_API_URL}/api/chat/${data._id}`, {
        method: "PUT",
        credentials: "include", // 让浏览器在请求时自动携带cookie
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: question.length ? question : undefined,
          answer,
          img: img.dbData?.filePath || undefined,
        }),
      }).then((res) => res.json());
    },
    onSuccess: () => {
      // Invalidate and refetch
      queryClient
        .invalidateQueries({ queryKey: ["chat", data._id] })
        .then(() => {
          setQuestion("");
          setAnswer("");
          setIsChatLoading(false);
          setImg({
            isLoading: false,
            error: "",
            dbData: {},
            aiData: {},
          });
          formRef.current.reset();
        });
    },
    onError: (err) => {
      console.log(err);
      setIsChatLoading(false);
    },
  });
  const add = async (text, isInitial) => {
    try {
      if (!isInitial) setQuestion(text);
      setIsChatLoading(true);
      const result = await chat.sendMessageStream(
        Object.entries(img.aiData).length ? [img.aiData, text] : [text]
      );

      // Print text as it comes in.
      let accumulatedText = "";
      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        accumulatedText += chunkText;
        setAnswer(accumulatedText);
      }
      // 延迟一下，确保 setAnswer 渲染完成再调用 mutate（可视化更稳）
      setTimeout(() => {
        mutation.mutate();
      }, 50);
    } catch (error) {
      // 检查是否是用户取消请求
      if (error.message === "Request cancelled by user") {
        console.log("用户取消了请求");
        setAnswer((prev) => prev + "\n\n[请求已被取消]");
      } else {
        console.log(error);
      }
      setIsChatLoading(false);
    }
  };
  const hasRun = useRef(false);
  useEffect(() => {
    if (!hasRun.current) {
      if (data?.history?.length === 1) {
        add(data?.history[0].parts[0].text, true);
      }
    }
    hasRun.current = true;
  }, []);
  return (
    <>
      {/* ADD NEW CHAT */}
      {img.isLoading && <div className="">Loading...</div>}
      {img.dbData?.filePath && (
        <IKImage
          urlEndpoint={import.meta.env.VITE_IMAGE_KIT_ENDPOINT}
          path={img.dbData?.filePath}
          width="380"
          transformation={[{ width: 380 }]}
        />
      )}
      {question && <div className="message user">{question}</div>}
      {answer && (
        <div className="message">
          <Markdown>{answer}</Markdown>
          <div className="message-actions">
            <button>复制</button>
            {/* <button>最佳回复</button>
            <button>错误回复</button>
            <button>朗读</button>
            <button>在画布中编辑</button>
            <button>共享</button>
            <button>重试</button> */}
          </div>
        </div>
      )}
      <div className="endChat" ref={endRef}></div>

      <form className="newForm" onSubmit={handleOnSubmit} ref={formRef}>
        <Upload setImg={setImg} />
        {/* 模型选择器 */}
        <Select
          defaultValue="gemini-2.5-pro"
          onChange={handleChange}
          style={{ width: 150 }}
          options={[
            {
              label: <span>gemini</span>,
              title: "gemini",
              options: [
                {
                  label: <span>gemini-2.5-flash</span>,
                  value: "gemini-flash",
                },
                {
                  label: <span>gemini-2.5-pro</span>,
                  value: "gemini-pro",
                },
              ],
            },
            {
              label: <span>deepseek</span>,
              title: "deepseek",
              options: [{ label: <span>deepseek</span>, value: "deepseek" }],
            },
          ]}
        />
        <input id="file" type="file" multiple={false} hidden />
        <input
          type="text"
          name="text"
          autoComplete="off"
          placeholder="Ask anything..."
          disabled={isChatLoading} // 在加载时禁用输入
        />
        <button type="submit" disabled={isChatLoading}>
          {isChatLoading ? (
            <Spin indicator={<LoadingOutlined spin />} />
          ) : (
            <img src="/arrow.png" alt="" />
          )}
        </button>

        {/* 添加取消按钮 */}
        {isChatLoading && (
          <button
            type="button"
            onClick={cancelRequest}
            className="cancel-button"
            style={{
              marginLeft: "10px",
              padding: "5px 10px",
              backgroundColor: "#ff4444",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            取消
          </button>
        )}
      </form>
    </>
  );
};
export default NewPrompt;

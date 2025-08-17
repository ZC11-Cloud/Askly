// ChatPage.jsx
import "./chatPage.css";
import NewPrompt from "../../layouts/components/newPrompt/NewPrompt";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "react-router-dom";
import { IKImage } from "imagekitio-react";
import { CopyOutlined, CheckOutlined } from "@ant-design/icons";
import { useState } from "react";
import MarkdownEditor from "../../layouts/components/MarkdownEditor/MarkdownEditor.jsx"; // 添加导入

export const ChatPage = () => {
  const { pathname } = useLocation();
  const chatId = pathname.split("/").pop();
  const { isPending, error, data } = useQuery({
    queryKey: ["chat", chatId],
    queryFn: () =>
      fetch(`${import.meta.env.VITE_API_URL}/api/chat/${chatId}`, {
        credentials: "include",
      }).then((res) => res.json()),
  });
  
  // 复制
  const [copyStates, setCopyStates] = useState({});
  const copyToClipboard = (content, index) => {
    navigator.clipboard.writeText(content);
    setCopyStates((prev) => ({
      ...prev,
      [index]: true,
    }));

    setInterval(() => {
      setCopyStates((prev) => ({
        ...prev,
        [index]: false,
      }));
    }, 2000);
  };

  // 朗读
  const [isSpeaking, setIsSpeaking] = useState(false);
  const speakText = (text) => {
    // 创建朗读对象
    const utterance = new SpeechSynthesisUtterance(text);

    // 设置参数（可选）
    utterance.lang = "zh-CN"; // 中文
    utterance.rate = 1; // 语速 (0.1 ~ 10)
    utterance.pitch = 1; // 音调 (0 ~ 2)
    utterance.volume = 1; // 音量 (0 ~ 1)

    // 开始朗读
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
  };
  
  return (
    <div className="chatPage">
      <div className="wrapper">
        <div className="chat">
          {isPending
            ? "loading"
            : error
            ? "Something went wrong"
            : data?.history.map((item, index) => {
                const text = item.parts[0].text
                  ? String(item.parts[0].text).trim()
                  : "";
                return (
                  <div
                    className={
                      item.role === "user" ? "message user" : "message"
                    }
                    key={index}
                  >
                    {item.img && (
                      <IKImage
                        urlEndpoint={import.meta.env.VITE_IMAGE_KIT_ENDPOINT}
                        path={item.img}
                        height="300"
                        width="400"
                        transformation={[{ height: 300, width: 400 }]}
                        loading="lazy"
                        lqip={{ active: true, quality: 20 }}
                      ></IKImage>
                    )}
                    <div>
                      {/* 使用 MarkdownEditor 替换原来的 Markdown 组件 */}
                      <MarkdownEditor answer={text} readOnly={true} />
                      
                      <div className="message-action">
                        {item.role !== "user" && (
                          <>
                            <button
                              onClick={() => {
                                copyToClipboard(text, index);
                              }}
                            >
                              {copyStates[index] ? (
                                <CheckOutlined />
                              ) : (
                                <CopyOutlined />
                              )}
                            </button>
                            {isSpeaking ? (
                              <button
                                onClick={() => {
                                  stopSpeaking();
                                  setIsSpeaking(false);
                                }}
                              >
                                <i className="iconfont">&#xe60b;</i>
                              </button>
                            ) : (
                              <button
                                onClick={() => {
                                  speakText(text);
                                  setIsSpeaking(true);
                                }}
                              >
                                <i className="iconfont">&#xe60b;</i>
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
          {data && <NewPrompt data={data}></NewPrompt>}
        </div>
      </div>
    </div>
  );
};
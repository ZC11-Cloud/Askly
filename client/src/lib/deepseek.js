// client/src/lib/deepseek.js
import OpenAI from "openai";

// 创建DeepSeek客户端实例
const deepSeekClient = new OpenAI({
  baseURL: 'https://api.deepseek.com/v1',
  apiKey: import.meta.env.VITE_DEEPSEEK_API_KEY,
  dangerouslyAllowBrowser: true
});

// 创建一个包装类来模拟Gemini的接口
class DeepSeekModel {
  constructor(model = "deepseek-chat") {
    this.model = model;
    this.history = [];
  }

  // 模拟Gemini的startChat方法
  startChat(options) {
    if (options.history) {
      // 转换历史记录格式以匹配DeepSeek
      // 将Gemini的角色名称转换为OpenAI的角色名称
      this.history = options.history.map(item => ({
        role: this.convertRole(item.role),
        content: item.parts[0].text
      }));
    }
    return this;
  }

  // 转换角色名称
  convertRole(role) {
    switch (role) {
      case "user":
        return "user";
      case "model":
        return "assistant";
      default:
        return "user";
    }
  }

  // 模拟Gemini的sendMessageStream方法
  async sendMessageStream(messages) {
    try {
      // 准备消息数组
      let currentMessages = [...this.history];

      // 处理不同类型的消息输入
      if (Array.isArray(messages)) {
        if (messages.length > 1 && messages[0].inlineData) {
          // 处理图片和文本混合输入
          const textContent = messages[1];
          currentMessages.push({
            role: "user",
            content: typeof textContent === 'string' ? textContent : textContent.toString()
          });
        } else {
          // 仅文本输入
          const textContent = messages[0];
          currentMessages.push({
            role: "user",
            content: typeof textContent === 'string' ? textContent : textContent.toString()
          });
        }
      } else {
        // 简单字符串输入
        currentMessages.push({
          role: "user",
          content: messages
        });
      }

      // 调用DeepSeek API
      const stream = await deepSeekClient.chat.completions.create({
        model: this.model,
        messages: currentMessages,
        stream: true
      });

      // 直接返回兼容的流格式
      const geminiCompatibleStream = {
        stream: stream  // OpenAI流本身就实现了异步迭代器接口
      };

      // 但我们还需要包装每个chunk以匹配Gemini的接口
      geminiCompatibleStream.stream = {
        [Symbol.asyncIterator]() {
          const iterator = stream[Symbol.asyncIterator]();
          return {
            async next() {
              try {
                const result = await iterator.next();
                if (result.done) {
                  return { done: true };
                }

                const content = result.value.choices[0]?.delta?.content || "";

                return {
                  done: false,
                  value: {
                    text: () => content
                  }
                };
              } catch (error) {
                console.error("Stream processing error:", error);
                return { done: true };
              }
            }
          };
        }
      };

      return geminiCompatibleStream;
    } catch (error) {
      console.error("DeepSeek API Error:", error);
      throw error;
    }
  }
}

// 创建模型实例
const deepSeekChat = new DeepSeekModel("deepseek-chat");

// 导出需要的内容
export { deepSeekClient, deepSeekChat, DeepSeekModel };

// 配置信息
export const deepSeekConfig = {
  name: "deepseek",
  description: "DeepSeek自研的通用大语言模型"
};
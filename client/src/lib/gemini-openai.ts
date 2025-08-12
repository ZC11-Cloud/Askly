import OpenAI from "openai";

// 初始化OpenAI客户端
const openai = new OpenAI({
  apiKey: `${import.meta.env.VITE_GEMINI_API_KEY}`,
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/"
});

export default openai
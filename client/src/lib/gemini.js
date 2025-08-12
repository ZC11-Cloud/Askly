import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
  },
]

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
const geminiFlash = genAI.getGenerativeModel({ model: "gemini-2.5-flash", safetySettings });
const geminiPro = genAI.getGenerativeModel({ model: "gemini-2.5-pro", safetySettings })

const modelConfig = {
  "gemini-2.5-flash": {
    name: "gemini-2.5-flash",
    description: "在性价比方面表现出色的模型，可提供全面的功能"
  },
  "gemini-2.5-pro": {
    name: "gemini-2.5-pro",
    description: "Google旗下最强大的思考模型，回答准确性高，性能出色"
  },
}

export { geminiFlash, geminiPro, modelConfig }
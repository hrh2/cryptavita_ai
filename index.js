const { GoogleGenerativeAI, HarmCategory,HarmBlockThreshold} = require("@google/generative-ai");
require('dotenv').config()

// Access your API key as an environment variable (see "Set up your API key" above)
const genAI = new GoogleGenerativeAI(process.env.API_KEY);
async function run(prompt) {
  try {
    const generationConfig = {
      temperature: 1,
      topP: 0.95,
      topK: 64,
      maxOutputTokens: 8192,
      responseMimeType: "text/plain",
    };
    const safetySettings = [
      {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
    ];
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash",systemInstruction: {
      parts: [
        {text: 'Your mission is to give  infomation about Rwanda.'},
        {text: 'Your mission is to  give Rwanda geoglaphical details.'},
        {text: 'Your mission is to explain Rwandan Climate .'},
      ],
    }});
    
    const textPart = {
      text: `
      User input: ${prompt?prompt:"what can you tell me about Rwanda"}.
      Answer:`,
    };
    
    const request = {
      contents: [{role: 'user', parts: [textPart]}],
    };
    
    const result = await model.generateContent(request,generationConfig,safetySettings);
    const response = await result.response;
    const text = response.text();
    console.log(text);
  } catch (error) {
    if (error instanceof GoogleGenerativeAIResponseError) {
      console.error("Content was blocked due to safety concerns.");
    } else {
      console.error("An unexpected error occurred:", error);
    }
  }
}

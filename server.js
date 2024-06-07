const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require("@google/generative-ai");
require('dotenv').config();
const {localconnection,onlineconnection} =require('./DB/connector')
const {saveMessage} = require('./controllers/Save_update_chat')

// localconnection()
onlineconnection()

const app = express();
const server = http.createServer(app);

const io = socketIo(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
      credentials: true
    }
  });

const genAI = new GoogleGenerativeAI(process.env.API_KEY);

class UserResponse {
  constructor(question, message, Timestamp = new Date()) {
      this.question = question;
      this.message = message;
      this.Timestamp = Timestamp;
  }
}

io.on('connection', (socket) => {
  // console.log('A user connected');
  socket.on('generateContent', async (prompt) => {
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
      const model = genAI.getGenerativeModel({model: "gemini-1.5-flash"});
      const textPart = {
        text: `${prompt.message}.`,
      };
    
      const request = {
        contents: [{ role: 'user', parts: [textPart] }],
      };
      const result = await model.generateContent(request, generationConfig, safetySettings);
      const response = await result.response;
      const text = await response.text();
      const cleanedMessage = text.replace(/\*/g, '');
      const returnMessage = new UserResponse(prompt.message,cleanedMessage)
      saveMessage(prompt.chat_id,prompt.user_id,returnMessage)
      socket.emit('generatedContent', returnMessage);
    } catch (error) {
        socket.emit('generatedContent',new UserResponse(prompt.message,"Check if the internent is stable plz"))
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

server.listen(process.env.PORT || 5000, () => {
  console.log(`Server listening on port ${process.env.PORT||5000}`);
});

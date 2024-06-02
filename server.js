const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require("@google/generative-ai");
require('dotenv').config();

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

// app.use(express.static(__dirname + '/client/build'));

io.on('connection', (socket) => {
  console.log('A user connected');
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

      const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        systemInstruction: {
          parts: [
            { text: 'Your mission is to give information about Rwanda.' },
            { text: 'Your mission is to give Rwanda geographical details.' },
            { text: 'Your mission is to explain Rwandan Climate .' },
          ],
        }
      });

      const textPart = {
        text: `User input: ${prompt ? prompt : "what can you tell me about Rwanda in you Response include in icons where possible"}.\nAnswer:`,
      };

      const request = {
        contents: [{ role: 'user', parts: [textPart] }],
      };

      const result = await model.generateContent(request, generationConfig, safetySettings);
      const response = await result.response;
      const text = await response.text();
     const cleanedText = text.replace(/\*/g, '');
        // console.log(cleanedText);

      
      // Emit the generated text back to the client
      socket.emit('generatedContent', { text: cleanedText, sentByUser: false });
    } catch (error) {
      if (error instanceof GoogleGenerativeAIResponseError) {
        console.error("Content was blocked due to safety concerns.");
        socket.emit('generatedContent', "Content was blocked due to safety concerns.");
      } else {
        console.error("An unexpected error occurred:", error);
        socket.emit('generatedContent', "An unexpected error occurred. Please try again later.");
      }
    }
  });

  socket.on('disconnect', () => {
    // console.log('User disconnected');
  });
});

server.listen(process.env.PORT || 5000, () => {
//   console.log('Server listening on port 5000');
});

const { Chat } = require('../Model/Chat');

async function saveMessage(chatId, userId, message) {
    try {
        let chat = await Chat.findOne({ ChatID: chatId });
        if (chat) {
            chat.Messages.push(message);
        } else {
            chat = new Chat({
                ChatID: chatId,
                userId: userId,
                Messages: [message]
            });
        }
        // Save the chat document
        await chat.save();
        // console.log('Message saved successfully');
    } catch (error) {
        console.error('Error saving message:', error);
        throw new Error(error.message)
    } 
}

// saveMessage(chatId, userId, messageObj);
module.exports={saveMessage}

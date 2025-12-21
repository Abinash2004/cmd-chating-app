import { consumeQueue } from "../config/rabbitmq.js";
import { askQuestion } from "../utils/readline.js";
import { sendDelayed } from "../config/rabbitmq.js";

async function listenOfflineMessages(receiverPort) {
    await consumeQueue(`chat_${receiverPort}`, async (msg) => {
        console.log(`${msg.senderPort} : ${msg.message}`);
    });
}

async function sendDelayMessage(senderPort, receiverPort) {
    const message = await askQuestion("Enter your message: ");
    const delay = await askQuestion("Enter delay in seconds: ");
    
    if (!(/^[1-9]\d*$/.test(delay))) {
        console.error("error: delay must be integer.");
        process.exit(1);
    }
    
    await sendDelayed(`chat_${receiverPort}`,{
        senderPort,
        message: message,
        createdAt: new Date()
    },delay * 1000);
}

export { listenOfflineMessages, sendDelayMessage };
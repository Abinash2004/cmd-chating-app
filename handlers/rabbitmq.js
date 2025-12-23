import { consumeQueue, sendDelayed } from "../config/rabbitmq.js";
import { askQuestion } from "../utils/readline.js";
import { green, blue, error } from "../config/chalk.js";

async function listenOfflineMessages(receiverPort) {
    await consumeQueue(`chat_${receiverPort}`, async (msg) => {
        console.log(`${green(msg.senderUserName)} [${blue(msg.senderPort)}]: ${msg.message}`);
    });
}

async function sendDelayMessage(senderUserName, senderPort, receiverPort) {
    const userMessage = await askQuestion("Enter your message: ");
    const delay = await askQuestion("Enter delay in seconds: ");
    
    if (!(/^[1-9]\d*$/.test(delay))) {
        console.error(`${error("error")}: delay must be integer.`);
        process.exit(1);
    }
    
    await sendDelayed(`chat_${receiverPort}`, {
        senderPort,
        senderUserName,
        message: userMessage,
        createdAt: new Date()
    }, delay * 1000);
}

export { listenOfflineMessages, sendDelayMessage };
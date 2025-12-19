import { consumeQueue } from "../config/rabbitmq.js";

async function listenOfflineMessages(receiverPort) {
    await consumeQueue(`chat_${receiverPort}`, async (msg) => {
        console.log(`${msg.senderPort} (offline message): ${msg.message}`);
    });
}

export { listenOfflineMessages };
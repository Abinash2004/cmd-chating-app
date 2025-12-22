import { httpServer } from "../config/server.js";
import { askQuestion } from "./readline.js";
import { addMessage, getConversation } from "../handlers/mongo.js";
import { requestUserInfo } from "./client.emissions.js";
import { sendToQueue } from "../config/rabbitmq.js";
import { sendDelayMessage } from "../handlers/rabbitmq.js";
import { socketClientConnection } from "../handlers/socket.js";
import { message, error } from "../config/chalk.js";

async function startMessagingInterface(socketClient, senderUsername, senderContactNumber, senderPort, receiverPort) {
    let peerUserName = null;
    let peerContactNumber = null;

    while (true) {
        const isSocketClientConnected = socketClient?.connected === true;
        
        if (isSocketClientConnected && (peerUserName == null || peerContactNumber == null)) {
            const { peerUserName: name, peerContactNumber: number } = await requestUserInfo(socketClient);
            peerUserName = name;
            peerContactNumber = number;
        }

        const inputMessage = await askQuestion("");

        if (inputMessage === "/quit") {
            if (isSocketClientConnected) socketClient.disconnect();
            httpServer.close();
            process.exit(0);
        }
        
        else if (inputMessage === "/past") {
            if (isSocketClientConnected) {
                await getConversation(senderContactNumber, peerContactNumber, peerUserName);
            } else {
                console.log(`${message("message")}: client credentials are missing, client must be offline.`);
            }
        } 
        
        else if (inputMessage === "/switch") {
            if (isSocketClientConnected) socketClient.disconnect();
            socketClientConnection(senderUsername, senderContactNumber, senderPort, null);
            return;
        } 
        
        else if (inputMessage === "/schedule") {
            await sendDelayMessage(senderPort, receiverPort);
            if (isSocketClientConnected) {
                await addMessage(senderContactNumber, peerContactNumber, inputMessage);
            }
        }

        else {
            try {
                if (isSocketClientConnected) {
                    socketClient.emit("message", inputMessage);
                } else {
                    await sendToQueue(`chat_${receiverPort}`, {
                        senderPort,
                        message: inputMessage,
                        createdAt: new Date()
                    });
                    console.log(`${message("message")}: user offline, saved to queue.`);
                }
            } catch (err) {
                console.error(`${error("error")}: ${err.message}`);
            } finally {
                if (isSocketClientConnected) {   
                    await addMessage(senderContactNumber, peerContactNumber, inputMessage);
                }
            }
        }
    }
}

export { startMessagingInterface };
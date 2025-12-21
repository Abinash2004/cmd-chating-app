import { httpServer } from "../config/server.js";
import { askQuestion } from "../utils/readline.js";
import { switchSocketClient } from "../utils/client.switch.js";
import { addMessage, getConversation } from "./mongo.js";
import { requestUserInfo } from "../utils/client.emissions.js";
import { sendToQueue, sendDelayed } from "../config/rabbitmq.js";
import { sendDelayMessage } from "./rabbitmq.js";

function socketServerConnection(socket, userName, contactNumber) {
    const { clientUserName } = socket.handshake.auth;
    console.log(`message: ${clientUserName} connected.`);
    
    socket.on("requestUserInfo", () => {
        socket.emit("userInfo", {userName, contactNumber});
    });
    
    socket.on("message", (message) => {
        console.log(`${clientUserName}: ${message}`);
    });
    
    socket.on("disconnect", () => {
        console.log(`message: ${clientUserName} Disconnected.`);
    });
}

async function socketClientConnection(socketClient, senderUsername, senderContactNumber, senderPort, receiverPort) {
    const { peerUserName, peerContactNumber } = await requestUserInfo(socketClient);
    console.log(`message: your messages will be sent to ${peerUserName}.`);
    while (true) {
        const inputMessage = await askQuestion("");
        if (inputMessage === "/quit") {
            socketClient.disconnect();
            httpServer.close();
            process.exit(0);
        } else if (inputMessage === "/past") {
            await getConversation(senderContactNumber, peerContactNumber, peerUserName);
        } else if (inputMessage === "/switch") {
            socketClient.disconnect();
            switchSocketClient(senderUsername, senderContactNumber, senderPort, null);
            return;
        } else if (inputMessage === "/schedule") {
            await sendDelayMessage(senderPort,receiverPort);
            await addMessage(senderContactNumber, peerContactNumber, inputMessage);
        }
        else {
            try {
                if (socketClient && socketClient.connected) {
                    socketClient.emit("message", inputMessage);
                } else {
                    await sendToQueue(`chat_${receiverPort}`, {
                        senderPort,
                        message: inputMessage,
                        createdAt: new Date()
                    });
                    console.log("message: user offline, saved to queue.");
                }
            } catch (err) {
                console.error("error sending message:", err.message);
            } finally {
                await addMessage(senderContactNumber, peerContactNumber, inputMessage);
            }
        }
    }
}

export {
    socketServerConnection,
    socketClientConnection
};
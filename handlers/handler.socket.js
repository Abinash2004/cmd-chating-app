import { httpServer } from "../config/config.server.js";
import { askQuestion } from "../utils/utils.readline.js";
import { switchSocketClient } from "../utils/utils.client.switch.js";
import { addMessage, getConversation } from "./handler.mongo.js";
import { requestUserInfo } from "../utils/utils.client.emissions.js";

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

async function socketClientConnection(socketClient, senderUsername, senderContactNumber, senderPort) {
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
        } else {
            socketClient.emit("message", inputMessage);
            await addMessage(senderContactNumber,peerContactNumber,inputMessage);
        }
    }
}

export {
    socketServerConnection,
    socketClientConnection
};
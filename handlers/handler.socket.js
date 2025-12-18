import { httpServer } from "../config/config.server.js";
import { askQuestion } from "../utils/utils.readline.js";
import { addMessage } from "./handler.mongo.js";

let receiverContactNumber;

function socketServerConnection(socket) {
    const { clientUserName,clientContactNumber } = socket.handshake.auth;
    receiverContactNumber = clientContactNumber;
    console.log(`${clientUserName} connected.\nenter "quit" to end this conversation.\n`);
    
    socket.on("message", (message) => {
        console.log(`${clientUserName}: ${message}`);
    });
    
    socket.on("disconnect", () => {
        console.log(`${clientUserName} Disconnected.`);
    });
}

async function socketClientConnection(socketClient,senderContactNumber) {
    while (true) {
        const inputMessage = await askQuestion("");
        if (inputMessage === "quit") {
            socketClient.disconnect();
            httpServer.close();
            process.exit(0);
        }
        socketClient.emit("message", inputMessage);
        await addMessage(senderContactNumber,receiverContactNumber,inputMessage);
    }
}

export {
    socketServerConnection,
    socketClientConnection
};
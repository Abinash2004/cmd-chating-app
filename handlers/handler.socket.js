import { httpServer } from "../config/config.server.js";
import { askQuestion } from "../utils/utils.readline.js";
import { addMessage, getConversation } from "./handler.mongo.js";

function socketServerConnection(socket, userName, contactNumber) {
    const { clientUserName } = socket.handshake.auth;
    console.log(`message: ${clientUserName} connected.\n`);
    console.log(`\nCOMMANDS:\n/quit - end conversation\n/past - get pass messages.\n`);
    
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

async function socketClientConnection(socketClient, senderContactNumber) {
    const { peerUserName, peerContactNumber } = await new Promise((resolve) => {
        socketClient.emit("requestUserInfo");
        socketClient.on("userInfo", ({userName, contactNumber}) => {
            resolve({
                peerUserName: userName,
                peerContactNumber: contactNumber 
            })
        });
    });
    while (true) {
        const inputMessage = await askQuestion("");
        if (inputMessage === "/quit") {
            socketClient.disconnect();
            httpServer.close();
            process.exit(0);
        } else if (inputMessage === "/past") {
            await getConversation(senderContactNumber, peerContactNumber, peerUserName);
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
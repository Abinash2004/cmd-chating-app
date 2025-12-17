import { httpServer } from "../config/config.server.js";
import { askQuestion } from "../utils/utils.readline.js";

function socketServerConnection(socket) {
    const { clientUserName } = socket.handshake.auth;
    console.log(`${clientUserName} connected.\nenter "quit" to end this conversation.\n`);
    
    socket.on("message", (message) => {
        console.log(`${clientUserName}: ${message}`);
    });
    
    socket.on("disconnect", () => {
        console.log(`${clientUserName} Disconnected.`);
    });
}

async function socketClientConnection(socketClient) {
    while (true) {
        const inputMessage = await askQuestion("");
        if (inputMessage === "quit") {
            socketClient.disconnect();
            httpServer.close();
            process.exit(0);
        }
        socketClient.emit("message", inputMessage);
    }
}

export {
    socketServerConnection,
    socketClientConnection
};
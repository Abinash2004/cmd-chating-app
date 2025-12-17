import { readlineClient } from "../config/readline.js";
import { httpServer } from "../config/server.js";

function socketServerConnection(socket) {
    const { clientUserName } = socket.handshake.auth;
    console.log(`${clientUserName} connected.\nenter "quit" to end this conversation.\n`);
    
    socket.on("message", (message) => {
        console.log(`${clientUserName}: ${message}`);
    });
    
    socket.on("disconnect",() => {
        console.log(`${clientUserName} Disconnected.`);
    });
}

async function socketClientConnection(socketClient) {
    while (true) {
        const inputMessage = await new Promise((resolve) => {
            readlineClient.question("", resolve);
        });
        
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
import { createSocketClient } from "../config/client.js";
import { startMessagingInterface } from "../utils/messaging.interface.js";
import { askQuestion } from "../utils/readline.js";
import { validatePort } from "../validators/cmd.js";
import { message, green } from "../config/chalk.js";

function socketServerConnection(socket, userName, contactNumber) {
    const { clientUserName } = socket.handshake.auth;
    console.log(`${message("message")}: ${clientUserName} connected.`);
    
    socket.on("requestUserInfo", () => {
        socket.emit("userInfo", { userName, contactNumber });
    });
    
    socket.on("message", (message) => {
        console.log(`${green(clientUserName)}: ${message}`);
    });
    
    socket.on("disconnect", () => {
        console.log(`${message("message")}: ${clientUserName} Disconnected.`);
    });
}

async function socketClientConnection(userName, contactNumber, senderPort, receiverPort) {
    let switchPort;
    if (receiverPort) {
        switchPort = receiverPort;
    } else {
        switchPort = await askQuestion(`enter new receiver port: `);
        validatePort(senderPort, switchPort);
        console.log(`${message("message")}: switched to port ${switchPort}.\n`);
    }
    
    const socketClient = createSocketClient(switchPort, userName);
    socketClient.on("connect", () => {});
    startMessagingInterface(socketClient, userName, contactNumber, senderPort, switchPort);
}

export {
    socketServerConnection,
    socketClientConnection,
};
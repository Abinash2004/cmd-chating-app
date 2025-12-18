import { socketClientConnection } from "../handlers/handler.socket.js";
import { createSocketClient } from "../config/config.client.js";
import { askQuestion } from "./utils.readline.js";
import { validatePort } from "../validators/validator.cmd.js";

async function switchSocketClient(userName, contactNumber, senderPort, receiverPort) {
    let switchPort;
    if (receiverPort) {
        switchPort = receiverPort;
    } else {
        switchPort = await askQuestion(`enter new receiver port: `);
        validatePort(senderPort,switchPort);
        console.log(`message: switched to port ${switchPort}.\n`);
    }
    
    const socketClient = createSocketClient(switchPort, userName);
    socketClient.on("connect", async () => {
        await socketClientConnection(socketClient, userName, contactNumber, senderPort);
    });
}

export { switchSocketClient };
import { httpServer,socketServer } from "./config/server.js";
import { createSocketClient } from "./config/socket.client.js";
import { 
    socketServerConnection,
    socketClientConnection 
} from "./handlers/socket.handler.js";

const arg = process.argv.slice(2);
const [ userName,senderPort,receiverPort ] = [ arg[0],arg[1],arg[2] ];
const socketClient = createSocketClient(receiverPort, userName);

socketServer.on("connection",(socket) => socketServerConnection(socket));
socketClient.on("connect", async () => socketClientConnection(socketClient));

httpServer.listen(senderPort, () => {
    console.log(`server started on port ${senderPort}`);
});
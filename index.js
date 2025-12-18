import { connectToMongoDB } from "./config/config.mongo.js";
import { httpServer, socketServer } from "./config/config.server.js";
import { createSocketClient } from "./config/config.client.js";
import { socketServerConnection, socketClientConnection } from "./handlers/handler.socket.js";
import { validatePort } from "./validators/validator.cmd.js";
import { authenticateUser } from "./handlers/handler.mongo.js";

const arg = process.argv.slice(2);
const [senderPort, receiverPort, contactNumber] = [arg[0], arg[1], arg[2]];
validatePort(senderPort, receiverPort);

await connectToMongoDB();
const userName = await authenticateUser(contactNumber);
const socketClient = createSocketClient(receiverPort, userName, contactNumber);

socketServer.on("connection", (socket) => socketServerConnection(socket));
socketClient.on("connect", async () => socketClientConnection(socketClient, contactNumber));

httpServer.listen(senderPort, () => {
    console.log(`message: server started on port ${senderPort}`);
});
import { connectToMongoDB } from "./config/mongo.js";
import { httpServer, socketServer } from "./config/server.js";
import { socketServerConnection } from "./handlers/socket.js";
import { validatePort } from "./validators/cmd.js";
import { authenticateUser } from "./handlers/mongo.js";
import { switchSocketClient } from "./utils/client.switch.js";
import { connectRabbitMQ } from "./config/rabbitmq.js";
import { listenOfflineMessages } from "./handlers/rabbitmq.js";

const arg = process.argv.slice(2);
const [senderPort, receiverPort, contactNumber] = [arg[0], arg[1], arg[2]];
validatePort(senderPort, receiverPort);

await connectToMongoDB();
await connectRabbitMQ();
const userName = await authenticateUser(contactNumber);

socketServer.on("connection", (socket) => socketServerConnection(socket, userName, contactNumber));
await switchSocketClient(userName, contactNumber, senderPort, receiverPort);

httpServer.listen(senderPort, async () => {
    console.log(`message: server started on port ${senderPort}`);
    console.log(`\nCOMMANDS:\n/quit - end conversation\n/past - get pass messages.\n/switch - change receiver port.\n`);
    console.log(`message: waiting for peer server on port ${receiverPort}...`);
    await listenOfflineMessages(senderPort);
});
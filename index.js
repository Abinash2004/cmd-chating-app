import { connectToMongoDB } from "./config/config.mongo.js";
import { httpServer, socketServer } from "./config/config.server.js";
import { socketServerConnection } from "./handlers/handler.socket.js";
import { validatePort } from "./validators/validator.cmd.js";
import { authenticateUser } from "./handlers/handler.mongo.js";
import { switchSocketClient } from "./utils/utils.client.switch.js";

const arg = process.argv.slice(2);
const [senderPort, receiverPort, contactNumber] = [arg[0], arg[1], arg[2]];
validatePort(senderPort, receiverPort);

await connectToMongoDB();
const userName = await authenticateUser(contactNumber);

socketServer.on("connection", (socket) => socketServerConnection(socket, userName, contactNumber));
await switchSocketClient(userName, contactNumber, senderPort, receiverPort);

httpServer.listen(senderPort, () => {
    console.log(`message: server started on port ${senderPort}`);
    console.log(`\nCOMMANDS:\n/quit - end conversation\n/past - get pass messages.\n/switch - change receiver port.\n`);
    console.log(`message: waiting for peer server on port ${receiverPort}...`);
});
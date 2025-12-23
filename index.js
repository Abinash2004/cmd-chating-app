import { connectToMongoDB } from "./config/mongo.js";
import { httpServer, socketServer } from "./config/server.js";
import { socketClientConnection, socketServerConnection } from "./handlers/socket.js";
import { validatePort } from "./validators/cmd.js";
import { authenticateUser } from "./handlers/mongo.js";
import { connectRabbitMQ } from "./config/rabbitmq.js";
import { listenOfflineMessages } from "./handlers/rabbitmq.js";
import { message, blue } from "./config/chalk.js";

const arg = process.argv.slice(2);
const [senderPort, receiverPort, contactNumber] = [arg[0], arg[1], arg[2]];
validatePort(senderPort, receiverPort);

await connectToMongoDB();
await connectRabbitMQ();
const userName = await authenticateUser(contactNumber);

socketServer.on("connection", (socket) => socketServerConnection(socket, userName, contactNumber));
await socketClientConnection(userName, contactNumber, senderPort, receiverPort);

httpServer.listen(senderPort, async () => {
    console.log(`${message("message")}: server started on port ${senderPort}`);
    console.log(`\n${message("COMMANDS:")}\n${blue("/exit")} - end conversation\n${blue("/history")} - get past messages\n${blue("/switch")} - change receiver port\n${blue("/schedule")} - send message with delay\n${blue("/create_room")} - create a new chat room\n${blue("/join_room")} - join a chat room\n`);
    console.log(`${message("message")}: your messages will be send to port ${receiverPort}...`);
    await listenOfflineMessages(senderPort);
});
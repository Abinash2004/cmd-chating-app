import { askQuestion } from "./readline.js";
import { requestUserInfo } from "./client.emissions.js";
import { joinChatRoom, consumeChatQueue, sendToChatRoom } from "../config/rabbitmq.js";
import { socketClientConnection } from "../handlers/socket.js";
import { green,blue } from "../config/chalk.js";
import { 
    messagingPast,
    messagingQuit,
    messagingSwitch,
    messagingSchedule,
    messagingCreateRoom,
    messagingJoinRoom,
    sendMessage } from "./messaging.helper.js";

async function startMessagingInterface(socketClient, senderUsername, senderContactNumber, senderPort, receiverPort) {
    let peerUserName = null;
    let peerContactNumber = null;

    while (true) {
        const isSocketClientConnected = socketClient?.connected === true;
        
        if (isSocketClientConnected && (peerUserName == null || peerContactNumber == null)) {
            const { peerUserName: name, peerContactNumber: number } = await requestUserInfo(socketClient);
            peerUserName = name;
            peerContactNumber = number;
        }

        const inputMessage = await askQuestion("");

        if (inputMessage === "/exit") {
            messagingQuit(isSocketClientConnected, socketClient);
        }
        
        else if (inputMessage === "/history") {
            await messagingPast(isSocketClientConnected, senderContactNumber, peerContactNumber, peerUserName);
        } 
        
        else if (inputMessage === "/switch") {
            await messagingSwitch(isSocketClientConnected, socketClient, senderUsername, senderContactNumber, senderPort);
            return;
        } 
        
        else if (inputMessage === "/schedule") {
            await messagingSchedule(isSocketClientConnected, senderUsername, senderPort, receiverPort, senderContactNumber, peerContactNumber, inputMessage);
        }
        
        else if (inputMessage === "/create_room") {
            await messagingCreateRoom();
        }
        
        else if (inputMessage === "/join_room") {
            const operation = await messagingJoinRoom(isSocketClientConnected, socketClient, senderUsername, senderContactNumber, senderPort, receiverPort);
            if (operation === "continue") continue;
            if (operation === "return") return;
        }

        else {
            await sendMessage(isSocketClientConnected, socketClient, receiverPort, senderPort, inputMessage, senderContactNumber, senderUsername, peerContactNumber);
        }
    }
}

async function roomMessagingInterface(userName, contactNumber, senderPort, receiverPort, roomName, exchangeId) {
    const userQueue = `user_${userName}_${contactNumber}_${exchangeId}`;
    await joinChatRoom(userQueue, exchangeId);

    consumeChatQueue(userQueue, (msg) => {
        if (msg.senderContactNumber !== contactNumber) {
            console.log(`[${blue(roomName)}] ${green(msg.senderUsername)}: ${msg.message}`);
        }
    });

    while (true) {
        const inputMessage = await askQuestion("");
        if (inputMessage === "/exit") {
            socketClientConnection(userName, contactNumber, senderPort, receiverPort);
            return;
        } else {
            await sendToChatRoom({
                senderUsername: userName,
                senderContactNumber: contactNumber,
                message: inputMessage,
                createdAt: new Date()
            }, exchangeId);
        }
    }
}

export { startMessagingInterface, roomMessagingInterface };
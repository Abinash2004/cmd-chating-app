import { httpServer } from "../config/server.js";
import { askQuestion } from "./readline.js";
import bcrypt from "bcrypt";
import { sendToQueue } from "../config/rabbitmq.js";
import { sendDelayMessage } from "../handlers/rabbitmq.js";
import { socketClientConnection } from "../handlers/socket.js";
import { message, error } from "../config/chalk.js";
import { roomMessagingInterface } from "./messaging.interface.js";
import { 
    addMessage,
    createRoom,
    getAvailableRooms,
    getConversation } from "../handlers/mongo.js";

function messagingQuit(isSocketClientConnected, socketClient) {
    if (isSocketClientConnected) socketClient.disconnect();
    httpServer.close();
    process.exit(0);
}

async function messagingPast(isSocketClientConnected, senderContactNumber, peerContactNumber, peerUserName) {
    if (isSocketClientConnected) {
        await getConversation(senderContactNumber, peerContactNumber, peerUserName);
    } else {
        console.log(`${message("message")}: client credentials are missing, client must be offline.`);
    }
}

async function messagingSwitch(isSocketClientConnected, socketClient, senderUsername, senderContactNumber, senderPort) {
    if (isSocketClientConnected) socketClient.disconnect();
    socketClientConnection(senderUsername, senderContactNumber, senderPort, null);
}

async function messagingSchedule(isSocketClientConnected, senderUserName, senderPort, receiverPort, senderContactNumber, peerContactNumber, inputMessage) {
    await sendDelayMessage(senderUserName, senderPort, receiverPort);
    if (isSocketClientConnected) {
        await addMessage(senderContactNumber, peerContactNumber, inputMessage);
    }
}

async function messagingCreateRoom() {
    const roomName = await askQuestion("enter your room name: ");
    const password = await askQuestion("create password to your room (if not then enter <null>): ");
    createRoom(roomName,password);
}

async function messagingJoinRoom(isSocketClientConnected, socketClient, senderUsername, senderContactNumber, senderPort, receiverPort) {
    const room = await getAvailableRooms();
    if (room === null) return "continue";
    if (room.password !== "null") {
        const password = await askQuestion(`enter password for ${room.roomName} chat room: `);
        if (!(await bcrypt.compare(password, room.password))) {
            console.error(`${error("error")}: invalid password.`);
            return "continue";
        }
    }
    if (isSocketClientConnected) socketClient.disconnect();
    roomMessagingInterface(senderUsername,senderContactNumber,senderPort,receiverPort,room.roomName,room.exchangeId);
    return "return";
}

async function sendMessage(isSocketClientConnected, socketClient, receiverPort, senderPort, inputMessage, senderContactNumber, senderUserName,peerContactNumber) {
    try {
        if (isSocketClientConnected) {
            socketClient.emit("message", inputMessage);
        } else {
            await sendToQueue(`chat_${receiverPort}`, {
                senderPort,
                senderUserName,
                message: inputMessage,
                createdAt: new Date()
            });
            console.log(`${message("message")}: user might be offline, saved to queue.`);
        }
    } catch (err) {
        console.error(`${error("error")}: ${err.message}`);
    } finally {
        if (isSocketClientConnected) {   
            await addMessage(senderContactNumber, peerContactNumber, inputMessage);
        }
    }
}

export {
    messagingQuit,
    messagingPast,
    messagingSwitch,
    messagingSchedule,
    messagingCreateRoom,
    messagingJoinRoom,
    sendMessage
}
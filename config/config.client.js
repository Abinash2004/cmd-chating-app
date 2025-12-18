import { io } from "socket.io-client";

function createSocketClient(receiverPort, userName, contactNumber) {
    return io(`http://localhost:${receiverPort}`, {
        auth: { 
            clientUserName: userName,
            clientContactNumber: contactNumber
        }
    });
}

export { createSocketClient };
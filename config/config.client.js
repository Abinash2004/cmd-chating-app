import { io } from "socket.io-client";

function createSocketClient(receiverPort, userName) {
    return io(`http://localhost:${receiverPort}`, {
        auth: { clientUserName: userName }
    });
}

export { createSocketClient };
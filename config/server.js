import express from "express";
import { Server } from "socket.io";
import { createServer } from "http";

const app = express();
const httpServer = createServer(app);
const socketServer = new Server(httpServer, {cors:{origin:"*"}});

export {
    httpServer,
    socketServer
};
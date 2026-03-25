import { io, Socket } from "socket.io-client";

const SOCKET_URL = process.env.SOCKET_URL || "https://ap-ipflegacy.discloud.app"; 

export const socket: Socket = io(SOCKET_URL, {
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 300,
    reconnectionDelay: 5000,
    transports: ["websocket"],
    auth: { 
        internalKey: process.env.INTERNAL_KEY 
    },
});
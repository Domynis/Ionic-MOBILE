import WebSocket from "ws";
import jwt from "jsonwebtoken";
import { jwtConfig } from "./utils.js";

let wss;

export const initWss = value => {
    wss = value;
    wss.on('connection', ws => {
        ws.on('message', message => {
            const { type, payload: { token } } = JSON.parse(message);
            // console.log("wss message", type, token);
            if (type !== 'authorization') {
                wss.close();
                return;
            }
            try {
                ws.user = jwt.verify(token, jwtConfig.secret);
            } catch (error) {
                ws.close();
            }
        });
    });
};

export const broadcast = (userId, data) => {
    if (!wss) return;
    wss.clients.forEach(client =>{
        if(client.readyState === WebSocket.OPEN && client.user._id === userId){
            console.log(`Sending message to ${client.user.username}`);
            client.send(JSON.stringify(data));
        }
    })
}
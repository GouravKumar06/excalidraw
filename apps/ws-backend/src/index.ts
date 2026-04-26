import { WebSocketServer } from "ws";
import jwt from "jsonwebtoken";
import dotenv from 'dotenv'

dotenv.config()
import { JWT_SECRET } from '@repo/backend-common';
const wss = new WebSocketServer({ port: 8080 });

wss.on("connection", function connection(ws, req) {

    const url = req.url;

    if(!url){
        ws.close(1008, "Invalid URL");
        return;
    }

    const params = new URLSearchParams(url.split("?")[1]);

    const token = params.get("token");

    if (!token) {
        ws.close(1008, "Token missing");
        return;
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET as string);

        if (!decoded) {
            ws.close(1008, "Unauthorized Access");
            return;
        }
    } catch (err) {
        ws.close(1008, "Unauthorized Access");
        return;
    }

    ws.on("message", function message(data) {
        console.log("received: %s", data);
    });

    ws.send("something");
});
import './env';  
import { WebSocketServer, WebSocket } from "ws";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from '@repo/backend-common';
import { prismaClient } from '@repo/database/client';


const wss = new WebSocketServer({ port: 8080 });



interface User {
    userId: string,
    rooms: string[],
    ws : WebSocket
}

const users: User[] = [];




function checkUser(token: string): string | null {
    try{
        const decoded = jwt.verify(token, JWT_SECRET as string);

        if(typeof decoded === "string"){
            return null;
        }

        if (!decoded || !decoded.userId ) {
            return null;
        }

        return decoded.userId;
    }catch(error){
        console.error("Error verifying token:", error);
        return null;
    }

}

wss.on("connection", async function connection(ws, req) {
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

    const userId = checkUser(token);

    if (!userId) {
        ws.close(1008, "Unauthorized Access");
        return;
    }

    users.push({
        userId,
        rooms: [],
        ws
    });

    ws.on("message", async function message(data) {
        const parsedData = JSON.parse(data.toString());

        if(parsedData.type === "join_room"){
            const roomId = parsedData.roomId;

            console.log("JOIN ROOM HIT", roomId);

            const room = await prismaClient.room.findFirst({
                where: {
                    id: roomId,
                }
            });

            if(!room){
                ws.send(JSON.stringify({
                    type: "error",
                    message: "Room not found"
                }))
                return;
            }

            const user = users.find(u => u.ws === ws);

            user?.rooms.push(roomId);

        }

        if(parsedData.type === "Leave_room"){
            console.log("LEAVE ROOM HIT");

            const roomId = parsedData.roomId;
            const user = users.find(u => u.ws === ws);

            if(user){
                user.rooms = user.rooms.filter(r => r !== roomId);
            }

        }


        if(parsedData.type === "chat"){
            const roomId = parsedData.roomId;
            const message = parsedData.message;

            await prismaClient.chat.create({
                data:{
                    roomId,
                    userId: userId,
                    message
                }
            })
            
            users.forEach(user => {
                if(user.rooms.includes(roomId)){
                    user.ws.send(JSON.stringify({
                        type: "chat",
                        roomId,
                        message,
                        sender: userId
                    }))
                }
            })
        }

    });

});
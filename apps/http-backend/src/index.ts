import './env';  
import express from 'express';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '@repo/backend-common';
import { authMiddleware } from './middleware.js';
import { SignUpSchema, LoginSchema, CreateRoomSchema } from '@repo/common/types';
import { prismaClient } from '@repo/database/client';

const app = express();
const PORT = 3001;

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello, World!');
});

app.post("/signup",async(req,res)=>{

    const parsedData = SignUpSchema.safeParse(req.body);

    if(!parsedData.success){
        return res.json({
            message:"Incorrect Inputs",
            errors: parsedData.error
        })
    }

    try{

        const userExist = await prismaClient.user.findUnique({
            where: {
                email: parsedData.data.email
            }
        });

        if (userExist) {
            return res.status(409).json({
                message: "User already exists with this email"
            });
        }

        const user =await prismaClient.user.create({
            data:{
                username: parsedData.data.username,
                email: parsedData.data.email,
                password: parsedData.data.password,
            }
        })

        res.status(201).json({ 
            message: "User registered successfully",
            userId: user.id
        });
    }catch(error){
        console.error("Error during user registration:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }    
});

app.post("/login",async(req,res)=>{

    const parsedData = LoginSchema.safeParse(req.body);

    if(!parsedData.success){
        return res.json({
            message:"Incorrect Inputs",
            errors: parsedData.error
        })
    }

    try{
        
        const userExist = await prismaClient.user.findUnique({
            where: {
                email: parsedData.data.email,
                password: parsedData.data.password
            }
        });

        if (!userExist) {
            return res.status(404).json({
                message: "User not found with this email Please Sign UP"
            });
        }

        const userId = userExist.id;

        const token = jwt.sign({ userId}, JWT_SECRET as string);

        res.status(200).json({ token });
    }catch(error){
        console.error("Error during user login:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});


app.post('/create-room',authMiddleware, async(req, res) => {

    const parsedData = CreateRoomSchema.safeParse(req.body);

    if(!parsedData.success){
        return res.json({
            message:"Incorrect Inputs",
            errors: parsedData.error
        })
    }

    try{
        const userId = (req as any).user.userId;

        const roomExist = await prismaClient.room.findUnique({
            where: {
                slug: parsedData.data.name
            }
        });

        if (roomExist) {
            return res.status(409).json({
                message: "Room already exists with this name"
            });
        }

        const room = await prismaClient.room.create({
            data:{
                slug:parsedData.data.name,
                adminId : userId
            }
        })

        res.json({
            roomId: room.id,
        })
    }catch(error){
        console.error("Error during room creation:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }    
});   


app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
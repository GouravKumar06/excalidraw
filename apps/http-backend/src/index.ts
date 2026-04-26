import express from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv'

dotenv.config()
import { JWT_SECRET } from '@repo/backend-common';
import { authMiddleware } from './middleware.js';
import { SignUpSchema, LoginSchema,CreateRoomSchema } from '@repo/common/types';

const app = express();
const PORT = 3001;



app.get('/', (req, res) => {
  res.send('Hello, World!');
});

app.post("/signup",(req,res)=>{

    const data = SignUpSchema.safeParse(req.body);

    if(!data.success){
        res.json({
            message:"Incorrect Inputs",
            errors: data.error
        })
    }

    res.status(201).json({ 
        message: "User registered successfully",
        userId: 1
    });
});

app.post("/login",(req,res)=>{

    const data = LoginSchema.safeParse(req.body);

    if(!data.success){
        res.json({
            message:"Incorrect Inputs",
            errors: data.error
        })
    }

    const userId = 1;

    const token = jwt.sign({ userId}, JWT_SECRET as string);

    res.status(200).json({ token });
});


app.post('/create-room',authMiddleware, (req, res) => {

    const data = CreateRoomSchema.safeParse(req.body);

    if(!data.success){
        res.json({
            message:"Incorrect Inputs",
            errors: data.error
        })
    }

    res.json({
        roomId: '12345',
    })
});   


app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
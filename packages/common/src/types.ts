import { z } from "zod";

export const SignUpSchema = z.object({
    username: z.string().min(3).max(20),
    email: z.string(),
    password: z.string().min(6),
});


export const LoginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
});


export const CreateRoomSchema = z.object({
    name: z.string().min(2).max(100),
});
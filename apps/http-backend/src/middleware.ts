import './env';
import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

import { JWT_SECRET } from '@repo/backend-common';
declare global {
    namespace Express {
        interface Request {
            user?: any;
        }
    }
}

export const authMiddleware = (req : Request, res:Response, next:NextFunction) => {
    const token = req.headers.authorization;

    if (!token) {
        return res.status(401).json({ message: "Token missing" });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET as string);
        req.user = decoded;

        next();
    } catch (err) {
        return res.status(401).json({ message: "Unauthorized Access" });
    }
};
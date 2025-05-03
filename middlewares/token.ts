import express, { NextFunction } from "express";
import jwt from 'jsonwebtoken';

const TokenVerifier = async (req: express.Request, res: express.Response, next: NextFunction) => {
    
    const token = req.headers['x-auth-token'];

    // Check if token is missing
    if (!token || typeof token !== 'string') {
        res.status(401).json({
            errors: [
                {
                    msg: "No token provided. Access denied."
                }
            ]
        });
        return;
    }

    const secretKey = process.env.JWT_SECRET_KEY;
    if (!secretKey) {
        console.error("JWT secret key not set in environment");
        res.status(500).json({
            errors: [
                {
                    msg: "Server configuration error",
                }
            ],
        });
        return;
    }
    try {
        const decoded: any = jwt.verify(token,secretKey);
        // You can attach the user to the request object here
        (req as any).user = decoded.user;
        
        // Proceed to the next middleware or route handler
        next();                                         
    } catch (error) {
        res.status(401).json({
            errors: [{
                msg: "Invalid token. Access denied.",
            },],
        });
    }
}
export default TokenVerifier;
import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { your_jwt_secret } from "./config";

// ✅ Use the same JWT secret from config
const JWT_PASSWORD = your_jwt_secret;

// Define a custom Request type to include 'userId'
interface AuthenticatedRequest extends Request {
  userId?: string;
}

export const userMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    const authHeader = req.headers["authorization"];

    // Check if the Authorization header is present and correctly formatted
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(403).json({
            message: "You are not logged in"
        });
        return;
    }

    const token = authHeader.split(' ')[1];

    try {
        // Verify the token synchronously
        const decoded = jwt.verify(token, JWT_PASSWORD);

        // Attach the user ID from the token's payload to the request object
        if (typeof decoded === 'object' && decoded !== null && 'id' in decoded) {
            req.userId = (decoded as any).id;
            next(); // Proceed to the next middleware or route handler
            return;
        } else {
            throw new Error("Invalid token payload");
        }
    } catch (err) {
        // This block catches errors from jwt.verify (e.g., invalid signature, expired token)
        res.status(403).json({
            message: "You are not logged in"
        });
        return;
    }
};

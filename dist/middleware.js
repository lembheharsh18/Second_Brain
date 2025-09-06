"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("./config");
// ✅ Use the same JWT secret from config
const JWT_PASSWORD = config_1.your_jwt_secret;
const userMiddleware = (req, res, next) => {
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
        const decoded = jsonwebtoken_1.default.verify(token, JWT_PASSWORD);
        // Attach the user ID from the token's payload to the request object
        if (typeof decoded === 'object' && decoded !== null && 'id' in decoded) {
            req.userId = decoded.id;
            next(); // Proceed to the next middleware or route handler
            return;
        }
        else {
            throw new Error("Invalid token payload");
        }
    }
    catch (err) {
        // This block catches errors from jwt.verify (e.g., invalid signature, expired token)
        res.status(403).json({
            message: "You are not logged in"
        });
        return;
    }
};
exports.userMiddleware = userMiddleware;

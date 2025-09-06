import express from 'express';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { UserModel, ContentModel } from './db';
import { userMiddleware } from "./middleware";
import { your_jwt_secret } from "./config";

const app = express();
app.use(express.json());

// ✅ Use the same JWT secret from config
const JWT_PASSWORD = your_jwt_secret;

app.post("/api/v1/signup", async (req, res) => {
    const { username, password } = req.body;
    
    try {
        await UserModel.create({
            username,
            password
        });
        
        res.json({
            message: "User Signed Up"
        });
    } catch (e) {
        res.status(411).json({
            message: "User already exists"
        });
    }
});

app.post("/api/v1/signin", async (req, res) => {
    const { username, password } = req.body;
    
    try {
        const existingUser = await UserModel.findOne({ username, password });
        
        if (existingUser) {
            // ✅ Use consistent JWT secret
            const token = jwt.sign(
                { id: existingUser._id },
                JWT_PASSWORD,
                { expiresIn: '24h' }
            );
            
            res.json({ token });
        } else {
            res.status(403).json({
                message: "Invalid Credentials"
            });
        }
    } catch (e) {
        console.error("Signin error:", e);
        res.status(500).json({
            message: "Something went wrong"
        });
    }
});

app.post("/api/v1/content", userMiddleware, async (req, res) => {
    const { title, link, type } = req.body;
    const userId = (req as any).userId;
    
    try {
        const content = await ContentModel.create({ 
            title, 
            link, 
            userId, 
            type, 
            tags: [] 
        });
        res.json({ message: "Content created", content });
    } catch (e) {
        console.error("Content creation error:", e);
        res.status(500).json({ message: "Error creating content" });
    }
});

app.get("/api/v1/content", userMiddleware, async (req, res) => {
    const userId = (req as any).userId;
    
    try {
        const contents = await ContentModel
            .find({ userId })
            .populate('userId', 'username'); // ✅ Populate userId with username field
        
        res.json({ contents });
    } catch (e) {
        console.error("Error fetching content:", e);
        res.status(500).json({ message: "Error fetching content" });
    }
});


app.delete("/api/v1/content", userMiddleware, async (req, res) => {
    const { id } = req.body;
    const userId = (req as any).userId;
    
    try {
        const result = await ContentModel.deleteOne({ _id: id, userId });
        if (result.deletedCount === 0) {
            res.status(404).json({ message: "Content not found or unauthorized" });
            return;
        }
        res.json({ message: "Content deleted" });
    } catch (e) {
        res.status(500).json({ message: "Error deleting content" });
    }
});

app.listen(3000, () => {
    console.log("✅ Server running on port 3000");
});

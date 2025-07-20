import express from 'express';
import jwt from 'jsonwebtoken';
import mongoose, { mongo } from 'mongoose';
import { UserModel } from './db';

const app = express();
app.use(express.json());
const JWT_PASSWORD="1212111";

app.post("/api/v1/signup", async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    try {
        await UserModel.create({
            username: username,
            password: password
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
    const username = req.body.username;
    const password = req.body.password;

    try {
        const existingUser = await UserModel.findOne({ username, password });

        if (existingUser) {
            const token = jwt.sign(
                { id: existingUser._id },
                process.env.JWT_PASSWORD || "your_jwt_secret"
            );

            res.json({ token });
        } else {
            res.status(403).json({
                message: "Invalid Credentials"
            });
        }
    } catch (e) {
        if (e instanceof Error) {
            res.status(500).json({
                message: "Something went wrong",
                error: e.message
            });
        } else {
            res.status(500).json({
                message: "Unknown error"
            });
        }
    }
});

app.post("/api/v1/content", (req,res) => {

})
app.get("/api/v1/content", (req,res) => {

})
app.delete("/api/v1/content", (req,res) => {

})

app.listen(3000);
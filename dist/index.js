"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = require("./db");
const middleware_1 = require("./middleware");
const config_1 = require("./config");
const app = (0, express_1.default)();
app.use(express_1.default.json());
// ✅ Use the same JWT secret from config
const JWT_PASSWORD = config_1.your_jwt_secret;
app.post("/api/v1/signup", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password } = req.body;
    try {
        yield db_1.UserModel.create({
            username,
            password
        });
        res.json({
            message: "User Signed Up"
        });
    }
    catch (e) {
        res.status(411).json({
            message: "User already exists"
        });
    }
}));
app.post("/api/v1/signin", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password } = req.body;
    try {
        const existingUser = yield db_1.UserModel.findOne({ username, password });
        if (existingUser) {
            // ✅ Use consistent JWT secret
            const token = jsonwebtoken_1.default.sign({ id: existingUser._id }, JWT_PASSWORD, { expiresIn: '24h' });
            res.json({ token });
        }
        else {
            res.status(403).json({
                message: "Invalid Credentials"
            });
        }
    }
    catch (e) {
        console.error("Signin error:", e);
        res.status(500).json({
            message: "Something went wrong"
        });
    }
}));
app.post("/api/v1/content", middleware_1.userMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { title, link, type } = req.body;
    const userId = req.userId;
    try {
        const content = yield db_1.ContentModel.create({
            title,
            link,
            userId,
            type,
            tags: []
        });
        res.json({ message: "Content created", content });
    }
    catch (e) {
        console.error("Content creation error:", e);
        res.status(500).json({ message: "Error creating content" });
    }
}));
app.get("/api/v1/content", middleware_1.userMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.userId;
    try {
        const contents = yield db_1.ContentModel.find({ userId });
        res.json({ contents });
    }
    catch (e) {
        res.status(500).json({ message: "Error fetching content" });
    }
}));
app.delete("/api/v1/content", middleware_1.userMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.body;
    const userId = req.userId;
    try {
        const result = yield db_1.ContentModel.deleteOne({ _id: id, userId });
        if (result.deletedCount === 0) {
            res.status(404).json({ message: "Content not found or unauthorized" });
            return;
        }
        res.json({ message: "Content deleted" });
    }
    catch (e) {
        res.status(500).json({ message: "Error deleting content" });
    }
}));
app.listen(3000, () => {
    console.log("✅ Server running on port 3000");
});

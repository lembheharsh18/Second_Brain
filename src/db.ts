import mongoose, { model, Schema } from 'mongoose';

mongoose.connect("mongodb://localhost:27017/brainly")
    .then(() => console.log("✅ Connected to MongoDB"))
    .catch((err) => console.error("❌ MongoDB connection error:", err));

const contentTypes = ['image', 'video', 'article', 'audio'];

const UserSchema = new Schema({
    username: { type: String, unique: true, required: true },
    password: { type: String, required: true }
});

const ContentSchema = new Schema({
    link: { type: String, required: true },
    type: { type: String, enum: contentTypes, required: true },
    title: { type: String, required: true },
    tags: [{ type: Schema.Types.ObjectId, ref: 'Tag' }],
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
});

export const ContentModel = model("Content", ContentSchema);
export const UserModel = model("User", UserSchema);

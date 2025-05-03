import mongoose, { Schema, Model } from "mongoose";
import { IUser } from "./i_user";

let userSchema: Schema = new mongoose.Schema({
    name: { type: String, required: true, },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    avatar: { type: String, required: true },
    isAdmin: { type: Boolean, default: false },
}, { timestamps: true }
);
const  User: Model<IUser> = mongoose.model<IUser>('User', userSchema);
export default User;

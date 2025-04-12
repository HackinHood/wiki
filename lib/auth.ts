import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import clientPromise from "./mongodb";

const client = await clientPromise;
const db = client.db("auth");

export const auth = betterAuth({
    database: mongodbAdapter(db),
})
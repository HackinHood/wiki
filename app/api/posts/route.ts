import { auth } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";

export const GET = async (req: Request) => {
    const client = await clientPromise;
    const db = client.db("main-data");
    const posts = await db.collection("posts").find().toArray();

    return new Response(JSON.stringify(posts), {
        status: 200,
        headers: {
            "Content-Type": "application/json",
        },
    });
}

export const POST = async (req: Request) => {
    const session = await auth.api.getSession(req)
    if (!session) {
        return new Response("Unauthorized", { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db("main-data");
    const body = await req.json();

    const { title, content, description, tldr } = body;

    if (!title || !content || !description || !tldr) {
        return new Response(JSON.stringify({ error: "Title, content, description, and tldr are required" }), {
            status: 400,
            headers: {
                "Content-Type": "application/json",
            },
        });
    }

    const post = await db.collection("posts").insertOne({ title, content, description, tldr, author: session.user.id });

    return new Response(JSON.stringify(post), {
        status: 201,
        headers: {
            "Content-Type": "application/json",
        },
    });
}
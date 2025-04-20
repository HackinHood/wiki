import { auth } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export const GET = async (req: Request) => {
    const url = new URL(req.url);
    const isDrafts = url.searchParams.get('drafts') === 'true';
    const client = await clientPromise;
    const db = client.db("main-data");

    // If drafts are requested, check for authentication
    if (isDrafts) {
        const session = await auth.api.getSession(req);
        if (!session) {
            return new Response("Unauthorized", { status: 401 });
        }

        // Only return drafts belonging to the current user
        const drafts = await db.collection("posts")
            .find({ author: session.user.id, status: "draft" })
            .toArray();

        return new Response(JSON.stringify(drafts), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    }

    // For regular posts, only return published ones
    const posts = await db.collection("posts")
        .find({ status: "published" })
        .toArray();

    return new Response(JSON.stringify(posts), {
        status: 200,
        headers: { "Content-Type": "application/json" },
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

    const { title, content, description, tldr, status = "published" } = body;

    if (!title || !content) {
        return new Response(JSON.stringify({ error: "Title and content are required" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
        });
    }

    // For published posts, require description and tldr
    if (status === "published" && (!description || !tldr)) {
        return new Response(JSON.stringify({
            error: "Description and tldr are required for published posts"
        }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
        });
    }

    const post = await db.collection("posts").insertOne({
        title,
        content,
        description: description || "",
        tldr: tldr || "",
        author: session.user.id,
        status,
        createdAt: new Date(),
        updatedAt: new Date()
    });

    return new Response(JSON.stringify(post), {
        status: 201,
        headers: { "Content-Type": "application/json" },
    });
}

export const PUT = async (req: Request) => {
    const session = await auth.api.getSession(req)
    if (!session) {
        return new Response("Unauthorized", { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db("main-data");
    const body = await req.json();

    const { id, title, content, description, tldr, status } = body;

    if (!id || !title || !content) {
        return new Response(JSON.stringify({ error: "Post ID, title and content are required" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
        });
    }

    // For published posts, require description and tldr
    if (status === "published" && (!description || !tldr)) {
        return new Response(JSON.stringify({
            error: "Description and tldr are required for published posts"
        }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
        });
    }

    try {
        // Verify the post belongs to the current user
        const existingPost = await db.collection("posts").findOne({
            _id: new ObjectId(id),
            author: session.user.id
        });

        if (!existingPost) {
            return new Response(JSON.stringify({ error: "Post not found or you don't have permission to edit it" }), {
                status: 404,
                headers: { "Content-Type": "application/json" },
            });
        }

        const result = await db.collection("posts").updateOne(
            { _id: new ObjectId(id) },
            {
                $set: {
                    title,
                    content,
                    description: description || "",
                    tldr: tldr || "",
                    status,
                    updatedAt: new Date()
                }
            }
        );

        return new Response(JSON.stringify({ success: true, result }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        console.error("Error updating post:", error);
        return new Response(JSON.stringify({ error: "Failed to update post" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}
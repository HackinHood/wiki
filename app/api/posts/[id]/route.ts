import { auth } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export const GET = async (req: Request, { params }: { params: { id: string } }) => {
  try {
    // Get post ID from params
    const postId = params.id;
    
    if (!postId || !ObjectId.isValid(postId)) {
      return new Response(JSON.stringify({ error: "Invalid post ID" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const client = await clientPromise;
    const db = client.db("main-data");
    
    // Find the post by ID
    const post = await db.collection("posts").findOne({ 
      _id: new ObjectId(postId),
      status: "published" // Only fetch published posts
    });
    
    if (!post) {
      return new Response(JSON.stringify({ error: "Post not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }
    
    return new Response(JSON.stringify(post), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching post:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch post" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
"use client"

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@heroui/button";
import { Link } from "@heroui/link";
import { addToast } from "@heroui/toast";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

function PostCard({ post }: { post: any }) {
    const postDate = post.createdAt 
        ? new Date(post.createdAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })
        : new Date(Number.parseInt(post._id.toString().substring(0, 8), 16) * 1000).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          });

    // Get first letter of author ID for avatar fallback
    const authorInitial = post.author ? post.author.charAt(0).toUpperCase() : 'U';
    const router = useRouter();

    // Function to strip HTML tags for preview
    const stripHtml = (html) => {
        const doc = new DOMParser().parseFromString(html, 'text/html');
        return doc.body.textContent || '';
    };

    return (
        <Card className="h-full flex flex-col hover:shadow-md transition-shadow">
            <CardHeader>
                <div className="flex justify-between items-start">
                    <CardTitle className="text-xl line-clamp-2">
                        <Link href={`/posts/${post._id}`} className="hover:underline">
                            {post.title}
                        </Link>
                    </CardTitle>
                    <Badge variant="outline" className="ml-2 shrink-0">
                        {postDate}
                    </Badge>
                </div>
                <CardDescription className="line-clamp-2 mt-2">{post.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
                {post.tldr && (
                    <div className="bg-muted p-3 rounded-md mb-4">
                        <p className="text-sm font-medium mb-1">TL;DR</p>
                        <p className="text-sm text-muted-foreground">{post.tldr}</p>
                    </div>
                )}
                <p className="text-muted-foreground line-clamp-3">
                    {typeof post.content === 'string' 
                        ? stripHtml(post.content).substring(0, 150) + (stripHtml(post.content).length > 150 ? "..." : "") 
                        : "No content available"}
                </p>
            </CardContent>
            <CardFooter className="border-t pt-4">
                <div className="flex items-center w-full">
                    <div className="flex items-center">
                        <div className="h-8 w-8 mr-2 bg-primary/10 rounded-full flex items-center justify-center text-primary font-semibold">
                            {authorInitial}
                        </div>
                        <div>
                            <p className="text-sm font-medium">Author</p>
                            <p className="text-xs text-muted-foreground">{post.author}</p>
                        </div>
                    </div>
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        className="ml-auto"
                        onPress={() => router.push(`/posts/${post._id}`)}
                    >
                        Read More
                    </Button>
                </div>
            </CardFooter>
        </Card>
    )
}

export default function Home() {
    const { data: session } = authClient.useSession();
    const { data: posts, isLoading } = useQuery({
        queryKey: ["posts"],
        queryFn: async () => {
            const response = await fetch("/api/posts");
            if (!response.ok) {
                addToast({
                    title: "Error",
                    description: "Failed to fetch posts...",
                    color: "danger",
                    variant: "flat"
                });
                return [];
            }
            return response.json();
        },
        initialData: [],
    });
    const router = useRouter();

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Latest Posts</h1>
                {session && (
                    <Button 
                        onPress={() => router.push("/posts/create")}
                        className="flex items-center gap-2"
                    >
                        <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M8 2.75C8 2.47386 7.77614 2.25 7.5 2.25C7.22386 2.25 7 2.47386 7 2.75V7H2.75C2.47386 7 2.25 7.22386 2.25 7.5C2.25 7.77614 2.47386 8 2.75 8H7V12.25C7 12.5261 7.22386 12.75 7.5 12.75C7.77614 12.75 8 12.5261 8 12.25V8H12.25C12.5261 8 12.75 7.77614 12.75 7.5C12.75 7.22386 12.5261 7 12.25 7H8V2.75Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                        </svg>
                        Create Post
                    </Button>
                )}
            </div>

            {isLoading ? (
                <div className="text-center py-20">
                    <p className="text-muted-foreground">Loading posts...</p>
                </div>
            ) : posts.length === 0 ? (
                <div className="text-center py-20">
                    <h2 className="text-2xl font-semibold mb-4">No posts yet</h2>
                    <p className="text-muted-foreground mb-6">Be the first to create a post!</p>
                    {session ? (
                        <Button onPress={() => router.push("/posts/create")}>
                            Create new post
                        </Button>
                    ) : (
                        <Button onPress={() => router.push("/auth/login")}>
                            Login to create a post
                        </Button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {posts.map((post: any) => (
                        <PostCard key={post._id} post={post} />
                    ))}
                </div>
            )}
        </div>
    );
}

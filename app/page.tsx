"use client"

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@heroui/button";
import { Link } from "@heroui/link";
import { addToast } from "@heroui/toast";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

function PostCard({ post }: { post: any }) {
    const postDate = new Date(Number.parseInt(post._id.toString().substring(0, 8), 16) * 1000)
    const formattedDate = postDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    })

    // Get first letter of author ID for avatar fallback
    const authorInitial = post.author.charAt(0).toUpperCase()
    const router = useRouter();

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
                        {formattedDate}
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
                    {post.content.substring(0, 150)}
                    {post.content.length > 150 ? "..." : ""}
                </p>
            </CardContent>
            <CardFooter className="border-t pt-4">
                <div className="flex items-center">
                    <Avatar className="h-8 w-8 mr-2">
                        <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${post.author}`} alt="Author" />
                        <AvatarFallback>{authorInitial}</AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="text-sm font-medium">Author</p>
                        <p className="text-xs text-muted-foreground">{post.author}</p>
                    </div>
                    <Button variant="ghost" size="sm" className="ml-auto" onPress={() => {
                        router
                    }}>
                    </Button>
                </div>
            </CardFooter>
        </Card>
    )
}

export default function Home() {
    // const { error, isPending, data: session } = authClient.useSession()
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
                })
            }
            return response.json();
        },
        initialData: [],
    })
    const router = useRouter();

    return (
        <div className="flex flex-col items-center justify-center py-2">
            {posts.length === 0 ? (
                <div className="text-center py-20">
                    <h2 className="text-2xl font-semibold mb-4">No posts yet</h2>
                    <p className="text-muted-foreground mb-6">Be the first to create a post!</p>
                    <Button onPress={() => {
                        router.push("/posts/create");
                    }}>
                        Create new post
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {posts.map((post: any) => (
                        <PostCard key={post._id.toString()} post={post} />
                    ))}
                    <Button onPress={() => {
                        router.push("/posts/create");
                    }}>
                        Create Post
                    </Button>
                </div>
            )}
        </div>
    );
}

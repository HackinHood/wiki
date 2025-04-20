"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { authClient } from "@/lib/auth-client"
import { CreatePostForm } from "@/components/create-post-form"
import { addToast } from "@heroui/toast"

export default function EditPostPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const postId = searchParams.get("id")
    const { data: session, isPending } = authClient.useSession()
    const [post, setPost] = useState(null)
    const [isLoading, setIsLoading] = useState(true)

    // Redirect to login if not authenticated
    useEffect(() => {
        if (!isPending && !session) {
            router.push("/auth/login")
        }
    }, [session, isPending, router])

    // Redirect to home if no post ID
    useEffect(() => {
        if (!postId && !isPending) {
            addToast({
                title: "Error",
                description: "No post ID specified",
                variant: "flat",
                color: "danger"
            })
            router.push("/")
        }
    }, [postId, isPending, router])

    // Fetch the post data
    useEffect(() => {
        async function fetchPost() {
            if (!session || !postId) return
            
            try {
                // TODO: Add API endpoint to get a single post by ID
                // For now, we'll fetch all drafts and find the one we need
                const response = await fetch("/api/posts?drafts=true")
                if (!response.ok) {
                    throw new Error("Failed to fetch post")
                }
                
                const data = await response.json()
                const foundPost = data.find(p => p._id === postId)
                
                if (!foundPost) {
                    throw new Error("Post not found")
                }
                
                setPost(foundPost)
            } catch (error) {
                console.error("Error fetching post:", error)
                addToast({
                    title: "Error",
                    description: error.message || "Failed to fetch post data",
                    variant: "flat",
                    color: "danger"
                })
                router.push("/posts/drafts")
            } finally {
                setIsLoading(false)
            }
        }
        
        if (session && postId) {
            fetchPost()
        }
    }, [session, postId, router])

    if (isPending || !session || isLoading) {
        return (
            <div className="container mx-auto py-8 px-4">
                <div className="max-w-5xl mx-auto">
                    <h1 className="text-3xl font-bold tracking-tight mb-6">Loading...</h1>
                </div>
            </div>
        )
    }

    if (!post) {
        return (
            <div className="container mx-auto py-8 px-4">
                <div className="max-w-5xl mx-auto">
                    <h1 className="text-3xl font-bold tracking-tight mb-6">Post not found</h1>
                    <p>The post you're looking for doesn't exist or you don't have permission to edit it.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="container mx-auto py-8 px-4">
            <div className="max-w-5xl mx-auto">
                <h1 className="text-3xl font-bold tracking-tight mb-6">Edit Post</h1>
                <CreatePostForm draftId={postId} initialData={post} />
            </div>
        </div>
    )
}
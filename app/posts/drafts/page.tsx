"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { authClient } from "@/lib/auth-client"
import { Button } from "@heroui/button"
import { addToast } from "@heroui/toast"
import { formatDistanceToNow } from "date-fns"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function DraftsPage() {
    const router = useRouter()
    const { data: session, isPending } = authClient.useSession()
    const [drafts, setDrafts] = useState([])
    const [isLoading, setIsLoading] = useState(true)

    // Redirect to login if not authenticated
    useEffect(() => {
        if (!isPending && !session) {
            router.push("/auth/login")
        }
    }, [session, isPending, router])

    // Fetch user's drafts
    useEffect(() => {
        async function fetchDrafts() {
            if (!session) return

            try {
                const response = await fetch("/api/posts?drafts=true")
                if (!response.ok) {
                    throw new Error("Failed to fetch drafts")
                }

                const data = await response.json()
                setDrafts(data)
            } catch (error) {
                console.error("Error fetching drafts:", error)
                addToast({
                    title: "Error",
                    description: "Failed to fetch drafts",
                    variant: "flat",
                    color: "danger"
                })
            } finally {
                setIsLoading(false)
            }
        }

        if (session) {
            fetchDrafts()
        }
    }, [session])

    const formatDate = (dateString) => {
        try {
            const date = new Date(dateString)
            return formatDistanceToNow(date, { addSuffix: true })
        } catch (e) {
            return "Unknown date"
        }
    }

    // Handle editing a draft
    const editDraft = (draft) => {
        router.push(`/posts/edit?id=${draft._id}`)
    }

    // Handle publishing a draft
    const publishDraft = async (draft) => {
        if (confirm("Are you sure you want to publish this draft?")) {
            try {
                const response = await fetch("/api/posts", {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        id: draft._id,
                        title: draft.title,
                        content: draft.content,
                        description: draft.description,
                        tldr: draft.tldr,
                        status: "published"
                    }),
                })

                if (!response.ok) {
                    throw new Error("Failed to publish draft")
                }

                addToast({
                    title: "Draft published",
                    description: "Your draft has been published successfully",
                    variant: "flat",
                    color: "success"
                })

                // Remove the draft from the list
                setDrafts(drafts.filter(d => d._id !== draft._id))
            } catch (error) {
                console.error("Error publishing draft:", error)
                addToast({
                    title: "Error",
                    description: "Failed to publish draft",
                    variant: "flat",
                    color: "danger"
                })
            }
        }
    }

    // Handle deleting a draft
    const deleteDraft = async (draft) => {
        if (confirm("Are you sure you want to delete this draft? This action cannot be undone.")) {
            try {
                // TODO: Add delete API endpoint
                // For now, just remove from the list
                setDrafts(drafts.filter(d => d._id !== draft._id))

                addToast({
                    title: "Draft deleted",
                    description: "Your draft has been deleted",
                    variant: "flat",
                    color: "success"
                })
            } catch (error) {
                console.error("Error deleting draft:", error)
                addToast({
                    title: "Error",
                    description: "Failed to delete draft",
                    variant: "flat",
                    color: "danger"
                })
            }
        }
    }

    if (isPending || !session) {
        return (
            <div className="container mx-auto py-8 px-4">
                <div className="max-w-5xl mx-auto">
                    <h1 className="text-3xl font-bold tracking-tight mb-6">Loading...</h1>
                </div>
            </div>
        )
    }

    return (
        <div className="container mx-auto py-8 px-4">
            <div className="max-w-5xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-3xl font-bold tracking-tight">Your Drafts</h1>
                    <Button
                        onClick={() => router.push('/posts/create')}
                    >
                        Create New Post
                    </Button>
                </div>

                {isLoading ? (
                    <div className="text-center py-12">
                        <p className="text-muted-foreground">Loading your drafts...</p>
                    </div>
                ) : drafts.length === 0 ? (
                    <div className="text-center py-12">
                        <h2 className="text-2xl font-semibold mb-4">No drafts yet</h2>
                        <p className="text-muted-foreground mb-6">Start writing and save your work as drafts</p>
                        <Button
                            onClick={() => router.push('/posts/create')}
                        >
                            Create new post
                        </Button>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {drafts.map((draft) => (
                            <Card key={draft._id} className="transition-shadow hover:shadow-md">
                                <CardHeader>
                                    <div className="flex justify-between items-start">
                                        <CardTitle className="text-xl">{draft.title || "Untitled Draft"}</CardTitle>
                                        <Badge variant="outline">
                                            {draft.updatedAt ? formatDate(draft.updatedAt) : formatDate(draft.createdAt)}
                                        </Badge>
                                    </div>
                                    {draft.description && (
                                        <CardDescription className="mt-2">
                                            {draft.description}
                                        </CardDescription>
                                    )}
                                </CardHeader>
                                <CardContent>
                                    <div className="line-clamp-3 text-muted-foreground">
                                        {/* Strip HTML tags for preview */}
                                        {draft.content
                                            ? draft.content.replace(/<[^>]*>/g, '').substring(0, 200) +
                                            (draft.content.length > 200 ? '...' : '')
                                            : 'No content'}
                                    </div>
                                </CardContent>
                                <CardFooter className="flex justify-end space-x-2">
                                    <Button
                                        variant="outline"
                                        onClick={() => deleteDraft(draft)}
                                        color="danger"
                                    >
                                        Delete
                                    </Button>
                                    <Button
                                        variant="secondary"
                                        onClick={() => editDraft(draft)}
                                    >
                                        Edit
                                    </Button>
                                    <Button
                                        onClick={() => publishDraft(draft)}
                                    >
                                        Publish
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
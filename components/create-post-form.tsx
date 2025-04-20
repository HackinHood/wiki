"use client"

import type React from "react"

import { Input, Textarea } from "@heroui/input"
import { addToast } from "@heroui/toast"
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight"
import Highlight from "@tiptap/extension-highlight"
import Image from "@tiptap/extension-image"
import Link from "@tiptap/extension-link"
import Placeholder from "@tiptap/extension-placeholder"
import Table from "@tiptap/extension-table"
import TableCell from "@tiptap/extension-table-cell"
import TableHeader from "@tiptap/extension-table-header"
import TableRow from "@tiptap/extension-table-row"
import TextAlign from "@tiptap/extension-text-align"
import Underline from "@tiptap/extension-underline"
import { EditorContent, useEditor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import { createLowlight } from "lowlight"
import { useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"

import { EditorToolbar } from "@/components/editor-toolbar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { authClient } from "@/lib/auth-client"

export function CreatePostForm({ draftId, initialData }: { draftId?: string, initialData?: any }) {
    const router = useRouter()
    const { data: session } = authClient.useSession()
    const [title, setTitle] = useState(initialData?.title || "")
    const [description, setDescription] = useState(initialData?.description || "")
    const [tldr, setTldr] = useState(initialData?.tldr || "")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [wordCount, setWordCount] = useState(0)
    const [readingTime, setReadingTime] = useState(0)
    const [activeTab, setActiveTab] = useState("edit")
    const [lastSaved, setLastSaved] = useState<Date | null>(null)
    const formRef = useRef<HTMLFormElement>(null)
    const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null)
    const [isSavingDraft, setIsSavingDraft] = useState(false)

    // Initialize TipTap editor
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: {
                    levels: [1, 2, 3, 4, 5, 6],
                },
            }),
            Placeholder.configure({
                placeholder: "Start writing your post content here...",
            }),
            Image.configure({
                allowBase64: true,
                inline: true,
            }),
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: "text-primary underline",
                },
            }),
            CodeBlockLowlight.configure({
                lowlight: createLowlight(),
            }),
            Underline,
            TextAlign.configure({
                types: ["heading", "paragraph"],
            }),
            Table.configure({
                resizable: true,
            }),
            TableRow,
            TableCell,
            TableHeader,
            Highlight,
        ],
        content: initialData?.content || "",
        onUpdate: ({ editor }) => {
            const text = editor.getText()
            const words = text.split(/\s+/).filter((word) => word.length > 0)
            setWordCount(words.length)
            setReadingTime(Math.ceil(words.length / 200)) // Assuming 200 words per minute reading speed

            // Trigger autosave for local drafts only if not editing an existing draft
            if (!draftId && autoSaveTimerRef.current) {
                clearTimeout(autoSaveTimerRef.current)
                autoSaveTimerRef.current = setTimeout(() => {
                    saveLocalDraft()
                }, 3000)
            }
        },
    })

    // Load draft from localStorage on component mount (only if not editing an existing draft)
    useEffect(() => {
        if (!draftId && !initialData) {
            const savedDraft = localStorage.getItem("postDraft")
            if (savedDraft) {
                try {
                    const draft = JSON.parse(savedDraft)
                    setTitle(draft.title || "")
                    setDescription(draft.description || "")
                    setTldr(draft.tldr || "")
                    if (editor && draft.content) {
                        editor.commands.setContent(draft.content)
                    }

                    if (draft.lastSaved) {
                        setLastSaved(new Date(draft.lastSaved))
                    }

                    addToast({
                        title: "Draft loaded",
                        description: "Your previous draft has been restored",
                        variant: "flat",
                        color: "default"
                    })
                } catch (error) {
                    console.error("Error loading draft:", error)
                }
            }
        }

        return () => {
            if (autoSaveTimerRef.current) {
                clearTimeout(autoSaveTimerRef.current)
            }
        }
    }, [editor, draftId, initialData])

    // Load initial content for existing draft
    useEffect(() => {
        if (initialData && editor && initialData.content) {
            editor.commands.setContent(initialData.content)
        }
    }, [initialData, editor])

    // Save draft to localStorage (for anonymous drafts)
    const saveLocalDraft = () => {
        if (!editor) return

        const draft = {
            title,
            description,
            tldr,
            content: editor.getJSON(),
            lastSaved: new Date().toISOString(),
        }

        localStorage.setItem("postDraft", JSON.stringify(draft))
        setLastSaved(new Date())

        addToast({
            title: "Draft saved",
            description: "Your draft has been saved locally",
            variant: "flat",
            color: "success"
        })
    }

    // Save draft to server (for logged-in users)
    const saveServerDraft = async () => {
        if (!editor || !session) return

        setIsSavingDraft(true)
        try {
            const content = editor.getHTML()

            // If we have a draftId, update the existing draft
            if (draftId) {
                const response = await fetch("/api/posts", {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        id: draftId,
                        title,
                        description,
                        tldr,
                        content,
                        status: "draft"
                    }),
                })

                if (!response.ok) {
                    throw new Error("Failed to update draft")
                }
            } else {
                // Otherwise create a new draft
                const response = await fetch("/api/posts", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        title,
                        description,
                        tldr,
                        content,
                        status: "draft"
                    }),
                })

                if (!response.ok) {
                    throw new Error("Failed to save draft")
                }

                const result = await response.json()

                // Clear localStorage draft after saving to server
                localStorage.removeItem("postDraft")

                // Redirect to drafts page
                router.push("/posts/drafts")
            }

            setLastSaved(new Date())
            addToast({
                title: "Draft saved",
                description: "Your draft has been saved successfully",
                variant: "flat",
                color: "success"
            })
        } catch (error) {
            console.error("Error saving draft:", error)
            addToast({
                title: "Error",
                description: "Failed to save draft. Please try again.",
                variant: "flat",
                color: "danger"
            })
        } finally {
            setIsSavingDraft(false)
        }
    }

    // Publish post (new or from draft)
    const publishPost = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!editor || !title.trim()) {
            addToast({
                title: "Missing information",
                description: "Please provide at least a title and some content",
                variant: "flat",
                color: "danger"
            })
            return
        }

        // Validate required fields for publishing
        if (!description.trim() || !tldr.trim()) {
            addToast({
                title: "Missing information",
                description: "Description and TL;DR are required for published posts",
                variant: "flat",
                color: "danger"
            })
            return
        }

        setIsSubmitting(true)

        try {
            // Get the content as HTML
            const content = editor.getHTML()

            // If we have a draftId, update the existing draft to published status
            if (draftId) {
                const response = await fetch("/api/posts", {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        id: draftId,
                        title,
                        description,
                        tldr,
                        content,
                        status: "published"
                    }),
                })

                if (!response.ok) {
                    throw new Error("Failed to publish post")
                }
            } else {
                // Otherwise create a new published post
                const response = await fetch("/api/posts", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        title,
                        description,
                        tldr,
                        content,
                        status: "published"
                    }),
                })

                if (!response.ok) {
                    throw new Error("Failed to publish post")
                }
            }

            // Clear the draft from localStorage
            localStorage.removeItem("postDraft")

            addToast({
                title: "Post published",
                description: "Your post has been published successfully",
                variant: "flat",
                color: "success"
            })

            // Redirect to the home page
            router.push("/")
            router.refresh()
        } catch (error) {
            console.error("Error publishing post:", error)
            addToast({
                title: "Error",
                description: "Failed to publish post. Please try again.",
                variant: "flat",
                color: "danger"
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    // Discard draft
    const discardDraft = () => {
        if (confirm("Are you sure you want to discard this draft? This action cannot be undone.")) {
            // If editing an existing draft and we want to delete it from the server
            if (draftId && session) {
                // TODO: Add API endpoint to delete drafts and call it here
                router.push("/posts/drafts")
            } else {
                // Just clear local state
                localStorage.removeItem("postDraft")
                setTitle("")
                setDescription("")
                setTldr("")
                if (editor) {
                    editor.commands.clearContent()
                }
                setLastSaved(null)
            }

            addToast({
                title: "Draft discarded",
                description: "Your draft has been discarded",
                variant: "flat",
                color: "success"
            })
        }
    }

    return (
        <form ref={formRef} onSubmit={publishPost} className="space-y-6">
            <div className="grid gap-4">
                <div>
                    <Input
                        placeholder="Post title"
                        value={title}
                        variant="bordered"
                        onValueChange={setTitle}
                        className="text-2xl font-bold border-none px-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                </div>

                <div>
                    <Textarea
                        placeholder="Short description (appears in post previews)"
                        value={description}
                        variant="bordered"
                        onValueChange={setDescription}
                        className="resize-none min-h-[80px]"
                    />
                </div>

                <div>
                    <Textarea
                        placeholder="TL;DR (optional summary of your post)"
                        value={tldr}
                        variant="bordered"
                        onValueChange={setTldr}
                        className="resize-none min-h-[60px]"
                    />
                </div>
            </div>

            <Card className="border rounded-lg overflow-hidden">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/50">
                        <TabsList className="grid w-[200px] grid-cols-2">
                            <TabsTrigger value="edit">Edit</TabsTrigger>
                            <TabsTrigger value="preview">Preview</TabsTrigger>
                        </TabsList>

                        <div className="flex items-center text-sm text-muted-foreground">
                            <span className="mr-4">{wordCount} words</span>
                            <span>{readingTime} min read</span>
                        </div>
                    </div>

                    <TabsContent value="edit" className="h-[500px] overflow-hidden">
                        {editor && (
                            <div className="w-full h-full">
                                <EditorToolbar editor={editor} />
                                <div className="p-4 h-[calc(100%-40px)] overflow-auto">
                                    <EditorContent editor={editor} className="focus:outline-none min-h-[400px]" />
                                </div>
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="preview" className="p-0 m-0">
                        <div className="p-6 min-h-[500px] w-full">
                            {editor?.isEmpty ? (
                                <p className="text-muted-foreground italic">Nothing to preview yet...</p>
                            ) : (
                                <div dangerouslySetInnerHTML={{ __html: editor?.getHTML() || "" }} />
                            )}
                        </div>
                    </TabsContent>
                </Tabs>
            </Card>

            <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                    {lastSaved ? <span>Last saved: {lastSaved.toLocaleTimeString()}</span> : <span>Not saved yet</span>}
                </div>

                <div className="flex space-x-2">
                    <Button type="button" variant="outline" onClick={discardDraft}>
                        Discard
                    </Button>
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={session ? saveServerDraft : saveLocalDraft}
                        disabled={isSavingDraft}
                    >
                        {isSavingDraft ? "Saving..." : "Save Draft"}
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Publishing..." : "Publish Post"}
                    </Button>
                </div>
            </div>
        </form>
    )
}

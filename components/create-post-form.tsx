"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Placeholder from "@tiptap/extension-placeholder"
import Image from "@tiptap/extension-image"
import Link from "@tiptap/extension-link"
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight"
import { createLowlight } from "lowlight"
import Underline from "@tiptap/extension-underline"
import TextAlign from "@tiptap/extension-text-align"
import Table from "@tiptap/extension-table"
import TableRow from "@tiptap/extension-table-row"
import TableCell from "@tiptap/extension-table-cell"
import TableHeader from "@tiptap/extension-table-header"
import Highlight from "@tiptap/extension-highlight"
import { addToast } from "@heroui/toast"
import { Input, Textarea } from "@heroui/input"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EditorToolbar } from "@/components/editor-toolbar"

export function CreatePostForm() {
    const router = useRouter()
    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [tldr, setTldr] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [wordCount, setWordCount] = useState(0)
    const [readingTime, setReadingTime] = useState(0)
    const [activeTab, setActiveTab] = useState("edit")
    const [lastSaved, setLastSaved] = useState<Date | null>(null)
    const formRef = useRef<HTMLFormElement>(null)
    const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null)

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
        content: "",
        onUpdate: ({ editor }) => {
            const text = editor.getText()
            const words = text.split(/\s+/).filter((word) => word.length > 0)
            setWordCount(words.length)
            setReadingTime(Math.ceil(words.length / 200)) // Assuming 200 words per minute reading speed

            // Trigger autosave
            if (autoSaveTimerRef.current) {
                clearTimeout(autoSaveTimerRef.current)
            }
            autoSaveTimerRef.current = setTimeout(() => {
                savePostDraft()
            }, 3000)
        },
    })

    // Load draft from localStorage on component mount
    useEffect(() => {
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

        return () => {
            if (autoSaveTimerRef.current) {
                clearTimeout(autoSaveTimerRef.current)
            }
        }
    }, [editor])

    // Save draft to localStorage
    const savePostDraft = () => {
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
    }

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
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

        setIsSubmitting(true)

        try {
            // Get the content as HTML
            const content = editor.getHTML()

            // Send the data to your API
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
                }),
            })

            if (!response.ok) {
                throw new Error("Failed to create post")
            }

            // Clear the draft from localStorage
            localStorage.removeItem("postDraft")

            addToast({
                title: "Post created",
                description: "Your post has been published successfully",
                variant: "flat",
                color: "success"
            })

            // Redirect to the home page or the new post
            router.push("/")
        } catch (error) {
            console.error("Error creating post:", error)
            addToast({
                title: "Error",
                description: "Failed to create post. Please try again.",
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
            localStorage.removeItem("postDraft")
            setTitle("")
            setDescription("")
            setTldr("")
            if (editor) {
                editor.commands.clearContent()
            }
            setLastSaved(null)
            addToast({
                title: "Draft discarded",
                description: "Your draft has been discarded",
                variant: "flat",
                color: "success"
            })
        }
    }

    return (
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
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

                    <TabsContent value="edit" className="p-0 m-0">
                        {editor && <EditorToolbar editor={editor} />}
                        <div className="p-4 min-h-[500px]">
                            <EditorContent editor={editor} className="w-full min-h-[500px] focus-visible:outline-none" />
                        </div>
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
                    <Button type="button" variant="secondary" onClick={savePostDraft}>
                        Save Draft
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Publishing..." : "Publish Post"}
                    </Button>
                </div>
            </div>
        </form>
    )
}

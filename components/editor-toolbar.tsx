"use client"

import type { Editor } from "@tiptap/react"
import {
    Bold,
    Italic,
    Underline,
    Strikethrough,
    Code,
    List,
    ListOrdered,
    AlignLeft,
    AlignCenter,
    AlignRight,
    AlignJustify,
    LinkIcon,
    ImageIcon,
    TableIcon,
    Highlighter,
    Undo,
    Redo,
    Quote,
    Minus,
} from "lucide-react"

import { Toggle } from "@/components/ui/toggle"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface EditorToolbarProps {
    editor: Editor
}

export function EditorToolbar({ editor }: EditorToolbarProps) {
    if (!editor) {
        return null
    }

    // Handle image upload
    const addImage = () => {
        const url = window.prompt("Enter the URL of the image:")

        if (url) {
            editor.chain().focus().setImage({ src: url }).run()
        }
    }

    // Handle link insertion
    const setLink = () => {
        const previousUrl = editor.getAttributes("link").href
        const url = window.prompt("Enter the URL:", previousUrl)

        // cancelled
        if (url === null) {
            return
        }

        // empty
        if (url === "") {
            editor.chain().focus().extendMarkRange("link").unsetLink().run()
            return
        }

        // update link
        editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run()
    }

    // Insert table
    const insertTable = () => {
        editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
    }

    return (
        <div className="border-b p-1 bg-background flex flex-wrap gap-1">
            <div className="flex items-center">
                <Select
                    value={
                        editor.isActive("heading", { level: 1 })
                            ? "h1"
                            : editor.isActive("heading", { level: 2 })
                                ? "h2"
                                : editor.isActive("heading", { level: 3 })
                                    ? "h3"
                                    : editor.isActive("paragraph")
                                        ? "p"
                                        : "p"
                    }
                    onValueChange={(value) => {
                        if (value === "p") {
                            editor.chain().focus().setParagraph().run()
                        } else if (value === "h1") {
                            editor.chain().focus().setHeading({ level: 1 }).run()
                        } else if (value === "h2") {
                            editor.chain().focus().setHeading({ level: 2 }).run()
                        } else if (value === "h3") {
                            editor.chain().focus().setHeading({ level: 3 }).run()
                        }
                    }}
                >
                    <SelectTrigger className="w-[130px] h-8">
                        <SelectValue placeholder="Paragraph" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="p">Paragraph</SelectItem>
                        <SelectItem value="h1">Heading 1</SelectItem>
                        <SelectItem value="h2">Heading 2</SelectItem>
                        <SelectItem value="h3">Heading 3</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <Separator orientation="vertical" className="mx-1 h-8" />

            <Toggle
                size="sm"
                pressed={editor.isActive("bold")}
                onPressedChange={() => editor.chain().focus().toggleBold().run()}
                aria-label="Toggle bold"
            >
                <Bold className="h-4 w-4" />
            </Toggle>

            <Toggle
                size="sm"
                pressed={editor.isActive("italic")}
                onPressedChange={() => editor.chain().focus().toggleItalic().run()}
                aria-label="Toggle italic"
            >
                <Italic className="h-4 w-4" />
            </Toggle>

            <Toggle
                size="sm"
                pressed={editor.isActive("underline")}
                onPressedChange={() => editor.chain().focus().toggleUnderline().run()}
                aria-label="Toggle underline"
            >
                <Underline className="h-4 w-4" />
            </Toggle>

            <Toggle
                size="sm"
                pressed={editor.isActive("strike")}
                onPressedChange={() => editor.chain().focus().toggleStrike().run()}
                aria-label="Toggle strikethrough"
            >
                <Strikethrough className="h-4 w-4" />
            </Toggle>

            <Toggle
                size="sm"
                pressed={editor.isActive("highlight")}
                onPressedChange={() => editor.chain().focus().toggleHighlight().run()}
                aria-label="Toggle highlight"
            >
                <Highlighter className="h-4 w-4" />
            </Toggle>

            <Separator orientation="vertical" className="mx-1 h-8" />

            <Toggle
                size="sm"
                pressed={editor.isActive("bulletList")}
                onPressedChange={() => editor.chain().focus().toggleBulletList().run()}
                aria-label="Toggle bullet list"
            >
                <List className="h-4 w-4" />
            </Toggle>

            <Toggle
                size="sm"
                pressed={editor.isActive("orderedList")}
                onPressedChange={() => editor.chain().focus().toggleOrderedList().run()}
                aria-label="Toggle ordered list"
            >
                <ListOrdered className="h-4 w-4" />
            </Toggle>

            <Toggle
                size="sm"
                pressed={editor.isActive("blockquote")}
                onPressedChange={() => editor.chain().focus().toggleBlockquote().run()}
                aria-label="Toggle blockquote"
            >
                <Quote className="h-4 w-4" />
            </Toggle>

            <Toggle
                size="sm"
                pressed={editor.isActive("codeBlock")}
                onPressedChange={() => editor.chain().focus().toggleCodeBlock().run()}
                aria-label="Toggle code block"
            >
                <Code className="h-4 w-4" />
            </Toggle>

            <Separator orientation="vertical" className="mx-1 h-8" />

            <Toggle
                size="sm"
                pressed={editor.isActive({ textAlign: "left" })}
                onPressedChange={() => editor.chain().focus().setTextAlign("left").run()}
                aria-label="Align left"
            >
                <AlignLeft className="h-4 w-4" />
            </Toggle>

            <Toggle
                size="sm"
                pressed={editor.isActive({ textAlign: "center" })}
                onPressedChange={() => editor.chain().focus().setTextAlign("center").run()}
                aria-label="Align center"
            >
                <AlignCenter className="h-4 w-4" />
            </Toggle>

            <Toggle
                size="sm"
                pressed={editor.isActive({ textAlign: "right" })}
                onPressedChange={() => editor.chain().focus().setTextAlign("right").run()}
                aria-label="Align right"
            >
                <AlignRight className="h-4 w-4" />
            </Toggle>

            <Toggle
                size="sm"
                pressed={editor.isActive({ textAlign: "justify" })}
                onPressedChange={() => editor.chain().focus().setTextAlign("justify").run()}
                aria-label="Align justify"
            >
                <AlignJustify className="h-4 w-4" />
            </Toggle>

            <Separator orientation="vertical" className="mx-1 h-8" />

            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={setLink} aria-label="Insert link">
                <LinkIcon className="h-4 w-4" />
            </Button>

            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={addImage} aria-label="Insert image">
                <ImageIcon className="h-4 w-4" />
            </Button>

            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={insertTable} aria-label="Insert table">
                <TableIcon className="h-4 w-4" />
            </Button>

            <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => editor.chain().focus().setHorizontalRule().run()}
                aria-label="Insert horizontal rule"
            >
                <Minus className="h-4 w-4" />
            </Button>

            <Separator orientation="vertical" className="mx-1 h-8" />

            <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => editor.chain().focus().undo().run()}
                disabled={!editor.can().undo()}
                aria-label="Undo"
            >
                <Undo className="h-4 w-4" />
            </Button>

            <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => editor.chain().focus().redo().run()}
                disabled={!editor.can().redo()}
                aria-label="Redo"
            >
                <Redo className="h-4 w-4" />
            </Button>
        </div>
    )
}

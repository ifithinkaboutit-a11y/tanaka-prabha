"use client"

import * as React from "react"
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import { Bold, Italic, List } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

/**
 * Minimal rich-text editor using Tiptap with Bold, Italic, BulletList.
 * Stores content as an HTML string.
 *
 * Props:
 *   value    {string}           - HTML string (controlled)
 *   onChange {(html: string) => void} - called on every content change
 *   placeholder {string}       - placeholder text when empty
 *   className {string}         - extra class for the wrapper
 */
export function RichTextEditor({ value, onChange, placeholder, className }) {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                // Only enable Bold, Italic, BulletList from StarterKit
                bold: true,
                italic: true,
                bulletList: true,
                listItem: true,
                // Disable unused extensions to keep it minimal
                blockquote: false,
                codeBlock: false,
                code: false,
                hardBreak: false,
                heading: false,
                horizontalRule: false,
                orderedList: false,
                strike: false,
            }),
        ],
        content: value || "",
        onUpdate({ editor }) {
            const html = editor.getHTML()
            // Treat empty paragraph as empty string
            onChange(html === "<p></p>" ? "" : html)
        },
        editorProps: {
            attributes: {
                class: "min-h-[80px] px-3 py-2 text-sm focus:outline-none",
            },
        },
    })

    // Sync external value changes (e.g. form reset)
    React.useEffect(() => {
        if (!editor) return
        const current = editor.getHTML()
        const incoming = value || ""
        if (current !== incoming && !(current === "<p></p>" && incoming === "")) {
            editor.commands.setContent(incoming, false)
        }
    }, [value, editor])

    if (!editor) return null

    return (
        <div className={cn("rounded-md border border-input bg-background", className)}>
            {/* Toolbar */}
            <div className="flex items-center gap-0.5 border-b px-2 py-1">
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    active={editor.isActive("bold")}
                    title="Bold"
                >
                    <Bold className="size-3.5" />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    active={editor.isActive("italic")}
                    title="Italic"
                >
                    <Italic className="size-3.5" />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    active={editor.isActive("bulletList")}
                    title="Bullet List"
                >
                    <List className="size-3.5" />
                </ToolbarButton>
            </div>
            {/* Editor area */}
            <div className="relative">
                {editor.isEmpty && placeholder && (
                    <p className="pointer-events-none absolute left-3 top-2 text-sm text-muted-foreground select-none">
                        {placeholder}
                    </p>
                )}
                <EditorContent editor={editor} />
            </div>
        </div>
    )
}

function ToolbarButton({ onClick, active, title, children }) {
    return (
        <Button
            type="button"
            variant="ghost"
            size="icon"
            className={cn("size-7", active && "bg-accent text-accent-foreground")}
            onClick={onClick}
            title={title}
        >
            {children}
        </Button>
    )
}

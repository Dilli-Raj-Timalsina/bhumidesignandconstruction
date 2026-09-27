"use client";

import { mergeAttributes, Node } from "@tiptap/core";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import StarterKit from "@tiptap/starter-kit";
import { EditorContent, useEditor } from "@tiptap/react";
import {
  Bold,
  Heading2,
  Heading3,
  ImagePlus,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Quote,
  RemoveFormatting,
} from "lucide-react";
import { useEffect, useState } from "react";

const AdminImage = Node.create({
  name: "image",
  group: "block",
  atom: true,
  draggable: true,
  addAttributes() {
    return {
      alt: { default: "" },
      src: { default: null },
    };
  },
  parseHTML() {
    return [{ tag: "img[src]" }];
  },
  renderHTML({ HTMLAttributes }) {
    return ["img", mergeAttributes(HTMLAttributes, { loading: "lazy" })];
  },
});

function ToolButton({
  label,
  active = false,
  onClick,
  children,
}: {
  label: string;
  active?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      aria-pressed={active}
      onClick={onClick}
      className={`inline-flex size-8 items-center justify-center transition-colors ${active ? "bg-bhumi text-white" : "text-slate-600 hover:bg-slate-100 hover:text-ink"}`}
    >
      {children}
    </button>
  );
}

export function RichTextEditor({
  name,
  initialContent = "",
  label = "Content",
  required = false,
}: {
  name: string;
  initialContent?: string;
  label?: string;
  required?: boolean;
}) {
  const [content, setContent] = useState(initialContent);
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Link.configure({ openOnClick: false, autolink: true, linkOnPaste: true }),
      Placeholder.configure({ placeholder: "Write the article body…" }),
      AdminImage,
    ],
    content: initialContent,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "min-h-64 px-4 py-4 text-sm leading-7 text-ink focus:outline-none prose-bhumi [&_img]:my-5 [&_img]:max-h-[30rem] [&_img]:w-full [&_img]:object-cover [&_.is-editor-empty:first-child::before]:pointer-events-none [&_.is-editor-empty:first-child::before]:float-left [&_.is-editor-empty:first-child::before]:h-0 [&_.is-editor-empty:first-child::before]:text-muted [&_.is-editor-empty:first-child::before]:content-[attr(data-placeholder)]",
      },
    },
    onUpdate: ({ editor: nextEditor }) => setContent(nextEditor.getHTML()),
  });

  useEffect(() => {
    if (editor && initialContent !== editor.getHTML()) {
      editor.commands.setContent(initialContent, { emitUpdate: false });
    }
  }, [editor, initialContent]);

  function setLink() {
    if (!editor) return;
    const previousUrl = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Enter the link URL", previousUrl ?? "");
    if (url === null) return;
    if (url.trim() === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: url.trim() })
      .run();
  }

  function insertImage() {
    if (!editor) return;
    const src = window.prompt("Enter the image URL");
    if (!src?.trim()) return;
    const alt = window.prompt("Image description (optional)") ?? "";
    editor
      .chain()
      .focus()
      .insertContent({ type: "image", attrs: { src: src.trim(), alt } })
      .run();
  }

  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-ink">
        {label}
        {required ? <span className="ml-1 text-red-700">*</span> : null}
      </label>
      <input type="hidden" name={name} value={content} required={required} />
      <div className="border border-line bg-white">
        <div
          className="flex flex-wrap gap-px border-b border-line bg-slate-50 p-1.5"
          aria-label="Text formatting controls"
        >
          <ToolButton
            label="Heading level 2"
            active={editor?.isActive("heading", { level: 2 })}
            onClick={() =>
              editor?.chain().focus().toggleHeading({ level: 2 }).run()
            }
          >
            <Heading2 className="size-4" />
          </ToolButton>
          <ToolButton
            label="Heading level 3"
            active={editor?.isActive("heading", { level: 3 })}
            onClick={() =>
              editor?.chain().focus().toggleHeading({ level: 3 }).run()
            }
          >
            <Heading3 className="size-4" />
          </ToolButton>
          <span className="mx-1 h-8 w-px bg-line" aria-hidden="true" />
          <ToolButton
            label="Bold"
            active={editor?.isActive("bold")}
            onClick={() => editor?.chain().focus().toggleBold().run()}
          >
            <Bold className="size-4" />
          </ToolButton>
          <ToolButton
            label="Italic"
            active={editor?.isActive("italic")}
            onClick={() => editor?.chain().focus().toggleItalic().run()}
          >
            <Italic className="size-4" />
          </ToolButton>
          <ToolButton
            label="Bullet list"
            active={editor?.isActive("bulletList")}
            onClick={() => editor?.chain().focus().toggleBulletList().run()}
          >
            <List className="size-4" />
          </ToolButton>
          <ToolButton
            label="Numbered list"
            active={editor?.isActive("orderedList")}
            onClick={() => editor?.chain().focus().toggleOrderedList().run()}
          >
            <ListOrdered className="size-4" />
          </ToolButton>
          <ToolButton
            label="Quote"
            active={editor?.isActive("blockquote")}
            onClick={() => editor?.chain().focus().toggleBlockquote().run()}
          >
            <Quote className="size-4" />
          </ToolButton>
          <ToolButton
            label="Add link"
            active={editor?.isActive("link")}
            onClick={setLink}
          >
            <LinkIcon className="size-4" />
          </ToolButton>
          <ToolButton label="Insert image" onClick={insertImage}>
            <ImagePlus className="size-4" />
          </ToolButton>
          <ToolButton
            label="Clear formatting"
            onClick={() =>
              editor?.chain().focus().clearNodes().unsetAllMarks().run()
            }
          >
            <RemoveFormatting className="size-4" />
          </ToolButton>
        </div>
        <EditorContent editor={editor} />
      </div>
      <p className="mt-2 text-xs text-muted">
        Use the image tool to place an already uploaded image URL in the article
        body.
      </p>
    </div>
  );
}

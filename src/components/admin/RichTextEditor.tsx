import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import Table from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Toggle } from "@/components/ui/toggle";
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  Heading1, Heading2, Heading3,
  List, ListOrdered, Quote, Code, Code2,
  Image as ImageIcon, Link as LinkIcon, Minus,
  Undo2, Redo2, FileCode, Table as TableIcon,
  Pilcrow,
} from "lucide-react";

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minimal?: boolean;
}

export function RichTextEditor({ content, onChange, placeholder = "Start writing…", minimal = false }: RichTextEditorProps) {
  const [showHtml, setShowHtml] = useState(false);
  const [rawHtml, setRawHtml] = useState(content);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      Image.configure({ inline: false, allowBase64: true }),
      Link.configure({ openOnClick: false, HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" } }),
      Placeholder.configure({ placeholder }),
      ...(minimal ? [] : [
        Table.configure({ resizable: true }),
        TableRow,
        TableCell,
        TableHeader,
      ]),
    ],
    content,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);
      setRawHtml(html);
    },
    editorProps: {
      attributes: {
        class: "prose prose-sm max-w-none min-h-[200px] p-4 focus:outline-none prose-headings:font-serif prose-headings:text-foreground prose-p:text-foreground/85",
      },
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content, false);
      setRawHtml(content);
    }
  }, [content, editor]);

  const handleRawHtmlChange = useCallback((val: string) => {
    setRawHtml(val);
    if (editor) {
      editor.commands.setContent(val, false);
      onChange(val);
    }
  }, [editor, onChange]);

  const toggleHtmlView = () => {
    if (showHtml && editor) {
      editor.commands.setContent(rawHtml, false);
    } else if (editor) {
      setRawHtml(editor.getHTML());
    }
    setShowHtml(!showHtml);
  };

  if (!editor) return null;

  const addLink = () => {
    const url = window.prompt("URL:");
    if (url) {
      editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
    }
  };

  const addImage = () => {
    const url = window.prompt("Image URL:");
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const insertTable = () => {
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  };

  return (
    <div className="rounded-md border border-input bg-background overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 p-1.5 border-b border-border bg-muted/30">
        <Toggle size="sm" pressed={editor.isActive("bold")} onPressedChange={() => editor.chain().focus().toggleBold().run()}>
          <Bold className="h-4 w-4" />
        </Toggle>
        <Toggle size="sm" pressed={editor.isActive("italic")} onPressedChange={() => editor.chain().focus().toggleItalic().run()}>
          <Italic className="h-4 w-4" />
        </Toggle>
        <Toggle size="sm" pressed={editor.isActive("underline")} onPressedChange={() => editor.chain().focus().toggleUnderline().run()}>
          <UnderlineIcon className="h-4 w-4" />
        </Toggle>
        <Toggle size="sm" pressed={editor.isActive("strike")} onPressedChange={() => editor.chain().focus().toggleStrike().run()}>
          <Strikethrough className="h-4 w-4" />
        </Toggle>

        <Separator orientation="vertical" className="h-6 mx-1" />

        {!minimal && (
          <>
            <Toggle size="sm" pressed={editor.isActive("heading", { level: 1 })} onPressedChange={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>
              <Heading1 className="h-4 w-4" />
            </Toggle>
            <Toggle size="sm" pressed={editor.isActive("heading", { level: 2 })} onPressedChange={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
              <Heading2 className="h-4 w-4" />
            </Toggle>
            <Toggle size="sm" pressed={editor.isActive("heading", { level: 3 })} onPressedChange={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
              <Heading3 className="h-4 w-4" />
            </Toggle>
            <Toggle size="sm" pressed={editor.isActive("paragraph")} onPressedChange={() => editor.chain().focus().setParagraph().run()}>
              <Pilcrow className="h-4 w-4" />
            </Toggle>

            <Separator orientation="vertical" className="h-6 mx-1" />
          </>
        )}

        <Toggle size="sm" pressed={editor.isActive("bulletList")} onPressedChange={() => editor.chain().focus().toggleBulletList().run()}>
          <List className="h-4 w-4" />
        </Toggle>
        <Toggle size="sm" pressed={editor.isActive("orderedList")} onPressedChange={() => editor.chain().focus().toggleOrderedList().run()}>
          <ListOrdered className="h-4 w-4" />
        </Toggle>

        {!minimal && (
          <>
            <Toggle size="sm" pressed={editor.isActive("blockquote")} onPressedChange={() => editor.chain().focus().toggleBlockquote().run()}>
              <Quote className="h-4 w-4" />
            </Toggle>
            <Toggle size="sm" pressed={editor.isActive("codeBlock")} onPressedChange={() => editor.chain().focus().toggleCodeBlock().run()}>
              <Code2 className="h-4 w-4" />
            </Toggle>
            <Toggle size="sm" pressed={editor.isActive("code")} onPressedChange={() => editor.chain().focus().toggleCode().run()}>
              <Code className="h-4 w-4" />
            </Toggle>

            <Separator orientation="vertical" className="h-6 mx-1" />

            <Button variant="ghost" size="sm" onClick={addLink} className="h-8 w-8 p-0">
              <LinkIcon className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={addImage} className="h-8 w-8 p-0">
              <ImageIcon className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().setHorizontalRule().run()} className="h-8 w-8 p-0">
              <Minus className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={insertTable} className="h-8 w-8 p-0">
              <TableIcon className="h-4 w-4" />
            </Button>

            <Separator orientation="vertical" className="h-6 mx-1" />
          </>
        )}

        <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} className="h-8 w-8 p-0">
          <Undo2 className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} className="h-8 w-8 p-0">
          <Redo2 className="h-4 w-4" />
        </Button>

        <div className="flex-1" />

        {!minimal && (
          <Button variant="ghost" size="sm" onClick={toggleHtmlView} className="h-8 px-2 text-xs gap-1">
            <FileCode className="h-3.5 w-3.5" />
            {showHtml ? "Visual" : "HTML"}
          </Button>
        )}
      </div>

      {/* Editor or HTML view */}
      {showHtml ? (
        <Textarea
          value={rawHtml}
          onChange={(e) => handleRawHtmlChange(e.target.value)}
          className="border-0 rounded-none font-mono text-xs min-h-[200px] focus-visible:ring-0"
          rows={12}
        />
      ) : (
        <EditorContent editor={editor} />
      )}
    </div>
  );
}

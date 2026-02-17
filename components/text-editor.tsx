"use client";
import {
  useEditor,
  EditorContent,
  Editor,
  useEditorState,
  EditorContext,
} from "@tiptap/react";

import Highlight from "@tiptap/extension-highlight";
import Underline from "@tiptap/extension-underline";
import { ListKit } from "@tiptap/extension-list";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import { Toggle } from "./ui/toggle";
import { Color, TextStyle } from "@tiptap/extension-text-style";
import {
  BoldIcon,
  BookImage,
  CodeIcon,
  HighlighterIcon,
  Italic,
  LinkIcon,
  ListIcon,
  ListOrderedIcon,
  Quote,
  StrikethroughIcon,
  UnderlineIcon,
  UnlinkIcon,
} from "lucide-react";
import { useCallback, useState, useRef, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { TextAlign } from "@tiptap/extension-text-align";
import { TextAlignButton } from "@/components/tiptap-ui/text-align-button";

const Tiptap = ({
  content,
  onChange,
}: {
  content?: string;
  onChange?: (content: string) => void;
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      ListKit,
      Image,
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      Underline,
      TextAlign.configure({ types: ["heading", "paragraph"] }),

      Link.configure({
        openOnClick: false,
        autolink: true,
        defaultProtocol: "https",
        protocols: ["http", "https"],
        isAllowedUri: (url, ctx) => {
          try {
            const parsedUrl = url.includes(":")
              ? new URL(url)
              : new URL(`${ctx.defaultProtocol}://${url}`);

            if (!ctx.defaultValidate(parsedUrl.href)) {
              return false;
            }

            const disallowedProtocols = ["ftp", "file", "mailto"];
            const protocol = parsedUrl.protocol.replace(":", "");

            if (disallowedProtocols.includes(protocol)) {
              return false;
            }

            const allowedProtocols = ctx.protocols.map((p) =>
              typeof p === "string" ? p : p.scheme,
            );

            if (!allowedProtocols.includes(protocol)) {
              return false;
            }

            const disallowedDomains = [
              "example-phishing.com",
              "malicious-site.net",
            ];
            const domain = parsedUrl.hostname;

            if (disallowedDomains.includes(domain)) {
              return false;
            }

            return true;
          } catch {
            return false;
          }
        },
        shouldAutoLink: (url) => {
          try {
            const parsedUrl = url.includes(":")
              ? new URL(url)
              : new URL(`https://${url}`);

            const disallowedDomains = [
              "example-no-autolink.com",
              "another-no-autolink.com",
            ];
            const domain = parsedUrl.hostname;

            return !disallowedDomains.includes(domain);
          } catch {
            return false;
          }
        },
      }),
    ],

    editorProps: {
      attributes: {
        // FIX 2: Added "tiptap-editor" so the CSS fix below can target this
        // editor without affecting other prose elements on the page
        class: "tiptap-editor prose min-h-24 border-2 px-2",
      },
    },

    content,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
    immediatelyRender: false,
  });

  return (
    <>
      {/*
        FIX 3: Tailwind's `prose` plugin hardcodes color values on strong, em,
        code etc. (e.g. `strong { color: var(--tw-prose-bold) }`), which
        overrides the inline `color` style Tiptap puts on the wrapping <span>.
        `color: inherit` forces those elements to pass the color through from
        the <span> instead of resetting it.

        Tip: you can move these rules into globals.css and remove this <style>
        block — same effect, cleaner separation.
      */}
      {/* <style>{`
        .tiptap-editor strong,
        .tiptap-editor b,
        .tiptap-editor em,
        .tiptap-editor i,
        .tiptap-editor u,
        .tiptap-editor s,
        .tiptap-editor del,
        .tiptap-editor code {
          color: inherit;
        }
      `}</style> */}
      {editor && <ToolBar editor={editor} />}
      <div className="">
        <EditorContent editor={editor} />
      </div>
    </>
  );
};

export default Tiptap;

// ─── Color definitions (shared between ColorPicker and ToolBar) ───────────────

const colors = [
  { value: "default", color: "", label: "Default" },
  { value: "purple", color: "#958DF1", label: "Purple" },
  { value: "red", color: "#F98181", label: "Red" },
  { value: "orange", color: "#FBBC88", label: "Orange" },
  { value: "yellow", color: "#FAF594", label: "Yellow" },
  { value: "blue", color: "#70CFF8", label: "Blue" },
  { value: "teal", color: "#94FADB", label: "Teal" },
  { value: "green", color: "#B9F18D", label: "Green" },
];

// ─── Color Picker Popover ─────────────────────────────────────────────────────

const ColorPicker = ({
  currentColor,
  onColorChange,
}: {
  currentColor: string | undefined;
  onColorChange: (value: string) => void;
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        title="Text color"
        className="flex items-center justify-center w-9 h-9 rounded-md border border-input bg-background hover:bg-accent transition-colors"
      >
        <span
          className="w-4 h-4 rounded-full border border-black/10"
          style={{ backgroundColor: currentColor || "#000000" }}
        />
      </button>

      {/* Popover grid */}
      {open && (
        <div
          className="absolute left-0 top-full mt-1 z-50 rounded-xl border border-border bg-popover shadow-lg p-3"
          style={{ minWidth: 180 }}
        >
          <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground mb-2 px-0.5">
            Text Color
          </p>
          <div className="grid grid-cols-4 gap-1.5">
            {colors.map((item) => {
              const isActive =
                item.value === "default"
                  ? !currentColor
                  : currentColor === item.color;

              return (
                <button
                  key={item.value}
                  type="button"
                  title={item.label}
                  onClick={() => {
                    onColorChange(item.value);
                    setOpen(false);
                  }}
                  className={[
                    "relative flex items-center justify-center w-8 h-8 rounded-lg border transition-all duration-150",
                    isActive
                      ? "ring-2 ring-offset-1 ring-foreground border-transparent scale-110"
                      : "border-border hover:scale-105 hover:border-foreground/40",
                  ].join(" ")}
                  style={{
                    backgroundColor: item.color || "#000000",
                  }}
                >
                  {isActive && (
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 12 12"
                      fill="none"
                      className="absolute"
                    >
                      <path
                        d="M2 6L5 9L10 3"
                        stroke={
                          item.value === "yellow" || item.value === "default"
                            ? "#000"
                            : "#fff"
                        }
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

// ─── ToolBar ──────────────────────────────────────────────────────────────────

const ToolBar = ({ editor }: { editor: Editor }) => {
  const editorState = useEditorState({
    editor,
    selector: (ctx) => {
      return {
        isBold: ctx.editor.isActive("bold") ?? false,
        isItalic: ctx.editor.isActive("italic") ?? false,
        isUnderline: ctx.editor.isActive("underline") ?? false,
        isStrike: ctx.editor.isActive("strike") ?? false,
        isHighlight: ctx.editor.isActive("highlight") ?? false,
        isCode: ctx.editor.isActive("code") ?? false,
        isBulletList: ctx.editor.isActive("bulletList") ?? false,
        isOrderedList: ctx.editor.isActive("orderedList") ?? false,
        isBlockquote: ctx.editor.isActive("blockquote") ?? false,
        isLink: ctx.editor.isActive("link") ?? false,
        isParagraph: ctx.editor.isActive("paragraph") ?? false,
        isHeading1: ctx.editor.isActive("heading", { level: 1 }) ?? false,
        isHeading2: ctx.editor.isActive("heading", { level: 2 }) ?? false,
        isHeading3: ctx.editor.isActive("heading", { level: 3 }) ?? false,
        isHeading4: ctx.editor.isActive("heading", { level: 4 }) ?? false,
        isHeading5: ctx.editor.isActive("heading", { level: 5 }) ?? false,
        isHeading6: ctx.editor.isActive("heading", { level: 6 }) ?? false,
        color: ctx.editor.getAttributes("textStyle").color,
        isPurple: ctx.editor.isActive("textStyle", { color: "#958DF1" }),
        isRed: ctx.editor.isActive("textStyle", { color: "#F98181" }),
        isOrange: ctx.editor.isActive("textStyle", { color: "#FBBC88" }),
        isYellow: ctx.editor.isActive("textStyle", { color: "#FAF594" }),
        isBlue: ctx.editor.isActive("textStyle", { color: "#70CFF8" }),
        isTeal: ctx.editor.isActive("textStyle", { color: "#94FADB" }),
        isGreen: ctx.editor.isActive("textStyle", { color: "#B9F18D" }),
      };
    },
  });

  const setLink = useCallback(() => {
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("URL", previousUrl);

    if (url === null) return;

    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    try {
      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: url })
        .run();
    } catch (e) {
      alert(e.message);
    }
  }, [editor]);

  const addImage = useCallback(() => {
    const url = window.prompt("URL");
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);

  if (!editor) return null;

  const handleHeadingChange = (value: string) => {
    if (value === "paragraph") {
      editor.chain().focus().setParagraph().run();
    } else {
      const level = Number.parseInt(value.replace("heading", "")) as
        | 1
        | 2
        | 3
        | 4
        | 5
        | 6;
      editor.chain().focus().setHeading({ level }).run();
    }
  };

  const handleColorChange = (value: string) => {
    if (value === "default") {
      editor.chain().focus().unsetColor().run();
    } else {
      const selected = colors.find((c) => c.value === value);
      if (selected?.color) {
        editor.chain().focus().setColor(selected.color).run();
      }
    }
  };

  return (
    <div
      className={
        "bg-background sticky top-0 z-10 flex flex-wrap items-center gap-1 border-b p-2 w-full"
      }
    >
      <Select
        onValueChange={handleHeadingChange}
        value={
          editorState.isHeading1
            ? "heading1"
            : editorState.isHeading2
              ? "heading2"
              : editorState.isHeading3
                ? "heading3"
                : editorState.isHeading4
                  ? "heading4"
                  : editorState.isHeading5
                    ? "heading5"
                    : editorState.isHeading6
                      ? "heading6"
                      : "paragraph"
        }
      >
        <SelectTrigger className="w-17.5">
          <SelectValue placeholder="14" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="paragraph">14</SelectItem>
          <SelectItem value="heading6">16</SelectItem>
          <SelectItem value="heading5">18</SelectItem>
          <SelectItem value="heading4">20</SelectItem>
          <SelectItem value="heading3">22</SelectItem>
          <SelectItem value="heading2">24</SelectItem>
          <SelectItem value="heading1">26</SelectItem>
        </SelectContent>
      </Select>

      <ColorPicker
        currentColor={editorState.color}
        onColorChange={handleColorChange}
      />

      <Toggle
        aria-label="Toggle bold"
        size="sm"
        pressed={editorState.isBold}
        onPressedChange={() => editor.chain().focus().toggleBold().run()}
      >
        <BoldIcon className="h-4 w-4" />
      </Toggle>
      <Toggle
        aria-label="Toggle italic"
        size="sm"
        pressed={editorState.isItalic}
        onPressedChange={() => editor.chain().focus().toggleItalic().run()}
      >
        <Italic className="h-4 w-4" />
      </Toggle>
      <Toggle
        aria-label="Toggle underline"
        size="sm"
        pressed={editorState.isUnderline}
        onPressedChange={() => editor.chain().focus().toggleUnderline().run()}
      >
        <UnderlineIcon className="h-4 w-4" />
      </Toggle>
      <Toggle
        aria-label="Toggle strikethrough"
        size="sm"
        pressed={editorState.isStrike}
        onPressedChange={() => editor.chain().focus().toggleStrike().run()}
      >
        <StrikethroughIcon className="h-4 w-4" />
      </Toggle>
      <EditorContext.Provider value={{ editor }}>
        <TextAlignButton
          editor={editor}
          align="left"
          onAligned={() => console.log("Text aligned!")}
        />
        <TextAlignButton align="center" />
        <TextAlignButton align="right" />
      </EditorContext.Provider>
      <Toggle
        aria-label="Toggle highlight"
        size="sm"
        pressed={editorState.isHighlight}
        onPressedChange={() => editor.chain().focus().toggleHighlight().run()}
      >
        <HighlighterIcon className="h-4 w-4" />
      </Toggle>
      <Toggle
        aria-label="Toggle code"
        size="sm"
        pressed={editorState.isCode}
        onPressedChange={() => editor.chain().focus().toggleCode().run()}
      >
        <CodeIcon className="h-4 w-4" />
      </Toggle>
      <Toggle
        aria-label="Toggle bullet list"
        size="sm"
        pressed={editorState.isBulletList}
        onPressedChange={() => editor.chain().focus().toggleBulletList().run()}
      >
        <ListIcon className="h-4 w-4" />
      </Toggle>
      <Toggle
        aria-label="Toggle ordered list"
        size="sm"
        pressed={editorState.isOrderedList}
        onPressedChange={() => editor.chain().focus().toggleOrderedList().run()}
      >
        <ListOrderedIcon className="h-4 w-4" />
      </Toggle>
      <Toggle
        aria-label="Toggle blockquote"
        size="sm"
        pressed={editorState.isBlockquote}
        onPressedChange={() => editor.chain().focus().toggleBlockquote().run()}
      >
        <Quote className="h-4 w-4" />
      </Toggle>
      <Toggle size="sm" onPressedChange={addImage}>
        <BookImage className="h-4 w-4" />
      </Toggle>

      {editorState.isLink ? (
        <Toggle
          aria-label="Unset link"
          size="sm"
          pressed={editorState.isLink}
          onPressedChange={() =>
            editor.chain().focus().extendMarkRange("link").unsetLink().run()
          }
        >
          <UnlinkIcon className="h-4 w-4" />
        </Toggle>
      ) : (
        <Toggle
          aria-label="Set link"
          size="sm"
          pressed={false}
          onPressedChange={setLink}
        >
          <LinkIcon className="h-4 w-4" />
        </Toggle>
      )}
    </div>
  );
};

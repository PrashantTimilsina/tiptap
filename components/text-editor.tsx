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
import Link from "@tiptap/extension-link";
import { Toggle } from "./ui/toggle";
import {
  BoldIcon,
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
import { useCallback } from "react";
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
      ListKit,
      StarterKit,
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
            // construct URL
            const parsedUrl = url.includes(":")
              ? new URL(url)
              : new URL(`${ctx.defaultProtocol}://${url}`);

            // use default validation
            if (!ctx.defaultValidate(parsedUrl.href)) {
              return false;
            }

            // disallowed protocols
            const disallowedProtocols = ["ftp", "file", "mailto"];
            const protocol = parsedUrl.protocol.replace(":", "");

            if (disallowedProtocols.includes(protocol)) {
              return false;
            }

            // only allow protocols specified in ctx.protocols
            const allowedProtocols = ctx.protocols.map((p) =>
              typeof p === "string" ? p : p.scheme,
            );

            if (!allowedProtocols.includes(protocol)) {
              return false;
            }

            // disallowed domains
            const disallowedDomains = [
              "example-phishing.com",
              "malicious-site.net",
            ];
            const domain = parsedUrl.hostname;

            if (disallowedDomains.includes(domain)) {
              return false;
            }

            // all checks have passed
            return true;
          } catch {
            return false;
          }
        },
        shouldAutoLink: (url) => {
          try {
            // construct URL
            const parsedUrl = url.includes(":")
              ? new URL(url)
              : new URL(`https://${url}`);

            // only auto-link if the domain is not in the disallowed list
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
        class: "prose min-h-24 border-2 px-2",
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
      {editor && <ToolBar editor={editor} />}
      <div className="">
        <EditorContent editor={editor} />
      </div>
    </>
  );
};

export default Tiptap;
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
        //block list
        isParagraph: ctx.editor.isActive("paragraph") ?? false,
        isHeading1: ctx.editor.isActive("heading", { level: 1 }) ?? false,
        isHeading2: ctx.editor.isActive("heading", { level: 2 }) ?? false,
        isHeading3: ctx.editor.isActive("heading", { level: 3 }) ?? false,
        isHeading4: ctx.editor.isActive("heading", { level: 4 }) ?? false,
        isHeading5: ctx.editor.isActive("heading", { level: 5 }) ?? false,
        isHeading6: ctx.editor.isActive("heading", { level: 6 }) ?? false,
      };
    },
  });
  const setLink = useCallback(() => {
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("URL", previousUrl);

    // cancelled
    if (url === null) {
      return;
    }

    // empty
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();

      return;
    }

    // update link
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
  return (
    <div
      className={
        "bg-background sticky top-0 z-10 flex flex-wrap items-center gap-1 border-b p-2 w-full "
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

      <Toggle
        aria-label="Toggle bold"
        size="sm"
        pressed={editorState.isBold}
        onPressedChange={() => editor.chain().focus().toggleBold().run()}
      >
        <BoldIcon className="h-4 w-4 " />
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
          // text="Left"
          // hideWhenUnavailable={true}
          // showShortcut={true}
          onAligned={() => console.log("Text aligned!")}
        />
        <TextAlignButton align="center" />
        <TextAlignButton align="right" />
        {/* <TextAlignButton align="justify" /> */}

        {/* <EditorContent editor={editor} role="presentation" /> */}
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

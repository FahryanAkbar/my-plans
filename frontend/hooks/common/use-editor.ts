import { useRef } from "react";
import { useTheme } from "next-themes";
import { BlockNoteEditor, PartialBlock } from "@blocknote/core";
import { useCreateBlockNote } from "@blocknote/react";
import { darkDefaultTheme } from "@blocknote/mantine";
import { toast } from "sonner";

import { useEdgeStore } from "@/lib";
import { isSafeFile } from "@/lib/utils";

interface UseEditorOptions {
  initialContent?: string;
  editable?: boolean;
}

interface UseEditorReturn {
  editor: BlockNoteEditor;
  theme: typeof darkDefaultTheme | "light";
}

export const useEditor = ({
  initialContent,
  editable,
}: UseEditorOptions): UseEditorReturn => {
  const { resolvedTheme } = useTheme();
  const { edgestore } = useEdgeStore();

  const editorRef = useRef<BlockNoteEditor | null>(null);

  const handleUpload = async (file: File): Promise<string> => {
    const validation = isSafeFile(file);

    if (!validation.safe) {
      const message = validation.reason ?? "File tidak aman untuk diupload.";
      toast.error(message);

      setTimeout(() => {
        const editor = editorRef.current;
        if (!editor) return;

        try {
          const { block } = editor.getTextCursorPosition();
          const uploadBlockTypes = ["image", "file", "video", "audio"];

          if (block && uploadBlockTypes.includes(block.type)) {
            editor.removeBlocks([block]);
          }
        } catch {
          
        }
      }, 200);

      return Promise.reject(new Error(message));
    }

    try {
      const response = await edgestore.publicFiles.upload({ file });
      return response.url;
    } catch (error) {
      const message = "Gagal mengupload file ke server. Coba lagi.";
      toast.error(message);
      console.log(error)
      return Promise.reject(new Error(message));
    }
  };

  const editor = useCreateBlockNote({
    editable,
    initialContent:
      initialContent
        ? JSON.parse(initialContent) as PartialBlock[]
        : undefined,
    uploadFile: handleUpload,
  });

  // eslint-disable-next-line react-hooks/refs
  editorRef.current = editor;

  const customDarkTheme = {
    ...darkDefaultTheme,
    colors: {
      ...darkDefaultTheme.colors,
      editor: {
        text: "#ffffff",
        background: "transparent",
      },
    },
  };

  const theme = resolvedTheme === "dark" ? customDarkTheme : "light";

  return { editor, theme };
};

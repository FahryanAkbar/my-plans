"use client";

import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/core/style.css";
import "@blocknote/mantine/style.css";

import { EdgeStoreProvider } from "@/lib";
import { useEditor } from "@/hooks/common";

interface EditorProps {
  onChange: (value: string) => void;
  initialContent?: string;
  editable?: boolean;
};

const EditorContent = ({
  onChange,
  initialContent,
  editable
}: EditorProps) => {
  const { editor, theme } = useEditor({
    initialContent,
    editable
  });

  return (
    <div className="bg-background min-h-full">
      <BlockNoteView
        editor={editor}
        theme={theme}
        className="bg-transparent! [&_.bn-editor]:!bg-transparent"
        onChange={() => {
          onChange(JSON.stringify(editor.document, null, 2));
        }}
      />
    </div>
  )
}

const Editor = (props: EditorProps) => {
  return (
    <EdgeStoreProvider>
      <EditorContent {...props} />
    </EdgeStoreProvider>
  );
}

export { Editor };

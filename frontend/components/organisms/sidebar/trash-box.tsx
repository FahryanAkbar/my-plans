'use client'

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { Search, Trash, Undo } from "lucide-react";
import { toast } from "sonner";

import { api } from "@/convex/_generated/api";
import { Doc, Id } from "@/convex/_generated/dataModel";

import { Input, Loaders, Typography } from "@/components/atoms";
import { ConfirmModal } from "@/components/molecules";

interface TrashItemProps {
  document: Doc<"documents">;
  onRestore: (event: React.MouseEvent<HTMLDivElement, MouseEvent>, documentId: Id<"documents">) => void;
  onRemove: (documentId: Id<"documents">) => void;
  onClick: (documentId: string) => void;
}

const TrashItem = ({ document, onRestore, onRemove, onClick }: TrashItemProps) => {
  const [open, setOpen] = useState(false);

  return (
    <div
      role="button"
      onClick={() => onClick(document._id)}
      className="text-sm rounded-sm w-full hover:bg-primary/5 flex items-center text-primary justify-between group"
    >
      <span className="truncate pl-2">
        {document.title}
      </span>
      <div className="flex items-center">
        <div
          onClick={(e) => onRestore(e, document._id)}
          role="button"
          className="rounded-sm p-2 hover:bg-neutral-200 dark:hover:bg-neutral-600"
        >
          <Undo className="h-4 w-4 text-muted-foreground" />
        </div>
        <ConfirmModal 
          open={open}
          onOpenChange={setOpen}
          onConfirm={() => onRemove(document._id)}
          title="Delete this Notes?"
          description="This document will be permanently removed. This action cannot be undone."
          variant="destructive"
          confirmText="Delete"
        >
          <div
            role="button"
            onClick={(e) => e.stopPropagation()}
            className="rounded-sm p-2 hover:bg-neutral-200 dark:hover:bg-neutral-600"
          >
            <Trash className="h-4 w-4 text-muted-foreground" />
          </div>
        </ConfirmModal>
      </div>
    </div>
  );
};

export const TrashBox = () => {
  const router = useRouter();
  const params = useParams();
  const documents = useQuery(api.documents.getTrash);
  const restore = useMutation(api.documents.restore);
  const remove = useMutation(api.documents.remove);

  const [search, setSearch] = useState("");

  const filteredDocuments = documents?.filter((document) => {
    return document.title.toLowerCase().includes(search.toLowerCase());
  });

  const onClick = (documentId: string) => {
    router.push(`/documents/${documentId}`);
  };

  const onRestore = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>,
    documentId: Id<"documents">,
  ) => {
    event.stopPropagation();
    const promise = restore({ id: documentId });

    toast.promise(promise, {
      loading: "Restoring note...",
      success: "Note restored!",
      error:" Failed to restore note."
    });
  };

  const onRemove = (
    documentId: Id<"documents">,
  ) => {
    const promise = remove({ id: documentId });

    toast.promise(promise, {
      loading: "Deleting note...",
      success: "Note deleted!",
      error:" Failed to delete note."
    });

    if (params.documentId === documentId) {
      router.push("/documents");
    }
  };

  if (documents === undefined) {
    return (
      <div className="h-full flex items-center justify-center p-4">
        <Loaders size="sm" />
      </div>
    );
  }

  return (
    <div className="text-sm">
      <div className="flex items-center gap-x-1 p-2">
        <Search className="h-4 w-4" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-7 px-2 focus-visible:ring-transparent bg-secondary"
          placeholder="Filter by page title..."
        />
      </div>
      <div className="mt-2 px-1 pb-1">
        <Typography variant="muted" className="hidden last:block text-xs text-center text-muted-foreground pb-2">
          No documents found.
        </Typography>
        {filteredDocuments?.map((document) => (
          <TrashItem 
            key={document._id}
            document={document}
            onRestore={onRestore}
            onRemove={onRemove}
            onClick={onClick}
          />
        ))}
      </div>
    </div>
  );
};

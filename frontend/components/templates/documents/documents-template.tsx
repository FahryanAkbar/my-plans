"use client";

import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { toast } from "sonner";

import { api } from "@/convex/_generated/api";
import { EmptyState } from "@/components/organisms";

export const DocumentsTemplate = () => {
  const router = useRouter();
  const createDocument = useMutation(api.documents.create);

  const onCreate = () => {
    const promise = createDocument({ title: "Untitled" }).then((documentId) => {
      router.push(`/documents/${documentId}`);
    });

    toast.promise(promise, {
      loading: "Creating a new note...",
      success: "New note created!",
      error: "Failed to create a new note.",
    });
  };

  return (
    <div className="h-full flex flex-col items-center justify-center space-y-4">
      <EmptyState onCreate={onCreate} />
    </div>
  );
};

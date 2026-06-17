'use client'

import { useState } from "react";
import { useParams } from "next/navigation";
import { useCoverImage } from "@/hooks";
import { useEdgeStore } from "@/lib";
import { useConvexAuth } from "convex/react";
import { toast } from "sonner";

import { api } from "@/convex/_generated/api";
import { useMutation } from "convex/react";
import { Id } from "@/convex/_generated/dataModel";
import { isSafeFile } from "@/lib/utils/sanitizer";

import {
  Dialog,
  DialogDescription,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/atoms";
import { SingleImageDropzone } from "../../molecules/single-image-uploader";


export const CoverImageModal = () => {
  const params = useParams();
  const update = useMutation(api.documents.update);
  const { isAuthenticated, isLoading } = useConvexAuth();

  const coverImage = useCoverImage();
  const { edgestore } = useEdgeStore();

  const [file, setFile] = useState<File>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onClose = () => {
    setFile(undefined);
    setIsSubmitting(false);
    coverImage.onClose();
  }

  const onChange = async (file?: File) => {
    if (!file) return;
    
    const check = isSafeFile(file);
    if (!check.safe) {
      toast.error("Files are rejected for security reasons", {
        description: check.reason
      });
      return;
    }

    if (isLoading || !isAuthenticated) {
      toast.error("The session is not ready. Please try again after logging in.");
      return;
    }

    if (!params.documentId) {
      toast.error("Document ID not found.");
      return;
    }

    setIsSubmitting(true);
    setFile(file);

    try {
      const res = await edgestore.publicFiles.upload({
        file,
        options: {
          replaceTargetUrl: coverImage.url
        }
      });

      await update({
        id: params.documentId as Id<"documents">,
        coverImage: res.url
      });

      onClose();
    } catch (error) {
      toast.error("Failed to upload cover image.");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={coverImage.isOpen} onOpenChange={coverImage.onClose}>
      <DialogContent>
        <DialogHeader className="border-b pb-3">
          <DialogTitle className="text-lg font-medium">
            Upload cover image
          </DialogTitle>
        </DialogHeader>
        <DialogDescription className="py-4">
          Recommended images have a 3:1 ratio and a minimum size of 1500x500 pixels for best results.
        </DialogDescription>
        <SingleImageDropzone
          className="w-full outline-none"
          disabled={isSubmitting}
          value={file}
          onChange={onChange}
        />
      </DialogContent>
    </Dialog>
  );
};

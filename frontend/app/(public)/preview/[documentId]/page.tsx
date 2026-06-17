"use client";

import { use } from "react";
import { Id } from "@/convex/_generated/dataModel";
import { PreviewTemplate } from "@/components/templates/preview/preview-template";

interface DocumentIdPageProps {
  params: Promise<{
    documentId: Id<"documents">;
  }>;
}

const DocumentIdPage = ({ params }: DocumentIdPageProps) => {
  const { documentId } = use(params);

  return <PreviewTemplate documentId={documentId} />;
};

export default DocumentIdPage;

"use client";

import { use } from "react";
import { Id } from "@/convex/_generated/dataModel";
import { DocumentIdTemplate } from "@/components/templates";

interface DocumentIdPageProps {
  params: Promise<{
    documentId: Id<"documents">;
  }>;
}

const DocumentIdPage = ({ params }: DocumentIdPageProps) => {
  const { documentId } = use(params);

  return <DocumentIdTemplate documentId={documentId} />;
};

export default DocumentIdPage;

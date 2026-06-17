import { Metadata } from "next";

import { DocumentsTemplate } from "@/components/templates";

export const metadata: Metadata = {
  title: "My PLAN | Workspace",
  description: 
    "Access your documents in Notion Clone!"
}

const DocumentPage = () => {
  return <DocumentsTemplate />;
};

export default DocumentPage;
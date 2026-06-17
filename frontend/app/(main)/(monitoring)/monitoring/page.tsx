import { Metadata } from "next";

import { ManagementProjectTemplate } from "@/components/templates"

export const metadata: Metadata = {
  title: "My PLAN | Analytics Dashboard",
  description: 
    "Access your documents in Notion Clone!"
}

const ManagementProjectPage = () => {
  return <ManagementProjectTemplate />
}

export default ManagementProjectPage
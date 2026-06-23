import { Metadata } from "next";

import { MarketingTemplate } from "@/components/templates";

export const metadata: Metadata = {
  title: "My PLAN",
  description: 'Access your documents in Notion Clone!',
}

const MarketingPage = () => {
  return <MarketingTemplate />;
}

export default MarketingPage;

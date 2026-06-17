"use client";

import { use } from "react";
import { JoinTokenTemplate } from "@/components/templates";

interface JoinPageProps {
  params: Promise<{
    token: string;
  }>;
}

const JoinPage = ({ params }: JoinPageProps) => {
  const { token } = use(params);

  return <JoinTokenTemplate token={token} />;
};

export default JoinPage;
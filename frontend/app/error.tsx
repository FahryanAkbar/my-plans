"use client";

import { GeneralErrorTemplate } from "@/components/templates";

const ErrorPage = ({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) => {
  return (
    <GeneralErrorTemplate 
      error={error}
      reset={reset}
    />
  );
};

export default ErrorPage;
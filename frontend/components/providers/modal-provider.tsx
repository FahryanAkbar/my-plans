/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import { useEffect, useState } from "react";

import { CoverImageModal } from "@/components/organisms";
import { SettingsModal } from "@/components/organisms";
import { EdgeStoreProvider } from "@/lib";

export const ModalProvider = () => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }
  
  return (
    <>
      <SettingsModal />
      <EdgeStoreProvider>
        <CoverImageModal />
      </EdgeStoreProvider>
    </>
  );
};

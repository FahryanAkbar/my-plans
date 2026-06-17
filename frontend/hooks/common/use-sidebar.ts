"use client";

import { useLayoutEffect, useRef, useState, ElementRef } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { useMediaQuery } from "usehooks-ts";
import { toast } from "sonner";

import { api } from "@/convex/_generated/api";

export const useSidebar = () => {
  const router = useRouter();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const create = useMutation(api.documents.create);

  const isResizingRef = useRef(false);
  const sidebarRef = useRef<ElementRef<"aside">>(null);
  const navbarRef = useRef<ElementRef<"div">>(null);

  const [isResetting, setIsResetting] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(isMobile);

  const handleMouseDown = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    event.preventDefault();
    event.stopPropagation();

    isResizingRef.current = true;
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleMouseMove = (event: MouseEvent) => {
    if (!isResizingRef.current) return;

    let newWidth = event.clientX;

    if (newWidth < 240) newWidth = 240;
    if (newWidth > 480) newWidth = 480;

    if (sidebarRef.current && navbarRef.current) {
      sidebarRef.current.style.width = `${newWidth}px`;
      navbarRef.current.style.setProperty("left", `${newWidth}px`);
      navbarRef.current.style.setProperty(
        "width",
        `calc(100% - ${newWidth}px)`
      );
    }
  };

  const handleMouseUp = () => {
    isResizingRef.current = false;
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  };

  const resetWidth = () => {
    if (!sidebarRef.current || !navbarRef.current) return;

    setIsCollapsed(false);
    setIsResetting(true);

    const width = "240px";

    sidebarRef.current.style.width = width;
    navbarRef.current.style.setProperty("width", `calc(100% - ${width})`);
    navbarRef.current.style.setProperty("left", width);

    setTimeout(() => setIsResetting(false), 300);
  };

  const collapse = () => {
    if (!sidebarRef.current || !navbarRef.current) return;

    setIsCollapsed(true);
    setIsResetting(true);

    sidebarRef.current.style.width = "0";
    navbarRef.current.style.setProperty("width", "100%");
    navbarRef.current.style.setProperty("left", "0");

    setTimeout(() => setIsResetting(false), 300);
  };

  const handleCreate = () => {
    const promise = create({ title: "Untitled" }).then((documentId) =>
      router.push(`/documents/${documentId}`)
    );

    toast.promise(promise, {
      loading: "Creating a new note...",
      success: "New note created!",
      error: "Failed to create a new note.",
    });
  };

  useLayoutEffect(() => {
    if (!sidebarRef.current || !navbarRef.current) return;

    if (isMobile) {
      sidebarRef.current.style.width = "0";
      navbarRef.current.style.setProperty("width", "100%");
      navbarRef.current.style.setProperty("left", "0");
    } else {
      sidebarRef.current.style.width = "240px";
      navbarRef.current.style.setProperty("width", "calc(100% - 240px)");
      navbarRef.current.style.setProperty("left", "240px");
    }
  }, [isMobile]);

  return {
    sidebarRef,
    navbarRef,
    isMobile,
    isResetting,
    isCollapsed,
    handleMouseDown,
    handleCreate,
    resetWidth,
    collapse,
  };
};

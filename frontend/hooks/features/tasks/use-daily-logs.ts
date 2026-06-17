"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { startOfDay, format } from "date-fns";
import { toast } from "sonner";

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { MemberInfo, Block } from "@/types/features";

interface UseDailyLogsProps {
  projectId: Id<"projects">;
  dateStr: string;
}

const generateDynamicTemplate = (members: MemberInfo[]) => {
  const blocks: Block[] = [];

  members.forEach((member, index) => {
    blocks.push({
      type: "heading",
      props: { level: 1 },
      content: [{ type: "text", text: member.fullName || "Team Member", styles: { bold: true } }],
    });

    blocks.push({
      type: "heading",
      props: { level: 3 },
      content: [{ type: "text", text: "Progress :", styles: { bold: true } }],
    });
    blocks.push({
      type: "checkListItem",
      props: { checked: true },
      content: [{ type: "text", text: "Task completed ✅", styles: {} }],
    });
    blocks.push({
      type: "checkListItem",
      props: { checked: false },
      content: [{ type: "text", text: "Task in progress ⏳", styles: {} }],
    });

    blocks.push({
      type: "heading",
      props: { level: 3 },
      content: [{ type: "text", text: "To-do :", styles: { bold: true } }],
    });
    blocks.push({
      type: "bulletListItem",
      content: [{ type: "text", text: "Planned task 1", styles: {} }],
    });
    blocks.push({
      type: "bulletListItem",
      content: [{ type: "text", text: "Planned task 2", styles: {} }],
    });

    if (index < members.length - 1) {
      blocks.push({ type: "paragraph", content: [] });
      blocks.push({ type: "paragraph", content: [] });
    }
  });

  return JSON.stringify(blocks);
};

export const useDailyLogs = ({ projectId, dateStr }: UseDailyLogsProps) => {
  const router = useRouter();
  
  const date = useMemo(() => {
    if (!dateStr) return new Date();
    const parts = dateStr.split("-").map(Number);
    const d = new Date(parts[0], parts[1] - 1, parts[2]);
    return startOfDay(d);
  }, [dateStr]);

  const log = useQuery(api.dailyLog.getLogByDate, {
    projectId,
    date: date.getTime(),
  });

  const membersData = useQuery(api.project.getProjectMembers, {
    projectId,
  });

  const upsertLog = useMutation(api.dailyLog.upsert);

  const [title, setTitle] = useState<string | null>(null);
  const [content, setContent] = useState<string | undefined>();
  const [isSaving, setIsSaving] = useState(false);

  const [prevDbTitle, setPrevDbTitle] = useState<string | null>(null);
  const [prevDbContent, setPrevDbContent] = useState<string | undefined>();

  useEffect(() => {
    if (log === undefined) return;

    const dbTitle = log?.title || "Daily Progress";
    const dbContent = log?.content;

    // 1. Initial Load
    if (title === null) {
      setTitle(dbTitle);
      setPrevDbTitle(dbTitle);
    }
    if (content === undefined) {
      setContent(dbContent);
      setPrevDbContent(dbContent);
    }

    // 2. Real-time Sync (Only if local matches previous DB state - meaning user hasn't typed anything new)
    if (dbTitle !== prevDbTitle) {
      if (title === prevDbTitle) {
        setTitle(dbTitle);
      }
      setPrevDbTitle(dbTitle);
    }

    if (dbContent !== prevDbContent) {
      if (content === prevDbContent) {
        setContent(dbContent);
      }
      setPrevDbContent(dbContent);
    }
  }, [log, title, content, prevDbTitle, prevDbContent]);



  const onInitialize = () => {
    if (!membersData) return;
    
    const formattedMembers: MemberInfo[] = (membersData || []).map(m => ({
      userId: m.userId,
      fullName: m.fullName,
      imageUrl: m.imageUrl,
    }));
    
    const template = generateDynamicTemplate(formattedMembers);
    setContent(template);
    toast.info("Log initialized with team template");
  };

  const onSave = async () => {
    if (title === null || content === undefined) return;

    setIsSaving(true);
    try {
      await upsertLog({
        projectId,
        date: date.getTime(),
        title,
        content,
      });

    } catch (error) {
      toast.error("Failed to save daily log.");
      console.error("Failed to save daily log:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const onChange = (value: string) => {
    setContent(value);
  };

  const onTitleChange = (value: string) => {
    setTitle(value);
  };

  useEffect(() => {
    if (title === null || content === undefined) return;

    const timeout = setTimeout(() => {
      onSave();
    }, 1500);

    return () => clearTimeout(timeout);
  }, [title, content]);


  const onBack = () => {
    router.push(`/project/${projectId}/tasks`);
  };

  const onDateChange = (newDate: Date) => {
    const newDateStr = format(newDate, "yyyy-MM-dd");
    setTitle(null);
    setContent(undefined);
    router.push(`/project/${projectId}/daily-logs/${newDateStr}`);
  };

  const [searchQuery, setSearchQuery] = useState("");
  const searchResults = useQuery(api.dailyLog.searchLogs, {
    projectId,
    query: searchQuery,
  });

  const onSearch = (query: string) => {
    setSearchQuery(query);
  };

  return {
    projectId,
    date,
    dateStr,
    log,
    members: (membersData || []).map(m => ({
      _id: m.userId,
      fullName: m.fullName,
      imageUrl: m.imageUrl,
    })),
    title: title || "",
    content,
    isSaving,
    isLoading: log === undefined || membersData === undefined || title === null,
    hasLog: !!log || content !== undefined,
    onInitialize,
    onSave,
    onChange,
    onTitleChange,
    onBack,
    onDateChange,
    onSearch,
    searchResults,
    activeMembers: (membersData || []).slice(0, 5).map(m => ({
      _id: m.userId,
      fullName: m.fullName,
      imageUrl: m.imageUrl,
    })), 
  };


};

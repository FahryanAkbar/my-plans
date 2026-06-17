"use client";

import { useState } from "react";

export const useIssueActivityFilters = () => {
  const [activitySearch, setActivitySearch] = useState("");
  const [selectedActions, setSelectedActions] = useState<string[]>([]);
  const [selectedMemberId, setSelectedMemberId] = useState<string>("all");
  const [selectedPeriod, setSelectedPeriod] = useState<string>("all");
  const [activityStats, setActivityStats] = useState({ total: 0, filtered: 0 });

  const toggleAction = (id: string) => {
    setSelectedActions((prev) => 
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    );
  };

  const resetFilters = () => {
    setActivitySearch("");
    setSelectedActions([]);
    setSelectedMemberId("all");
    setSelectedPeriod("all");
  };

  return {
    activitySearch,
    setActivitySearch,
    selectedActions,
    setSelectedActions,
    selectedMemberId,
    setSelectedMemberId,
    selectedPeriod,
    setSelectedPeriod,
    activityStats,
    setActivityStats,
    toggleAction,
    resetFilters
  };
};

import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { WidgetType, WidgetData } from "@/lib/types";
import { apiRequest } from "@/lib/queryClient";
import { useAutoRefresh } from "./useAutoRefresh";

export function useWidgetData<T extends WidgetData>(widgetType: WidgetType) {
  const queryClient = useQueryClient();
  const queryKey = [`/api/widget-data/${widgetType}`];
  
  const { data, isLoading, error } = useQuery<{ data: T }>({
    queryKey,
    refetchOnWindowFocus: false,
    staleTime: 60 * 1000, // 1 minute
  });
  
  const refreshData = async () => {
    await queryClient.invalidateQueries({ queryKey });
  };
  
  // Set up auto refresh
  const defaultRefreshInterval = 5 * 60 * 1000; // 5 minutes
  useAutoRefresh(refreshData, defaultRefreshInterval);
  
  return {
    data: data?.data,
    isLoading,
    error,
    refreshData
  };
}

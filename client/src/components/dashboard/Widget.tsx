import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Widget as WidgetType } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

interface WidgetProps {
  widget: WidgetType;
  children: React.ReactNode;
  className?: string;
  onRefresh?: () => Promise<void>;
}

const Widget: React.FC<WidgetProps> = ({ 
  widget, 
  children, 
  className,
  onRefresh 
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();

  const handleRefresh = async () => {
    if (isRefreshing || !onRefresh) return;
    
    setIsRefreshing(true);
    try {
      await onRefresh();
      toast({
        title: "Refreshed",
        description: `${widget.title} data has been updated.`,
        duration: 2000
      });
    } catch (error) {
      console.error("Error refreshing widget:", error);
      toast({
        title: "Refresh failed",
        description: "Failed to update widget data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  // Get service icon and color based on widget type
  const getServiceIcon = () => {
    switch (widget.type) {
      case 'jira': 
        return { icon: 'J', color: 'bg-[#0052CC]' };
      case 'google_analytics': 
        return { icon: 'G', color: 'bg-[#F9AB00]' };
      case 'atlassian': 
        return { icon: 'A', color: 'bg-[#172B4D]' };
      case 'pingdom': 
        return { icon: 'P', color: 'bg-[#00B388]' };
      case 'metrics': 
        return { icon: 'insert_chart', color: 'bg-primary' };
      case 'add_integration':
        return { icon: 'add', color: 'bg-primary-light' };
      // RACI Matrix widgets
      case 'raci_matrix_jira':
        return { icon: 'table_chart', color: 'bg-[#0052CC]' };
      case 'raci_matrix_google_analytics':
        return { icon: 'table_chart', color: 'bg-[#F9AB00]' };
      case 'raci_matrix_atlassian':
        return { icon: 'table_chart', color: 'bg-[#172B4D]' };
      case 'raci_matrix_pingdom':
        return { icon: 'table_chart', color: 'bg-[#00B388]' };
      default: 
        return { icon: 'widgets', color: 'bg-neutral-500' };
    }
  };

  const { icon, color } = getServiceIcon();

  return (
    <div className={cn(
      "widget bg-white rounded-lg shadow-widget relative",
      className
    )}>
      <div className="p-4 pb-2 border-b border-neutral-100 flex justify-between items-center">
        <div className="flex items-center">
          <div className={`w-6 h-6 rounded-md ${color} flex items-center justify-center text-white text-xs mr-2`}>
            {icon.length === 1 ? icon : <span className="material-icons text-sm">{icon}</span>}
          </div>
          <h3 className="text-sm font-medium text-neutral-900">{widget.title}</h3>
        </div>
        <div className="flex items-center space-x-2">
          {onRefresh && (
            <button 
              className={cn(
                "text-neutral-400 hover:text-neutral-600",
                isRefreshing && "animate-spin text-primary"
              )}
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <span className="material-icons text-sm">refresh</span>
            </button>
          )}
          <button className="text-neutral-400 hover:text-neutral-600">
            <span className="material-icons text-sm">more_vert</span>
          </button>
        </div>
      </div>
      
      <div className="p-4 h-64 overflow-auto">
        {isRefreshing ? (
          <div className="flex items-center justify-center h-full">
            <div className="border-t-4 border-primary border-solid rounded-full w-8 h-8 animate-spin"></div>
          </div>
        ) : (
          children
        )}
      </div>
      
      {/* Resize handle (would be functional with a grid library) */}
      <div className="resize-handle absolute bottom-2 right-2 w-3 h-3 cursor-se-resize opacity-0 transition-opacity group-hover:opacity-70">
        <span className="material-icons text-xs text-neutral-400">drag_handle</span>
      </div>
    </div>
  );
};

export default Widget;

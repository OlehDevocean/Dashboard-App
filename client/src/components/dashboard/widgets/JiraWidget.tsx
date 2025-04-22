import React from "react";
import Widget from "../Widget";
import { Widget as WidgetType, JiraData } from "@/lib/types";
import { useWidgetData } from "@/hooks/useWidgetData";

interface JiraWidgetProps {
  widget: WidgetType;
}

const JiraWidget: React.FC<JiraWidgetProps> = ({ widget }) => {
  const { data, isLoading, error, refreshData } = useWidgetData<JiraData>(widget.type);

  if (isLoading) {
    return (
      <Widget widget={widget}>
        <div className="flex items-center justify-center h-full">
          <div className="border-t-4 border-primary border-solid rounded-full w-8 h-8 animate-spin"></div>
        </div>
      </Widget>
    );
  }

  if (error || !data) {
    return (
      <Widget widget={widget}>
        <div className="flex items-center justify-center h-full flex-col">
          <span className="material-icons text-3xl text-neutral-400 mb-2">error_outline</span>
          <p className="text-neutral-500">Failed to load Jira data</p>
        </div>
      </Widget>
    );
  }

  const { issues, issuesByType } = data;

  // Normalize bar heights
  const maxValue = Math.max(issuesByType.bug, issuesByType.task, issuesByType.story, issuesByType.epic, issuesByType.other);
  const getBarHeight = (value: number) => Math.round((value / maxValue) * 100);

  return (
    <Widget widget={widget} onRefresh={refreshData}>
      <div className="flex justify-between mb-4">
        <div className="text-center bg-neutral-50 rounded-lg p-3 flex-1 mx-1">
          <div className="text-2xl font-bold text-error">{issues.critical}</div>
          <div className="text-xs text-neutral-500">Critical</div>
        </div>
        <div className="text-center bg-neutral-50 rounded-lg p-3 flex-1 mx-1">
          <div className="text-2xl font-bold text-warning">{issues.high}</div>
          <div className="text-xs text-neutral-500">High</div>
        </div>
        <div className="text-center bg-neutral-50 rounded-lg p-3 flex-1 mx-1">
          <div className="text-2xl font-bold text-info">{issues.medium}</div>
          <div className="text-xs text-neutral-500">Medium</div>
        </div>
      </div>
      
      <div className="mt-4">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-neutral-500">Open issues by type</span>
        </div>
        <div className="h-32 flex items-end">
          <div className="flex-1 mx-1">
            <div className="chart-bar bg-[#0052CC] rounded-t" style={{ height: `${getBarHeight(issuesByType.bug)}%` }}></div>
            <div className="text-xs text-center mt-1 text-neutral-600">Bug</div>
          </div>
          <div className="flex-1 mx-1">
            <div className="chart-bar bg-[#36B37E] rounded-t" style={{ height: `${getBarHeight(issuesByType.task)}%` }}></div>
            <div className="text-xs text-center mt-1 text-neutral-600">Task</div>
          </div>
          <div className="flex-1 mx-1">
            <div className="chart-bar bg-[#FF5630] rounded-t" style={{ height: `${getBarHeight(issuesByType.story)}%` }}></div>
            <div className="text-xs text-center mt-1 text-neutral-600">Story</div>
          </div>
          <div className="flex-1 mx-1">
            <div className="chart-bar bg-[#6554C0] rounded-t" style={{ height: `${getBarHeight(issuesByType.epic)}%` }}></div>
            <div className="text-xs text-center mt-1 text-neutral-600">Epic</div>
          </div>
          <div className="flex-1 mx-1">
            <div className="chart-bar bg-[#FF8B00] rounded-t" style={{ height: `${getBarHeight(issuesByType.other)}%` }}></div>
            <div className="text-xs text-center mt-1 text-neutral-600">Other</div>
          </div>
        </div>
      </div>
    </Widget>
  );
};

export default JiraWidget;

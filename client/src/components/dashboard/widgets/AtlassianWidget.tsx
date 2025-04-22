import React from "react";
import Widget from "../Widget";
import { Widget as WidgetType, AtlassianData } from "@/lib/types";
import { useWidgetData } from "@/hooks/useWidgetData";

interface AtlassianWidgetProps {
  widget: WidgetType;
}

const AtlassianWidget: React.FC<AtlassianWidgetProps> = ({ widget }) => {
  const { data, isLoading, error, refreshData } = useWidgetData<AtlassianData>("atlassian");

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
          <p className="text-neutral-500">Failed to load Atlassian data</p>
        </div>
      </Widget>
    );
  }

  // Find the highest value for percentage calculation
  const maxValue = Math.max(...data.sales.map(item => item.value));

  return (
    <Widget widget={widget} onRefresh={refreshData}>
      <div className="flex justify-between items-center mb-4">
        <div className="text-sm font-medium text-neutral-800">Sales by App</div>
        <div className="text-xs text-neutral-500">Last 30 days</div>
      </div>
      <div className="space-y-3">
        {data.sales.map((app, index) => (
          <div key={index}>
            <div className="flex justify-between text-sm mb-1">
              <span>{app.name}</span>
              <span className="font-medium">${app.value.toLocaleString()}</span>
            </div>
            <div className="w-full bg-neutral-100 rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full" 
                style={{ width: `${(app.value / maxValue) * 100}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </Widget>
  );
};

export default AtlassianWidget;

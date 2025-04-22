import React from "react";
import Widget from "../Widget";
import { Widget as WidgetType, PingdomData } from "@/lib/types";
import { useWidgetData } from "@/hooks/useWidgetData";
import { LineChart, Line, ResponsiveContainer } from "recharts";

interface PingdomWidgetProps {
  widget: WidgetType;
}

const PingdomWidget: React.FC<PingdomWidgetProps> = ({ widget }) => {
  const { data, isLoading, error, refreshData } = useWidgetData<PingdomData>("pingdom");

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
          <p className="text-neutral-500">Failed to load Pingdom data</p>
        </div>
      </Widget>
    );
  }

  const statusColor = data.status === 'operational' ? 'bg-success' : 
                      data.status === 'degraded' ? 'bg-warning' : 'bg-error';

  const responseTimeData = data.responseTimeHistory.map((value, index) => ({
    x: index,
    y: value
  }));

  const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <Widget widget={widget} onRefresh={refreshData}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className={`h-3 w-3 rounded-full ${statusColor}`}></div>
          <span className="text-sm">All systems operational</span>
        </div>
        <div className="text-sm font-medium text-success">{data.uptime}%</div>
      </div>
      
      <div className="bg-neutral-50 p-2 rounded-lg">
        <div className="grid grid-cols-7 gap-1 mb-2">
          {data.dailyStatus.map((status, index) => (
            <div 
              key={index} 
              className={`h-6 rounded ${
                status === 'success' ? 'bg-success' : 
                status === 'warning' ? 'bg-warning' : 'bg-error'
              }`}
            ></div>
          ))}
        </div>
        <div className="flex justify-between text-xs text-neutral-400">
          {daysOfWeek.map((day, index) => (
            <span key={index}>{day}</span>
          ))}
        </div>
      </div>
      
      <div className="mt-4">
        <div className="text-sm font-medium mb-2">Response Time</div>
        <div className="flex items-center">
          <div className="text-2xl font-bold text-neutral-800 mr-2">{data.responseTime}ms</div>
          <div className={`text-xs flex items-center ${data.responseTrend <= 0 ? 'text-success' : 'text-error'}`}>
            <span className="material-icons text-xs mr-1">
              {data.responseTrend <= 0 ? 'arrow_downward' : 'arrow_upward'}
            </span>
            {Math.abs(data.responseTrend)}ms
          </div>
        </div>
        
        <div className="h-8 mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={responseTimeData}>
              <Line 
                type="monotone" 
                dataKey="y" 
                stroke="#00B388" 
                strokeWidth={1.5} 
                dot={false} 
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Widget>
  );
};

export default PingdomWidget;

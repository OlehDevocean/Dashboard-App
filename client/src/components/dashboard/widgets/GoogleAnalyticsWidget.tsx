import React from "react";
import Widget from "../Widget";
import { Widget as WidgetType, GoogleAnalyticsData } from "@/lib/types";
import { useWidgetData } from "@/hooks/useWidgetData";
import { AreaChart, Area, ResponsiveContainer, XAxis } from "recharts";

interface GoogleAnalyticsWidgetProps {
  widget: WidgetType;
}

const GoogleAnalyticsWidget: React.FC<GoogleAnalyticsWidgetProps> = ({ widget }) => {
  const { data, isLoading, error, refreshData } = useWidgetData<GoogleAnalyticsData>("google_analytics");

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
          <p className="text-neutral-500">Failed to load Analytics data</p>
        </div>
      </Widget>
    );
  }

  const chartData = data.weeklyData.map((value, index) => ({
    day: index,
    value
  }));

  const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <Widget widget={widget} onRefresh={refreshData}>
      <div className="flex justify-between mb-4">
        <div className="text-center p-3 flex-1">
          <div className="text-2xl font-bold text-neutral-800">{data.visits.toLocaleString()}</div>
          <div className="text-xs text-neutral-500">Total visits</div>
          <div className={`text-xs flex items-center justify-center mt-1 ${data.visitsTrend >= 0 ? 'text-success' : 'text-error'}`}>
            <span className="material-icons text-xs mr-1">
              {data.visitsTrend >= 0 ? 'arrow_upward' : 'arrow_downward'}
            </span>
            {Math.abs(data.visitsTrend)}%
          </div>
        </div>
        <div className="text-center p-3 flex-1">
          <div className="text-2xl font-bold text-neutral-800">{data.averageTime}</div>
          <div className="text-xs text-neutral-500">Avg. time</div>
          <div className={`text-xs flex items-center justify-center mt-1 ${data.timeTrend >= 0 ? 'text-error' : 'text-success'}`}>
            <span className="material-icons text-xs mr-1">
              {data.timeTrend >= 0 ? 'arrow_upward' : 'arrow_downward'}
            </span>
            {Math.abs(data.timeTrend)}%
          </div>
        </div>
      </div>

      <div className="h-32 relative mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3366FF" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#3366FF" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="day" 
              tick={{ fontSize: 10, fill: '#9AA5B1' }}
              tickFormatter={(value) => daysOfWeek[value % 7]}
              axisLine={false}
              tickLine={false}
            />
            <Area 
              type="monotone" 
              dataKey="value" 
              stroke="#3366FF" 
              fillOpacity={1} 
              fill="url(#colorValue)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Widget>
  );
};

export default GoogleAnalyticsWidget;

import React from "react";
import Widget from "../Widget";
import { Widget as WidgetType, MetricsData } from "@/lib/types";
import { useWidgetData } from "@/hooks/useWidgetData";
import { 
  ComposedChart, 
  Line, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts";

interface MetricsWidgetProps {
  widget: WidgetType;
}

const MetricsWidget: React.FC<MetricsWidgetProps> = ({ widget }) => {
  const { data, isLoading, error, refreshData } = useWidgetData<MetricsData>("metrics");

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
          <p className="text-neutral-500">Failed to load metrics data</p>
        </div>
      </Widget>
    );
  }

  // Format chart data
  const chartData = data.timelineData.tasks.map((value, index) => ({
    name: `Week ${index + 1}`,
    tasks: data.timelineData.tasks[index] || 0,
    completion: data.timelineData.completion[index] || 0,
    volume: data.timelineData.volume[index] || 0
  }));

  return (
    <Widget widget={widget} onRefresh={refreshData} className="col-span-1 lg:col-span-2">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <div className="bg-neutral-50 p-3 rounded-lg">
          <div className="text-sm text-neutral-500 mb-1">Active Tasks</div>
          <div className="text-2xl font-bold text-neutral-800">{data.activeTasks.value}</div>
          <div className={`text-xs flex items-center mt-1 ${data.activeTasks.trend >= 0 ? 'text-success' : 'text-error'}`}>
            <span className="material-icons text-xs mr-1">
              {data.activeTasks.trend >= 0 ? 'arrow_upward' : 'arrow_downward'}
            </span>
            {Math.abs(data.activeTasks.trend)}%
          </div>
        </div>
        <div className="bg-neutral-50 p-3 rounded-lg">
          <div className="text-sm text-neutral-500 mb-1">Pending Reviews</div>
          <div className="text-2xl font-bold text-neutral-800">{data.pendingReviews.value}</div>
          <div className={`text-xs flex items-center mt-1 ${data.pendingReviews.trend >= 0 ? 'text-error' : 'text-success'}`}>
            <span className="material-icons text-xs mr-1">
              {data.pendingReviews.trend >= 0 ? 'arrow_upward' : 'arrow_downward'}
            </span>
            {Math.abs(data.pendingReviews.trend)}%
          </div>
        </div>
        <div className="bg-neutral-50 p-3 rounded-lg">
          <div className="text-sm text-neutral-500 mb-1">Conversion Rate</div>
          <div className="text-2xl font-bold text-neutral-800">{data.conversionRate.value}%</div>
          <div className={`text-xs flex items-center mt-1 ${data.conversionRate.trend >= 0 ? 'text-success' : 'text-error'}`}>
            <span className="material-icons text-xs mr-1">
              {data.conversionRate.trend >= 0 ? 'arrow_upward' : 'arrow_downward'}
            </span>
            {Math.abs(data.conversionRate.trend)}%
          </div>
        </div>
        <div className="bg-neutral-50 p-3 rounded-lg">
          <div className="text-sm text-neutral-500 mb-1">Avg. Response</div>
          <div className="text-2xl font-bold text-neutral-800">{data.averageResponse.value}</div>
          <div className={`text-xs flex items-center mt-1 ${data.averageResponse.trend <= 0 ? 'text-success' : 'text-error'}`}>
            <span className="material-icons text-xs mr-1">
              {data.averageResponse.trend <= 0 ? 'arrow_downward' : 'arrow_upward'}
            </span>
            {Math.abs(data.averageResponse.trend)}%
          </div>
        </div>
      </div>

      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E4E7EB" />
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 10, fill: '#9AA5B1' }}
              axisLine={{ stroke: '#E4E7EB' }}
              tickLine={false}
            />
            <Tooltip />
            <Bar dataKey="volume" barSize={20} fill="#3366FF" fillOpacity={0.1} radius={2} />
            <Line type="monotone" dataKey="tasks" stroke="#3366FF" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="completion" stroke="#00C853" strokeWidth={2} dot={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-center mt-4 space-x-6">
        <div className="flex items-center">
          <div className="h-3 w-3 bg-primary rounded-full mr-2"></div>
          <span className="text-xs text-neutral-600">Tasks</span>
        </div>
        <div className="flex items-center">
          <div className="h-3 w-3 bg-[#00C853] rounded-full mr-2"></div>
          <span className="text-xs text-neutral-600">Completion</span>
        </div>
        <div className="flex items-center">
          <div className="h-3 w-3 bg-primary bg-opacity-10 rounded-full mr-2"></div>
          <span className="text-xs text-neutral-600">Volume</span>
        </div>
      </div>
    </Widget>
  );
};

export default MetricsWidget;

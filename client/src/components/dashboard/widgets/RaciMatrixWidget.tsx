import React from "react";
import Widget from "../Widget";
import { Widget as WidgetType, RaciMatrixData } from "@/lib/types";
import { useWidgetData } from "@/hooks/useWidgetData";
import { cn } from "@/lib/utils";

interface RaciMatrixWidgetProps {
  widget: WidgetType;
}

const RaciMatrixWidget: React.FC<RaciMatrixWidgetProps> = ({ widget }) => {
  const { data, isLoading, error, refreshData } = useWidgetData<RaciMatrixData>(widget.type);
  
  // Extract the service name from the widget type (e.g., "raci_matrix_jira" -> "Jira")
  const getServiceName = () => {
    const parts = widget.type.split('_');
    if (parts.length > 2) {
      const serviceName = parts[2];
      return serviceName.charAt(0).toUpperCase() + serviceName.slice(1);
    }
    return "";
  };

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
          <p className="text-neutral-500">Failed to load RACI Matrix data for {getServiceName()}</p>
        </div>
      </Widget>
    );
  }

  const { roles, tasks, status, taskCompletionTrend, timeStats } = data;

  // Helper to determine the color for a RACI type
  const getRaciColor = (type: 'R' | 'A' | 'C' | 'I') => {
    switch (type) {
      case 'R': return 'bg-blue-500';
      case 'A': return 'bg-green-500';
      case 'C': return 'bg-yellow-500';
      case 'I': return 'bg-purple-500';
      default: return 'bg-gray-300';
    }
  };

  // Helper to get the full name of RACI role
  const getRaciFullName = (type: 'R' | 'A' | 'C' | 'I') => {
    switch (type) {
      case 'R': return 'Responsible';
      case 'A': return 'Accountable';
      case 'C': return 'Consulted';
      case 'I': return 'Informed';
      default: return '';
    }
  };
  
  // Helper to format time in seconds to human-readable format
  const formatTime = (seconds: number | undefined) => {
    if (!seconds) return '0г';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    let result = '';
    if (hours > 0) result += `${hours}г `;
    if (minutes > 0) result += `${minutes}хв`;
    
    return result.trim() || '0г';
  };

  return (
    <Widget widget={widget} onRefresh={refreshData} className="h-auto">
      {/* Tasks Status Overview */}
      <div className="flex justify-between mb-4">
        <div className="text-center bg-neutral-50 rounded-lg p-2 flex-1 mx-1">
          <div className="text-sm font-bold text-success">{status.onTrack}</div>
          <div className="text-xs text-neutral-500">On Track</div>
        </div>
        <div className="text-center bg-neutral-50 rounded-lg p-2 flex-1 mx-1">
          <div className="text-sm font-bold text-warning">{status.atRisk}</div>
          <div className="text-xs text-neutral-500">At Risk</div>
        </div>
        <div className="text-center bg-neutral-50 rounded-lg p-2 flex-1 mx-1">
          <div className="text-sm font-bold text-error">{status.delayed}</div>
          <div className="text-xs text-neutral-500">Delayed</div>
        </div>
        <div className="text-center bg-neutral-50 rounded-lg p-2 flex-1 mx-1">
          <div className="text-sm font-bold text-info">{status.completed}</div>
          <div className="text-xs text-neutral-500">Completed</div>
        </div>
      </div>

      {/* RACI Legend */}
      <div className="flex items-center justify-center mb-3 text-xs">
        <div className="flex items-center mr-3">
          <span className="inline-block w-3 h-3 bg-blue-500 rounded-full mr-1"></span>
          <span>R: Responsible</span>
        </div>
        <div className="flex items-center mr-3">
          <span className="inline-block w-3 h-3 bg-green-500 rounded-full mr-1"></span>
          <span>A: Accountable</span>
        </div>
        <div className="flex items-center mr-3">
          <span className="inline-block w-3 h-3 bg-yellow-500 rounded-full mr-1"></span>
          <span>C: Consulted</span>
        </div>
        <div className="flex items-center">
          <span className="inline-block w-3 h-3 bg-purple-500 rounded-full mr-1"></span>
          <span>I: Informed</span>
        </div>
      </div>

      {/* RACI Matrix Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-xs">
          <thead>
            <tr className="bg-neutral-50">
              <th className="py-2 px-3 text-left font-medium text-neutral-600 border-b border-neutral-200 w-1/4">Tasks</th>
              {roles.map((role, index) => (
                <th key={index} className="py-2 px-2 text-center font-medium text-neutral-600 border-b border-neutral-200">
                  {role}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tasks.map((task, taskIndex) => (
              <tr key={taskIndex} className={taskIndex % 2 === 0 ? 'bg-white' : 'bg-neutral-50'}>
                <td className="py-2 px-3 border-b border-neutral-200 font-medium">
                  {task.name}
                </td>
                {roles.map((_, roleIndex) => {
                  // Find any assignment for this role and task
                  const assignment = task.assignments.find(a => a.roleIndex === roleIndex);
                  return (
                    <td key={roleIndex} className="py-1 px-1 border-b border-neutral-200 text-center">
                      {assignment ? (
                        <div 
                          className={cn(
                            "inline-flex items-center justify-center w-6 h-6 rounded-full text-white font-bold text-xs",
                            getRaciColor(assignment.type)
                          )}
                          title={`${roles[roleIndex]} - ${getRaciFullName(assignment.type)}`}
                        >
                          {assignment.type}
                        </div>
                      ) : null}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Time Tracking Stats */}
      {timeStats && (
        <div className="mt-4 mb-3 bg-neutral-50 p-3 rounded-lg">
          <h3 className="text-sm font-semibold mb-2">Статистика по часу</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="text-center">
              <div className="text-xs text-neutral-500">Початковий естімейт</div>
              <div className="text-sm font-medium text-primary">{formatTime(timeStats.totalOriginalEstimate)}</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-neutral-500">Поточний естімейт</div>
              <div className="text-sm font-medium text-primary">{formatTime(timeStats.totalCurrentEstimate)}</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-neutral-500">Витрачений час</div>
              <div className="text-sm font-medium text-primary">{formatTime(timeStats.totalTimeSpent)}</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-neutral-500">Точність оцінки</div>
              <div className="text-sm font-medium text-primary">{Math.round(timeStats.estimateAccuracy)}%</div>
            </div>
          </div>
        </div>
      )}

      {/* Task Details with Time */}
      {tasks.some(task => task.originalEstimate || task.currentEstimate || task.timeSpent) && (
        <div className="mt-4 mb-3">
          <h3 className="text-sm font-semibold mb-2">Деталі по задачам</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse text-xs">
              <thead>
                <tr className="bg-neutral-50">
                  <th className="py-2 px-3 text-left font-medium text-neutral-600 border-b border-neutral-200">Задача</th>
                  <th className="py-2 px-3 text-center font-medium text-neutral-600 border-b border-neutral-200">Початковий естімейт</th>
                  <th className="py-2 px-3 text-center font-medium text-neutral-600 border-b border-neutral-200">Витрачений час</th>
                  <th className="py-2 px-3 text-center font-medium text-neutral-600 border-b border-neutral-200">Прогрес</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-neutral-50'}>
                    <td className="py-2 px-3 border-b border-neutral-200 font-medium">
                      {task.key ? (
                        <a href={`https://${getServiceName().toLowerCase()}.atlassian.net/browse/${task.key}`} 
                           target="_blank" 
                           rel="noopener noreferrer"
                           className="text-primary hover:underline">
                          {task.name}
                        </a>
                      ) : task.name}
                    </td>
                    <td className="py-2 px-3 border-b border-neutral-200 text-center">
                      {formatTime(task.originalEstimate)}
                    </td>
                    <td className="py-2 px-3 border-b border-neutral-200 text-center">
                      {formatTime(task.timeSpent)}
                    </td>
                    <td className="py-2 px-3 border-b border-neutral-200 text-center">
                      {task.progress ? (
                        <div className="w-full bg-neutral-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${task.progress > 100 ? 'bg-warning' : 'bg-primary'}`}
                            style={{ width: `${Math.min(100, task.progress)}%` }}
                          ></div>
                        </div>
                      ) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Task Completion Trend Chart */}
      <div className="mt-3">
        <div className="text-xs text-neutral-500 mb-1">Task Completion Trend</div>
        <div className="h-12 flex items-end">
          {taskCompletionTrend.map((value, index) => (
            <div 
              key={index} 
              className="flex-1 mx-px"
              title={`Week ${index + 1}: ${value} tasks`}
            >
              <div 
                className="chart-bar bg-primary rounded-t" 
                style={{ height: `${(value / Math.max(...taskCompletionTrend)) * 100}%` }}
              ></div>
            </div>
          ))}
        </div>
      </div>
    </Widget>
  );
};

export default RaciMatrixWidget;
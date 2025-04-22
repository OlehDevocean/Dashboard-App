import React, { useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import WidgetGrid from "@/components/dashboard/WidgetGrid";
import { Widget } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const Dashboard: React.FC = () => {
  const [isAddWidgetOpen, setIsAddWidgetOpen] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(5); // in minutes
  const { toast } = useToast();

  // Default to userId 1 for demo purposes
  const userId = 1;
  
  // Get dashboard data
  const { data: dashboardData, isLoading: isDashboardLoading } = useQuery({
    queryKey: ['/api/dashboards/default', userId],
    queryFn: async () => {
      const res = await fetch(`/api/dashboards/default?userId=${userId}`);
      if (!res.ok) throw new Error('Failed to fetch dashboard');
      return res.json();
    }
  });
  
  // Get widgets for this dashboard
  const dashboardId = dashboardData?.dashboard?.id;
  const { data: widgetsData, isLoading: isWidgetsLoading } = useQuery({
    queryKey: ['/api/widgets', dashboardId],
    queryFn: async () => {
      if (!dashboardId) return { widgets: [] };
      const res = await fetch(`/api/widgets?dashboardId=${dashboardId}`);
      if (!res.ok) throw new Error('Failed to fetch widgets');
      return res.json();
    },
    enabled: !!dashboardId
  });
  
  // If there's no widgets data yet, create demo widgets
  const widgets: Widget[] = widgetsData?.widgets?.length 
    ? widgetsData.widgets 
    : [
        {
          id: 1,
          type: 'jira',
          title: 'Jira Issues',
          refreshInterval: 300,
          layout: { x: 0, y: 0, w: 1, h: 1 },
          config: {},
          dashboardId: dashboardId || 1
        },
        {
          id: 2,
          type: 'google_analytics',
          title: 'Analytics Overview',
          refreshInterval: 300,
          layout: { x: 1, y: 0, w: 1, h: 1 },
          config: {},
          dashboardId: dashboardId || 1
        },
        {
          id: 3,
          type: 'atlassian',
          title: 'Marketplace Performance',
          refreshInterval: 300,
          layout: { x: 2, y: 0, w: 1, h: 1 },
          config: {},
          dashboardId: dashboardId || 1
        },
        {
          id: 4,
          type: 'pingdom',
          title: 'Uptime Monitor',
          refreshInterval: 300,
          layout: { x: 3, y: 0, w: 1, h: 1 },
          config: {},
          dashboardId: dashboardId || 1
        },
        {
          id: 5,
          type: 'add_integration',
          title: 'Add Integration',
          refreshInterval: 0,
          layout: { x: 0, y: 1, w: 1, h: 1 },
          config: {},
          dashboardId: dashboardId || 1
        },
        {
          id: 6,
          type: 'metrics',
          title: 'Cross-Service Metrics',
          refreshInterval: 300,
          layout: { x: 1, y: 1, w: 2, h: 1 },
          config: {},
          dashboardId: dashboardId || 1
        },
        {
          id: 7,
          type: 'raci_matrix_jira',
          title: 'Jira RACI Matrix',
          refreshInterval: 300,
          layout: { x: 0, y: 2, w: 2, h: 1 },
          config: {},
          dashboardId: dashboardId || 1
        },
        {
          id: 8,
          type: 'raci_matrix_google_analytics',
          title: 'Google Analytics RACI Matrix',
          refreshInterval: 300,
          layout: { x: 2, y: 2, w: 2, h: 1 },
          config: {},
          dashboardId: dashboardId || 1
        }
      ];

  const handleAddWidget = () => {
    setIsAddWidgetOpen(true);
  };

  const changeRefreshInterval = (minutes: number) => {
    setRefreshInterval(minutes);
    toast({
      title: "Refresh interval updated",
      description: `Dashboard will refresh every ${minutes} minutes`,
    });
  };

  return (
    <DashboardLayout>
      <div className="py-6">
        {/* Dashboard Header */}
        <div className="px-4 mx-auto max-w-7xl sm:px-6 md:px-8 mb-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-neutral-900">
              {isDashboardLoading ? "Loading..." : dashboardData?.dashboard?.name || "Main Dashboard"}
            </h1>
            
            <div className="flex space-x-3">
              <div className="relative inline-block text-left">
                <button 
                  type="button" 
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-neutral-700 bg-white border border-neutral-300 rounded-md shadow-sm hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-primary"
                  onClick={() => changeRefreshInterval(refreshInterval === 5 ? 10 : 5)}
                >
                  <span className="material-icons text-neutral-500 mr-2 text-sm">access_time</span>
                  Auto-refresh: {refreshInterval}m
                  <span className="material-icons text-neutral-500 ml-2 text-sm">arrow_drop_down</span>
                </button>
              </div>
              
              <div>
                <button 
                  type="button" 
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-primary border border-transparent rounded-md shadow-sm hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary"
                  onClick={handleAddWidget}
                >
                  <span className="material-icons mr-2 text-sm">add</span>
                  Add Widget
                </button>
              </div>
            </div>
          </div>
          
          <div className="mt-2 flex flex-wrap items-center text-sm text-neutral-500">
            <div className="flex items-center mr-6">
              <span className="material-icons text-xs mr-1">calendar_today</span>
              Last updated: Just now
            </div>
            <div className="flex items-center">
              <span className="flex h-3 w-3 relative mr-1">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-secondary"></span>
              </span>
              All systems operational
            </div>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="px-4 mx-auto max-w-7xl sm:px-6 md:px-8">
          {isWidgetsLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="border-t-4 border-primary border-solid rounded-full w-8 h-8 animate-spin"></div>
            </div>
          ) : (
            <WidgetGrid widgets={widgets} onAddWidget={handleAddWidget} />
          )}
        </div>
      </div>

      {/* Add Widget Dialog */}
      <Dialog open={isAddWidgetOpen} onOpenChange={setIsAddWidgetOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Widget</DialogTitle>
            <DialogDescription>
              Choose a widget type to add to your dashboard.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 py-4">
            <button className="flex flex-col items-center justify-center p-4 border rounded-lg hover:border-primary hover:bg-primary-light hover:bg-opacity-10">
              <div className="w-10 h-10 rounded-md bg-[#0052CC] flex items-center justify-center text-white text-sm mb-2">J</div>
              <span className="text-sm font-medium">Jira Issues</span>
            </button>
            
            <button className="flex flex-col items-center justify-center p-4 border rounded-lg hover:border-primary hover:bg-primary-light hover:bg-opacity-10">
              <div className="w-10 h-10 rounded-md bg-[#F9AB00] flex items-center justify-center text-white text-sm mb-2">G</div>
              <span className="text-sm font-medium">Google Analytics</span>
            </button>
            
            <button className="flex flex-col items-center justify-center p-4 border rounded-lg hover:border-primary hover:bg-primary-light hover:bg-opacity-10">
              <div className="w-10 h-10 rounded-md bg-[#172B4D] flex items-center justify-center text-white text-sm mb-2">A</div>
              <span className="text-sm font-medium">Atlassian</span>
            </button>
            
            <button className="flex flex-col items-center justify-center p-4 border rounded-lg hover:border-primary hover:bg-primary-light hover:bg-opacity-10">
              <div className="w-10 h-10 rounded-md bg-[#00B388] flex items-center justify-center text-white text-sm mb-2">P</div>
              <span className="text-sm font-medium">Pingdom</span>
            </button>
            
            <button className="flex flex-col items-center justify-center p-4 border rounded-lg hover:border-primary hover:bg-primary-light hover:bg-opacity-10">
              <div className="w-10 h-10 rounded-md bg-primary flex items-center justify-center text-white text-sm mb-2">
                <span className="material-icons">insert_chart</span>
              </div>
              <span className="text-sm font-medium">Metrics</span>
            </button>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddWidgetOpen(false)}>Cancel</Button>
            <Button disabled>Add Widget</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Dashboard;

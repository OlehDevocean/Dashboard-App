import React, { useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import RaciMatrixWidget from "@/components/dashboard/widgets/RaciMatrixWidget";
import { Widget } from "@/lib/types";

const RaciMatrix: React.FC = () => {
  const { toast } = useToast();
  const [refreshInterval, setRefreshInterval] = useState(5); // in minutes
  const [activeService, setActiveService] = useState<string>("jira");

  // Default to userId 1 for demo purposes
  const userId = 1;
  
  // Get dashboard data for the widget container
  const { data: dashboardData, isLoading: isDashboardLoading } = useQuery({
    queryKey: ['/api/dashboards/default', userId],
    queryFn: async () => {
      const res = await fetch(`/api/dashboards/default?userId=${userId}`);
      if (!res.ok) throw new Error('Failed to fetch dashboard');
      return res.json();
    }
  });
  
  const dashboardId = dashboardData?.dashboard?.id || 1;

  // Define mock widgets for each RACI matrix service
  const raciWidgets: Record<string, Widget> = {
    jira: {
      id: 1,
      type: 'raci_matrix_jira',
      title: 'Jira RACI Matrix',
      refreshInterval: 300,
      layout: { x: 0, y: 0, w: 4, h: 2 },
      config: {},
      dashboardId: dashboardId
    },
    google_analytics: {
      id: 2,
      type: 'raci_matrix_google_analytics',
      title: 'Google Analytics RACI Matrix',
      refreshInterval: 300,
      layout: { x: 0, y: 0, w: 4, h: 2 },
      config: {},
      dashboardId: dashboardId
    },
    atlassian: {
      id: 3,
      type: 'raci_matrix_atlassian',
      title: 'Atlassian RACI Matrix',
      refreshInterval: 300,
      layout: { x: 0, y: 0, w: 4, h: 2 },
      config: {},
      dashboardId: dashboardId
    },
    pingdom: {
      id: 4,
      type: 'raci_matrix_pingdom',
      title: 'Pingdom RACI Matrix',
      refreshInterval: 300,
      layout: { x: 0, y: 0, w: 4, h: 2 },
      config: {},
      dashboardId: dashboardId
    }
  };

  const changeRefreshInterval = (minutes: number) => {
    setRefreshInterval(minutes);
    toast({
      title: "Refresh interval updated",
      description: `RACI matrix will refresh every ${minutes} minutes`,
    });
  };

  return (
    <DashboardLayout>
      <div className="py-6">
        {/* RACI Matrix Header */}
        <div className="px-4 mx-auto max-w-7xl sm:px-6 md:px-8 mb-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-neutral-900">
              RACI Matrix
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
                <Button
                  onClick={() => {
                    toast({
                      title: "RACI Matrix Refreshed",
                      description: "All matrices have been updated with the latest data."
                    });
                  }}
                >
                  <span className="material-icons mr-2 text-sm">refresh</span>
                  Refresh Now
                </Button>
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
              Matrix data up-to-date
            </div>
          </div>
        </div>

        {/* RACI Matrix Content */}
        <div className="px-4 mx-auto max-w-7xl sm:px-6 md:px-8">
          <div className="mb-6">
            <p className="text-neutral-600">
              The RACI matrix helps define and clarify roles and responsibilities for each service integration. 
              RACI stands for Responsible, Accountable, Consulted, and Informed.
            </p>
          </div>

          <Tabs defaultValue="jira" className="w-full" onValueChange={setActiveService}>
            <TabsList className="mb-6 grid grid-cols-4 w-full">
              <TabsTrigger value="jira" className="text-center">
                <div className="flex flex-col items-center gap-1">
                  <div className="w-6 h-6 rounded-md bg-[#0052CC] flex items-center justify-center text-white text-xs">J</div>
                  <span>Jira</span>
                </div>
              </TabsTrigger>
              <TabsTrigger value="google_analytics" className="text-center">
                <div className="flex flex-col items-center gap-1">
                  <div className="w-6 h-6 rounded-md bg-[#F9AB00] flex items-center justify-center text-white text-xs">G</div>
                  <span>Google Analytics</span>
                </div>
              </TabsTrigger>
              <TabsTrigger value="atlassian" className="text-center">
                <div className="flex flex-col items-center gap-1">
                  <div className="w-6 h-6 rounded-md bg-[#172B4D] flex items-center justify-center text-white text-xs">A</div>
                  <span>Atlassian</span>
                </div>
              </TabsTrigger>
              <TabsTrigger value="pingdom" className="text-center">
                <div className="flex flex-col items-center gap-1">
                  <div className="w-6 h-6 rounded-md bg-[#00B388] flex items-center justify-center text-white text-xs">P</div>
                  <span>Pingdom</span>
                </div>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="jira" className="mt-4">
              <div className="bg-white rounded-lg shadow-sm p-4">
                <h2 className="text-xl font-semibold mb-4">Jira RACI Matrix</h2>
                <RaciMatrixWidget widget={raciWidgets.jira} />
              </div>
            </TabsContent>
            
            <TabsContent value="google_analytics" className="mt-4">
              <div className="bg-white rounded-lg shadow-sm p-4">
                <h2 className="text-xl font-semibold mb-4">Google Analytics RACI Matrix</h2>
                <RaciMatrixWidget widget={raciWidgets.google_analytics} />
              </div>
            </TabsContent>
            
            <TabsContent value="atlassian" className="mt-4">
              <div className="bg-white rounded-lg shadow-sm p-4">
                <h2 className="text-xl font-semibold mb-4">Atlassian RACI Matrix</h2>
                <RaciMatrixWidget widget={raciWidgets.atlassian} />
              </div>
            </TabsContent>
            
            <TabsContent value="pingdom" className="mt-4">
              <div className="bg-white rounded-lg shadow-sm p-4">
                <h2 className="text-xl font-semibold mb-4">Pingdom RACI Matrix</h2>
                <RaciMatrixWidget widget={raciWidgets.pingdom} />
              </div>
            </TabsContent>
          </Tabs>

          <div className="mt-8 bg-white rounded-lg shadow-sm p-4">
            <h2 className="text-xl font-semibold mb-4">What is RACI?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-lg mb-2">RACI Definition</h3>
                <ul className="list-disc pl-5 space-y-2">
                  <li><span className="font-medium text-blue-500">R (Responsible):</span> The person who performs the work</li>
                  <li><span className="font-medium text-green-500">A (Accountable):</span> The person ultimately answerable for the work</li>
                  <li><span className="font-medium text-yellow-500">C (Consulted):</span> The person whose opinions are sought</li>
                  <li><span className="font-medium text-purple-500">I (Informed):</span> The person who is kept up-to-date on progress</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Benefits</h3>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Clarifies roles and responsibilities</li>
                  <li>Prevents duplication of effort</li>
                  <li>Ensures all necessary activities are assigned</li>
                  <li>Improves communication and collaboration</li>
                  <li>Provides a structure for cross-functional work</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default RaciMatrix;
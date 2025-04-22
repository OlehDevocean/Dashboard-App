import React, { useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Integration } from "@/lib/types";
import { JiraIntegration } from "@/components/integrations/JiraIntegration";

const Integrations: React.FC = () => {
  // Default to userId 1 for demo purposes
  const userId = 1;
  const [activeTab, setActiveTab] = useState("gallery");
  
  // Get integrations
  const { data, isLoading } = useQuery({
    queryKey: ['/api/integrations', userId],
    queryFn: async () => {
      const res = await fetch(`/api/integrations?userId=${userId}`);
      if (!res.ok) throw new Error('Failed to fetch integrations');
      return res.json();
    }
  });
  
  const integrations: Integration[] = data?.integrations || [];
  
  // Available integration types
  const availableIntegrations = [
    { 
      type: 'jira', 
      name: 'Jira Cloud', 
      description: 'Track issues, workflows, and projects',
      icon: 'J',
      color: 'bg-[#0052CC]'
    },
    { 
      type: 'google_analytics', 
      name: 'Google Analytics', 
      description: 'Analyze website traffic and user behavior',
      icon: 'G',
      color: 'bg-[#F9AB00]'
    },
    { 
      type: 'atlassian', 
      name: 'Atlassian Marketplace', 
      description: 'Track app performance and sales metrics',
      icon: 'A',
      color: 'bg-[#172B4D]'
    },
    { 
      type: 'pingdom', 
      name: 'Pingdom', 
      description: 'Monitor website uptime and performance',
      icon: 'P',
      color: 'bg-[#00B388]'
    }
  ];

  return (
    <DashboardLayout>
      <div className="py-6">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 md:px-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-semibold text-neutral-900">Інтеграції</h1>
          </div>
          
          <Tabs defaultValue="gallery" className="w-full" onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="gallery">Галерея інтеграцій</TabsTrigger>
              <TabsTrigger value="configured">Налаштовані інтеграції</TabsTrigger>
              <TabsTrigger value="jira">Jira</TabsTrigger>
            </TabsList>
            
            <TabsContent value="gallery">
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="border-t-4 border-primary border-solid rounded-full w-8 h-8 animate-spin"></div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {availableIntegrations.map((integration) => {
                    // Check if this integration is already configured
                    const existingIntegration = integrations.find(i => i.type === integration.type);
                    const isConfigured = !!existingIntegration;
                    
                    return (
                      <Card key={integration.type} className="overflow-hidden">
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-start">
                            <div className="flex items-center">
                              <div className={`w-10 h-10 rounded-md ${integration.color} flex items-center justify-center text-white text-sm mr-3`}>
                                {integration.icon}
                              </div>
                              <div>
                                <CardTitle className="text-lg">{integration.name}</CardTitle>
                                <CardDescription>{integration.description}</CardDescription>
                              </div>
                            </div>
                            {isConfigured && (
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                Підключено
                              </Badge>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent className="pb-2">
                          {isConfigured ? (
                            <div className="text-sm">
                              <div className="grid grid-cols-2 gap-2 mt-4">
                                <div>
                                  <p className="text-neutral-500 text-xs">Статус</p>
                                  <p className="font-medium">Активний</p>
                                </div>
                                <div>
                                  <p className="text-neutral-500 text-xs">Додано</p>
                                  <p className="font-medium">Сьогодні</p>
                                </div>
                                <div>
                                  <p className="text-neutral-500 text-xs">Остання синхронізація</p>
                                  <p className="font-medium">5 хвилин тому</p>
                                </div>
                                <div>
                                  <p className="text-neutral-500 text-xs">Віджети</p>
                                  <p className="font-medium">1 активний</p>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="text-sm text-neutral-600">
                              <p>Підключіть ваш обліковий запис {integration.name} для відображення віджетів з ключовими метриками на вашій панелі приладів.</p>
                            </div>
                          )}
                        </CardContent>
                        <CardFooter className="flex justify-end space-x-2 pt-2">
                          {isConfigured ? (
                            <>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => setActiveTab(integration.type === 'jira' ? 'jira' : 'configured')}
                              >
                                Налаштувати
                              </Button>
                              <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                                Відключити
                              </Button>
                            </>
                          ) : (
                            <Button 
                              size="sm" 
                              onClick={() => setActiveTab(integration.type === 'jira' ? 'jira' : 'configured')}
                            >
                              Підключити
                            </Button>
                          )}
                        </CardFooter>
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="configured">
              <div className="space-y-6">
                <h2 className="text-xl font-semibold">Налаштовані інтеграції</h2>
                {integrations.length === 0 ? (
                  <Card>
                    <CardContent className="p-6">
                      <div className="text-center space-y-2">
                        <p className="text-neutral-600">У вас ще немає налаштованих інтеграцій</p>
                        <Button onClick={() => setActiveTab('gallery')}>Переглянути доступні інтеграції</Button>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {integrations.map(integration => {
                      const integrationType = availableIntegrations.find(i => i.type === integration.type);
                      return (
                        <Card key={integration.id}>
                          <CardHeader>
                            <div className="flex items-center">
                              <div className={`w-10 h-10 rounded-md ${integrationType?.color || 'bg-neutral-800'} flex items-center justify-center text-white text-sm mr-3`}>
                                {integrationType?.icon || 'I'}
                              </div>
                              <div>
                                <CardTitle>{integration.name}</CardTitle>
                                <CardDescription>Type: {integration.type}</CardDescription>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm text-neutral-600">
                              ID: {integration.id}<br />
                              Status: {integration.isActive ? 'Active' : 'Inactive'}
                            </p>
                          </CardContent>
                          <CardFooter className="flex justify-end space-x-2">
                            <Button variant="outline" size="sm">Редагувати</Button>
                            <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                              Видалити
                            </Button>
                          </CardFooter>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="jira">
              <JiraIntegration />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Integrations;

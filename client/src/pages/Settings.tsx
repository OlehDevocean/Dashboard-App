import React from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

const Settings: React.FC = () => {
  return (
    <DashboardLayout>
      <div className="py-6">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 md:px-8">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-neutral-900">Settings</h1>
            <p className="text-neutral-500 mt-1">Manage your account and dashboard preferences</p>
          </div>

          <Tabs defaultValue="profile">
            <TabsList className="mb-6">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="dashboards">Dashboards</TabsTrigger>
              <TabsTrigger value="integrations">Integrations</TabsTrigger>
              <TabsTrigger value="appearance">Appearance</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
            </TabsList>

            <TabsContent value="profile">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Personal Information</CardTitle>
                      <CardDescription>
                        Update your personal information and contact details
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <form className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="firstName">First Name</Label>
                            <Input id="firstName" placeholder="First Name" defaultValue="John" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="lastName">Last Name</Label>
                            <Input id="lastName" placeholder="Last Name" defaultValue="Smith" />
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input id="email" type="email" placeholder="Email" defaultValue="john@company.com" />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="company">Company</Label>
                          <Input id="company" placeholder="Company" defaultValue="Acme Inc." />
                        </div>
                        
                        <div className="pt-2">
                          <Button type="button">
                            Save Changes
                          </Button>
                        </div>
                      </form>
                    </CardContent>
                  </Card>
                </div>
                
                <div>
                  <Card>
                    <CardHeader>
                      <CardTitle>Account</CardTitle>
                      <CardDescription>
                        Manage your account settings
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="username">Username</Label>
                        <Input id="username" placeholder="Username" defaultValue="johnsmith" />
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <Button variant="outline" className="w-full">
                          Change Password
                        </Button>
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <Button variant="destructive" className="w-full">
                          Delete Account
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="dashboards">
              <Card>
                <CardHeader>
                  <CardTitle>Dashboard Settings</CardTitle>
                  <CardDescription>
                    Customize your dashboard experience
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <div className="font-medium">Default Dashboard</div>
                    <div className="text-sm text-neutral-500">Select which dashboard to show when you log in</div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
                      <Card className="border-primary">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-center">
                            <div className="font-medium">Main Dashboard</div>
                            <Badge className="bg-primary text-white">Default</Badge>
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4">
                          <div className="font-medium">Analytics</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4">
                          <div className="font-medium">Development</div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <div className="flex items-center justify-between space-y-0">
                      <div>
                        <div className="font-medium">Auto-refresh Dashboards</div>
                        <div className="text-sm text-neutral-500">Automatically refresh widget data</div>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>

                  <div>
                    <div className="font-medium mb-2">Default Refresh Interval</div>
                    <div className="flex space-x-2">
                      <Button variant="outline" className="flex-1">1 minute</Button>
                      <Button variant="outline" className="flex-1 bg-primary-light bg-opacity-10 border-primary">5 minutes</Button>
                      <Button variant="outline" className="flex-1">15 minutes</Button>
                      <Button variant="outline" className="flex-1">30 minutes</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="integrations">
              <Card>
                <CardHeader>
                  <CardTitle>Integration Settings</CardTitle>
                  <CardDescription>
                    Configure global settings for all integrations
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between space-y-0">
                    <div>
                      <div className="font-medium">Auto-sync Data</div>
                      <div className="text-sm text-neutral-500">Keep integration data up to date automatically</div>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between space-y-0">
                    <div>
                      <div className="font-medium">Error Notifications</div>
                      <div className="text-sm text-neutral-500">Receive notifications for integration errors</div>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between space-y-0">
                    <div>
                      <div className="font-medium">Cache API Responses</div>
                      <div className="text-sm text-neutral-500">Store API responses to reduce rate limiting</div>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="appearance">
              <Card>
                <CardHeader>
                  <CardTitle>Appearance Settings</CardTitle>
                  <CardDescription>
                    Customize the look and feel of your dashboard
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <div className="font-medium mb-3">Theme</div>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="border rounded-md p-3 flex items-center space-x-3 cursor-pointer bg-primary-light bg-opacity-10 border-primary">
                        <div className="w-5 h-5 rounded-full bg-white border border-neutral-200"></div>
                        <div className="font-medium">Light</div>
                      </div>
                      <div className="border rounded-md p-3 flex items-center space-x-3 cursor-pointer">
                        <div className="w-5 h-5 rounded-full bg-neutral-800"></div>
                        <div className="font-medium">Dark</div>
                      </div>
                      <div className="border rounded-md p-3 flex items-center space-x-3 cursor-pointer">
                        <div className="w-5 h-5 rounded-full bg-gradient-to-r from-white to-neutral-800"></div>
                        <div className="font-medium">System</div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <div className="font-medium mb-3">Primary Color</div>
                    <div className="grid grid-cols-6 gap-3">
                      <div className="border rounded-md p-3 flex justify-center cursor-pointer bg-primary-light bg-opacity-10 border-primary">
                        <div className="w-6 h-6 rounded-full bg-[#3366FF]"></div>
                      </div>
                      <div className="border rounded-md p-3 flex justify-center cursor-pointer">
                        <div className="w-6 h-6 rounded-full bg-[#6554C0]"></div>
                      </div>
                      <div className="border rounded-md p-3 flex justify-center cursor-pointer">
                        <div className="w-6 h-6 rounded-full bg-[#00B388]"></div>
                      </div>
                      <div className="border rounded-md p-3 flex justify-center cursor-pointer">
                        <div className="w-6 h-6 rounded-full bg-[#FF5630]"></div>
                      </div>
                      <div className="border rounded-md p-3 flex justify-center cursor-pointer">
                        <div className="w-6 h-6 rounded-full bg-[#F9AB00]"></div>
                      </div>
                      <div className="border rounded-md p-3 flex justify-center cursor-pointer">
                        <div className="w-6 h-6 rounded-full bg-[#8E44AD]"></div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between space-y-0">
                    <div>
                      <div className="font-medium">Compact Mode</div>
                      <div className="text-sm text-neutral-500">Reduce spacing to fit more content</div>
                    </div>
                    <Switch />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notifications">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Settings</CardTitle>
                  <CardDescription>
                    Control how and when you receive notifications
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between space-y-0">
                    <div>
                      <div className="font-medium">Email Notifications</div>
                      <div className="text-sm text-neutral-500">Receive important updates via email</div>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between space-y-0">
                    <div>
                      <div className="font-medium">Browser Notifications</div>
                      <div className="text-sm text-neutral-500">Get notifications in your browser</div>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <div className="font-medium">Notification Types</div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="alerts">Critical Alerts</Label>
                        <Switch id="alerts" defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="updates">System Updates</Label>
                        <Switch id="updates" defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="tips">Tips & Feature Announcements</Label>
                        <Switch id="tips" />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="marketing">Marketing Communications</Label>
                        <Switch id="marketing" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Settings;

import React from "react";
import { useLocation, Link } from "wouter";
import { cn } from "@/lib/utils";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ open, onClose }) => {
  const [location] = useLocation();

  // Navigation items
  const navItems = [
    { name: "RACI Matrix", path: "/raci-matrix", icon: "grid_view", highlight: true },
    { name: "Dashboards", path: "/dashboard", icon: "dashboard" },
    { name: "Integrations", path: "/integrations", icon: "settings_input_component" },
    { name: "Settings", path: "/settings", icon: "tune" },
    { name: "Help", path: "/help", icon: "help_outline" },
  ];

  // Connected services
  const serviceItems = [
    { name: "Jira Cloud", path: "/integrations/jira", icon: "J", color: "bg-[#0052CC]" },
    { name: "Google Analytics", path: "/integrations/google-analytics", icon: "G", color: "bg-[#F9AB00]" },
    { name: "Atlassian Marketplace", path: "/integrations/atlassian", icon: "A", color: "bg-[#172B4D]" },
    { name: "Pingdom", path: "/integrations/pingdom", icon: "P", color: "bg-[#00B388]" },
  ];

  // Mobile sidebar overlay
  const overlayClass = cn(
    "fixed inset-0 z-20 transition-opacity bg-black bg-opacity-50 md:hidden",
    open ? "opacity-100 ease-out duration-300" : "opacity-0 ease-in duration-200 pointer-events-none"
  );

  // Sidebar container
  const sidebarClass = cn(
    "fixed inset-y-0 left-0 z-30 w-64 transition duration-300 transform bg-white md:relative md:translate-x-0 md:flex md:flex-shrink-0",
    open ? "translate-x-0 ease-out" : "-translate-x-full ease-in"
  );

  return (
    <>
      {/* Mobile backdrop */}
      <div className={overlayClass} onClick={onClose} aria-hidden="true" />

      {/* Sidebar */}
      <aside className={sidebarClass}>
        <div className="flex flex-col w-64 border-r border-neutral-200 bg-white">
          {/* Logo */}
          <div className="flex items-center justify-center h-16 px-4 border-b border-neutral-200">
            <h1 className="text-xl font-semibold text-neutral-800">
              <span className="text-primary">Data</span>Sync
            </h1>
          </div>

          {/* Navigation */}
          <div className="flex flex-col flex-grow px-4 py-4 overflow-y-auto">
            <nav className="flex-1 space-y-1">
              {navItems.map((item) => (
                <a 
                  key={item.path} 
                  href={item.path} 
                  onClick={(e) => {
                    e.preventDefault();
                    window.history.pushState(null, '', item.path);
                    onClose();
                  }}
                  className={cn(
                    "flex items-center px-2 py-2 text-sm font-medium rounded-md",
                    item.highlight 
                      ? (location === item.path 
                          ? "bg-primary text-white" 
                          : "bg-primary-light bg-opacity-20 text-primary font-semibold border border-primary-light")
                      : (location === item.path
                          ? "bg-primary-light bg-opacity-10 text-primary"
                          : "text-neutral-600 hover:text-primary hover:bg-primary-light hover:bg-opacity-10")
                  )}>
                  <span className={cn(
                    "material-icons text-xl mr-3",
                    item.highlight && location !== item.path ? "text-primary" : ""
                  )}>{item.icon}</span>
                  {item.name}
                </a>
              ))}
            </nav>

            {/* Connected Services */}
            <div className="pt-4 mt-4 border-t border-neutral-200">
              <h3 className="px-2 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                Connected Services
              </h3>
              <div className="mt-2 space-y-1">
                {serviceItems.map((service) => (
                  <a 
                    key={service.path} 
                    href={service.path}
                    onClick={(e) => {
                      e.preventDefault();
                      window.history.pushState(null, '', service.path);
                      onClose();
                    }}
                    className="flex items-center px-2 py-1.5 text-sm font-medium rounded-md text-neutral-600 hover:text-primary hover:bg-primary-light hover:bg-opacity-10"
                  >
                    <div className={`w-6 h-6 mr-3 rounded-full ${service.color} flex items-center justify-center text-white text-xs`}>
                      {service.icon}
                    </div>
                    {service.name}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* User profile */}
          <div className="flex flex-shrink-0 p-4 border-t border-neutral-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-semibold">
                  J
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-neutral-700">John Smith</p>
                <p className="text-xs text-neutral-500">john@company.com</p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

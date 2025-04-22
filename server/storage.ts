import {
  users, type User, type InsertUser,
  integrations, type Integration, type InsertIntegration,
  dashboards, type Dashboard, type InsertDashboard,
  widgets, type Widget, type InsertWidget
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Integration methods
  getIntegration(id: number): Promise<Integration | undefined>;
  getIntegrationsByUserId(userId: number): Promise<Integration[]>;
  createIntegration(integration: InsertIntegration): Promise<Integration>;
  updateIntegration(id: number, integration: Partial<InsertIntegration>): Promise<Integration | undefined>;
  deleteIntegration(id: number): Promise<boolean>;
  
  // Dashboard methods
  getDashboard(id: number): Promise<Dashboard | undefined>;
  getDashboardsByUserId(userId: number): Promise<Dashboard[]>;
  getDefaultDashboard(userId: number): Promise<Dashboard | undefined>;
  createDashboard(dashboard: InsertDashboard): Promise<Dashboard>;
  updateDashboard(id: number, dashboard: Partial<InsertDashboard>): Promise<Dashboard | undefined>;
  deleteDashboard(id: number): Promise<boolean>;
  
  // Widget methods
  getWidget(id: number): Promise<Widget | undefined>;
  getWidgetsByDashboardId(dashboardId: number): Promise<Widget[]>;
  createWidget(widget: InsertWidget): Promise<Widget>;
  updateWidget(id: number, widget: Partial<InsertWidget>): Promise<Widget | undefined>;
  deleteWidget(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private integrations: Map<number, Integration>;
  private dashboards: Map<number, Dashboard>;
  private widgets: Map<number, Widget>;
  
  private userIdCounter: number;
  private integrationIdCounter: number;
  private dashboardIdCounter: number;
  private widgetIdCounter: number;
  
  constructor() {
    this.users = new Map();
    this.integrations = new Map();
    this.dashboards = new Map();
    this.widgets = new Map();
    
    this.userIdCounter = 1;
    this.integrationIdCounter = 1;
    this.dashboardIdCounter = 1;
    this.widgetIdCounter = 1;
    
    // Add a demo user
    this.createUser({
      username: "demo",
      password: "password",
      email: "demo@example.com",
      fullName: "Demo User"
    });
  }
  
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const timestamp = new Date();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    
    // Create a default dashboard for new users
    this.createDashboard({
      userId: id,
      name: "Main Dashboard",
      isDefault: true
    });
    
    return user;
  }
  
  // Integration methods
  async getIntegration(id: number): Promise<Integration | undefined> {
    return this.integrations.get(id);
  }
  
  async getIntegrationsByUserId(userId: number): Promise<Integration[]> {
    return Array.from(this.integrations.values()).filter(
      (integration) => integration.userId === userId
    );
  }
  
  async createIntegration(insertIntegration: InsertIntegration): Promise<Integration> {
    const id = this.integrationIdCounter++;
    const timestamp = new Date();
    const integration: Integration = {
      ...insertIntegration,
      id,
      createdAt: timestamp
    };
    this.integrations.set(id, integration);
    return integration;
  }
  
  async updateIntegration(id: number, integrationUpdate: Partial<InsertIntegration>): Promise<Integration | undefined> {
    const integration = this.integrations.get(id);
    if (!integration) return undefined;
    
    const updatedIntegration: Integration = {
      ...integration,
      ...integrationUpdate
    };
    this.integrations.set(id, updatedIntegration);
    return updatedIntegration;
  }
  
  async deleteIntegration(id: number): Promise<boolean> {
    return this.integrations.delete(id);
  }
  
  // Dashboard methods
  async getDashboard(id: number): Promise<Dashboard | undefined> {
    return this.dashboards.get(id);
  }
  
  async getDashboardsByUserId(userId: number): Promise<Dashboard[]> {
    return Array.from(this.dashboards.values()).filter(
      (dashboard) => dashboard.userId === userId
    );
  }
  
  async getDefaultDashboard(userId: number): Promise<Dashboard | undefined> {
    return Array.from(this.dashboards.values()).find(
      (dashboard) => dashboard.userId === userId && dashboard.isDefault
    );
  }
  
  async createDashboard(insertDashboard: InsertDashboard): Promise<Dashboard> {
    const id = this.dashboardIdCounter++;
    const timestamp = new Date();
    const dashboard: Dashboard = {
      ...insertDashboard,
      id,
      createdAt: timestamp
    };
    this.dashboards.set(id, dashboard);
    
    // If this is the default dashboard, ensure no other dashboard for this user is default
    if (dashboard.isDefault) {
      for (const [otherId, otherDashboard] of this.dashboards.entries()) {
        if (otherDashboard.userId === dashboard.userId && otherDashboard.id !== id && otherDashboard.isDefault) {
          this.dashboards.set(otherId, { ...otherDashboard, isDefault: false });
        }
      }
    }
    
    return dashboard;
  }
  
  async updateDashboard(id: number, dashboardUpdate: Partial<InsertDashboard>): Promise<Dashboard | undefined> {
    const dashboard = this.dashboards.get(id);
    if (!dashboard) return undefined;
    
    const updatedDashboard: Dashboard = {
      ...dashboard,
      ...dashboardUpdate
    };
    this.dashboards.set(id, updatedDashboard);
    
    // If this dashboard is now default, ensure no other dashboard for this user is default
    if (dashboardUpdate.isDefault) {
      for (const [otherId, otherDashboard] of this.dashboards.entries()) {
        if (otherDashboard.userId === dashboard.userId && otherDashboard.id !== id && otherDashboard.isDefault) {
          this.dashboards.set(otherId, { ...otherDashboard, isDefault: false });
        }
      }
    }
    
    return updatedDashboard;
  }
  
  async deleteDashboard(id: number): Promise<boolean> {
    // First delete all widgets associated with this dashboard
    for (const [widgetId, widget] of this.widgets.entries()) {
      if (widget.dashboardId === id) {
        this.widgets.delete(widgetId);
      }
    }
    
    return this.dashboards.delete(id);
  }
  
  // Widget methods
  async getWidget(id: number): Promise<Widget | undefined> {
    return this.widgets.get(id);
  }
  
  async getWidgetsByDashboardId(dashboardId: number): Promise<Widget[]> {
    return Array.from(this.widgets.values()).filter(
      (widget) => widget.dashboardId === dashboardId
    );
  }
  
  async createWidget(insertWidget: InsertWidget): Promise<Widget> {
    const id = this.widgetIdCounter++;
    const timestamp = new Date();
    const widget: Widget = {
      ...insertWidget,
      id,
      createdAt: timestamp
    };
    this.widgets.set(id, widget);
    return widget;
  }
  
  async updateWidget(id: number, widgetUpdate: Partial<InsertWidget>): Promise<Widget | undefined> {
    const widget = this.widgets.get(id);
    if (!widget) return undefined;
    
    const updatedWidget: Widget = {
      ...widget,
      ...widgetUpdate
    };
    this.widgets.set(id, updatedWidget);
    return updatedWidget;
  }
  
  async deleteWidget(id: number): Promise<boolean> {
    return this.widgets.delete(id);
  }
}

export const storage = new MemStorage();

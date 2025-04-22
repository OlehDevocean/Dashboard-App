import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { insertUserSchema, insertIntegrationSchema, insertDashboardSchema, insertWidgetSchema } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import axios from "axios";
import { getRaciMatrixData, getJiraWidgetData, testJiraConnection } from "./services/jira";

// Utility function to handle validation errors
const validateRequest = <T>(schema: z.ZodType<T>, data: any): T => {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof ZodError) {
      const validationError = fromZodError(error);
      throw new Error(validationError.message);
    }
    throw error;
  }
};

// Mock data functions for integrations (since we don't have real API credentials)
const getMockJiraData = () => ({
  issues: {
    critical: 12,
    high: 24,
    medium: 47
  },
  issuesByType: {
    bug: 42,
    task: 57,
    story: 31,
    epic: 22,
    other: 48
  }
});

const getMockGoogleAnalyticsData = () => ({
  visits: 4392,
  averageTime: "2:14",
  visitsTrend: 8.1,
  timeTrend: -1.2,
  weeklyData: [90, 80, 85, 70, 55, 60, 45, 50, 35, 40, 30, 25, 20, 25, 15, 10]
});

const getMockAtlassianData = () => ({
  sales: [
    { name: "App Connector Pro", value: 14382 },
    { name: "Team Calendar", value: 8741 },
    { name: "Project Visualizer", value: 6382 },
    { name: "Advanced Reports", value: 4127 },
    { name: "Custom Fields+", value: 3845 }
  ]
});

const getMockPingdomData = () => ({
  status: "operational",
  uptime: 99.98,
  dailyStatus: ["success", "success", "success", "warning", "success", "success", "success"],
  responseTime: 324,
  responseTrend: -12,
  responseTimeHistory: [15, 10, 12, 8, 15, 18, 16, 14, 10, 8, 12, 14, 10, 6, 9, 11, 7, 10, 8, 12, 10]
});

const getMockMetricsData = () => ({
  activeTasks: { value: 128, trend: 12 },
  pendingReviews: { value: 25, trend: 8 },
  conversionRate: { value: 3.2, trend: 0.8 },
  averageResponse: { value: "1.4h", trend: -12 },
  timelineData: {
    tasks: [100, 90, 120, 100, 80, 60, 70, 50, 30],
    completion: [130, 140, 120, 110, 130, 120, 100, 90, 85],
    volume: [30, 40, 50, 60, 70, 65, 75, 80]
  }
});

// RACI Matrix data specific to each service
const getMockRaciMatrixData = (serviceType: string) => {
  // Different roles based on the service type
  let roles: string[] = [];
  let tasks: { name: string; assignments: { roleIndex: number; type: 'R' | 'A' | 'C' | 'I' }[] }[] = [];
  
  // Configure roles and tasks based on the service type
  switch (serviceType) {
    case 'jira':
      roles = ['Product Owner', 'Scrum Master', 'Developer', 'QA Engineer', 'UX Designer', 'DevOps'];
      tasks = [
        { 
          name: 'Backlog Grooming', 
          assignments: [
            { roleIndex: 0, type: 'R' },
            { roleIndex: 1, type: 'A' },
            { roleIndex: 2, type: 'C' },
            { roleIndex: 4, type: 'C' }
          ]
        },
        { 
          name: 'Sprint Planning', 
          assignments: [
            { roleIndex: 0, type: 'A' },
            { roleIndex: 1, type: 'R' },
            { roleIndex: 2, type: 'C' },
            { roleIndex: 3, type: 'C' }
          ]
        },
        { 
          name: 'Feature Development', 
          assignments: [
            { roleIndex: 2, type: 'R' },
            { roleIndex: 0, type: 'A' },
            { roleIndex: 4, type: 'C' },
            { roleIndex: 1, type: 'I' }
          ]
        },
        { 
          name: 'Code Review', 
          assignments: [
            { roleIndex: 2, type: 'R' },
            { roleIndex: 2, type: 'A' },
            { roleIndex: 1, type: 'I' }
          ]
        },
        { 
          name: 'QA Testing', 
          assignments: [
            { roleIndex: 3, type: 'R' },
            { roleIndex: 0, type: 'A' },
            { roleIndex: 2, type: 'C' }
          ]
        },
        { 
          name: 'Deployment', 
          assignments: [
            { roleIndex: 5, type: 'R' },
            { roleIndex: 2, type: 'A' },
            { roleIndex: 3, type: 'C' },
            { roleIndex: 0, type: 'I' },
            { roleIndex: 1, type: 'I' }
          ]
        }
      ];
      break;
    
    case 'google_analytics':
      roles = ['Marketing Manager', 'Data Analyst', 'Web Developer', 'SEO Specialist', 'Content Creator'];
      tasks = [
        {
          name: 'Campaign Setup',
          assignments: [
            { roleIndex: 0, type: 'R' },
            { roleIndex: 1, type: 'C' },
            { roleIndex: 3, type: 'C' }
          ]
        },
        {
          name: 'Tracking Implementation',
          assignments: [
            { roleIndex: 2, type: 'R' },
            { roleIndex: 1, type: 'A' },
            { roleIndex: 0, type: 'C' }
          ]
        },
        {
          name: 'Data Analysis',
          assignments: [
            { roleIndex: 1, type: 'R' },
            { roleIndex: 0, type: 'A' },
            { roleIndex: 3, type: 'C' }
          ]
        },
        {
          name: 'Reporting',
          assignments: [
            { roleIndex: 1, type: 'R' },
            { roleIndex: 0, type: 'A' },
            { roleIndex: 4, type: 'I' }
          ]
        },
        {
          name: 'Content Strategy',
          assignments: [
            { roleIndex: 4, type: 'R' },
            { roleIndex: 0, type: 'A' },
            { roleIndex: 1, type: 'C' },
            { roleIndex: 3, type: 'C' }
          ]
        }
      ];
      break;
      
    case 'atlassian':
      roles = ['Product Manager', 'Developer Lead', 'Developer', 'Support', 'Marketing', 'Sales'];
      tasks = [
        {
          name: 'App Planning',
          assignments: [
            { roleIndex: 0, type: 'R' },
            { roleIndex: 1, type: 'A' },
            { roleIndex: 2, type: 'C' }
          ]
        },
        {
          name: 'Feature Development',
          assignments: [
            { roleIndex: 2, type: 'R' },
            { roleIndex: 1, type: 'A' },
            { roleIndex: 0, type: 'C' }
          ]
        },
        {
          name: 'App Store Listing',
          assignments: [
            { roleIndex: 4, type: 'R' },
            { roleIndex: 0, type: 'A' },
            { roleIndex: 5, type: 'C' }
          ]
        },
        {
          name: 'Customer Support',
          assignments: [
            { roleIndex: 3, type: 'R' },
            { roleIndex: 0, type: 'A' },
            { roleIndex: 2, type: 'C' }
          ]
        },
        {
          name: 'Sales Optimization',
          assignments: [
            { roleIndex: 5, type: 'R' },
            { roleIndex: 0, type: 'A' },
            { roleIndex: 4, type: 'C' }
          ]
        }
      ];
      break;
      
    case 'pingdom':
      roles = ['DevOps Lead', 'System Admin', 'Developer', 'Support Engineer', 'Product Owner'];
      tasks = [
        {
          name: 'Monitor Configuration',
          assignments: [
            { roleIndex: 1, type: 'R' },
            { roleIndex: 0, type: 'A' },
            { roleIndex: 4, type: 'C' }
          ]
        },
        {
          name: 'Alert Setup',
          assignments: [
            { roleIndex: 1, type: 'R' },
            { roleIndex: 0, type: 'A' },
            { roleIndex: 3, type: 'C' },
            { roleIndex: 4, type: 'I' }
          ]
        },
        {
          name: 'Incident Response',
          assignments: [
            { roleIndex: 3, type: 'R' },
            { roleIndex: 0, type: 'A' },
            { roleIndex: 1, type: 'C' },
            { roleIndex: 2, type: 'C' }
          ]
        },
        {
          name: 'Performance Tuning',
          assignments: [
            { roleIndex: 2, type: 'R' },
            { roleIndex: 0, type: 'A' },
            { roleIndex: 1, type: 'C' }
          ]
        },
        {
          name: 'Reporting',
          assignments: [
            { roleIndex: 0, type: 'R' },
            { roleIndex: 4, type: 'A' },
            { roleIndex: 3, type: 'C' }
          ]
        }
      ];
      break;
    
    default:
      roles = ['Manager', 'Team Lead', 'Developer', 'QA', 'DevOps'];
      tasks = [
        {
          name: 'Project Planning',
          assignments: [
            { roleIndex: 0, type: 'R' },
            { roleIndex: 1, type: 'A' },
            { roleIndex: 2, type: 'C' }
          ]
        },
        {
          name: 'Development',
          assignments: [
            { roleIndex: 2, type: 'R' },
            { roleIndex: 1, type: 'A' },
            { roleIndex: 3, type: 'C' }
          ]
        },
        {
          name: 'Testing',
          assignments: [
            { roleIndex: 3, type: 'R' },
            { roleIndex: 1, type: 'A' },
            { roleIndex: 2, type: 'C' }
          ]
        }
      ];
  }
  
  return {
    roles,
    tasks,
    status: {
      onTrack: Math.floor(Math.random() * 10) + 5,
      atRisk: Math.floor(Math.random() * 5) + 1,
      delayed: Math.floor(Math.random() * 3),
      completed: Math.floor(Math.random() * 15) + 10
    },
    taskCompletionTrend: Array.from({ length: 8 }, () => Math.floor(Math.random() * 50) + 50)
  };
};

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // Auth routes
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }
      
      const user = await storage.getUserByUsername(username);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid username or password" });
      }
      
      // In a real app, you'd use a proper session management system
      // For simplicity, we'll just return the user (minus the password)
      const { password: _, ...userWithoutPassword } = user;
      
      return res.status(200).json({ user: userWithoutPassword });
    } catch (error) {
      console.error("Login error:", error);
      return res.status(500).json({ message: "An error occurred during login" });
    }
  });
  
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const userData = validateRequest(insertUserSchema, req.body);
      
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(409).json({ message: "Username already exists" });
      }
      
      const user = await storage.createUser(userData);
      const { password: _, ...userWithoutPassword } = user;
      
      return res.status(201).json({ user: userWithoutPassword });
    } catch (error) {
      console.error("Registration error:", error);
      return res.status(500).json({ message: error instanceof Error ? error.message : "An error occurred during registration" });
    }
  });
  
  // Dashboard routes
  app.get("/api/dashboards", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.query.userId as string);
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Valid userId is required" });
      }
      
      const dashboards = await storage.getDashboardsByUserId(userId);
      return res.status(200).json({ dashboards });
    } catch (error) {
      console.error("Get dashboards error:", error);
      return res.status(500).json({ message: "An error occurred while fetching dashboards" });
    }
  });
  
  app.get("/api/dashboards/default", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.query.userId as string);
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Valid userId is required" });
      }
      
      const dashboard = await storage.getDefaultDashboard(userId);
      
      if (!dashboard) {
        return res.status(404).json({ message: "Default dashboard not found" });
      }
      
      return res.status(200).json({ dashboard });
    } catch (error) {
      console.error("Get default dashboard error:", error);
      return res.status(500).json({ message: "An error occurred while fetching the default dashboard" });
    }
  });
  
  app.get("/api/dashboards/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Valid dashboard id is required" });
      }
      
      const dashboard = await storage.getDashboard(id);
      
      if (!dashboard) {
        return res.status(404).json({ message: "Dashboard not found" });
      }
      
      return res.status(200).json({ dashboard });
    } catch (error) {
      console.error("Get dashboard error:", error);
      return res.status(500).json({ message: "An error occurred while fetching the dashboard" });
    }
  });
  
  app.post("/api/dashboards", async (req: Request, res: Response) => {
    try {
      const dashboardData = validateRequest(insertDashboardSchema, req.body);
      const dashboard = await storage.createDashboard(dashboardData);
      return res.status(201).json({ dashboard });
    } catch (error) {
      console.error("Create dashboard error:", error);
      return res.status(500).json({ message: error instanceof Error ? error.message : "An error occurred while creating the dashboard" });
    }
  });
  
  app.put("/api/dashboards/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Valid dashboard id is required" });
      }
      
      const dashboardData = validateRequest(insertDashboardSchema.partial(), req.body);
      const dashboard = await storage.updateDashboard(id, dashboardData);
      
      if (!dashboard) {
        return res.status(404).json({ message: "Dashboard not found" });
      }
      
      return res.status(200).json({ dashboard });
    } catch (error) {
      console.error("Update dashboard error:", error);
      return res.status(500).json({ message: error instanceof Error ? error.message : "An error occurred while updating the dashboard" });
    }
  });
  
  app.delete("/api/dashboards/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Valid dashboard id is required" });
      }
      
      const success = await storage.deleteDashboard(id);
      
      if (!success) {
        return res.status(404).json({ message: "Dashboard not found" });
      }
      
      return res.status(204).send();
    } catch (error) {
      console.error("Delete dashboard error:", error);
      return res.status(500).json({ message: "An error occurred while deleting the dashboard" });
    }
  });
  
  // Widget routes
  app.get("/api/widgets", async (req: Request, res: Response) => {
    try {
      const dashboardId = parseInt(req.query.dashboardId as string);
      
      if (isNaN(dashboardId)) {
        return res.status(400).json({ message: "Valid dashboardId is required" });
      }
      
      const widgets = await storage.getWidgetsByDashboardId(dashboardId);
      return res.status(200).json({ widgets });
    } catch (error) {
      console.error("Get widgets error:", error);
      return res.status(500).json({ message: "An error occurred while fetching widgets" });
    }
  });
  
  app.get("/api/widgets/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Valid widget id is required" });
      }
      
      const widget = await storage.getWidget(id);
      
      if (!widget) {
        return res.status(404).json({ message: "Widget not found" });
      }
      
      return res.status(200).json({ widget });
    } catch (error) {
      console.error("Get widget error:", error);
      return res.status(500).json({ message: "An error occurred while fetching the widget" });
    }
  });
  
  app.post("/api/widgets", async (req: Request, res: Response) => {
    try {
      const widgetData = validateRequest(insertWidgetSchema, req.body);
      const widget = await storage.createWidget(widgetData);
      return res.status(201).json({ widget });
    } catch (error) {
      console.error("Create widget error:", error);
      return res.status(500).json({ message: error instanceof Error ? error.message : "An error occurred while creating the widget" });
    }
  });
  
  app.put("/api/widgets/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Valid widget id is required" });
      }
      
      const widgetData = validateRequest(insertWidgetSchema.partial(), req.body);
      const widget = await storage.updateWidget(id, widgetData);
      
      if (!widget) {
        return res.status(404).json({ message: "Widget not found" });
      }
      
      return res.status(200).json({ widget });
    } catch (error) {
      console.error("Update widget error:", error);
      return res.status(500).json({ message: error instanceof Error ? error.message : "An error occurred while updating the widget" });
    }
  });
  
  app.delete("/api/widgets/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Valid widget id is required" });
      }
      
      const success = await storage.deleteWidget(id);
      
      if (!success) {
        return res.status(404).json({ message: "Widget not found" });
      }
      
      return res.status(204).send();
    } catch (error) {
      console.error("Delete widget error:", error);
      return res.status(500).json({ message: "An error occurred while deleting the widget" });
    }
  });
  
  // Integration routes
  app.get("/api/integrations", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.query.userId as string);
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Valid userId is required" });
      }
      
      const integrations = await storage.getIntegrationsByUserId(userId);
      return res.status(200).json({ integrations });
    } catch (error) {
      console.error("Get integrations error:", error);
      return res.status(500).json({ message: "An error occurred while fetching integrations" });
    }
  });
  
  app.get("/api/integrations/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Valid integration id is required" });
      }
      
      const integration = await storage.getIntegration(id);
      
      if (!integration) {
        return res.status(404).json({ message: "Integration not found" });
      }
      
      return res.status(200).json({ integration });
    } catch (error) {
      console.error("Get integration error:", error);
      return res.status(500).json({ message: "An error occurred while fetching the integration" });
    }
  });
  
  app.post("/api/integrations", async (req: Request, res: Response) => {
    try {
      const integrationData = validateRequest(insertIntegrationSchema, req.body);
      const integration = await storage.createIntegration(integrationData);
      return res.status(201).json({ integration });
    } catch (error) {
      console.error("Create integration error:", error);
      return res.status(500).json({ message: error instanceof Error ? error.message : "An error occurred while creating the integration" });
    }
  });
  
  app.put("/api/integrations/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Valid integration id is required" });
      }
      
      const integrationData = validateRequest(insertIntegrationSchema.partial(), req.body);
      const integration = await storage.updateIntegration(id, integrationData);
      
      if (!integration) {
        return res.status(404).json({ message: "Integration not found" });
      }
      
      return res.status(200).json({ integration });
    } catch (error) {
      console.error("Update integration error:", error);
      return res.status(500).json({ message: error instanceof Error ? error.message : "An error occurred while updating the integration" });
    }
  });
  
  app.delete("/api/integrations/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Valid integration id is required" });
      }
      
      const success = await storage.deleteIntegration(id);
      
      if (!success) {
        return res.status(404).json({ message: "Integration not found" });
      }
      
      return res.status(204).send();
    } catch (error) {
      console.error("Delete integration error:", error);
      return res.status(500).json({ message: "An error occurred while deleting the integration" });
    }
  });
  
  // Test Jira connection route
  app.get("/api/jira/test-connection", async (req: Request, res: Response) => {
    try {
      // Виводимо в консоль інформацію про ключі середовища перед тестуванням
      console.log('=== Jira Connection Test from Routes ===');
      console.log('JIRA_DOMAIN:', process.env.JIRA_DOMAIN);
      console.log('JIRA_EMAIL (повний):', process.env.JIRA_EMAIL); // Повний email для відлагодження
      console.log('JIRA_API_TOKEN (частково):', process.env.JIRA_API_TOKEN ? process.env.JIRA_API_TOKEN.substring(0, 5) + '...' : 'не вказано');
      
      const result = await testJiraConnection();
      return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      console.error("Test Jira connection error:", error);
      return res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : "An error occurred while testing Jira connection"
      });
    }
  });
  
  // Widget data routes
  app.get("/api/widget-data/:type", async (req: Request, res: Response) => {
    try {
      const { type } = req.params;
      
      let data;
      switch (type) {
        case "jira":
          try {
            // Спробуємо отримати реальні дані з Jira
            data = await getJiraWidgetData();
          } catch (jiraError) {
            console.error("Error fetching real Jira data:", jiraError);
            // Якщо виникла помилка при отриманні реальних даних, повертаємо копію помилки клієнту
            return res.status(500).json({ 
              error: jiraError instanceof Error ? jiraError.message : "Помилка при отриманні даних з Jira",
              data: null
            });
          }
          break;
        case "google_analytics":
          data = getMockGoogleAnalyticsData();
          break;
        case "atlassian":
          data = getMockAtlassianData();
          break;
        case "pingdom":
          data = getMockPingdomData();
          break;
        case "metrics":
          data = getMockMetricsData();
          break;
        case "raci_matrix_jira":
          try {
            // Спробуємо отримати реальні дані з Jira для RACI матриці
            data = await getRaciMatrixData();
          } catch (jiraError) {
            console.error("Error fetching real Jira RACI matrix data:", jiraError);
            // Якщо виникла помилка при отриманні реальних даних, повертаємо копію помилки клієнту
            return res.status(500).json({ 
              error: jiraError instanceof Error ? jiraError.message : "Помилка при отриманні даних RACI з Jira",
              data: null
            });
          }
          break;
        case "raci_matrix_google_analytics":
          data = getMockRaciMatrixData("google_analytics");
          break;
        case "raci_matrix_atlassian":
          data = getMockRaciMatrixData("atlassian");
          break;
        case "raci_matrix_pingdom":
          data = getMockRaciMatrixData("pingdom");
          break;
        default:
          return res.status(400).json({ message: "Invalid widget type" });
      }
      
      return res.status(200).json({ data });
    } catch (error) {
      console.error(`Get ${req.params.type} data error:`, error);
      return res.status(500).json({ 
        message: `An error occurred while fetching ${req.params.type} data`,
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  
  return httpServer;
}

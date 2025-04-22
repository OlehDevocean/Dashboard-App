// Widget layout type for grid positioning
export interface WidgetLayout {
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  minH?: number;
  maxW?: number;
  maxH?: number;
}

// Widget type containing metadata and configuration
export interface Widget {
  id: number;
  type: WidgetType;
  title: string;
  refreshInterval: number; // in seconds
  layout: WidgetLayout;
  config: any;
  integrationId?: number;
  dashboardId: number;
}

// Types of widgets supported
export type WidgetType = 
  | 'jira'
  | 'google_analytics'
  | 'atlassian'
  | 'pingdom'
  | 'metrics'
  | 'add_integration'
  | 'raci_matrix_jira'
  | 'raci_matrix_google_analytics'
  | 'raci_matrix_atlassian'
  | 'raci_matrix_pingdom';

// Integration type containing connection configuration
export interface Integration {
  id: number;
  type: string;
  name: string;
  isActive: boolean;
  config: any;
  userId: number;
}

// Dashboard containing widgets
export interface Dashboard {
  id: number;
  name: string;
  isDefault: boolean;
  userId: number;
}

// User type
export interface User {
  id: number;
  username: string;
  email: string;
  fullName: string;
}

// Widget data types for specific integrations
export interface JiraData {
  issues: {
    critical: number;
    high: number;
    medium: number;
  };
  issuesByType: {
    bug: number;
    task: number;
    story: number;
    epic: number;
    other: number;
  };
}

export interface GoogleAnalyticsData {
  visits: number;
  averageTime: string;
  visitsTrend: number;
  timeTrend: number;
  weeklyData: number[];
}

export interface AtlassianData {
  sales: {
    name: string;
    value: number;
  }[];
}

export interface PingdomData {
  status: 'operational' | 'degraded' | 'down';
  uptime: number;
  dailyStatus: ('success' | 'warning' | 'error')[];
  responseTime: number;
  responseTrend: number;
  responseTimeHistory: number[];
}

export interface MetricsData {
  activeTasks: { value: number; trend: number };
  pendingReviews: { value: number; trend: number };
  conversionRate: { value: number; trend: number };
  averageResponse: { value: string; trend: number };
  timelineData: {
    tasks: number[];
    completion: number[];
    volume: number[];
  };
}

export interface RaciMatrixData {
  roles: string[];
  tasks: {
    name: string;
    key?: string; // Jira issue key
    assignments: {
      roleIndex: number;
      type: 'R' | 'A' | 'C' | 'I';
    }[];
    // Інформація про час
    originalEstimate?: number; // Початкова оцінка часу в секундах
    currentEstimate?: number; // Поточна оцінка часу в секундах
    timeSpent?: number; // Витрачений час в секундах
    progress?: number; // Відсоток виконання (0-100)
  }[];
  status: {
    onTrack: number;
    atRisk: number;
    delayed: number;
    completed: number;
  };
  taskCompletionTrend: number[];
  // Загальна статистика по часу
  timeStats?: {
    totalOriginalEstimate: number; // Загальна початкова оцінка часу в секундах
    totalCurrentEstimate: number; // Загальна поточна оцінка часу в секундах
    totalTimeSpent: number; // Загальний витрачений час в секундах
    estimateAccuracy: number; // Точність оцінки (відсоток)
  };
}

export type WidgetData = 
  | JiraData
  | GoogleAnalyticsData
  | AtlassianData
  | PingdomData
  | MetricsData
  | RaciMatrixData;

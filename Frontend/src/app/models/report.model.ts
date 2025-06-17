export interface Report {
  id: number;
  title: string;
  category: string;
  dateRange: {
    start: Date;
    end: Date;
  };
  status: 'generated' | 'pending' | 'failed';
  createdAt: Date;
  downloadUrl?: string;
  team?: string;
  departmentId?: string;
  reportData?: TaskReportData;
}

export interface TaskReportData {
  departmentInfo: {
    id: string;
    name: string;
    color: string;
  };
  taskStats: {
    total: number;
    completed: number;
    inProgress: number;
    pending: number;
    overdue: number;
  };
  priorityStats: {
    high: number;
    medium: number;
    low: number;
  };
  completionPercentage: number;
  memberCount: number;
  teamMetrics: {
    productivity: number;
    efficiency: number;
    onTimeDelivery: number;
  };
} 
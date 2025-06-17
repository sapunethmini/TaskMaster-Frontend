import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Task {
  id?: number;
  title: string;
  description?: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'TODO';
  category: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  deadline?: Date;
  created_at?: Date;
  updated_at?: Date;
  user_id?: number;
  duration: string;
}

export interface TeamStatusCounts {
  pending: number;
  inProgress: number;
  completed: number;
  todo: number;
  total: number;
}

export interface AllStatusCounts {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  pendingTasks: number;
  todoTasks: number;
}

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private apiUrl =`${environment.TaskServiceUrl}/api/tasks`;

  constructor(private http: HttpClient) {}

  createTask(task: Task): Observable<Task> {
    return this.http.post<Task>(`${this.apiUrl}/createTask`, task);
  }

  getTasks(): Observable<Task[]> {
    return this.http.get<Task[]>(this.apiUrl);
  }

  getTaskById(id: number): Observable<Task> {
    return this.http.get<Task>(`${this.apiUrl}/${id}`);
  }

  updateTask(id: number, task: Task): Observable<Task> {
    return this.http.put<Task>(`${this.apiUrl}/${id}`, task);
  }

  deleteTask(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Main method for getting task count by status (all departments)
  // Endpoint: http://localhost:8084/api/tasks/status/{status}/count
  getTaskCountByStatus(status: string): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/status/${status}/count`);
  }

  getTotalTaskCount(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/count`);
  }

  // NEW METHOD: Get all status counts at once (all departments)
  getAllStatusCounts(): Observable<AllStatusCounts> {
    return new Observable(observer => {
      // Use forkJoin to make all requests simultaneously
      forkJoin({
        totalTasks: this.getTotalTaskCount(),
        completedTasks: this.getTaskCountByStatus('COMPLETED'),
        inProgressTasks: this.getTaskCountByStatus('IN_PROGRESS'),
        pendingTasks: this.getTaskCountByStatus('PENDING'),
        todoTasks: this.getTaskCountByStatus('TODO')
      }).subscribe({
        next: (counts) => {
          const allCounts: AllStatusCounts = {
            totalTasks: counts.totalTasks,
            completedTasks: counts.completedTasks,
            inProgressTasks: counts.inProgressTasks,
            pendingTasks: counts.pendingTasks,
            todoTasks: counts.todoTasks
          };
          
          observer.next(allCounts);
          observer.complete();
        },
        error: (error) => {
          console.error('Error fetching status counts:', error);
          observer.error(error);
        }
      });
    });
  }

  getCountByTeam(departmentId: string): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/team/${departmentId}/count`);
  }

  // Get task count by team and status using the specified endpoint
  getTaskCountByTeamAndStatus(teamId: string, status: string): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/team/${teamId}/status/${status}/count`);
  }

  // Get all status counts for a specific team
  getAllStatusCountsForTeam(teamId: string): Observable<TeamStatusCounts> {
    return new Observable(observer => {
      const statusCounts: TeamStatusCounts = {
        pending: 0,
        inProgress: 0,
        completed: 0,
        todo: 0,
        total: 0
      };

      // Use forkJoin to make all requests simultaneously
      forkJoin({
        pending: this.getTaskCountByTeamAndStatus(teamId, 'PENDING'),
        inProgress: this.getTaskCountByTeamAndStatus(teamId, 'IN_PROGRESS'),
        completed: this.getTaskCountByTeamAndStatus(teamId, 'COMPLETED'),
        todo: this.getTaskCountByTeamAndStatus(teamId, 'TODO')
      }).subscribe({
        next: (counts) => {
          statusCounts.pending = counts.pending;
          statusCounts.inProgress = counts.inProgress;
          statusCounts.completed = counts.completed;
          statusCounts.todo = counts.todo;
          statusCounts.total = counts.pending + counts.inProgress + counts.completed + counts.todo;
          
          observer.next(statusCounts);
          observer.complete();
        },
        error: (error) => {
          observer.error(error);
        }
      });
    });
  }

  // Method to get tasks by team and priority
  getTasksByTeamAndPriority(team: string, priority: 'HIGH' | 'MEDIUM' | 'LOW'): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.apiUrl}/team/${team}/priority/${priority}`);
  }

  // Method to get task count by team and priority
  getTaskCountByTeamAndPriority(team: string, priority: 'HIGH' | 'MEDIUM' | 'LOW'): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/team/${team}/priority/${priority}/count`);
  }

  // Helper method to get all priority counts for a specific team
  getAllPriorityCountsForTeam(team: string): Observable<{high: number, medium: number, low: number}> {
    return new Observable(observer => {
      const priorityCounts = { high: 0, medium: 0, low: 0 };

      forkJoin({
        high: this.getTaskCountByTeamAndPriority(team, 'HIGH'),
        medium: this.getTaskCountByTeamAndPriority(team, 'MEDIUM'),
        low: this.getTaskCountByTeamAndPriority(team, 'LOW')
      }).subscribe({
        next: (counts) => {
          observer.next(counts);
          observer.complete();
        },
        error: (error) => {
          observer.error(error);
        }
      });
    });
  }

  // Get all tasks for a specific team/department
  getTasksByTeam(departmentId: string): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.apiUrl}/getAllTasks/team/${departmentId}`);
  }
}
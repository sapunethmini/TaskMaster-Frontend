import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { TaskService, TeamStatusCounts } from '../../../services/task.service';

interface TeamTaskData {
  id: number;
  name: string;
  completedTasks: number;
  pendingTasks: number;
  inProgressTasks: number;
  todoTasks: number;
  totalTasks: number;
  color: string;
  departmentId: string;
  duration: string;
  isLoading?: boolean;
}

@Component({
  selector: 'app-task-management',
  templateUrl: './task-management.component.html',
  styleUrls: ['./task-management.component.css'],
  standalone: true,
  imports: [CommonModule, CardModule]
})
export class TaskManagementComponent implements OnInit {
  teams: TeamTaskData[] = [
    { 
      id: 1, 
      name: 'Development Team', 
      completedTasks: 0, 
      pendingTasks: 0,
      inProgressTasks: 0,
      todoTasks: 0,
      totalTasks: 0, 
      color: '#4CAF50', 
      departmentId: '001',
      duration: '1h',
      isLoading: true
    },
    { 
      id: 2, 
      name: 'Marketing Team', 
      completedTasks: 0, 
      pendingTasks: 0,
      inProgressTasks: 0,
      todoTasks: 0,
      totalTasks: 0, 
      color: '#2196F3', 
      departmentId: '002', 
      duration: '2h',
      isLoading: true
    },
    { 
      id: 3, 
      name: 'Sales Team', 
      completedTasks: 0, 
      pendingTasks: 0,
      inProgressTasks: 0,
      todoTasks: 0,
      totalTasks: 0, 
      color: '#9C27B0', 
      departmentId: '003', 
      duration: '1h',
      isLoading: true
    },
    { 
      id: 4, 
      name: 'Operation Team', 
      completedTasks: 0, 
      pendingTasks: 0,
      inProgressTasks: 0,
      todoTasks: 0,
      totalTasks: 0, 
      color: '#FF5722', 
      departmentId: '004',  
      duration: '3h',
      isLoading: true
    },
    { 
      id: 5, 
      name: 'Design Team', 
      completedTasks: 0, 
      pendingTasks: 0,
      inProgressTasks: 0,
      todoTasks: 0,
      totalTasks: 0, 
      color: '#FFC107', 
      departmentId: '005', 
      duration: '4h',
      isLoading: true
    },
    { 
      id: 6, 
      name: 'HR Team', 
      completedTasks: 0, 
      pendingTasks: 0,
      inProgressTasks: 0,
      todoTasks: 0,
      totalTasks: 0, 
      color: '#607D8B', 
      departmentId: '006', 
      duration: '2h',
      isLoading: true
    },
  ];

  constructor(
    private router: Router,
    private http: HttpClient,
    private taskService: TaskService
  ) { }

  ngOnInit(): void {
    this.loadTeamTaskCounts();
  }

  private loadTeamTaskCounts(): void {
    this.teams.forEach((team) => {
      this.taskService.getAllStatusCountsForTeam(team.departmentId).subscribe({
        next: (statusCounts: TeamStatusCounts) => {
          team.completedTasks = statusCounts.completed;
          team.pendingTasks = statusCounts.pending;
          team.inProgressTasks = statusCounts.inProgress;
          team.todoTasks = statusCounts.todo;
          team.totalTasks = statusCounts.total;
          team.isLoading = false;
        },
        error: (error) => {
          console.error(`Error loading task counts for team ${team.name}:`, error);
          team.isLoading = false;
          // Set default values on error
          team.completedTasks = 0;
          team.pendingTasks = 0;
          team.inProgressTasks = 0;
          team.todoTasks = 0;
          team.totalTasks = 0;
        }
      });
    });
  }

  getColorClass(completedTasks: number, totalTasks: number): string {
    if (totalTasks === 0) return 'progress-neutral';
    
    const progress = (completedTasks / totalTasks) * 100;
    if (progress >= 80) {
      return 'progress-success';
    } else if (progress >= 60) {
      return 'progress-warning';
    } else {
      return 'progress-danger';
    }
  }

  getCompletionPercentage(team: TeamTaskData): number {
    if (team.totalTasks === 0) return 0;
    return Math.round((team.completedTasks / team.totalTasks) * 100);
  }

  getProgressPercentage(team: TeamTaskData): number {
    if (team.totalTasks === 0) return 0;
    const progressTasks = team.completedTasks + team.inProgressTasks;
    return Math.round((progressTasks / team.totalTasks) * 100);
  }

  // Get the stroke-dasharray for circular progress ring
  getCircularProgress(team: TeamTaskData): string {
    const percentage = this.getCompletionPercentage(team);
    const circumference = 2 * Math.PI * 45; // radius = 45
    const strokeDasharray = (percentage / 100) * circumference;
    return `${strokeDasharray} ${circumference}`;
  }

  // Get stroke color based on completion percentage
  getStrokeColor(team: TeamTaskData): string {
    const percentage = this.getCompletionPercentage(team);
    if (percentage >= 80) {
      return '#4CAF50'; // Green
    } else if (percentage >= 60) {
      return '#FF9800'; // Orange
    } else if (percentage > 0) {
      return '#F44336'; // Red
    } else {
      return '#E0E0E0'; // Gray for no progress
    }
  }

  // Get completion status text
  getCompletionStatus(team: TeamTaskData): string {
    const percentage = this.getCompletionPercentage(team);
    if (percentage === 100) {
      return 'Complete';
    } else if (percentage >= 80) {
      return 'Almost Done';
    } else if (percentage >= 50) {
      return 'In Progress';
    } else if (percentage > 0) {
      return 'Started';
    } else {
      return 'Not Started';
    }
  }

  viewTeamTasks(team: TeamTaskData): void {
    if (team.isLoading) return;

    // Get priority counts for the team
    this.taskService.getAllPriorityCountsForTeam(team.departmentId).subscribe({
      next: (priorityCounts) => {
        // Navigate to team overview with department ID and all task data
        this.router.navigate(['/admin/team-overview'], {
          queryParams: {
            departmentId: team.departmentId,
            title: team.name,
            completedTasks: team.completedTasks,
            pendingTasks: team.pendingTasks,
            inProgressTasks: team.inProgressTasks,
            todoTasks: team.todoTasks,
            totalTasks: team.totalTasks,
            color: team.color,
            highPriority: priorityCounts.high,
            mediumPriority: priorityCounts.medium,
            lowPriority: priorityCounts.low
          }
        });
      },
      error: (error) => {
        console.error('Error loading priority counts:', error);
        // Navigate with basic data even if priority counts fail
        this.router.navigate(['/admin/team-overview'], {
          queryParams: {
            departmentId: team.departmentId,
            title: team.name,
            completedTasks: team.completedTasks,
            pendingTasks: team.pendingTasks,
            inProgressTasks: team.inProgressTasks,
            todoTasks: team.todoTasks,
            totalTasks: team.totalTasks,
            color: team.color,
            highPriority: 0,
            mediumPriority: 0,
            lowPriority: 0
          }
        });
      }
    });
  }

  refreshTeamData(team: TeamTaskData): void {
    team.isLoading = true;
    this.taskService.getAllStatusCountsForTeam(team.departmentId).subscribe({
      next: (statusCounts: TeamStatusCounts) => {
        team.completedTasks = statusCounts.completed;
        team.pendingTasks = statusCounts.pending;
        team.inProgressTasks = statusCounts.inProgress;
        team.todoTasks = statusCounts.todo;
        team.totalTasks = statusCounts.total;
        team.isLoading = false;
      },
      error: (error) => {
        console.error(`Error refreshing task counts for team ${team.name}:`, error);
        team.isLoading = false;
      }
    });
  }

  // Helper method to get status breakdown text
  getStatusBreakdown(team: TeamTaskData): string {
    return `Completed: ${team.completedTasks} | In Progress: ${team.inProgressTasks} | Pending: ${team.pendingTasks} | Todo: ${team.todoTasks}`;
  }
}
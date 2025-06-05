import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ProgressBarModule } from 'primeng/progressbar';
import { Router } from '@angular/router';
import { TaskService } from '../../../services/task.service';
import { forkJoin } from 'rxjs';

interface TeamData {
  id: number;
  name: string;
  progress: number;
  tasksCompleted: number;
  totalTasks: number;
  members: number;
  color: string;
  departmentId: string;
  isLoading?: boolean;
  error?: string;
}

@Component({
  selector: 'app-team-management',
  templateUrl: './team-management.component.html',
  styleUrls: ['./team-management.component.css'],
  standalone: true,
  imports: [CommonModule, CardModule, ProgressBarModule]
})
export class TeamManagementComponent implements OnInit {
  teams: TeamData[] = [
    { 
      id: 1, 
      name: 'Development Team', 
      progress: 0, 
      tasksCompleted: 0, 
      totalTasks: 0, 
      members: 8, 
      color: '#4CAF50', 
      departmentId: '001',
      isLoading: true 
    },
    { 
      id: 2, 
      name: 'Marketing Team', 
      progress: 0, 
      tasksCompleted: 0, 
      totalTasks: 0, 
      members: 5, 
      color: '#2196F3', 
      departmentId: '002',
      isLoading: true 
    },
    { 
      id: 3, 
      name: 'Sales Team', 
      progress: 0, 
      tasksCompleted: 0, 
      totalTasks: 0, 
      members: 6, 
      color: '#9C27B0', 
      departmentId: '003',
      isLoading: true 
    },
    { 
      id: 4, 
      name: 'Operation Team', 
      progress: 0, 
      tasksCompleted: 0, 
      totalTasks: 0, 
      members: 4, 
      color: '#FF5722', 
      departmentId: '004',
      isLoading: true 
    },
    { 
      id: 5, 
      name: 'Design Team', 
      progress: 0, 
      tasksCompleted: 0, 
      totalTasks: 0, 
      members: 4, 
      color: '#FFC107', 
      departmentId: '005',
      isLoading: true 
    },
    { 
      id: 6, 
      name: 'HR Team', 
      progress: 0, 
      tasksCompleted: 0, 
      totalTasks: 0, 
      members: 3, 
      color: '#607D8B', 
      departmentId: '006',
      isLoading: true ,
    }
  ];

  isLoading = true;
  error: string | null = null;

  constructor(private router: Router, private taskService: TaskService) {}

  ngOnInit(): void {
    this.loadTeamTaskData();
  }

  loadTeamTaskData(): void {
    console.log('Loading team task data...');
    this.isLoading = true;
    this.error = null;

    // Create requests for all teams
    const teamRequests = this.teams.map(team => 
      this.loadSingleTeamData(team)
    );

    // Execute all requests
    forkJoin(teamRequests).subscribe({
      next: (results) => {
        console.log('All team data loaded successfully');
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading team data:', error);
        this.error = 'Failed to load team task data';
        this.isLoading = false;
        this.teams.forEach(team => {
          team.isLoading = false;
          team.error = 'Failed to load';
        });
      }
    });
  }

  private loadSingleTeamData(team: TeamData) {
    console.log(`Loading data for team: ${team.name} (${team.departmentId})`);
    
    return new Promise((resolve, reject) => {
      // First try to get the total count
      this.taskService.getCountByTeam(team.departmentId).subscribe({
        next: (totalCount) => {
          console.log(`Team ${team.name} total count:`, totalCount);
          team.totalTasks = totalCount;
          
          // Get both COMPLETED and IN_PROGRESS counts
          forkJoin({
            completed: this.taskService.getTaskCountByTeamAndStatus(team.departmentId, 'COMPLETED'),
            inProgress: this.taskService.getTaskCountByTeamAndStatus(team.departmentId, 'IN_PROGRESS')
          }).subscribe({
            next: (counts) => {
              console.log(`Team ${team.name} completed count:`, counts.completed);
              console.log(`Team ${team.name} in progress count:`, counts.inProgress);
              
              team.tasksCompleted = counts.completed;
              team.progress = team.totalTasks > 0 
                ? Math.round(((counts.completed + counts.inProgress) / team.totalTasks) * 100) 
            : 0;
          team.isLoading = false;
          team.error = undefined;
          
          console.log(`Team ${team.name} progress: ${team.progress}% (${team.tasksCompleted}/${team.totalTasks})`);
          resolve(team);
        },
        error: (error) => {
              console.error(`Error loading status counts for team ${team.name}:`, error);
              team.error = 'Failed to load status counts';
              team.isLoading = false;
              reject(error);
            }
          });
        },
        error: (error) => {
          console.error(`Error loading total count for team ${team.name}:`, error);
          team.error = 'Failed to load total count';
          team.isLoading = false;
          reject(error);
        }
      });
    });
  }

  // BETTER APPROACH: Load team statistics using team-specific endpoints
  loadTeamTaskDataBetter(): void {
    console.log('Loading team task data (better approach)...');
    this.isLoading = true;
    this.error = null;

    this.teams.forEach((team) => {
      team.isLoading = true;
      team.error = undefined;

      // Use the team statistics method
      // this.taskService.getTeamTaskStatistics(team.departmentId).subscribe({
      //   next: (stats: TeamTaskStatistics) => {
      //     console.log(`Team ${team.name} statistics:`, stats);
          
      //     team.totalTasks = stats.total;
      //     team.tasksCompleted = stats.completed;
      //     team.progress = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
      //     team.isLoading = false;
      //     team.error = undefined;
      //   },
      //   error: (error: any) => {
      //     console.error(`Error loading statistics for team ${team.name}:`, error);
      //     team.error = 'Failed to load';
      //     team.isLoading = false;
      //   }
      // });
    });

    // Check if all teams are done loading
    setTimeout(() => {
      const stillLoading = this.teams.some(team => team.isLoading);
      if (!stillLoading) {
        this.isLoading = false;
      }
    }, 5000); // 5 second timeout
  }

  private getTotalTasksAcrossTeams(): number {
    return this.teams.reduce((total, team) => total + team.totalTasks, 0);
  }

  getColorClass(progress: number): string {
    if (progress >= 80) {
      return 'progress-success';
    } else if (progress >= 60) {
      return 'progress-warning';
    } else {
      return 'progress-danger';
    }
  }

  getProgressBarColor(progress: number): string {
    if (progress >= 80) {
      return '#4CAF50'; // Green
    } else if (progress >= 60) {
      return '#FF9800'; // Orange
    } else {
      return '#F44336'; // Red
    }
  }

  viewTeamMembers(team: TeamData): void {
    console.log(`Navigating to team members for: ${team.name}`);
    this.router.navigate(['/admin/team-members'], {
      queryParams: {
        departmentId: team.departmentId,
        title: team.name
      }
    });
  }

  // Method to view team tasks
  viewTeamTasks(team: TeamData): void {
    console.log(`Navigating to team tasks for: ${team.name}`);
    this.router.navigate(['/admin/team-tasks'], {
      queryParams: {
        departmentId: team.departmentId,
        title: team.name
      }
    });
  }

  // Refresh data for a specific team
  refreshTeamData(team: TeamData): void {
    console.log(`Refreshing data for team: ${team.name}`);
    team.isLoading = true;
    team.error = undefined;
    
    this.loadSingleTeamData(team).then(() => {
      console.log(`Data refreshed for team: ${team.name}`);
    }).catch((error) => {
      console.error(`Failed to refresh data for team: ${team.name}`, error);
    });
  }

  // Refresh all team data
  refreshAllData(): void {
    console.log('Refreshing all team data...');
    this.loadTeamTaskData();
  }

  // Get task completion rate as a formatted string
  getCompletionRate(team: TeamData): string {
    if (team.totalTasks === 0) {
      return 'No tasks';
    }
    return `${team.tasksCompleted}/${team.totalTasks} tasks`;
  }

  // Check if team has any tasks
  hasNoTasks(team: TeamData): boolean {
    return !team.isLoading && team.totalTasks === 0 && !team.error;
  }

  // Check if team has error
  hasError(team: TeamData): boolean {
    return !!team.error;
  }

  // Convert color to light version
  getLightColor(color: string): string {
    // Convert hex to RGB
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    // Add white to make it lighter
    const lightR = Math.min(255, r + 200);
    const lightG = Math.min(255, g + 200);
    const lightB = Math.min(255, b + 200);
    
    // Convert back to hex
    return `#${lightR.toString(16).padStart(2, '0')}${lightG.toString(16).padStart(2, '0')}${lightB.toString(16).padStart(2, '0')}`;
  }
}
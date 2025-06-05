import { Component, OnInit } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import { TaskService } from '../../../services/task.service';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { EmployeeService } from '../../../services/employee-service';
import { ActivatedRoute, Router } from '@angular/router';

// Register all Chart.js components
Chart.register(...registerables);

interface TeamData {
  id: number;
  name: string;
  progress: number;
  tasksCompleted: number;
  totalTasks: number;
  members: number;
  color: string;
  departmentId: string;
}

interface PriorityStats {
  high: number;
  medium: number;
  low: number;
}

@Component({
  selector: 'app-task-overview',
  templateUrl: './team-overview.component.html',
  styleUrls: ['./team-overview.component.css'],
  standalone: true,
  imports: [CommonModule, CardModule]
})
export class TeamOverviewComponent implements OnInit {

  constructor(
    private http: HttpClient, 
    private taskService: TaskService, 
    private employeeService: EmployeeService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  // Priority data for donut chart - will be updated with real data
  priorityData = [
    { name: 'High', value: 0, color: '#EF4444' },
    { name: 'Medium', value: 0, color: '#F59E0B' },
    { name: 'Low', value: 0, color: '#10B981' }
  ];

  // Priority statistics for the new cards
  priorityStats: PriorityStats = {
    high: 0,
    medium: 0,
    low: 0
  };
  
  teams: TeamData[] = [
    { id: 1, name: 'Development Team', progress: 0, tasksCompleted: 0, totalTasks: 0, members: 0, color: '#4CAF50', departmentId: '002' },
    { id: 2, name: 'Marketing Team', progress: 0, tasksCompleted: 0, totalTasks: 0, members: 0, color: '#2196F3', departmentId: '003' },
    { id: 3, name: 'Sales Team', progress: 0, tasksCompleted: 0, totalTasks: 0, members: 0, color: '#9C27B0', departmentId: '004' },
    { id: 4, name: 'Operation Team', progress: 0, tasksCompleted: 0, totalTasks: 0, members: 0, color: '#FF5722', departmentId: '005' },
    { id: 5, name: 'Design Team', progress: 0, tasksCompleted: 0, totalTasks: 0, members: 0, color: '#FFC107', departmentId: '006' },
    { id: 6, name: 'HR Team', progress: 0, tasksCompleted: 0, totalTasks: 0, members: 0, color: '#607D8B', departmentId: '007' }
  ];
  
  // Team data for member list
  teamData = [
    { 
      name: 'Alice', 
      tasks: 8, 
      color: '#3B82F6',
      tasksByPriority: { high: 3, medium: 3, low: 2 }
    },
    { 
      name: 'Bob', 
      tasks: 6, 
      color: '#8B5CF6',
      tasksByPriority: { high: 2, medium: 3, low: 1 }
    },
    { 
      name: 'Charlie', 
      tasks: 10, 
      color: '#10B981',
      tasksByPriority: { high: 4, medium: 4, low: 2 }
    },
    { 
      name: 'Diana', 
      tasks: 7, 
      color: '#F59E0B',
      tasksByPriority: { high: 2, medium: 3, low: 2 }
    },
    { 
      name: 'Eve', 
      tasks: 5, 
      color: '#EF4444',
      tasksByPriority: { high: 2, medium: 2, low: 1 }
    }
  ];

  // Task statistics - will be populated with real data
  taskStats = {
    total: 0,
    completed: 0,
    inProgress: 0,
    notStarted: 0,
    overdue: 0
  };

  // Selected team data for display
  selectedTeam: TeamData = this.teams[0]; // Default to first team

  // Team contact information
  teamLeader = {
    name: 'John Smith',
    title: 'Team Leader',
    email: 'john@example.com',
    phone: '(555) 123-4567'
  };

  // Progress circle properties
  completionPercentage = 0;
  radius = 85;
  circumference = 2 * Math.PI * this.radius;
  strokeDashoffset = 0;

  completedCount: number = 0;
  pendingCount: number = 0;
  memberCount: number = 0;

  // Array to collect all task counts for all teams
  allTeamTaskCounts: number[] = [];

  // Chart instance to update later
  priorityChart: Chart | null = null;

  // Store current department ID from URL
  currentDepartmentId: string = '';

  ngOnInit(): void {
    // Start with zero progress and animate to actual value
    this.strokeDashoffset = this.circumference;
    
    // Get query parameters
    this.route.queryParams.subscribe(params => {
      if (params['departmentId']) {
        this.currentDepartmentId = params['departmentId'];
        
        // Update selected team data
        this.selectedTeam = {
          id: 0,
          name: params['title'] || '',
          progress: 0,
          tasksCompleted: Number(params['completedTasks']) || 0,
          totalTasks: Number(params['totalTasks']) || 0,
          members: 0,
          color: params['color'] || '#4CAF50',
          departmentId: params['departmentId']
        };

        // Load real priority data from API
        this.loadPriorityStats();

        // Update task stats
        this.taskStats = {
          total: Number(params['totalTasks']) || 0,
          completed: Number(params['completedTasks']) || 0,
          inProgress: 0,
          notStarted: Number(params['pendingTasks']) || 0,
          overdue: 0
        };

        // Update completion percentage
        this.completionPercentage = this.selectedTeam.totalTasks > 0 
          ? Math.round((this.selectedTeam.tasksCompleted / this.selectedTeam.totalTasks) * 100) 
          : 0;

        // Update counts
        this.completedCount = this.selectedTeam.tasksCompleted;
        this.pendingCount = this.selectedTeam.totalTasks - this.selectedTeam.tasksCompleted;

        // Initialize charts
        setTimeout(() => {
          this.initPriorityChart();
          this.animateProgressRing();
        }, 100);
      }
    });

    // Load team member count
    this.loadTeamMemberCount();
  }

  private loadTeamMemberCount(): void {
    if (this.selectedTeam?.departmentId) {
      this.employeeService.getMemberCountByDepartment(this.selectedTeam.departmentId)
        .subscribe(count => {
          this.memberCount = count;
          this.selectedTeam.members = count;
        });
    }
  }

  loadTeamData(): void {
    // Create an array of observables for all team task counts
    const teamTaskObservables = this.teams.map(team => 
      this.taskService.getCountByTeam(team.departmentId)
    );
    
    // Create an array of observables for all team member counts
    const teamMemberObservables = this.teams.map(team => 
      this.employeeService.getMemberCountByDepartment(team.departmentId)
    );
    
    // Execute all task count observables in parallel
    forkJoin(teamTaskObservables).subscribe(taskCounts => {
      // Update each team with its total tasks
      taskCounts.forEach((totalTasks, index) => {
        this.teams[index].totalTasks = totalTasks;
        this.allTeamTaskCounts.push(totalTasks);
      });
      
      // Calculate the total tasks across all teams
      const totalAllTeamTasks = this.allTeamTaskCounts.reduce((sum, count) => sum + count, 0);
      
      // Update taskStats.total with the sum of all team tasks
      this.taskStats.total = totalAllTeamTasks;
      
      // Now get completed tasks for each team
      this.teams.forEach((team, index) => {
        // This is a temporary approach to simulate different completion rates for each team
        const completionRates: Record<string, number> = {
          '002': 0.75, // Development team: 75% completion
          '003': 0.62, // Marketing team: 62% completion
          '004': 0.45, // Sales team: 45% completion
          '005': 0.58, // Operation team: 58% completion
          '006': 0.70, // Design team: 70% completion
          '007': 0.55  // HR team: 55% completion
        };
        
        // Calculate completed tasks based on total tasks and completion rate
        const completionRate = completionRates[team.departmentId] || 0.5; // Default to 50% if not found
        team.tasksCompleted = Math.round(team.totalTasks * completionRate);
        
        // Calculate progress percentage
        team.progress = team.totalTasks > 0 ? Math.round((team.tasksCompleted / team.totalTasks) * 100) : 0;
      });
      
      // Calculate total completed tasks
      const totalCompletedTasks = this.teams.reduce((sum, team) => sum + team.tasksCompleted, 0);
      this.taskStats.completed = totalCompletedTasks;
      this.completedCount = totalCompletedTasks;
      
      // Calculate completion percentage
      if (totalAllTeamTasks > 0) {
        this.completionPercentage = Math.round((totalCompletedTasks / totalAllTeamTasks) * 100);
      }
      
      // Initialize charts after data is loaded
      setTimeout(() => {
        this.initPriorityChart();
        
        // Animate progress ring
        setTimeout(() => {
          this.animateProgressRing();
        }, 300);
      }, 100);
    });
    
    // Execute all member count observables in parallel
    forkJoin(teamMemberObservables).subscribe(memberCounts => {
      // Update each team with its member count
      memberCounts.forEach((count, index) => {
        this.teams[index].members = count;
      });
      
      // Calculate total member count
      this.memberCount = memberCounts.reduce((sum, count) => sum + count, 0);
    });
  }
  
  loadTaskData(): void {
    // Get counts for different task statuses for the full stats display
    forkJoin({
      inProgress: this.taskService.getTaskCountByStatus('IN_PROGRESS'),
      notStarted: this.taskService.getTaskCountByStatus('PENDING')
    }).subscribe(results => {
      // Update task statistics
      this.taskStats.inProgress = results.inProgress;
      this.taskStats.notStarted = results.notStarted;
      this.pendingCount = results.notStarted;
    });
  }

  private loadPriorityStats(): void {
    if (!this.currentDepartmentId) return;

    // Get counts for each priority level
    forkJoin({
      high: this.taskService.getTaskCountByTeamAndPriority(this.currentDepartmentId, 'HIGH'),
      medium: this.taskService.getTaskCountByTeamAndPriority(this.currentDepartmentId, 'MEDIUM'),
      low: this.taskService.getTaskCountByTeamAndPriority(this.currentDepartmentId, 'LOW')
    }).subscribe({
      next: (counts) => {
        console.log('Priority counts:', counts);
        
        // Update priority stats
      this.priorityStats = {
          high: counts.high,
          medium: counts.medium,
          low: counts.low
      };

        // Update priority data for chart
        this.priorityData = [
          { name: 'High', value: counts.high, color: '#EF4444' },
          { name: 'Medium', value: counts.medium, color: '#F59E0B' },
          { name: 'Low', value: counts.low, color: '#10B981' }
        ];

        // Initialize or update the chart
        if (this.priorityChart) {
          this.updatePriorityChart();
      } else {
          this.initPriorityChart();
        }
      },
      error: (error) => {
        console.error('Error loading priority stats:', error);
      }
    });
  }

  private initPriorityChart(): void {
    const ctx = document.getElementById('priorityChart') as HTMLCanvasElement;
    if (!ctx) return;

    // Destroy existing chart if it exists
      if (this.priorityChart) {
      this.priorityChart.destroy();
    }

    this.priorityChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: this.priorityData.map(item => item.name),
        datasets: [{
          data: this.priorityData.map(item => item.value),
          backgroundColor: this.priorityData.map(item => item.color),
          borderWidth: 0,
          hoverOffset: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: 20,
              usePointStyle: true,
              pointStyle: 'circle'
            }
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const label = context.label || '';
                const value = context.raw as number;
                const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
                return `${label}: ${value} (${percentage}%)`;
              }
            }
          }
        }
      }
    });
  }

  private updatePriorityChart(): void {
    if (!this.priorityChart) return;

    this.priorityChart.data.labels = this.priorityData.map(item => item.name);
    this.priorityChart.data.datasets[0].data = this.priorityData.map(item => item.value);
    this.priorityChart.data.datasets[0].backgroundColor = this.priorityData.map(item => item.color);
    this.priorityChart.update();
  }

  // Handle priority card clicks
  onPriorityCardClick(priority: 'HIGH' | 'MEDIUM' | 'LOW'): void {
    if (!this.currentDepartmentId) return;

    // Navigate to task list with filters
    this.router.navigate(['/admin/task-list'], {
      queryParams: {
        departmentId: this.currentDepartmentId,
        priority: priority,
        teamName: this.selectedTeam.name
      }
    });
  }
  
  // Animate the progress ring
  animateProgressRing(): void {
    // Animate from 0 to the actual completion percentage
    let currentPercentage = 0;
    const targetPercentage = this.completionPercentage;
    const duration = 1500; // 1.5 seconds
    const intervalTime = 20; // Update every 20ms for smooth animation
    const steps = duration / intervalTime;
    const increment = targetPercentage / steps;
    
    const progressElement = document.querySelector('.progress-percentage') as HTMLElement;
    
    const interval = setInterval(() => {
      currentPercentage += increment;
      
      if (currentPercentage >= targetPercentage) {
        currentPercentage = targetPercentage;
        clearInterval(interval);
      }
      
      // Update the offset for the progress ring
      this.strokeDashoffset = this.circumference - (currentPercentage / 100) * this.circumference;
      
      // Update the percentage text
      if (progressElement) {
        progressElement.textContent = `${Math.round(currentPercentage)}%`;
      }
    }, intervalTime);
  }

  // Method to navigate to task list
  navigateToTaskList(): void {
    this.router.navigate(['/admin/task-list'], {
      queryParams: {
        departmentId: this.currentDepartmentId,
        teamName: this.selectedTeam.name
      }
    });
  }
}
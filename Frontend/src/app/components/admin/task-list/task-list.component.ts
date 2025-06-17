import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TagModule } from 'primeng/tag';
import { TableModule } from 'primeng/table';
import { DropdownModule } from 'primeng/dropdown';
import { TaskService, Task } from '../../../services/task.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-task-list',
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, TagModule, TableModule, DropdownModule]
})
export class TaskListComponent implements OnInit {
  
  tasks: Task[] = [];
  filteredTasks: Task[] = [];
  currentDepartmentId: string = '';
  currentPriority: string = '';

  // Filter options
  statusOptions = [
    { label: 'All Statuses', value: null },
    { label: 'TODO', value: 'TODO' },
    { label: 'IN_PROGRESS', value: 'IN_PROGRESS' },
    { label: 'COMPLETED', value: 'COMPLETED' },
    { label: 'PENDING', value: 'PENDING' }
  ];

  teamOptions = [
    { label: 'All Teams', value: null },
    { label: 'Development', value: 'Development' },
    { label: 'Marketing', value: 'Marketing' },
    { label: 'Sales', value: 'Sales' },
    { label: 'Operation', value: 'Operation' },
    { label: 'Design', value: 'Design' },
    { label: 'HR', value: 'HR' }
  ];

  priorityOptions = [
    { label: 'All Priorities', value: null },
    { label: 'HIGH', value: 'HIGH' },
    { label: 'MEDIUM', value: 'MEDIUM' },
    { label: 'LOW', value: 'LOW' }
  ];

  // Selected filter values
  selectedStatus: string | null = null;
  selectedTeam: string | null = null;
  selectedPriority: string | null = null;

  constructor(
    private taskService: TaskService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    // Get query parameters
    this.route.queryParams.subscribe(params => {
      if (params['departmentId']) {
        this.currentDepartmentId = params['departmentId'];
        this.selectedTeam = params['teamName'] || null;
        
        if (params['priority']) {
          this.currentPriority = params['priority'];
          this.selectedPriority = params['priority'];
          this.loadTasksByPriority();
        } else {
          this.loadTasks();
        }
      } else {
        this.loadTasks();
      }
    });
  }

  loadTasksByPriority() {
    if (this.currentDepartmentId && this.currentPriority) {
      this.taskService.getTasksByTeamAndPriority(
        this.currentDepartmentId,
        this.currentPriority as 'HIGH' | 'MEDIUM' | 'LOW'
      ).subscribe({
        next: (tasks) => {
          this.tasks = tasks;
          this.filteredTasks = [...tasks];
        },
        error: (error) => {
          console.error('Error loading tasks by priority:', error);
        }
      });
    }
  }

  loadTasks() {
    this.taskService.getTasks().subscribe({
      next: (tasks) => {
        this.tasks = tasks;
        this.filteredTasks = [...tasks];
      },
      error: (error) => {
        console.error('Error loading tasks:', error);
      }
    });
  }

  applyFilters() {
    this.filteredTasks = this.tasks.filter(task => {
      return (!this.selectedStatus || task.status === this.selectedStatus) &&
             (!this.selectedTeam || task.category === this.selectedTeam) &&
             (!this.selectedPriority || task.priority === this.selectedPriority);
    });
  }

  onStatusChange() {
    this.applyFilters();
  }

  onTeamChange() {
    this.applyFilters();
  }

  onPriorityChange() {
    this.applyFilters();
  }

  getStatusSeverity(status: string): string {
    switch (status) {
      case 'COMPLETED':
        return 'status-completed';
      case 'IN_PROGRESS':
        return 'status-in-progress';
      case 'TODO':
      case 'PENDING':
        return 'status-todo';
      default:
        return 'status-default';
    }
  }

  getPrioritySeverity(priority: string): string {
    switch (priority) {
      case 'HIGH':
        return 'priority-high';
      case 'MEDIUM':
        return 'priority-medium';
      case 'LOW':
        return 'priority-low';
      default:
        return 'priority-default';
    }
  }

  getTeamColor(team: string): string {
    return '#3b82f6';
  }
}
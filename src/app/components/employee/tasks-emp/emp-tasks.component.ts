import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { FormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { Router } from '@angular/router';
import { EmployeeService, Task } from '../../../services/employee-service';

// Extended Task interface to include template properties
interface ExtendedTask extends Task {
  category?: string;
  deadline?: string;
}

// Column configuration interface
export interface TaskColumnConfig {
  title?: boolean;
  description?: boolean;
  priority?: boolean;
  status?: boolean;
  category?: boolean;
  dueDate?: boolean;
  actions?: boolean;
}

type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'COMPLETED';
type TaskPriority = 'HIGH' | 'MEDIUM' | 'LOW';

@Component({
  selector: 'app-employee-tasks',
  templateUrl: './emp-tasks.component.html',
  styleUrls: ['./emp-tasks.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    TableModule,
    ButtonModule,
    TagModule,
    FormsModule,
    DropdownModule
  ]
})
export class EmployeeTasksListComponent implements OnInit {
  @Input() visibleColumns: TaskColumnConfig = {
    title: true,
    description: true,
    priority: true,
    status: true,
    category: false, // Removed category from default visible columns
    dueDate: true,
    actions: true
  };
  @Input() showCreateButton: boolean = true;
  @Input() maxRows: number = 10;
  @Input() compact: boolean = false;

  tasks: ExtendedTask[] = [];
  allTasks: ExtendedTask[] = []; // Store all tasks for filtering
  loading = false;
  
  statusOptions = [
    { label: 'Todo', value: 'TODO' as TaskStatus },
    { label: 'In Progress', value: 'IN_PROGRESS' as TaskStatus },
    { label: 'Completed', value: 'COMPLETED' as TaskStatus }
  ];

  constructor(
    private router: Router,
    private employeeService: EmployeeService
  ) { }

  ngOnInit() {
    this.loadTasks();
  }

  loadTasks() {
    this.loading = true;
    console.log('Loading tasks for logged-in user...');
    
    this.employeeService.getTasksByUser().subscribe({
      next: (tasks) => {
        console.log('Tasks loaded successfully:', tasks);
        const processedTasks = tasks.map(task => ({
          ...task,
          category: (task as any).category || 'General',
          deadline: task.dueDate
        }));
        this.tasks = processedTasks;
        this.allTasks = [...processedTasks]; // Store all tasks for filtering
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading tasks:', error);
        this.loading = false;
      }
    });
  }

  loadTasksByStatus(status: TaskStatus) {
    this.loading = true;
    this.employeeService.getTasksByUserAndStatus(status).subscribe({
      next: (tasks) => {
        console.log(`${status} tasks loaded:`, tasks);
        this.tasks = tasks.map(task => ({
          ...task,
          category: (task as any).category || 'General',
          deadline: task.dueDate
        }));
        this.loading = false;
      },
      error: (error) => {
        console.error(`Error loading ${status} tasks:`, error);
        this.loading = false;
      }
    });
  }

  filterTasksByPriority(priority: TaskPriority) {
    console.log(`Filtering tasks by priority: ${priority}`);
    this.loading = true;
    
    // Filter from all tasks stored locally
    setTimeout(() => {
      this.tasks = this.allTasks.filter(task => 
        task.priority?.toUpperCase() === priority
      );
      this.loading = false;
    }, 300); // Small delay to show loading state
  }

  getPrioritySeverity(priority: string): string {
    switch (priority.toUpperCase()) {
      case 'HIGH':
        return 'danger';
      case 'MEDIUM':
        return 'warn';
      case 'LOW':
        return 'success';
      default:
        return 'info';
    }
  }

  getStatusSeverity(status: string): string {
    switch (status) {
      case 'COMPLETED':
        return 'success';
      case 'IN_PROGRESS':
        return 'warn';
      case 'TODO':
        return 'info';
      default:
        return 'info';
    }
  }

  updateTaskStatus(task: ExtendedTask, newStatus: TaskStatus) {
    console.log(`Updating task ${task.id} status to ${newStatus}`);
    
    const updateData = {
      ...task,
      status: newStatus
    };
    
    this.employeeService.updateTask(task.id, updateData).subscribe({
      next: (response) => {
        console.log('Task updated successfully:', response);
        // Update the task in the local array
        const index = this.tasks.findIndex(t => t.id === task.id);
        if (index !== -1) {
          this.tasks[index] = { ...task, status: newStatus };
        }
        // Update in allTasks array as well
        const allIndex = this.allTasks.findIndex(t => t.id === task.id);
        if (allIndex !== -1) {
          this.allTasks[allIndex] = { ...task, status: newStatus };
        }
        // Reload tasks to ensure data consistency
        this.loadTasks();
      },
      error: (error) => {
        console.error('Error updating task:', error);
        // Revert the status in the UI if update fails
        task.status = task.status;
      }
    });
  }

  createNewTask() {
    if (this.showCreateButton) {
      this.router.navigate(['/admin/task-creation-form']);
    }
  }

  getDisplayTasks(): ExtendedTask[] {
    if (this.maxRows > 0) {
      return this.tasks.slice(0, this.maxRows);
    }
    return this.tasks;
  }

  getVisibleColumnCount(): number {
    return Object.values(this.visibleColumns).filter(visible => visible).length;
  }



  showAllTasks() {
    this.loadTasks();
  }
}
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { Router } from '@angular/router';
import { TaskService, Task } from '../../../services/task.service';

type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';

@Component({
  selector: 'app-employee-tasks',
  templateUrl: './employee-tasks.component.html',
  styleUrls: ['./employee-tasks.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    TableModule,
    ButtonModule,
    TagModule,
    DialogModule,
    FormsModule,
    InputTextModule,
    CalendarModule,
    DropdownModule
  ]
})
export class EmployeeTasksComponent implements OnInit {
  tasks: Task[] = [];
  showTaskDialog = false;
  selectedTask: Task | null = null;
  statusOptions = [
    { label: 'Pending', value: 'PENDING' as TaskStatus },
    { label: 'In Progress', value: 'IN_PROGRESS' as TaskStatus },
    { label: 'Completed', value: 'COMPLETED' as TaskStatus }
  ];

  constructor(
    private router: Router,
    private taskService: TaskService
  ) { }

  ngOnInit() {
    this.loadTasks();
  }

  loadTasks() {
    this.taskService.getTasks().subscribe({
      next: (tasks) => {
        this.tasks = tasks;
      },
      error: (error) => {
        console.error('Error loading tasks:', error);
      }
    });
  }

  getPrioritySeverity(priority: string): string {
    switch (priority) {
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
      case 'PENDING':
        return 'info';
      default:
        return 'info';
    }
  }

  updateTaskStatus(task: Task, newStatus: TaskStatus) {
    const updatedTask: Task = { ...task, status: newStatus };
    this.taskService.updateTask(task.id!, updatedTask).subscribe({
      next: () => {
        task.status = newStatus;
      },
      error: (error) => {
        console.error('Error updating task status:', error);
      }
    });
  }

  viewTaskDetails(task: Task) {
    this.selectedTask = task;
    this.showTaskDialog = true;
  }

  createNewTask() {
    this.router.navigate(['/admin/task-creation-form']);
  }
} 
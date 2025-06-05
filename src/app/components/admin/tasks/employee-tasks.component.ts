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

interface Task {
  id: number;
  title: string;
  description: string;
  dueDate: Date;
  priority: 'High' | 'Medium' | 'Low';
  status: 'Pending' | 'In Progress' | 'Completed';
  assignedBy: string;
}

type Severity = 'success' | 'secondary' | 'info' | 'warn' | 'danger' | 'contrast';

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
    { label: 'Pending', value: 'Pending' },
    { label: 'In Progress', value: 'In Progress' },
    { label: 'Completed', value: 'Completed' }
  ];

  constructor(private router: Router) { }

  ngOnInit() {
    // Sample tasks data
    this.tasks = [
      {
        id: 1,
        title: 'Complete Project Documentation',
        description: 'Write comprehensive documentation for the new feature',
        dueDate: new Date('2024-03-25'),
        priority: 'High',
        status: 'In Progress',
        assignedBy: 'John Manager'
      },
      {
        id: 2,
        title: 'Code Review',
        description: 'Review pull requests from team members',
        dueDate: new Date('2024-03-26'),
        priority: 'Medium',
        status: 'Pending',
        assignedBy: 'Sarah Lead'
      },
      {
        id: 3,
        title: 'Team Meeting',
        description: 'Weekly team sync-up meeting',
        dueDate: new Date('2024-03-27'),
        priority: 'Low',
        status: 'Pending',
        assignedBy: 'Mike Director'
      }
    ];
  }

  getPrioritySeverity(priority: string): Severity {
    switch (priority) {
      case 'High':
        return 'danger';
      case 'Medium':
        return 'warn';
      case 'Low':
        return 'success';
      default:
        return 'info';
    }
  }

  getStatusSeverity(status: string): Severity {
    switch (status) {
      case 'Completed':
        return 'success';
      case 'In Progress':
        return 'warn';
      case 'Pending':
        return 'info';
      default:
        return 'info';
    }
  }

  updateTaskStatus(task: Task, newStatus: string) {
    task.status = newStatus as 'Pending' | 'In Progress' | 'Completed';
  }

  viewTaskDetails(task: Task) {
    this.selectedTask = task;
    this.showTaskDialog = true;
  }

  createNewTask() {
    this.router.navigate(['/employee/create-task']);
  }
} 
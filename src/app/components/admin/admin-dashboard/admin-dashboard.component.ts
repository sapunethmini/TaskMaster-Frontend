import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskService } from '../../../services/task-service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  totalTasks: number = 0;
  pendingTasks: number = 0;
  inProgressTasks: number = 0;
  completedTasks: number = 0;
  loading: boolean = true;
  error: string | null = null;

  constructor(private taskService: TaskService) {}

  ngOnInit(): void {
    this.loadTaskCounts();
  }

  loadTaskCounts(): void {
    this.loading = true;
    this.error = null;

    // Get total tasks count
    this.taskService.getTotalTaskCount().subscribe({
      next: (count) => {
        this.totalTasks = count;
      },
      error: (err) => {
        this.error = 'Failed to load total tasks count';
        console.error('Error loading total tasks:', err);
        this.loading = false;
      }
    });

    // Map the backend status to frontend status (with proper type)
    const statusMapping: Record<string, string> = {
      'TODO': 'PENDING',
      'IN_PROGRESS': 'IN_PROGRESS',
      'DONE': 'COMPLETED'
    };

    // Get counts by status with backend terminology
    const backendStatuses = ['TODO', 'IN_PROGRESS', 'DONE'];
    let completedRequests = 0;

    backendStatuses.forEach(backendStatus => {
      this.taskService.getTaskCountByStatus(backendStatus).subscribe({
        next: (count) => {
          switch(backendStatus) {
            case 'TODO':
              this.pendingTasks = count;
              break;
            case 'IN_PROGRESS':
              this.inProgressTasks = count;
              break;
            case 'DONE':
              this.completedTasks = count;
              break;
          }
          
          completedRequests++;
          if (completedRequests === backendStatuses.length) {
            this.loading = false;
          }
        },
        error: (err) => {
          // Use a safer approach to get the corresponding frontend status
          let frontendStatus = backendStatus.toLowerCase();
          if (backendStatus in statusMapping) {
            frontendStatus = statusMapping[backendStatus].toLowerCase();
          }
          this.error = `Failed to load ${frontendStatus} tasks count`;
          console.error(`Error loading ${backendStatus} tasks:`, err);
          this.loading = false;
        }
      });
    });
  }
}
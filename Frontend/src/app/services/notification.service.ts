
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

// Interfaces
export interface NotificationRequest {
  userId: number;
  email: string;
  title: string;
  message: string;
  type?: string;
  taskId?: number;
}

export interface Notification {
  id: number;
  userId: number;
  email: string;
  title: string;
  message: string;
  type: NotificationType;
  status: NotificationStatus;
  taskId?: number;
  createdAt: string;
  sentAt?: string;
  read: boolean;
}

export enum NotificationType {
  EMAIL = 'EMAIL',
  IN_APP = 'IN_APP'
}

export enum NotificationStatus {
  PENDING = 'PENDING',
  SENT = 'SENT',
  FAILED = 'FAILED',
  NOT_APPLICABLE = 'NOT_APPLICABLE'
}

export interface ApiError {
  message: string;
  status: number;
  timestamp: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private readonly baseUrl = `${environment.NotificationServiceUrl}/api/v1/notifications`;





  constructor(private http: HttpClient) {}

  /**
   * Create a new notification
   * @param request - Notification request data
   * @returns Observable<Notification>
   */
  createNotification(request: NotificationRequest): Observable<Notification> {
    return this.http.post<Notification>(this.baseUrl, request)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Get all notifications for a specific user
   * @param userId - User ID
   * @returns Observable<Notification[]>
   */
  getUserNotifications(userId: number): Observable<Notification[]> {
    return this.http.get<Notification[]>(`${this.baseUrl}/user/${userId}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Get pending notifications for a specific user
   * @param userId - User ID
   * @returns Observable<Notification[]>
   */
  getPendingNotifications(userId: number): Observable<Notification[]> {
    return this.http.get<Notification[]>(`${this.baseUrl}/user/${userId}/pending`)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Get unread notification count for a specific user
   * @param userId - User ID
   * @returns Observable<number>
   */
  getUnreadNotificationCount(userId: number): Observable<number> {
    return this.http.get<number>(`${this.baseUrl}/user/${userId}/count`)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Mark a notification as read
   * @param notificationId - Notification ID
   * @returns Observable<Notification>
   */
  markAsRead(notificationId: number): Observable<Notification> {
    return this.http.put<Notification>(`${this.baseUrl}/${notificationId}/read`, {})
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Mark multiple notifications as read
   * @param notificationIds - Array of notification IDs
   * @returns Observable<Notification[]>
   */
  markMultipleAsRead(notificationIds: number[]): Observable<Notification[]> {
    const requests = notificationIds.map(id => this.markAsRead(id));
    return new Observable(observer => {
      Promise.all(requests.map(req => req.toPromise()))
        .then(results => {
          observer.next(results as Notification[]);
          observer.complete();
        })
        .catch(error => observer.error(error));
    });
  }

  /**
   * Get unread notifications for a specific user
   * @param userId - User ID
   * @returns Observable<Notification[]>
   */
  getUnreadNotifications(userId: number): Observable<Notification[]> {
    return this.getUserNotifications(userId)
      .pipe(
        map(notifications => notifications.filter(n => !n.read)),
        catchError(this.handleError)
      );
  }

  /**
   * Get notifications by type for a specific user
   * @param userId - User ID
   * @param type - Notification type
   * @returns Observable<Notification[]>
   */
  getNotificationsByType(userId: number, type: NotificationType): Observable<Notification[]> {
    return this.getUserNotifications(userId)
      .pipe(
        map(notifications => notifications.filter(n => n.type === type)),
        catchError(this.handleError)
      );
  }

  /**
   * Get notifications by status for a specific user
   * @param userId - User ID
   * @param status - Notification status
   * @returns Observable<Notification[]>
   */
  getNotificationsByStatus(userId: number, status: NotificationStatus): Observable<Notification[]> {
    return this.getUserNotifications(userId)
      .pipe(
        map(notifications => notifications.filter(n => n.status === status)),
        catchError(this.handleError)
      );
  }

  /**
   * Health check for the notification service
   * @returns Observable<string>
   */
  healthCheck(): Observable<string> {
    return this.http.get<string>(`${this.baseUrl}/health`)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Create a simple notification with minimal data
   * @param userId - User ID
   * @param email - User email
   * @param title - Notification title
   * @param message - Notification message
   * @param taskId - Optional task ID
   * @returns Observable<Notification>
   */
  createSimpleNotification(
    userId: number, 
    email: string, 
    title: string, 
    message: string, 
    taskId?: number
  ): Observable<Notification> {
    const request: NotificationRequest = {
      userId,
      email,
      title,
      message,
      type: 'EMAIL',
      ...(taskId && { taskId })
    };
    return this.createNotification(request);
  }

  /**
   * Poll for new notifications (useful for real-time updates)
   * @param userId - User ID
   * @param intervalMs - Polling interval in milliseconds (default: 30000)
   * @returns Observable<Notification[]>
   */
  pollForNotifications(userId: number, intervalMs: number = 30000): Observable<Notification[]> {
    return new Observable(observer => {
      const interval = setInterval(() => {
        this.getUserNotifications(userId).subscribe({
          next: notifications => observer.next(notifications),
          error: error => observer.error(error)
        });
      }, intervalMs);

      // Initial fetch
      this.getUserNotifications(userId).subscribe({
        next: notifications => observer.next(notifications),
        error: error => observer.error(error)
      });

      // Cleanup function
      return () => clearInterval(interval);
    });
  }

  /**
   * Handle HTTP errors
   * @param error - HTTP error response
   * @returns Observable<never>
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unknown error occurred!';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side or network error
      errorMessage = `Client Error: ${error.error.message}`;
    } else {
      // Backend error
      switch (error.status) {
        case 400:
          errorMessage = 'Bad Request: Invalid request parameters';
          break;
        case 404:
          errorMessage = 'Not Found: Resource not found';
          break;
        case 500:
          errorMessage = 'Internal Server Error: Please try again later';
          break;
        default:
          errorMessage = `Server Error: ${error.status} - ${error.message}`;
      }
    }

    console.error('NotificationService Error:', error);
    return throwError(() => new Error(errorMessage));
  }
}

// Optional: Helper class for notification utilities
export class NotificationUtils {
  /**
   * Format notification timestamp for display
   * @param timestamp - ISO timestamp string
   * @returns Formatted date string
   */
  static formatTimestamp(timestamp: string): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays < 7) return `${diffDays} days ago`;
    
    return date.toLocaleDateString();
  }

  /**
   * Get notification icon based on type
   * @param type - Notification type
   * @returns Icon class name or unicode
   */
  static getNotificationIcon(type: NotificationType): string {
    switch (type) {
      case NotificationType.EMAIL:
        return '✉️';
      case NotificationType.IN_APP:
        return '🔔';
      default:
        return '📝';
    }
  }

  /**
   * Get status color class
   * @param status - Notification status
   * @returns CSS class name for status color
   */
  static getStatusColorClass(status: NotificationStatus): string {
    switch (status) {
      case NotificationStatus.PENDING:
        return 'status-pending';
      case NotificationStatus.SENT:
        return 'status-sent';
      case NotificationStatus.FAILED:
        return 'status-failed';
      case NotificationStatus.NOT_APPLICABLE:
        return 'status-na';
      default:
        return 'status-default';
    }
  }

  /**
   * Check if notification is recent (within last hour)
   * @param timestamp - ISO timestamp string
   * @returns boolean
   */
  static isRecent(timestamp: string): boolean {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = diffMs / 3600000;
    return diffHours < 1;
  }
}
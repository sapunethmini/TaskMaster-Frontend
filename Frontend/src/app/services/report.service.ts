


import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface ReportRequest {
  title: string;
  category: string;
  team?: string;
  departmentId?: string;
  dateRangeStart?: Date;
  dateRangeEnd?: Date;
  reportData?: string; // JSON string
}

export interface ReportResponse {
  id: number;
  title: string;
  category: string;
  team?: string;
  departmentId?: string;
  dateRangeStart?: Date;
  dateRangeEnd?: Date;
  status: string;
  createdAt: Date;
  updatedAt?: Date;
  fileName?: string;
  fileType?: string;
  fileSize?: number;
  downloadUrl?: string;
  reportData?: string; // JSON string
}

export interface TaskReportData {
  departmentInfo: {
    id: string;
    name: string;
    color: string;
  };
  taskStats: {
    total: number;
    completed: number;
    inProgress: number;
    pending: number;
    overdue: number;
  };
  priorityStats: {
    high: number;
    medium: number;
    low: number;
  };
  completionPercentage: number;
  memberCount: number;
  teamMetrics: {
    productivity: number;
    efficiency: number;
    onTimeDelivery: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class ReportService {
//   UserEmployeeUrl: 'http://localhost:8082/emp-controller',
//   reportUrl: 'http://localhost:8084/api/reports',

  private apiUrl =  `${environment.TaskServiceUrl}/api/reports`;
  private apiUrl2 = `${environment.UserSeviceUrl}/emp-controller`;

  constructor(private http: HttpClient) {}

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An error occurred';
    if (error.error instanceof ErrorEvent) {
      errorMessage = error.error.message;
    } else {
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    console.error('API Error:', error);
    return throwError(() => new Error(errorMessage));
  }

  // Basic CRUD operations
  createReport(report: ReportRequest): Observable<ReportResponse> {
    return this.http.post<ReportResponse>(this.apiUrl, report)
      .pipe(catchError(this.handleError));
  }

  getAllReports(): Observable<ReportResponse[]> {
    return this.http.get<ReportResponse[]>(this.apiUrl)
      .pipe(catchError(this.handleError));
  }

  getReportById(id: number): Observable<ReportResponse> {
    return this.http.get<ReportResponse>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  updateReport(id: number, report: ReportRequest): Observable<ReportResponse> {
    return this.http.put<ReportResponse>(`${this.apiUrl}/${id}`, report)
      .pipe(catchError(this.handleError));
  }

  deleteReport(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  // File operations
  createReportWithFile(reportData: any, file: File): Observable<ReportResponse> {
    const formData = new FormData();
    formData.append('title', reportData.title);
    formData.append('category', reportData.category);
    if (reportData.team) formData.append('team', reportData.team);
    if (reportData.departmentId) formData.append('departmentId', reportData.departmentId);
    if (reportData.dateRangeStart) formData.append('dateRangeStart', reportData.dateRangeStart.toISOString());
    if (reportData.dateRangeEnd) formData.append('dateRangeEnd', reportData.dateRangeEnd.toISOString());
    if (reportData.reportData) formData.append('reportData', reportData.reportData);
    formData.append('file', file);

    return this.http.post<ReportResponse>(`${this.apiUrl}/upload`, formData)
      .pipe(catchError(this.handleError));
  }

  attachFileToReport(reportId: number, file: File): Observable<ReportResponse> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<ReportResponse>(`${this.apiUrl}/${reportId}/attach-file`, formData)
      .pipe(catchError(this.handleError));
  }

  downloadReportFile(reportId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${reportId}/download`, { responseType: 'blob' })
      .pipe(catchError(this.handleError));
  }

  // Query operations
  getReportsByCategory(category: string): Observable<ReportResponse[]> {
    return this.http.get<ReportResponse[]>(`${this.apiUrl}/category/${category}`)
      .pipe(catchError(this.handleError));
  }

  getReportsByDepartment(departmentId: string): Observable<ReportResponse[]> {
    return this.http.get<ReportResponse[]>(`${this.apiUrl}/department/${departmentId}`)
      .pipe(catchError(this.handleError));
  }

  getReportsByStatus(status: string): Observable<ReportResponse[]> {
    return this.http.get<ReportResponse[]>(`${this.apiUrl}/status/${status}`)
      .pipe(catchError(this.handleError));
  }

  getReportsByDateRange(startDate: Date, endDate: Date): Observable<ReportResponse[]> {
    const params = new HttpParams()
      .set('startDate', startDate.toISOString())
      .set('endDate', endDate.toISOString());

    return this.http.get<ReportResponse[]>(`${this.apiUrl}/date-range`, { params })
      .pipe(catchError(this.handleError));
  }

  // Search operations
  searchReports(filters: {
    category?: string;
    departmentId?: string;
    status?: string;
    startDate?: Date;
    endDate?: Date;
    page?: number;
    size?: number;
    sortBy?: string;
    sortDir?: string;
  }): Observable<any> {
    let params = new HttpParams();
    
    if (filters.category) params = params.set('category', filters.category);
    if (filters.departmentId) params = params.set('departmentId', filters.departmentId);
    if (filters.status) params = params.set('status', filters.status);
    if (filters.startDate) params = params.set('startDate', filters.startDate.toISOString());
    if (filters.endDate) params = params.set('endDate', filters.endDate.toISOString());
    if (filters.page !== undefined) params = params.set('page', filters.page.toString());
    if (filters.size !== undefined) params = params.set('size', filters.size.toString());
    if (filters.sortBy) params = params.set('sortBy', filters.sortBy);
    if (filters.sortDir) params = params.set('sortDir', filters.sortDir);

    return this.http.get<any>(`${this.apiUrl}/search`, { params })
      .pipe(catchError(this.handleError));
  }

  searchReportsByTitle(title: string): Observable<ReportResponse[]> {
    const params = new HttpParams().set('title', title);
    return this.http.get<ReportResponse[]>(`${this.apiUrl}/search/title`, { params })
      .pipe(catchError(this.handleError));
  }

  // Report generation
  generateTaskReport(departmentId: string, startDate: Date, endDate: Date): Observable<ReportResponse> {
    const params = new HttpParams()
      .set('departmentId', departmentId)
      .set('startDate', startDate.toISOString())
      .set('endDate', endDate.toISOString());

    return this.http.post<ReportResponse>(`${this.apiUrl}/generate/task-report`, null, { params })
      .pipe(catchError(this.handleError));
  }

  generatePerformanceReport(departmentId: string, startDate: Date, endDate: Date): Observable<ReportResponse> {
    let params = new HttpParams()
      .set('startDate', startDate.toISOString())
      .set('endDate', endDate.toISOString());
    
    if (departmentId) {
      params = params.set('departmentId', departmentId);
    }

    return this.http.post<ReportResponse>(`${this.apiUrl}/generate/performance-report`, null, { params })
      .pipe(catchError(this.handleError));
  }

  generateCustomReport(request: ReportRequest, reportData: TaskReportData): Observable<ReportResponse> {
    const params = new HttpParams().set('reportDataJson', JSON.stringify(reportData));
    return this.http.post<ReportResponse>(`${this.apiUrl}/generate/custom`, request, { params })
      .pipe(catchError(this.handleError));
  }

  // Export operations - Updated to match your Angular component
  exportReport(reportId: number, format: 'pdf' | 'excel' | 'csv'): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${reportId}/download/${format}`, { responseType: 'blob' })
      .pipe(catchError(this.handleError));
  }

  // Statistics
  getReportStatistics(): Observable<{ [key: string]: number }> {
    return this.http.get<{ [key: string]: number }>(`${this.apiUrl}/statistics`)
      .pipe(catchError(this.handleError));
  }

  getReportCountByCategory(): Observable<{ [key: string]: number }> {
    return this.http.get<{ [key: string]: number }>(`${this.apiUrl}/statistics/category`)
      .pipe(catchError(this.handleError));
  }

  getReportCountByDepartment(): Observable<{ [key: string]: number }> {
    return this.http.get<{ [key: string]: number }>(`${this.apiUrl}/statistics/department`)
      .pipe(catchError(this.handleError));
  }

  getReportCountByStatus(): Observable<{ [key: string]: number }> {
    return this.http.get<{ [key: string]: number }>(`${this.apiUrl}/statistics/status`)
      .pipe(catchError(this.handleError));
  }

  // Status management
  updateReportStatus(reportId: number, status: string): Observable<ReportResponse> {
    const params = new HttpParams().set('status', status);
    return this.http.patch<ReportResponse>(`${this.apiUrl}/${reportId}/status`, null, { params })
      .pipe(catchError(this.handleError));
  }

  // Utility methods
  checkReportExists(reportId: number): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/${reportId}/exists`)
      .pipe(catchError(this.handleError));
  }

  getLatestReport(departmentId: string, category: string): Observable<ReportResponse> {
    const params = new HttpParams()
      .set('departmentId', departmentId)
      .set('category', category);

    return this.http.get<ReportResponse>(`${this.apiUrl}/latest`, { params })
      .pipe(catchError(this.handleError));
  }

  // Bulk operations
  createMultipleReports(reports: ReportRequest[]): Observable<ReportResponse[]> {
    return this.http.post<ReportResponse[]>(`${this.apiUrl}/bulk-create`, reports)
      .pipe(catchError(this.handleError));
  }

  deleteMultipleReports(reportIds: number[]): Observable<void> {
    return this.http.request<void>('delete', `${this.apiUrl}/bulk-delete`, { body: reportIds })
      .pipe(catchError(this.handleError));
  }

  // Helper method to convert ReportResponse to your existing Report interface
  convertToLegacyFormat(response: ReportResponse): any {
    return {
      id: response.id,
      title: response.title,
      category: response.category,
      team: response.team,
      departmentId: response.departmentId,
      dateRange: {
        start: response.dateRangeStart ? new Date(response.dateRangeStart) : new Date(),
        end: response.dateRangeEnd ? new Date(response.dateRangeEnd) : new Date()
      },
      status: response.status.toLowerCase(),
      createdAt: new Date(response.createdAt),
      downloadUrl: response.downloadUrl,
      reportData: response.reportData ? JSON.parse(response.reportData) : null
    };
  }

  // Method to save generated report with data to database
  saveGeneratedReport(reportData: {
    title: string;
    category: string;
    team?: string;
    departmentId?: string;
    dateRange: { start: Date; end: Date };
    reportData: TaskReportData;
  }): Observable<ReportResponse> {
    const request: ReportRequest = {
      title: reportData.title,
      category: reportData.category,
      team: reportData.team,
      departmentId: reportData.departmentId,
      dateRangeStart: reportData.dateRange.start,
      dateRangeEnd: reportData.dateRange.end,
      reportData: JSON.stringify(reportData.reportData)
    };

    return this.createReport(request);
  }
}
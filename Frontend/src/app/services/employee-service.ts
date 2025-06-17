import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface Employee {
  id?: number;
  firstname: string;
  lastname: string;
  email: string;
  department_Id?: string;
  role_Id?: string;
  departmentId?: string;  // Alternative field name
  roleId?: string;        // Alternative field name
  department?: string; // Optional: department name
  role?: string; // Optional: role name
}

export interface Task {
  id: number;
  title: string;
  description: string;
  status: string; // 'TODO', 'IN_PROGRESS', 'COMPLETED'
  priority: string; // 'LOW', 'MEDIUM', 'HIGH'
  assignedTo: number;
  assigneeEmail?: string;
  assigneeName?: string;
  dueDate: string;
  createdDate: string;
  updatedDate: string;
  progress?: number;
}

export interface Department {
  id: string;
  name: string;
  description?: string;
}

export interface Role {
  id: string;
  name: string;
  description?: string;
}

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  private apiUrl = `${environment.UserSeviceUrl}/emp-controller`;
  private taskApiUrl = `${environment.TaskServiceUrl}/api/tasks`;
  private departmentApiUrl = `${environment.UserSeviceUrl}/emp-controller`;
  private roleApiUrl = `${environment.UserSeviceUrl}/role`;
  
  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }

  private getUserIdFromToken(): string | null {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No token found in localStorage');
      return null;
    }

    try {
      // Split the JWT token
      const tokenParts = token.split('.');
      if (tokenParts.length !== 3) {
        console.error('Invalid token format');
        return null;
      }

      // Decode the payload (second part)
      const payload = JSON.parse(atob(tokenParts[1]));
      console.log('Token payload:', payload);

      // Try different possible user ID fields
      const userId = payload.userId || payload.id || payload.sub || payload.user_id || payload.employeeId;
      
      if (!userId) {
        console.error('User ID not found in token payload. Available fields:', Object.keys(payload));
        return null;
      }

      console.log('Extracted user ID:', userId);
      return userId.toString();
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }

  // NEW: Get current user profile
  // getCurrentUserProfile(): Observable<Employee> {
  //   const userId = this.getUserIdFromToken();
  //   if (!userId) {
  //     return throwError(() => new Error('User ID not found in token'));
  //   }

  //   return this.http.get<Employee>(`${this.apiUrl}/find-by-id/${userId}`, {
  //     headers: this.getAuthHeaders()
  //   }).pipe(
  //     tap(employee => console.log('Current user profile:', employee)),
  //     catchError(this.handleError)
  //   );
  // }

  // NEW: Update employee profile - MATCHES YOUR SAMPLE REQUEST FORMAT
  // updateEmployeeProfile(profileData: {
    
    
  //   id: number;
  //   firstname: string;
  //   lastname: string;
  //   email: string;
  //   departmentId: string;
  //   roleId: string;
  // }): Observable<any> {
  //   const userId = this.getUserIdFromToken();
  //   if (!userId) {
  //     return throwError(() => new Error('User ID not found in token'));
  //   }

  //   const url = `${this.apiUrl}/update-emp/${userId}`;
  //   console.log('🔍 Updating employee profile at URL:', url);
  //   console.log('📝 Request body:', profileData);

  //   return this.http.put<any>(url, profileData, {
  //     headers: this.getAuthHeaders()
  //   }).pipe(
  //     tap(res => console.log(`✅ Employee profile updated successfully:`, res)),
  //     catchError(error => {
  //       console.error(`❌ Error updating employee profile:`, error);
  //       return this.handleError(error);
  //     })
  //   );
  // }

  // Fixed updateEmployee method in your EmployeeService

getEmployeeCountByDepartment(departmentId: string): Observable<number> {
  return this.http.get<number>(`${this.departmentApiUrl}/count-by-department/${departmentId}`, {
    headers: this.getAuthHeaders()
  }).pipe(
    tap(count => console.log(`Department ${departmentId} has ${count} employees`)),
    catchError(this.handleError)
  );
}
// Employee Service methods

getCurrentUserProfile(): Observable<Employee> {
  const userId = this.getUserIdFromToken();
  if (!userId) {
    return throwError(() => new Error('User ID not found in token'));
  }

  return this.http.get<Employee>(`${this.apiUrl}/find-by-id/${userId}`, {
    headers: this.getAuthHeaders()
  }).pipe(
    tap(employee => console.log('Current user profile:', employee)),
    catchError(this.handleError)
  );
}

updateEmployeeByUsingId(userId: number, employeeData: any): Observable<any> {
  const url = `${this.apiUrl}/update-emp/${userId}`;
  
  const headers = new HttpHeaders({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`
  });

  console.log('🔍 Updating employee with URL:', url);
  console.log('🔍 Employee data:', employeeData);

  return this.http.put(url, employeeData, { headers }).pipe(
    tap(response => console.log('✅ Update response:', response)),
    catchError(error => {
      console.error('❌ Update error:', error);
      return throwError(() => error);
    })
  );
}

updateEmployee(employee: Employee): Observable<any> {
  console.log('EmployeeService: Updating employee', employee);
  
  const token = localStorage.getItem('token');
  const headers = new HttpHeaders({
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  });
  
  // Extract the ID from the employee object and add it to URL path
  const employeeId = employee.id;
  
  if (!employeeId) {
    throw new Error('Employee ID is required for update');
  }
  
  // Use the ID in the URL path as your backend expects: /update-emp/{id}
  return this.http.put<any>(`${this.apiUrl}/update-emp/${employeeId}`, employee, { headers })
    .pipe(
      tap(response => console.log('EmployeeService: Employee updated successfully', response)),
      catchError(this.handleError)
    );
}

  // Get all departments
  getDepartments(): Observable<Department[]> {
    return this.http.get<Department[]>(`${this.departmentApiUrl}/get-all`, {
      headers: this.getAuthHeaders()
    }).pipe(
      tap(departments => console.log(`Fetched ${departments.length} departments:`, departments)),
      catchError(error => {
        console.error('Error fetching departments:', error);
        // Return fallback departments if API fails
        return throwError(() => new Error('Failed to load departments'));
      })
    );
  }

  // Get all roles
  getRoles(): Observable<Role[]> {
    return this.http.get<Role[]>(`${this.roleApiUrl}/get-all`, {
      headers: this.getAuthHeaders()
    }).pipe(
      tap(roles => console.log(`Fetched ${roles.length} roles:`, roles)),
      catchError(error => {
        console.error('Error fetching roles:', error);
        // Return fallback roles if API fails
        return throwError(() => new Error('Failed to load roles'));
      })
    );
  }

  // Update employee with specific ID (for profile completion)
  updateEmployeeById(employeeId: number, employee: Partial<Employee>): Observable<any> {
  const userId = this.getUserIdFromToken();

    const url = `${this.apiUrl}/update-emp/${userId}`;
     if (!userId) {
      return throwError(() => new Error('User ID not found in token'));
    }

    console.log('🔍 Starting profile completion for user ID:', userId);
    console.log(`Updating employee ${userId} at URL: ${url}`, employee);

    return this.http.put<any>(url, employee, {
      headers: this.getAuthHeaders()
    }).pipe(
      tap(res => console.log(`Employee ${employeeId} updated successfully:`, res)),
      catchError(error => {
        console.error(`Error updating employee ${employeeId}:`, error);
        return this.handleError(error);
      })
    );
  }

  // LEGACY: Complete user profile - MATCHES YOUR POSTMAN REQUEST EXACTLY
  completeProfile(profileData: { department_Id: string; role_Id: string }): Observable<any> {
    const userId = this.getUserIdFromToken();
    if (!userId) {
      return throwError(() => new Error('User ID not found in token'));
    }

    console.log('🔍 Starting profile completion for user ID:', userId);
    console.log('📝 Profile data to update:', profileData);

    // First get current user data, then update with new profile data
    return new Observable(observer => {
      this.getCurrentUserProfile().subscribe({
        next: (currentEmployee) => {
          console.log('📋 Current employee data:', currentEmployee);
          
          // Prepare the EXACT same format as your Postman request
          const updateRequestBody = {
            id: parseInt(userId), // Ensure ID is a number
            firstname: currentEmployee.firstname,
            lastname: currentEmployee.lastname, 
            email: currentEmployee.email,
            department_Id: profileData.department_Id,
            role_Id: profileData.role_Id
          };

          console.log('📤 Request body (matches your Postman format):', updateRequestBody);
          
          // Use the EXACT endpoint format you tested in Postman
          const updateUrl = `${this.apiUrl}/update-emp/${userId}`;
          console.log('🔗 API URL:', updateUrl);
          
          this.http.put<any>(updateUrl, updateRequestBody, {
            headers: this.getAuthHeaders()
          }).pipe(
            tap(res => {
              console.log(`✅ Profile update API call successful for user ${userId}:`);
              console.log('📊 API Response:', res);
            }),
            catchError(error => {
              console.error(`❌ Profile update API call failed for user ${userId}:`);
              console.error('📊 Error details:', error);
              console.error('📊 Request that failed:', { url: updateUrl, body: updateRequestBody });
              return this.handleError(error);
            })
          ).subscribe({
            next: (result) => {
              console.log('🎉 Profile completion process completed successfully!');
              observer.next(result);
              observer.complete();
            },
            error: (error) => {
              console.error('💥 Profile completion process failed:', error);
              observer.error(error);
            }
          });
        },
        error: (error) => {
          console.error('❌ Failed to get current employee profile:', error);
          observer.error(new Error('Failed to load current profile. Please try again.'));
        }
      });
    });
  }

  // Get all tasks for the logged-in user
  getTasksByUser(): Observable<Task[]> {
    const userId = this.getUserIdFromToken();
    if (!userId) {
      const errorMsg = 'User ID not found in token. Please login again.';
      console.error(errorMsg);
      return throwError(() => new Error(errorMsg));
    }

    const url = `${this.taskApiUrl}/user/${userId}`;
    console.log('Fetching tasks from URL:', url);
    console.log(`User ID from token: ${userId}`);

    return this.http.get<Task[]>(url, {
      headers: this.getAuthHeaders()
    }).pipe(
      tap(tasks => {
        console.log(`Successfully fetched ${tasks.length} tasks for user ${userId}:`, tasks);
        
        // Log task distribution for debugging
        const tasksByStatus = {
          TODO: tasks.filter(t => t.status === 'TODO').length,
          IN_PROGRESS: tasks.filter(t => t.status === 'IN_PROGRESS').length,
          COMPLETED: tasks.filter(t => t.status === 'COMPLETED').length
        };
        console.log('Task distribution:', tasksByStatus);
      }),
      catchError(error => {
        console.error('Error fetching user tasks:', error);
        if (error.status === 401) {
          console.error('Unauthorized access. Token may be expired or invalid.');
        } else if (error.status === 404) {
          console.error('Tasks endpoint not found or user has no tasks.');
        }
        return this.handleError(error);
      })
    );
  }

  // Get tasks by user and status
  getTasksByUserAndStatus(status: string): Observable<Task[]> {
    const userId = this.getUserIdFromToken();
    if (!userId) {
      return throwError(() => new Error('User ID not found in token'));
    }

    const url = `${this.taskApiUrl}/user/${userId}/status/${status}`;
    console.log(`Fetching ${status} tasks from URL:`, url);

    return this.http.get<Task[]>(url, {
      headers: this.getAuthHeaders()
    }).pipe(
      tap(tasks => console.log(`Fetched ${tasks.length} ${status} tasks for user ${userId}`)),
      catchError(this.handleError)
    );
  }

  // Get task count by status
  getTaskCountByStatus(status: string): Observable<number> {
    const userId = this.getUserIdFromToken();
    if (!userId) {
      return throwError(() => new Error('User ID not found in token'));
    }

    return this.http.get<number>(`${this.taskApiUrl}/User/${userId}/status/${status}/count`, {
      headers: this.getAuthHeaders()
    }).pipe(
      tap(count => console.log(`User ${userId} has ${count} ${status} tasks`)),
      catchError(this.handleError)
    );
  }

  // Get all task counts
  getAllTaskCounts(): Observable<{ completed: number; inProgress: number; pending: number }> {
    const completed$ = this.getTaskCountByStatus('COMPLETED');
    const inProgress$ = this.getTaskCountByStatus('IN_PROGRESS');
    const pending$ = this.getTaskCountByStatus('TODO');

    return new Observable(observer => {
      let completed = 0, inProgress = 0, pending = 0;
      let done = 0;

      const check = () => {
        if (++done === 3) {
          observer.next({ completed, inProgress, pending });
          observer.complete();
        }
      };

      completed$.subscribe({ 
        next: c => { completed = c; check(); }, 
        error: e => {
          console.error('Error getting completed count:', e);
          completed = 0;
          check();
        }
      });
      
      inProgress$.subscribe({ 
        next: p => { inProgress = p; check(); }, 
        error: e => {
          console.error('Error getting in progress count:', e);
          inProgress = 0;
          check();
        }
      });
      
      pending$.subscribe({ 
        next: t => { pending = t; check(); }, 
        error: e => {
          console.error('Error getting pending count:', e);
          pending = 0;
          check();
        }
      });
    });
  }

  // Update task status
  updateTaskStatus(taskId: number, status: string): Observable<any> {
    const url = `${this.taskApiUrl}/${taskId}`;
    console.log(`Updating task ${taskId} status to ${status} at URL: ${url}`);
    
    const updateData = {
      status: status
    };

    return this.http.put<any>(url, updateData, {
      headers: this.getAuthHeaders()
    }).pipe(
      tap(res => {
        console.log(`Task ${taskId} status successfully updated to ${status}:`, res);
      }),
      catchError(error => {
        console.error(`Error updating task ${taskId} status:`, error);
        if (error.status === 404) {
          console.error(`Task with ID ${taskId} not found`);
        } else if (error.status === 400) {
          console.error(`Invalid status value: ${status}`);
        }
        return this.handleError(error);
      })
    );
  }

  // Employee CRUD operations
  addEmployee(employee: Employee): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/add-employee`, employee, {
      headers: this.getAuthHeaders()
    }).pipe(
      tap(res => console.log('Employee added:', res)),
      catchError(this.handleError)
    );
  }

  getEmployees(): Observable<Employee[]> {
    return this.http.get<Employee[]>(`${this.apiUrl}/get-all`, {
      headers: this.getAuthHeaders()
    }).pipe(
      tap(employees => console.log(`Fetched ${employees.length} employees`)),
      catchError(this.handleError)
    );
  }

  getEmployeesByDepartment(departmentId: string): Observable<Employee[]> {
    return this.http.get<Employee[]>(`${this.departmentApiUrl}/getAllByDepartment/${departmentId}`, {
      headers: this.getAuthHeaders()
    }).pipe(
      tap(emp => console.log(`Fetched ${emp.length} employees in department ${departmentId}`)),
      catchError(this.handleError)
    );
  }

  getMemberCountByDepartment(departmentId: string): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/count-by-department/${departmentId}`, {
      headers: this.getAuthHeaders()
    }).pipe(
      tap(count => console.log(`Department ${departmentId} has ${count} members`)),
      catchError(this.handleError)
    );
  }

  // deleteEmployee(id: number): Observable<any> {
  //   return this.http.delete<any>(`${this.apiUrl}/delete-emp/${id}`, {
  //     headers: this.getAuthHeaders()
  //   }).pipe(
  //     tap(res => console.log(`Deleted employee ${id}`)),
  //     catchError(this.handleError)
  //   );
  // }

  // In your EmployeeService, update the deleteEmployee method:
deleteEmployee(id: number): Observable<any> {
  return this.http.delete(`${this.apiUrl}/delete-emp/${id}`, {
    headers: this.getAuthHeaders(),
    responseType: 'text' as 'json'  // Tell Angular to expect text response
  }).pipe(
    map(response => ({ success: true, message: response })), // Convert to object
    tap(res => console.log(`Deleted employee ${id}:`, res)),
    catchError(this.handleError)
  );
}

  updateUsingIdEmployee(employee: Employee): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/update-emp`, employee, {
      headers: this.getAuthHeaders()
    }).pipe(
      tap(res => console.log('Employee updated:', res)),
      catchError(this.handleError)
    );
  }

  findEmployeeById(id: number): Observable<Employee> {
    return this.http.get<Employee>(`${this.apiUrl}/find-by-id/${id}`, {
      headers: this.getAuthHeaders()
    }).pipe(
      tap(emp => console.log('Found employee:', emp)),
      catchError(this.handleError)
    );
  }

  findEmployeeByFirstname(firstname: string): Observable<Employee> {
    return this.http.get<Employee>(`${this.apiUrl}/find-by-name/${firstname}`, {
      headers: this.getAuthHeaders()
    }).pipe(
      tap(emp => console.log('Found employee by firstname:', emp)),
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    let message = 'An error occurred';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      message = `Client error: ${error.error.message}`;
    } else {
      // Server-side error
      message = `Server error: ${error.status} - ${error.message}`;
      
      if (error.status === 401) {
        message += '\nUnauthorized access. Please check your authentication token.';
      } else if (error.status === 404) {
        message += '\nResource not found. Please check the API endpoint.';
      } else if (error.status === 403) {
        message += '\nForbidden access. You may not have permission to access this resource.';
      }
      
      if (error.error && typeof error.error === 'string') {
        message += `\nDetails: ${error.error}`;
      } else if (error.error && typeof error.error === 'object') {
        message += `\nDetails: ${JSON.stringify(error.error)}`;
      }
    }
    
    console.error('HTTP Error Details:', {
      status: error.status,
      statusText: error.statusText,
      url: error.url,
      error: error.error,
      message: message
    });
    
    return throwError(() => new Error(message));
  }

  updateTask(taskId: number, taskData: Partial<Task>): Observable<any> {
    return this.http.put<any>(`${this.taskApiUrl}/${taskId}`, taskData, {
      headers: this.getAuthHeaders()
    }).pipe(
      tap(res => console.log(`Task ${taskId} updated successfully:`, res)),
      catchError(this.handleError)
    );
  }


  //   updateEmployeeByUsingId(userId: number, employeeData: any): Observable<any> {
  //   const url = `${this.apiUrl}/update-emp/${userId}`;
    
  //   const headers = new HttpHeaders({
  //     'Content-Type': 'application/json',
  //     // Add authorization header if needed
  //     'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`
  //   });

  //   console.log('🔍 Updating employee with URL:', url);
  //   console.log('🔍 Employee data:', employeeData);

  //   return this.http.put(url, employeeData, { headers });
  // }



  //used for update employee details using emp-updaete file 
  // Add this method to your EmployeeService class

updateEmployeeUsingId(id: number, employeeData: any): Observable<any> {
  const url = `${this.apiUrl}/emp-controller/update-emp/${id}`;
  
  console.log('🔍 Calling update API:', url);
  console.log('🔍 Update payload:', employeeData);
  
  return this.http.put<any>(url, employeeData, {
    headers: {
      'Content-Type': 'application/json'
    }
  }).pipe(
    tap(response => {
      console.log('✅ Update API response:', response);
    }),
    catchError(error => {
      console.error('❌ Update API error:', error);
      return throwError(() => error);
    })
  );
}



updateEmployeebyUsingId(employeeId: number, employeeData: Employee): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    // Ensure the employee data has the correct structure for the backend
    const updatePayload = {
      id: employeeId,
      firstname: employeeData.firstname,
      lastname: employeeData.lastname,
      email: employeeData.email,
      department_Id: employeeData.department_Id,
      role_Id: employeeData.role_Id
    };

    console.log('🔄 Updating employee via API:', `${this.apiUrl}/update-emp/${employeeId}`);
    console.log('📦 Update payload:', updatePayload);

    return this.http.put<any>(`${this.apiUrl}/update-emp/${employeeId}`, updatePayload, { headers });
  }

  // ADDITIONAL METHOD: Add new employee (if needed)
  // addEmployee(employeeData: Employee): Observable<any> {
  //   const headers = new HttpHeaders({
  //     'Content-Type': 'application/json'
  //   });

  //   const addPayload = {
  //     firstname: employeeData.firstname,
  //     lastname: employeeData.lastname,
  //     email: employeeData.email,
  //     department_Id: employeeData.department_Id,
  //     role_Id: employeeData.role_Id
  //   };

  //   return this.http.post<any>(`${this.apiUrl}/add-employee`, addPayload, { headers });
  // }
}

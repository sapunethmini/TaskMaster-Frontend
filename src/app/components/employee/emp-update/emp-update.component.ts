// import { Component, OnInit } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
// import { ActivatedRoute, Router, RouterModule } from '@angular/router';
// import { InputTextModule } from 'primeng/inputtext';
// import { ButtonModule } from 'primeng/button';
// import { SelectButtonModule } from 'primeng/selectbutton';
// import { CardModule } from 'primeng/card';
// import { ToastModule } from 'primeng/toast';
// import { ConfirmDialogModule } from 'primeng/confirmdialog';
// import { MessageService, ConfirmationService } from 'primeng/api';
// import { EmployeeService, Employee, Department, Role } from '../../../services/employee-service';
// import { NotificationService } from '../../../services/notification.service';

// interface TeamOption {
//   id: string;
//   name: string;
// }

// interface RoleOption {
//   name: string;
//   id: string;
// }

// @Component({
//   selector: 'app-emp-update',
//   standalone: true,
//   imports: [
//     CommonModule,
//     FormsModule,
//     ReactiveFormsModule,
//     InputTextModule,
//     ButtonModule,
//     SelectButtonModule,
//     CardModule,
//     ToastModule,
//     ConfirmDialogModule,
//     RouterModule
//   ],
//   providers: [MessageService, ConfirmationService],
//   templateUrl: './emp-update.component.html',
//   styleUrls: ['./emp-update.component.css']
// })
// export class EmpUpdateComponent implements OnInit {
//   employeeForm!: FormGroup;
//   employeeId!: number;
//   isLoading: boolean = false;
//   errorMessage: string = '';
//   currentEmployee?: Employee;
  
//   // Store navigation state to return to correct page
//   private returnToParams: any = {};
  
//   // Use dynamic data from service instead of hardcoded arrays
//   Teams: TeamOption[] = [];
//   roles: RoleOption[] = [];
//   departments: Department[] = [];
//   availableRoles: Role[] = [];
  
//   constructor(
//     private fb: FormBuilder,
//     private route: ActivatedRoute,
//     private router: Router,
//     private messageService: MessageService,
//     private confirmationService: ConfirmationService,
//     private employeeService: EmployeeService,
//     private notificationService: NotificationService
//   ) { }

//   ngOnInit(): void {
//     this.initForm();
//     this.loadDepartmentsAndRoles();
    
//     // Get all query parameters including navigation state
//     this.route.queryParams.subscribe(params => {
//       const id = params['id'];
//       if (id) {
//         this.employeeId = parseInt(id);
//         console.log('🔍 Employee ID from URL:', this.employeeId);
        
//         // Store return navigation parameters
//         this.returnToParams = {
//           departmentId: params['departmentId'],
//           title: params['title'],
//           searchTerm: params['searchTerm'],
//           searchType: params['searchType']
//         };
//         console.log('📝 Stored return parameters:', this.returnToParams);
        
//         this.loadEmployee(this.employeeId);
//       } else {
//         this.messageService.add({ 
//           severity: 'error', 
//           summary: 'Error', 
//           detail: 'No employee ID provided in URL' 
//         });
//         this.navigateBackToList();
//       }
//     });
//   }

//   initForm(employee?: Employee): void {
//     this.employeeForm = this.fb.group({
//       firstname: [employee?.firstname || '', Validators.required],
//       lastname: [employee?.lastname || '', Validators.required],
//       email: [employee?.email || '', [Validators.required, Validators.email]],
//       department_Id: [employee?.department_Id || employee?.departmentId || '', Validators.required],
//       role_Id: [employee?.role_Id || employee?.roleId || '', Validators.required]
//     });
//   }

//   loadDepartmentsAndRoles(): void {
//     // Set updated fallback data with IDs
//     this.Teams = [
//       { id: '001', name: 'Development Team' },
//       { id: '002', name: 'Marketing Team' },
//       { id: '003', name: 'Sales Team' },
//       { id: '004', name: 'Operation Team' },
//       { id: '005', name: 'Design Team' },
//       { id: '006', name: 'HR Team' }
//     ];
    
//     this.roles = [
//       { id: '11', name: 'Manager' },
//       { id: '12', name: 'Senior Manager' },
//       { id: '13', name: 'Team Lead' },
//       { id: '14', name: 'Senior Team Lead' },
//       { id: '15', name: 'Director' },
//       { id: '16', name: 'Senior Director' },
//       { id: '21', name: 'Developer' },
//       { id: '31', name: 'Senior Developer' },
//       { id: '41', name: 'Designer' },
//       { id: '51', name: 'Analyst' },
//       { id: '61', name: 'Tester' },
//       { id: '71', name: 'Intern' },
//       { id: '81', name: 'HR' },
//       { id: '91', name: 'Admin' },
//       { id: '101', name: 'Support' },
//       { id: '111', name: 'Sales' },
//       { id: '121', name: 'Marketing' },
//       { id: '131', name: 'Finance' },
//       { id: '141', name: 'Operations' },
//       { id: '151', name: 'Customer Service' }
//     ];

//     // Try to load departments from service (optional)
//     this.employeeService.getDepartments().subscribe({
//       next: (departments) => {
//         if (departments && departments.length > 0) {
//           this.departments = departments;
//           this.Teams = departments.map(dept => ({ id: dept.id, name: dept.name }));
//           console.log('✅ Loaded departments from service:', this.departments);
//         }
//       },
//       error: (error) => {
//         console.warn('⚠️ Could not load departments from service, using fallback data:', error.message);
//       }
//     });

//     // Try to load roles from service (optional)
//     this.employeeService.getRoles().subscribe({
//       next: (roles) => {
//         if (roles && roles.length > 0) {
//           this.availableRoles = roles;
//           this.roles = roles.map(role => ({ id: role.id, name: role.name }));
//           console.log('✅ Loaded roles from service:', this.availableRoles);
//         }
//       },
//       error: (error) => {
//         console.warn('⚠️ Could not load roles from service, using fallback data:', error.message);
//       }
//     });
//   }

//   loadEmployee(id: number): void {
//     this.isLoading = true;
//     this.errorMessage = '';
    
//     this.employeeService.findEmployeeById(id)
//       .subscribe({
//         next: (employee) => {
//           console.log('✅ Loaded employee data:', employee);
//           this.currentEmployee = employee;
//           this.initForm(employee);
//           this.isLoading = false;
//         },
//         error: (error) => {
//           console.error('❌ Error fetching employee:', error);
//           this.errorMessage = 'Failed to load employee details. Please try again.';
//           this.isLoading = false;
//           this.messageService.add({ 
//             severity: 'error', 
//             summary: 'Error', 
//             detail: 'Employee not found or server error occurred' 
//           });
//         }
//       });
//   }

// onSubmit(): void {
//   // Validate form
//   if (this.employeeForm.invalid) {
//     Object.keys(this.employeeForm.controls).forEach(key => {
//       const control = this.employeeForm.get(key);
//       control?.markAsTouched();
//     });
//     this.messageService.add({ 
//       severity: 'warn', 
//       summary: 'Validation Error', 
//       detail: 'Please fill all required fields correctly' 
//     });
//     return;
//   }

//   // Check if employee ID exists
//   if (!this.employeeId) {
//     this.messageService.add({ 
//       severity: 'error', 
//       summary: 'Error', 
//       detail: 'No employee ID available for update' 
//     });
//     return;
//   }

//   // Prepare employee data exactly as backend expects
//   const formValues = this.employeeForm.value;
//   const employeeData = {
//     id: this.employeeId,  // Include ID in payload as shown in sample
//     firstname: formValues.firstname,
//     lastname: formValues.lastname,
//     email: formValues.email,
//     department_Id: formValues.department_Id,
//     role_Id: formValues.role_Id
//   };

//   console.log('🔍 Updating employee with ID:', this.employeeId);
//   console.log('🔍 Employee update data:', employeeData);
//   console.log('🔍 API URL will be: /emp-controller/update-emp/' + this.employeeId);
  
//   this.isLoading = true;
  
//   // Call the service method
//   this.employeeService.updateEmployeeByUsingId(this.employeeId, employeeData)
//     .subscribe({
//       next: (response) => {
//         console.log('✅ Employee updated successfully:', response);
        
//         // Optional: Create notification
//         this.createUpdateNotification(employeeData);

//         this.isLoading = false;
        
//         // Show success message
//         this.messageService.add({ 
//           severity: 'success', 
//           summary: '✅ Update Successful!', 
//           detail: `Employee "${employeeData.firstname} ${employeeData.lastname}" (ID: ${this.employeeId}) has been updated successfully.`,
//           life: 4000
//         });
        
//         // Show confirmation dialog
//         this.confirmationService.confirm({
//           message: `Employee "${employeeData.firstname} ${employeeData.lastname}" has been updated successfully! You will be redirected to the employee list.`,
//           header: '🎉 Update Successful',
//           icon: 'pi pi-check-circle',
//           acceptLabel: 'Continue',
//           rejectVisible: false,
//           accept: () => {
//             this.navigateBackToEmployeeList();
//           }
//         });
        
//         // Auto-navigate after 5 seconds
//         setTimeout(() => {
//           this.navigateBackToEmployeeList();
//         }, 5000);
//       },
//       error: (error) => {
//         this.isLoading = false;
//         console.error('❌ Error updating employee:', error);
        
//         this.handleUpdateError(error);
//       }
//     });
// }


// private createUpdateNotification(employeeData: any): void {
//   if (this.notificationService) {
//     const employeeEmail = employeeData.email;
    
//     this.notificationService.createNotification({
//       userId: this.employeeId,
//       email: employeeEmail,
//       title: 'Profile Updated',
//       message: `Your profile has been updated by an administrator.`,
//       type: 'IN_APP',
//       taskId: this.employeeId
//     }).subscribe({
//       next: (notificationResponse) => {
//         console.log('✅ Notification created successfully:', notificationResponse);
//       },
//       error: (error) => {
//         console.warn('⚠️ Could not create notification (non-critical):', error);
//       }
//     });
//   }
// }

// // Simple navigation method that works
// private handleUpdateError(error: any): void {
//   let errorMessage = `Failed to update employee (ID: ${this.employeeId}). Please try again.`;
//   let errorSummary = 'Update Failed';
  
//   switch (error.status) {
//     case 404:
//       errorMessage = `Employee with ID ${this.employeeId} not found. Please refresh and try again.`;
//       break;
//     case 401:
//       errorMessage = 'Your session has expired. Please login again.';
//       errorSummary = 'Authentication Required';
//       setTimeout(() => this.router.navigate(['/login']), 2000);
//       break;
//     case 403:
//       errorMessage = 'You do not have permission to update this employee.';
//       errorSummary = 'Access Denied';
//       break;
//     case 400:
//       errorMessage = 'Invalid employee data. Please check all fields and try again.';
//       errorSummary = 'Invalid Data';
//       break;
//     case 0:
//       errorMessage = 'Unable to connect to the server. Please check if the backend service is running on http://localhost:8082';
//       errorSummary = 'Connection Error';
//       break;
//     default:
//       if (error.message?.includes('CORS')) {
//         errorMessage = 'CORS error. Please check server configuration.';
//         errorSummary = 'Connection Error';
//       }
//   }
  
//   this.messageService.add({ 
//     severity: 'error', 
//     summary: errorSummary, 
//     detail: errorMessage
//   });
// }

// // Simplified navigation method
// private navigateBackToEmployeeList(): void {
//   const queryParams: any = {};
  
//   // Restore original navigation state
//   if (this.returnToParams?.departmentId) {
//     queryParams.departmentId = this.returnToParams.departmentId;
//   }
//   if (this.returnToParams?.title) {
//     queryParams.title = this.returnToParams.title;
//   }
//   if (this.returnToParams?.searchTerm) {
//     queryParams.searchTerm = this.returnToParams.searchTerm;
//   }
//   if (this.returnToParams?.searchType) {
//     queryParams.searchType = this.returnToParams.searchType;
//   }
  
//   // Add refresh trigger
//   queryParams.refresh = Date.now();
  
//   console.log('🔙 Navigating back to employee list with params:', queryParams);
  
//   this.router.navigate(['/admin/emplist'], { 
//     queryParams: Object.keys(queryParams).length > 0 ? queryParams : undefined 
//   });
// }
//   cancel(): void {
//     this.navigateBackToList();
//   }

//   private navigateBackToList(refresh: boolean = false): void {
//     // Build navigation parameters
//     const queryParams: any = {};
    
//     // Restore original navigation state
//     if (this.returnToParams.departmentId) {
//       queryParams.departmentId = this.returnToParams.departmentId;
//     }
//     if (this.returnToParams.title) {
//       queryParams.title = this.returnToParams.title;
//     }
//     if (this.returnToParams.searchTerm) {
//       queryParams.searchTerm = this.returnToParams.searchTerm;
//     }
//     if (this.returnToParams.searchType) {
//       queryParams.searchType = this.returnToParams.searchType;
//     }
    
//     // Add refresh trigger if needed
//     if (refresh) {
//       queryParams.refresh = Date.now(); // Force refresh with timestamp
//     }
    
//     console.log('🔙 Navigating back to list with params:', queryParams);
    
//     this.router.navigate(['/admin/emplist'], { 
//       queryParams: Object.keys(queryParams).length > 0 ? queryParams : undefined 
//     });
//   }

//   get f() {
//     return this.employeeForm.controls;
//   }

//   getRoleName(id: string): string {
//     const role = this.roles.find(r => r.id === id);
//     return role ? role.name : 'Unknown';
//   }

//   getDepartmentName(id: string): string {
//     const dept = this.Teams.find(t => t.id === id);
//     return dept ? dept.name : 'Unknown';
//   }
// }



import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';
import { EmployeeService, Employee, Department, Role } from '../../../services/employee-service';

interface TeamOption {
  label: string;
  value: string;
}

interface RoleOption {
  label: string;
  value: string;
}

@Component({
  selector: 'app-emp-update',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextModule,
    ButtonModule,
    DropdownModule,
    CardModule,
    ToastModule,
    ConfirmDialogModule,
    RouterModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './emp-update.component.html',
  styleUrls: ['./emp-update.component.css']
})
export class EmpUpdateComponent implements OnInit {
  employeeForm!: FormGroup;
  employeeId!: number;
  isLoading: boolean = false;
  isSubmitting: boolean = false;
  errorMessage: string = '';
  currentEmployee?: Employee;
  
  // Store navigation state to return to correct page
  private returnToParams: any = {};
  
  // Dropdown options for form
  teamOptions: TeamOption[] = [];
  roleOptions: RoleOption[] = [];
  
  // Fallback data
  private fallbackTeams = [
    { id: '001', name: 'Development Team' },
    { id: '002', name: 'Marketing Team' },
    { id: '003', name: 'Sales Team' },
    { id: '004', name: 'Operation Team' },
    { id: '005', name: 'Design Team' },
    { id: '006', name: 'HR Team' }
  ];
  
  private fallbackRoles = [
    { id: '11', name: 'Manager' },
    { id: '21', name: 'Team Lead' },
    { id: '31', name: 'Developer' },
    { id: '41', name: 'Designer' },
    { id: '51', name: 'Analyst' },
    { id: '61', name: 'Tester' },
    { id: '71', name: 'Intern' },
    { id: '81', name: 'HR' },
    { id: '91', name: 'Admin' },
    { id: '101', name: 'Support' },
    { id: '111', name: 'Sales' },
    { id: '121', name: 'Marketing' },
    { id: '131', name: 'Finance' },
    { id: '141', name: 'Operations' },
    { id: '151', name: 'Customer Service' }
  ];
  
  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private employeeService: EmployeeService
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.loadDropdownOptions();
    
    // Get all query parameters including navigation state
    this.route.queryParams.subscribe(params => {
      console.log('📋 Received URL parameters:', params);
      
      const id = params['id'];
      if (id) {
        this.employeeId = parseInt(id);
        console.log('🔍 Employee ID from URL:', this.employeeId);
        
        // Store return navigation parameters
        this.returnToParams = {
          departmentId: params['departmentId'],
          title: params['title'],
          searchTerm: params['searchTerm'],
          searchType: params['searchType']
        };
        console.log('📝 Stored return parameters:', this.returnToParams);
        
        // Load employee data
        this.loadEmployee(this.employeeId);
      } else {
        this.messageService.add({ 
          severity: 'error', 
          summary: 'Error', 
          detail: 'No employee ID provided in URL' 
        });
        this.navigateBackToList();
      }
    });
  }

  initForm(employee?: Employee): void {
    this.employeeForm = this.fb.group({
      firstname: [employee?.firstname || '', [Validators.required, Validators.minLength(2)]],
      lastname: [employee?.lastname || '', [Validators.required, Validators.minLength(2)]],
      email: [employee?.email || '', [Validators.required, Validators.email]],
      department_Id: [employee?.department_Id || employee?.departmentId || '', Validators.required],
      role_Id: [employee?.role_Id || employee?.roleId || '', Validators.required]
    });
    
    console.log('📝 Form initialized with values:', this.employeeForm.value);
  }

  loadDropdownOptions(): void {
    // Initialize with fallback data first
    this.teamOptions = this.fallbackTeams.map(team => ({
      label: team.name,
      value: team.id
    }));
    
    this.roleOptions = this.fallbackRoles.map(role => ({
      label: role.name,
      value: role.id
    }));

    // Try to load departments from service
    this.employeeService.getDepartments().subscribe({
      next: (departments: Department[]) => {
        if (departments && departments.length > 0) {
          this.teamOptions = departments.map(dept => ({
            label: dept.name,
            value: dept.id
          }));
          console.log('✅ Loaded departments from service:', this.teamOptions);
        }
      },
      error: (error) => {
        console.warn('⚠️ Could not load departments, using fallback data:', error.message);
      }
    });

    // Try to load roles from service
    this.employeeService.getRoles().subscribe({
      next: (roles: Role[]) => {
        if (roles && roles.length > 0) {
          this.roleOptions = roles.map(role => ({
            label: role.name,
            value: role.id
          }));
          console.log('✅ Loaded roles from service:', this.roleOptions);
        }
      },
      error: (error) => {
        console.warn('⚠️ Could not load roles, using fallback data:', error.message);
      }
    });
  }

  loadEmployee(id: number): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    console.log('🔄 Loading employee with ID:', id);
    
    this.employeeService.findEmployeeById(id).subscribe({
      next: (employee: Employee) => {
        console.log('✅ Loaded employee data:', employee);
        this.currentEmployee = employee;
        this.initForm(employee);
        this.isLoading = false;
        
        this.messageService.add({
          severity: 'info',
          summary: 'Employee Loaded',
          detail: `Editing ${employee.firstname} ${employee.lastname}`,
          life: 3000
        });
      },
      error: (error) => {
        console.error('❌ Error fetching employee:', error);
        this.errorMessage = 'Failed to load employee details. Please try again.';
        this.isLoading = false;
        
        this.messageService.add({ 
          severity: 'error', 
          summary: 'Error', 
          detail: 'Employee not found or server error occurred' 
        });
        
        // Navigate back after error
        setTimeout(() => this.navigateBackToList(), 3000);
      }
    });
  }

  onSubmit(): void {
    console.log('🚀 Form submission started');
    
    // Mark all fields as touched for validation display
    this.markFormGroupTouched(this.employeeForm);
    
    // Validate form
    if (this.employeeForm.invalid) {
      this.messageService.add({ 
        severity: 'warn', 
        summary: 'Validation Error', 
        detail: 'Please fill all required fields correctly' 
      });
      return;
    }

    // Check if employee ID exists
    if (!this.employeeId) {
      this.messageService.add({ 
        severity: 'error', 
        summary: 'Error', 
        detail: 'No employee ID available for update' 
      });
      return;
    }

    // Prepare employee data exactly as backend expects
    const formValues = this.employeeForm.value;
    const employeeData: Employee = {
      id: this.employeeId,
      firstname: formValues.firstname.trim(),
      lastname: formValues.lastname.trim(),
      email: formValues.email.trim(),
      department_Id: formValues.department_Id,
      role_Id: formValues.role_Id
    };

    console.log('🔍 Updating employee with ID:', this.employeeId);
    console.log('🔍 Employee update data:', employeeData);
    
    this.isSubmitting = true;
    
    // Call the service method
    this.employeeService.updateEmployeebyUsingId(this.employeeId, employeeData).subscribe({
      next: (response) => {
        console.log('✅ Employee updated successfully:', response);
        this.isSubmitting = false;
        
        // Show success message
        this.messageService.add({ 
          severity: 'success', 
          summary: 'Update Successful!', 
          detail: `Employee "${employeeData.firstname} ${employeeData.lastname}" has been updated successfully.`,
          life: 4000
        });
        
        // Show confirmation dialog and navigate
        this.confirmationService.confirm({
          message: `Employee "${employeeData.firstname} ${employeeData.lastname}" has been updated successfully! You will be redirected to the employee list.`,
          header: 'Update Successful',
          icon: 'pi pi-check-circle',
          acceptLabel: 'Continue',
          rejectVisible: false,
          accept: () => {
            this.navigateBackToList(true);
          }
        });
        
        // Auto-navigate after 3 seconds if user doesn't click
        setTimeout(() => {
          this.navigateBackToList(true);
        }, 3000);
      },
      error: (error) => {
        this.isSubmitting = false;
        console.error('❌ Error updating employee:', error);
        this.handleUpdateError(error);
      }
    });
  }

  private handleUpdateError(error: any): void {
    let errorMessage = `Failed to update employee (ID: ${this.employeeId}). Please try again.`;
    let errorSummary = 'Update Failed';
    
    switch (error.status) {
      case 404:
        errorMessage = `Employee with ID ${this.employeeId} not found. Please refresh and try again.`;
        break;
      case 401:
        errorMessage = 'Your session has expired. Please login again.';
        errorSummary = 'Authentication Required';
        break;
      case 403:
        errorMessage = 'You do not have permission to update this employee.';
        errorSummary = 'Access Denied';
        break;
      case 400:
        errorMessage = 'Invalid employee data. Please check all fields and try again.';
        errorSummary = 'Invalid Data';
        break;
      case 0:
        errorMessage = 'Unable to connect to the server. Please check if the backend service is running on http://localhost:8082';
        errorSummary = 'Connection Error';
        break;
      default:
        if (error.message?.includes('CORS')) {
          errorMessage = 'CORS error. Please check server configuration.';
          errorSummary = 'Connection Error';
        }
    }
    
    this.messageService.add({ 
      severity: 'error', 
      summary: errorSummary, 
      detail: errorMessage
    });
  }

  cancel(): void {
    this.confirmationService.confirm({
      message: 'Are you sure you want to cancel? Any unsaved changes will be lost.',
      header: 'Confirm Cancel',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.navigateBackToList();
      }
    });
  }

  private navigateBackToList(refresh: boolean = false): void {
    const queryParams: any = {};
    
    // Restore original navigation state
    if (this.returnToParams.departmentId) {
      queryParams.departmentId = this.returnToParams.departmentId;
    }
    if (this.returnToParams.title) {
      queryParams.title = this.returnToParams.title;
    }
    if (this.returnToParams.searchTerm) {
      queryParams.searchTerm = this.returnToParams.searchTerm;
    }
    if (this.returnToParams.searchType) {
      queryParams.searchType = this.returnToParams.searchType;
    }
    
    // Add refresh trigger if needed
    if (refresh) {
      queryParams.refresh = Date.now();
    }
    
    console.log('🔙 Navigating back to employee list with params:', queryParams);
    
    this.router.navigate(['/admin/emplist'], { 
      queryParams: Object.keys(queryParams).length > 0 ? queryParams : undefined 
    });
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  // Getter for easy access to form controls in template
  get f() {
    return this.employeeForm.controls;
  }

  // Helper methods for display
  getRoleName(id: string): string {
    const role = this.roleOptions.find(r => r.value === id);
    return role ? role.label : 'Unknown';
  }

  getDepartmentName(id: string): string {
    const dept = this.teamOptions.find(t => t.value === id);
    return dept ? dept.label : 'Unknown';
  }

  getCurrentEmployeeInfo(): string {
    if (this.currentEmployee) {
      return `${this.currentEmployee.firstname} ${this.currentEmployee.lastname} (ID: ${this.employeeId})`;
    }
    return `Employee ID: ${this.employeeId}`;
  }
}
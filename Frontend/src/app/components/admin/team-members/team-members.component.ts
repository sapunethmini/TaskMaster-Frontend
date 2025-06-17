import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService, MessageService } from 'primeng/api';
import { InputGroupModule } from 'primeng/inputgroup';
import { Router, ActivatedRoute } from '@angular/router';
import { RouterModule } from '@angular/router';
import { EmployeeService, Employee } from '../../../services/employee-service';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { TaskCreationFormComponent } from '../task-creation-form/task-creation-form.component';
import { NotificationService } from '../../../services/notification.service'; // Added import

@Component({
  selector: 'app-team-members',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    InputTextModule,
    ButtonModule,
    ConfirmDialogModule,
    ToastModule,
    InputGroupModule,
    RouterModule
  ],
  providers: [ConfirmationService, MessageService, DialogService, NotificationService], // Added NotificationService
  templateUrl: './team-members.component.html',
  styleUrls: ['./team-members.component.css']
})
export class TeamMembersComponent implements OnInit {
  employees: Employee[] = [];
  filteredEmployees: Employee[] = [];
  searchTerm: string = '';
  searchType: 'name' | 'id' = 'name';
  isLoading: boolean = false;
  errorMessage: string = '';
  selectedTeam: string = '';
  pageTitle: string = 'Team Members';
  memberCount: number = 0;
  ref: DynamicDialogRef | undefined;

  // Team mapping for display names
  teamNames: { [key: string]: string } = {
    '001': 'Development Team',
    '002': 'Marketing Team',
    '003': 'Sales Team',
    '004': 'Operation Team',
    '005': 'Design Team',
    '006': 'HR Team'
  };

  roles: { [key: string]: string } = {
    '11': 'Manager',
    '12': 'Senior Manager',
    '13': 'Team Lead',
    '14': 'Senior Team Lead',
    '15': 'Director',
    '16': 'Senior Director',
    '21': 'Developer',
    '31': 'Senior Developer',
    '41': 'Designer',
    '51': 'Analyst'
  };

  constructor(
    private employeeService: EmployeeService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private dialogService: DialogService,
    private notificationService: NotificationService, // Added injection
    public router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Get route parameters
    this.route.queryParams.subscribe(params => {
      console.log('Team Members Component - Route params:', params);
      
      if (params['departmentId']) {
        this.selectedTeam = params['departmentId'];
        this.pageTitle = params['title'] || this.teamNames[params['departmentId']] || 'Team Members';
        console.log(`Loading team members for: ${this.pageTitle} (ID: ${this.selectedTeam})`);
      } else {
        console.warn('No departmentId provided in route parameters');
        this.pageTitle = 'All Team Members';
      }
    });
    
    this.loadEmployees();
  }

  loadEmployees(): void {
    this.isLoading = true;
    this.errorMessage = '';
    console.log(`Loading employees for department: ${this.selectedTeam}`);

    if (!this.selectedTeam) {
      // If no specific team, load all employees
      console.log('No specific team selected, loading all employees');
      this.loadAllEmployees();
      return;
    }

    // Load employees for specific department using the dedicated endpoint
    this.employeeService.getEmployeesByDepartment(this.selectedTeam).subscribe({
      next: (data) => {
        console.log(`Successfully loaded ${data.length} employees for department ${this.selectedTeam}:`, data);
        
        this.employees = data;
        this.filteredEmployees = [...this.employees];
        this.memberCount = this.employees.length;
        this.isLoading = false;
        
        // Show success message
        this.messageService.add({
          severity: 'success',
          summary: 'Team Loaded',
          detail: `Found ${this.memberCount} members in ${this.pageTitle}`,
          life: 3000
        });

        // If no employees found for this department
        if (this.employees.length === 0) {
          this.messageService.add({
            severity: 'info',
            summary: 'No Members',
            detail: `${this.pageTitle} currently has no members assigned`,
            life: 5000
          });
        }
      },
      error: (error) => {
        console.error(`Error fetching employees for department ${this.selectedTeam}:`, error);
        this.errorMessage = `Failed to load team members for ${this.pageTitle}. Please try again later.`;
        this.isLoading = false;
        
        this.messageService.add({
          severity: 'error',
          summary: 'Loading Failed',
          detail: this.errorMessage,
          life: 5000
        });
      }
    });
  }

  // Fallback method to load all employees (if no department specified)
  private loadAllEmployees(): void {
    console.log('Loading all employees as fallback');
    
    this.employeeService.getEmployees().subscribe({
      next: (data) => {
        console.log(`Loaded ${data.length} total employees`);
        this.employees = data;
        this.filteredEmployees = [...this.employees];
        this.memberCount = this.employees.length;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fetching all employees:', error);
        this.errorMessage = 'Failed to load employees. Please try again later.';
        this.isLoading = false;
        
        this.messageService.add({
          severity: 'error',
          summary: 'Loading Failed',
          detail: this.errorMessage,
          life: 5000
        });
      }
    });
  }

  filterEmployees(): void {
    if (!this.searchTerm.trim()) {
      this.filteredEmployees = [...this.employees];
      return;
    }

    const term = this.searchTerm.trim().toLowerCase();
    console.log(`Filtering employees by ${this.searchType}: "${term}"`);
    
    this.filteredEmployees = this.employees.filter(employee => {
      const matchesSearch = this.searchType === 'id'
        ? employee.id?.toString() === this.searchTerm.trim()
        : (`${employee.firstname} ${employee.lastname}`).toLowerCase().includes(term);
      
      return matchesSearch;
    });

    console.log(`Filter results: ${this.filteredEmployees.length} employees found`);
  }

  onSearchChange(): void {
    this.filterEmployees();
  }

  setSearchType(type: 'name' | 'id'): void {
    console.log(`Changing search type to: ${type}`);
    this.searchType = type;
    this.searchTerm = '';
    this.filteredEmployees = [...this.employees]; // Reset filter
  }

  clearSearch(): void {
    console.log('Clearing search');
    this.searchTerm = '';
    this.filteredEmployees = [...this.employees];
  }

  getFullName(employee: Employee): string {
    return `${employee.firstname} ${employee.lastname}`;
  }

  getRoleName(roleId: string): string {
    return this.roles[roleId] || 'Unknown Role';
  }

  getInitials(employee: Employee): string {
    return `${employee.firstname?.[0] || ''}${employee.lastname?.[0] || ''}`;
  }

  // Navigate back to team management
  navigateBack(): void {
    console.log('Navigating back to team management');
    this.router.navigate(['/admin/team-management']);
  }

  openTaskCreationForm(employee: Employee): void {
    console.log(`Opening task creation form for employee: ${this.getFullName(employee)}`);
    
    this.ref = this.dialogService.open(TaskCreationFormComponent, {
      width: '40%',
      height: '80%',
      contentStyle: { overflow: 'auto' },
      baseZIndex: 1000,
      data: {
        employee: employee,
        teamId: this.selectedTeam,
        teamName: this.pageTitle
      }
    });

    this.ref.onClose.subscribe((result) => {
      if (result) {
        console.log('Task creation completed successfully');
        
        // Show existing success message (keeping original functionality intact)
        this.messageService.add({
          severity: 'success',
          summary: 'Task Created',
          detail: `Task has been assigned to ${this.getFullName(employee)}`,
          life: 4000
        });

        // CREATE NOTIFICATION FOR THE EMPLOYEE
        this.createTaskNotification(employee, result);
      }
    });
  }

  /**
   * Create notification when a task is assigned to an employee
   * @param employee - The employee who was assigned the task
   * @param taskResult - Result from task creation (may contain task details)
   */
  private createTaskNotification(employee: Employee, taskResult: any): void {
    // Validate that we have the necessary employee information
    if (!employee.id || !employee.email) {
      console.warn('Cannot create notification: Employee ID or email missing', employee);
      return;
    }

    console.log('Creating notification for task assignment:', {
      employeeId: employee.id,
      employeeName: this.getFullName(employee),
      email: employee.email,
      taskResult: taskResult
    });

    // Prepare notification details
    const employeeName = this.getFullName(employee);
    const teamName = this.getTeamDisplayName();
    
    // Create notification title and message
    const notificationTitle = 'New Task Assigned';
    const notificationMessage = `You have been assigned a new task${taskResult?.title ? ': ' + taskResult.title : ''} by ${teamName}.`;

    // Extract task ID if available from result
    const taskId = taskResult?.id || taskResult?.taskId || undefined;

    // Create the notification using the notification service
    this.notificationService.createSimpleNotification(
      employee.id,
      employee.email,
      notificationTitle,
      notificationMessage,
      taskId
    ).subscribe({
      next: (notification) => {
        console.log('✅ Notification created successfully:', notification);
        
        // Optional: Show admin confirmation that notification was sent
        this.messageService.add({
          severity: 'info',
          summary: 'Notification Sent',
          detail: `${employeeName} has been notified about the new task`,
          life: 3000
        });
      },
      error: (error) => {
        console.error('❌ Error creating notification:', error);
        
        // Optional: Show error to admin (but don't break the main flow)
        this.messageService.add({
          severity: 'warn',
          summary: 'Notification Warning',
          detail: `Task was created successfully, but notification could not be sent to ${employeeName}`,
          life: 5000
        });
      }
    });
  }

  navigateToAddEmployee(): void {
    console.log('Navigating to add employee form');
    this.router.navigate(['/admin/empadd'], {
      queryParams: {
        departmentId: this.selectedTeam,
        returnTo: '/admin/team-members'
      }
    });
  }

  // Navigate to employee details/edit
  viewEmployeeDetails(employee: Employee): void {
    console.log(`Viewing details for employee: ${this.getFullName(employee)}`);
    this.router.navigate(['/admin/empupdate'], { 
      queryParams: { 
        id: employee.id,
        returnTo: `/admin/team-members?departmentId=${this.selectedTeam}&title=${encodeURIComponent(this.pageTitle)}`
      } 
    });
  }

  confirmDelete(employee: Employee, event: Event): void {
    console.log(`Confirming deletion of employee: ${this.getFullName(employee)}`);
    
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: `Are you sure you want to remove ${employee.firstname} ${employee.lastname} from ${this.pageTitle}?`,
      header: 'Confirm Removal',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.deleteEmployee(employee);
      },
      reject: () => {
        console.log('Employee deletion cancelled');
      }
    });
  }

  deleteEmployee(employee: Employee): void {
    if (!employee.id) {
      console.error('Cannot delete employee without ID');
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Cannot delete employee without ID'
      });
      return;
    }

    console.log(`Deleting employee: ${this.getFullName(employee)} (ID: ${employee.id})`);

    this.employeeService.deleteEmployee(employee.id).subscribe({
      next: () => {
        console.log(`Successfully deleted employee: ${this.getFullName(employee)}`);
        
        // Remove from both arrays
        this.employees = this.employees.filter(emp => emp.id !== employee.id);
        this.filteredEmployees = this.filteredEmployees.filter(emp => emp.id !== employee.id);
        this.memberCount = this.employees.length;
        
        this.messageService.add({
          severity: 'success',
          summary: 'Employee Removed',
          detail: `${employee.firstname} ${employee.lastname} has been removed from ${this.pageTitle}`,
          life: 4000
        });
      },
      error: (error) => {
        console.error('Error deleting employee:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Remove Failed',
          detail: 'There was a problem removing the employee. Please try again.',
          life: 5000
        });
      }
    });
  }

  refreshList(): void {
    console.log('Refreshing team members list');
    this.loadEmployees();
  }

  // Check if there are no employees in this team
  hasNoEmployees(): boolean {
    return !this.isLoading && this.employees.length === 0 && !this.errorMessage;
  }

  // Check if search returned no results
  hasNoSearchResults(): boolean {
    return !this.isLoading && this.employees.length > 0 && this.filteredEmployees.length === 0 && this.searchTerm.trim().length > 0;
  }

  // Get team display name
  getTeamDisplayName(): string {
    return this.teamNames[this.selectedTeam] || this.pageTitle || 'Team';
  }
}
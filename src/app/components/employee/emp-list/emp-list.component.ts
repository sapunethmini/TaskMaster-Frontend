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

@Component({
  selector: 'app-emp-list',
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
  providers: [ConfirmationService, MessageService],
  templateUrl: './emp-list.component.html',
  styleUrls: ['./emp-list.component.css']
})
export class EmpListComponent implements OnInit {
  employees: Employee[] = [];
  filteredEmployees: Employee[] = [];
  searchTerm: string = '';
  searchType: 'name' | 'id' = 'name';
  isLoading: boolean = false;
  errorMessage: string = '';
  selectedTeam: string = '';
  pageTitle: string = 'All Employees';
  memberCount: number = 0;
  
  Teams: { [key: string]: string } = {
    '001': 'Development Team',
    '002': 'Marketing Team',
    '003': 'Sales Team',
    '004': 'Operation Team',
    '005': 'Design Team',
    '006': 'HR Team'
  };
  
  roles: { [key: string]: string } = {
    '11': 'Manager',
    '21': 'Team Lead',
    '31': 'Developer',
    '41': 'Designer',
    '51': 'Analyst',
    '61': 'Tester',
    '71': 'Intern',
    '81': 'HR',
    '91': 'Admin',
    '101': 'Support',
    '111': 'Sales',
    '121': 'Marketing',
    '131': 'Finance',
    '141': 'Operations',
    '151': 'Customer Service'
  };

  constructor(
    private employeeService: EmployeeService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    public router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    // Get query parameters from the URL
    this.route.queryParams.subscribe(params => {
      console.log('Route parameters:', params);
      
      // Handle department/team filtering
      if (params['departmentId']) {
        this.selectedTeam = params['departmentId'];
        this.pageTitle = params['title'] || this.Teams[params['departmentId']] || 'Team Members';
        console.log(`Loading employees for department: ${this.selectedTeam}`);
      } else {
        this.pageTitle = 'All Employees';
        console.log('Loading all employees');
      }
      
      // Restore search state if available
      if (params['searchTerm']) {
        this.searchTerm = params['searchTerm'];
        console.log('Restored search term:', this.searchTerm);
      }
      
      if (params['searchType']) {
        this.searchType = params['searchType'];
        console.log('Restored search type:', this.searchType);
      }
      
      // Check if we need to refresh data (coming back from update)
      const shouldRefresh = params['refresh'];
      if (shouldRefresh) {
        console.log('Refresh triggered, reloading data...');
      }
      
      this.loadEmployees();
    });
  }

  loadEmployees(): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    if (this.selectedTeam) {
      // Load employees for specific department
      console.log(`Fetching employees for department: ${this.selectedTeam}`);
      
      this.employeeService.getEmployeesByDepartment(this.selectedTeam)
        .subscribe({
          next: (data) => {
            console.log('Received department employees:', data);
            this.employees = data;
            this.applySearchFilter(); // Apply any existing search after loading
            this.memberCount = this.employees.length;
            this.isLoading = false;
            
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: `Loaded ${this.memberCount} employees from ${this.pageTitle}`,
              life: 3000
            });
          },
          error: (error) => {
            console.error('Error fetching department employees:', error);
            this.errorMessage = `Failed to load employees for ${this.pageTitle}. Please try again later.`;
            this.isLoading = false;
            
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: this.errorMessage
            });
          }
        });
    } else {
      // Load all employees
      console.log('Fetching all employees');
      
      this.employeeService.getEmployees()
        .subscribe({
          next: (data) => {
            console.log('Received all employees:', data);
            this.employees = data;
            this.applySearchFilter(); // Apply any existing search after loading
            this.memberCount = this.employees.length;
            this.isLoading = false;
            
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: `Loaded ${this.memberCount} employees`,
              life: 3000
            });
          },
          error: (error) => {
            console.error('Error fetching all employees:', error);
            this.errorMessage = 'Failed to load employees. Please try again later.';
            this.isLoading = false;
            
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: this.errorMessage
            });
          }
        });
    }
  }

  private applySearchFilter(): void {
    if (!this.searchTerm.trim()) {
      this.filteredEmployees = [...this.employees];
      return;
    }

    this.filteredEmployees = this.employees.filter(employee => {
      const matchesSearch = this.searchType === 'id' 
        ? employee.id?.toString() === this.searchTerm
        : `${employee.firstname} ${employee.lastname}`.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      return matchesSearch;
    });
    
    console.log(`Applied search filter: "${this.searchTerm}" (${this.searchType}), found ${this.filteredEmployees.length} results`);
  }

  filterEmployees(): void {
    this.applySearchFilter();
  }

  onSearchChange(): void {
    this.filterEmployees();
  }

  setSearchType(type: 'name' | 'id'): void {
    this.searchType = type;
    this.searchTerm = '';
    this.filterEmployees();
  }

  getFullName(employee: Employee): string {
    return `${employee.firstname} ${employee.lastname}`;
  }

  getTeamName(departmentId: string): string {
    return this.Teams[departmentId] || departmentId || 'Unknown Team';
  }

  getRoleName(roleId: string): string {
    return this.roles[roleId] || 'Unknown Role';
  }

  getInitials(employee: Employee): string {
    return `${employee.firstname?.[0] || ''}${employee.lastname?.[0] || ''}`;
  }

  updateEmployee(employee: Employee): void {
    // Build query parameters to pass current state to update component
    const queryParams: any = {
      id: employee.id
    };
    
    // Pass current navigation state so we can return properly
    if (this.selectedTeam) {
      queryParams.departmentId = this.selectedTeam;
      queryParams.title = this.pageTitle;
    }
    
    // Pass current search state
    if (this.searchTerm) {
      queryParams.searchTerm = this.searchTerm;
    }
    if (this.searchType !== 'name') { // Only pass if not default
      queryParams.searchType = this.searchType;
    }
    
    console.log('Navigating to update with state:', queryParams);
    this.router.navigate(['/admin/empupdate'], { queryParams });
  }

  navigateToAddEmployee(): void {
    // Pass current state to add component as well
    const queryParams: any = {};
    
    if (this.selectedTeam) {
      queryParams.departmentId = this.selectedTeam;
      queryParams.title = this.pageTitle;
    }
    
    this.router.navigate(['/admin/empadd'], { 
      queryParams: Object.keys(queryParams).length > 0 ? queryParams : undefined 
    });
  }

  // Navigate back to user management
  navigateBack(): void {
    this.router.navigate(['/admin/usermanagement']);
  }

  confirmDelete(employee: Employee, event: Event): void {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: `Are you sure you want to delete ${employee.firstname} ${employee.lastname}?`,
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.deleteEmployee(employee);
      }
    });
  }

  deleteEmployee(employee: Employee): void {
    if (!employee.id) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Cannot delete employee without ID'
      });
      return;
    }
    
    this.employeeService.deleteEmployee(employee.id)
      .subscribe({
        next: () => {
          // Remove the employee from both arrays
          this.employees = this.employees.filter(emp => emp.id !== employee.id);
          this.filteredEmployees = this.filteredEmployees.filter(emp => emp.id !== employee.id);
          this.memberCount = this.employees.length;
          
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: `${employee.firstname} ${employee.lastname} has been successfully removed`,
            life: 3000
          });
        },
        error: (error) => {
          console.error('Error deleting employee:', error);
          // Only show error if the error is not a 200 OK response
          if (error.status !== 200) {
            this.messageService.add({
              severity: 'error',
              summary: 'Delete Failed',
              detail: 'There was a problem deleting the employee. Please try again.'
            });
          } else {
            // If we get a 200 OK response, treat it as success
            this.employees = this.employees.filter(emp => emp.id !== employee.id);
            this.filteredEmployees = this.filteredEmployees.filter(emp => emp.id !== employee.id);
            this.memberCount = this.employees.length;
            
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: `${employee.firstname} ${employee.lastname} has been successfully removed`,
              life: 3000
            });
          }
        }
      });
  }

  refreshList(): void {
    console.log('Manual refresh triggered');
    this.loadEmployees();
  }

  // Clear filters and show all results for current view
  clearSearch(): void {
    this.searchTerm = '';
    this.filteredEmployees = [...this.employees];
  }
}
import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { EmployeeService } from '../../../services/employee-service'; // Ensure the path is correct

interface Team {
  id: string;
  name: string;
}

interface Role {
  id: string;
  name: string;
}

@Component({
  selector: 'app-employee-form',
  templateUrl: './emp-add.component.html',
  styleUrls: ['./emp-add.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule
  ]
})
export class EmployeeFormComponent implements OnInit {
  employeeForm: FormGroup;
  submitted = false;
  TeamDropdownOpen = false;
  roleDropdownOpen = false;
  isLoading = false;
  errorMessage = '';
  
  Teams: Team[] = [
    { id: '001', name: 'Development Team' },
    { id: '002', name: 'Marketing Team' },
    { id: '003', name: 'Sales Team' },
    { id: '004', name: 'Operation Team' },
    { id: '005', name: 'Design Team' },
    { id: '006', name: 'HR Team' },
  ];
  
  roles: Role[] = [
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
    private employeeService: EmployeeService
  ) {
    this.employeeForm = this.fb.group({
      firstname: ['', Validators.required],
      lastname: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      Team_Id: ['', Validators.required],
      role_Id: ['', Validators.required]
    });
  }

  ngOnInit(): void {
  }

  get f() {
    return this.employeeForm.controls;
  }

  // Capture clicks outside dropdowns to close them
  @HostListener('document:click', ['$event'])
  clickOutside(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.custom-dropdown')) {
      this.TeamDropdownOpen = false;
      this.roleDropdownOpen = false;
    }
  }

  toggleDropdown(type: string, event?: Event): void {
    // Prevent the above handler from firing
    event?.stopPropagation();
    
    if (type === 'Team') {
      this.TeamDropdownOpen = !this.TeamDropdownOpen;
      this.roleDropdownOpen = false;
    } else if (type === 'role') {
      this.roleDropdownOpen = !this.roleDropdownOpen;
      this.TeamDropdownOpen = false;
    }
  }

  selectTeam(id: string): void {
    this.employeeForm.patchValue({ Team_Id: id });
    this.TeamDropdownOpen = false;
  }

  selectRole(id: string): void {
    this.employeeForm.patchValue({ role_Id: id });
    this.roleDropdownOpen = false;
  }

  getTeamName(id: string): string {
    const Team = this.Teams.find(dept => dept.id === id);
    return Team ? Team.name : 'Select Team';
  }

  getRoleName(id: string): string {
    const role = this.roles.find(r => r.id === id);
    return role ? role.name : 'Select Role';
  }

  onSubmit() {
    this.submitted = true;
    this.errorMessage = '';
    
    if (this.employeeForm.invalid) {
      return;
    }
    
    this.isLoading = true;
    
    const employeeData = {
      ...this.employeeForm.value,
      id: this.generateEmployeeId()
    };
    
    console.log('Employee data to submit:', employeeData);
    
    this.employeeService.addEmployee(employeeData)
      .subscribe({
        next: (response) => {
          console.log('Success:', response);
          this.isLoading = false;
          alert('Employee added successfully!');
          this.resetForm();
        },
        error: (error) => {
          console.error('Error:', error);
          this.isLoading = false;
          this.errorMessage = error.message || 'Failed to add employee. Please try again.';
        }
      });
  }

  resetForm() {
    this.submitted = false;
    this.employeeForm.reset();
    this.errorMessage = '';
  }

  private generateEmployeeId(): number {
    return Math.floor(Math.random() * 1000) + 5; 
  }
}
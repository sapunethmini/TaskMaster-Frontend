// user-management.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { forkJoin } from 'rxjs';
import { EmployeeService } from '../../../services/employee-service'; // Changed to EmployeeService

interface TeamData {
  id: number;
  name: string;
  memberCount: number;
  color: string;
  departmentId: string;
}

@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.css'],
  standalone: true,
  imports: [CommonModule, CardModule]
})
export class UserManagementComponent implements OnInit {
  teams: TeamData[] = [];
  isLoading = true;

  constructor(
    private router: Router,
    private http: HttpClient,
    private employeeService: EmployeeService // Changed to EmployeeService
  ) { }

  ngOnInit(): void {
    // Updated team data structure to match EmpListComponent department IDs
    this.teams = [
      {
        id: 1,
        name: 'Development Team',
        memberCount: 0,
        color: '#4CAF50',
        departmentId: '001' // Fixed to match EmpListComponent
      },
      {
        id: 2,
        name: 'Marketing Team',
        memberCount: 0,
        color: '#2196F3',
        departmentId: '002' // Fixed to match EmpListComponent
      },
      {
        id: 3,
        name: 'Sales Team',
        memberCount: 0,
        color: '#9C27B0',
        departmentId: '003' // Fixed to match EmpListComponent
      },
      {
        id: 4,
        name: 'Operation Team',
        memberCount: 0,
        color: '#FF5722',
        departmentId: '004' // Fixed to match EmpListComponent
      },
      {
        id: 5,
        name: 'Design Team',
        memberCount: 0,
        color: '#FFC107',
        departmentId: '005' // Fixed to match EmpListComponent
      },
      {
        id: 6,
        name: 'HR Team',
        memberCount: 0,
        color: '#607D8B',
        departmentId: '006' // Fixed to match EmpListComponent
      }
    ];
    
    // Fetch actual member counts for each team
    this.loadTeamMemberCounts();
  }

  loadTeamMemberCounts(): void {
    // Create an array of observables, one for each team's member count request
    const countRequests = this.teams.map(team => 
      this.employeeService.getEmployeeCountByDepartment(team.departmentId) // Changed to correct method
    );
    
    // Execute all requests in parallel
   forkJoin(countRequests).subscribe({
    next: (counts) => {
      console.log('All team member counts loaded:', counts);
      // Handle the counts array - each index corresponds to the team at the same index
      counts.forEach((count, index) => {
        this.teams[index].memberCount = count; // Assuming teams have a memberCount property
      });
    },
    error: (error) => {
      console.error('Error loading team member counts:', error);
    }
  });
  }

  

  viewTeamMembers(team: TeamData): void {
    console.log(`Navigating to team: ${team.name} with departmentId: ${team.departmentId}`);
    // Navigate to employee list with department ID
    this.router.navigate(['/admin/emplist'], {
      queryParams: {
        departmentId: team.departmentId,
        title: team.name
      }
    });
  }
}
import { Routes } from '@angular/router';
import { UserSignupComponent } from './components/user/user-signup/user-signup.component';
import { UserLoginComponent } from './components/user/user-login/user-login.component';
import { EmployeeFormComponent } from './components/employee/emp-add/emp-add.component';
import { EmpUpdateComponent } from './components/employee/emp-update/emp-update.component';
import { EmpListComponent } from './components/employee/emp-list/emp-list.component';
import { DashboardComponent } from './components/admin/employee-dashboard/emp-dashboard.component';
import { SidebarAdminComponent } from './shared/sidebar-layout/sidebar-admin/sidebar-admin.component';
import { SidebarEmployeeComponent } from './shared/sidebar-layout/sidebar-employee/sidebar-employee.component';
import { RoleGuard } from './core/guards/role.guard';
import { TeamManagementComponent } from './components/admin/team-management/team-management.component';
import { TeamMembersComponent } from './components/admin/team-members/team-members.component';
import { UserManagementComponent } from './components/admin/user-management/user-management.component';
import { TaskManagementComponent } from './components/admin/task-management/task-management.component';
import { UserProfileComponent } from './components/employee/emp-profile/user-profile.component';
import { ReportComponent } from './components/admin/report/report.component';
import { EmployeeDashboardComponent } from './components/employee/dashboard/employee-dashboard.component';
import { EmployeeTasksComponent } from './components/employee/tasks/employee-tasks.component';
import { EmployeeProgressComponent } from './components/employee/progress/employee-progress.component';
import { TaskCreationFormComponent } from './components/admin/task-creation-form/task-creation-form.component';
import { TeamOverviewComponent } from './components/admin/team-overview/team-overview.component';
import { TaskListComponent } from './components/admin/task-list/task-list.component';
import {EmployeeTasksListComponent} from './components/employee/tasks-emp/emp-tasks.component';

export const routes: Routes = [
  { path: 'signup', component: UserSignupComponent },
  { path: 'login', component: UserLoginComponent },
  
  {
    path: 'admin',
    component: SidebarAdminComponent,
    children: [
      { path: 'empadd', component: EmployeeFormComponent },
      { path: 'empupdate', component: EmpUpdateComponent },
      { path: 'emplist', component: EmpListComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { 
        path: 'dashboard', 
        component: DashboardComponent, 
        canActivate: [RoleGuard],
        data: { role: 'admin' }
      },
      {
        path: 'team-management',
        component: TeamManagementComponent, 
        canActivate: [RoleGuard], 
        data: { role: 'admin' }
      },
      {
        path: 'user-management',
        component: UserManagementComponent,
        canActivate: [RoleGuard],
        data: { role: 'admin' }
      },
      {
        path: 'task-management',
        component: TaskManagementComponent,
        canActivate: [RoleGuard],
        data: { role: 'admin' }
      },
      {
        path: 'profile',
        component: UserProfileComponent,
        canActivate: [RoleGuard],
        data: { role: 'admin' }
      },
      {
        path: 'team-members',
        component: TeamMembersComponent,
        canActivate: [RoleGuard],
        data: { role: 'admin' }
      },
      {
        path: 'report',
        component: ReportComponent,
        canActivate: [RoleGuard],
        data: { role: 'admin' }
      },
      {
        path: 'task-creation-form',
        component: TaskCreationFormComponent,
        canActivate: [RoleGuard],
        data: { role: 'admin' }
      },
      {path: 'team-overview', component: TeamOverviewComponent, canActivate: [RoleGuard], data: { role: 'admin' } },
      {path: 'task-list', component: TaskListComponent, canActivate: [RoleGuard], data: { role: 'admin' } },
    ]
  },
  
  {
    path: 'employee',
    component: SidebarEmployeeComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: EmployeeDashboardComponent, canActivate: [RoleGuard], data: { role: 'employee' } },
      { path: 'tasks', component: EmployeeTasksComponent, canActivate: [RoleGuard], data: { role: 'employee' } },
      { path: 'progress', component: EmployeeProgressComponent, canActivate: [RoleGuard], data: { role: 'employee' } },
      { path: 'profile', component: UserProfileComponent, canActivate: [RoleGuard], data: { role: 'employee' } },
      {path: 'tasks-emp', component: EmployeeTasksListComponent, canActivate: [RoleGuard], data: { role: 'employee' } },
    ]
  },
  
  // Default redirects
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' }
];
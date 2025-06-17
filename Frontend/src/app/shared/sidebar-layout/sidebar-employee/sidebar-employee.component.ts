import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-sidebar-employee',
  templateUrl: './sidebar-employee.component.html',
  styleUrls: ['./sidebar-employee.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule, ButtonModule]
})
export class SidebarEmployeeComponent implements OnInit {
  menuItems: MenuItem[] = [];

  constructor() { }

  ngOnInit() {
    this.menuItems = [
      {
        label: 'Dashboard',
        icon: 'pi pi-home',
        routerLink: '/employee/dashboard',
        routerLinkActiveOptions: { exact: true }
      },
      {
        label: 'Tasks',
        icon: 'pi pi-list',
        routerLink: '/employee/tasks-emp',
        routerLinkActiveOptions: { exact: true }
      },
      // {
      //   label: 'Progress',
      //   icon: 'pi pi-chart-line',
      //   routerLink: '/employee/progress',
      //   routerLinkActiveOptions: { exact: true }
      // },
      {
        label: 'Profile',
        icon: 'pi pi-user',
        routerLink: '/employee/profile',
        routerLinkActiveOptions: { exact: true }
      }
    ];
  }
} 
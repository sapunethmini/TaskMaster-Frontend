import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TabViewModule } from 'primeng/tabview';
import { TableModule } from 'primeng/table';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { ChartModule } from 'primeng/chart';
import { MultiSelectModule } from 'primeng/multiselect';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { ToastModule } from 'primeng/toast';
import { FormsModule } from '@angular/forms';

interface MenuItem {
  label: string;
  icon: string;
  route?: string;
  active: boolean;
  color?: string;
}

@Component({
  selector: 'app-sidebar-admin',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    ButtonModule,
    CardModule,
    TabViewModule,
    TableModule,
    DropdownModule,
    CalendarModule,
    ChartModule,
    MultiSelectModule,
    DialogModule,
    InputTextModule,
    InputNumberModule,
    ToastModule,
    FormsModule
  ],
  templateUrl: './sidebar-admin.component.html',
  styleUrls: ['./sidebar-admin.component.css']
})
export class SidebarAdminComponent implements OnInit {
  menuItems: MenuItem[] = [];
  
  constructor(private router: Router) {
    // Subscribe to router events to update active state
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.updateActiveState();
    });
  }

  ngOnInit(): void {
    this.menuItems = [
      { 
        label: 'Dashboard', 
        icon: 'pi pi-home', 
        route: '/admin/dashboard', 
        active: this.isRouteActive('/admin/dashboard'),
        color: '#3B82F6'
      },
      { 
        label: 'User Management', 
        icon: 'pi pi-users',
        route: '/admin/user-management',
        active: this.isRouteActive('/admin/user-management'),
        color: '#10B981'
      },
      { 
        label: 'Team Management', 
        icon: 'pi pi-users', 
        route: '/admin/team-management',
        active: this.isRouteActive('/admin/team-management'),
        color: '#8B5CF6'
      },
      { 
        label: 'Task Management', 
        icon: 'pi pi-list-check',
        route: '/admin/task-management',
        active: this.isRouteActive('/admin/task-management'),
        color: '#8B5CF6'
      },
      { 
        label: 'Reports', 
        icon: 'pi pi-chart-bar', 
        route: '/admin/report', 
        active: this.isRouteActive('/admin/report'),
        color: '#F59E0B'
      }
    ];
  }

  isRouteActive(route: string): boolean {
    return this.router.url.startsWith(route);
  }

  updateActiveState(): void {
    this.menuItems.forEach(item => {
      if (item.route) {
        item.active = this.isRouteActive(item.route);
      }
    });
  }

  navigateTo(route: string): void {
    // Store the source of navigation in sessionStorage
    const source = this.menuItems.find(item => item.route === route)?.label;
    if (source) {
      sessionStorage.setItem('navigationSource', source);
    }
    
    // Update active state before navigation
    this.menuItems.forEach(item => {
      item.active = item.route === route;
    });
    
    this.router.navigate([route]);
  }
}
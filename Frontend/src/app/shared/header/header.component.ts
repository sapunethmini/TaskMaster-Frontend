import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { BadgeModule } from 'primeng/badge';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule, ButtonModule, MenuModule, BadgeModule]
})
export class HeaderComponent implements OnInit {
  notifications: any[] = [];
  profileMenuItems: MenuItem[] = [];

  constructor() { }

  ngOnInit() {
    // Sample notifications
    this.notifications = [
      {
        id: 1,
        title: 'New Task Assigned',
        message: 'You have been assigned a new task',
        time: '5 minutes ago',
        read: false
      },
      {
        id: 2,
        title: 'Task Completed',
        message: 'Your task has been marked as completed',
        time: '1 hour ago',
        read: true
      }
    ];

    // Profile menu items
    this.profileMenuItems = [
      {
        label: 'Profile',
        icon: 'pi pi-user',
        routerLink: '/employee/profile'
      },
      {
        label: 'Settings',
        icon: 'pi pi-cog',
        routerLink: '/employee/settings'
      },
      {
        separator: true
      },
      {
        label: 'Sign Out',
        icon: 'pi pi-sign-out',
        command: () => this.signOut()
      }
    ];
  }

  signOut() {
    // Implement sign out logic
    console.log('Signing out...');
  }

  markNotificationAsRead(notification: any) {
    notification.read = true;
  }

  get unreadNotificationsCount(): number {
    return this.notifications.filter(n => !n.read).length;
  }
} 
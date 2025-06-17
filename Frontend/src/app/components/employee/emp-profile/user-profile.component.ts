import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { BadgeModule } from 'primeng/badge';
import { ProgressBarModule } from 'primeng/progressbar';
import { DialogModule } from 'primeng/dialog';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextarea } from 'primeng/inputtextarea';
import { CalendarModule } from 'primeng/calendar';
import { InputNumberModule } from 'primeng/inputnumber';
import { DropdownModule } from 'primeng/dropdown';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TooltipModule } from 'primeng/tooltip';
import { Router } from '@angular/router';
import { EmployeeService,Employee, Task as BaseTask } from '../../../../app/services/employee-service';
import { ChartModule } from 'primeng/chart';
import { NotificationService, Notification } from '../../../services/notification.service';
import { Subscription, interval } from 'rxjs'; // Added for real-time updates

// Extended Task interface with additional properties
interface Task extends BaseTask {
  dueTime?: string;
  estimatedHours?: number;
}

interface LocalTask {
  id: number;
  title: string;
  description: string;
  dueDate: Date;
  dueTime: string;
  estimatedHours: number;
  status: 'pending' | 'completed';
  priority: 'high' | 'medium' | 'low';
  category?: string;
  assignee?: string;
}

interface TaskCounts {
  completed: number;
  inProgress: number;
  pending: number;
}

// Add interfaces for dropdown options
interface Team {
  id: string;
  name: string;
}

interface Role {
  id: string;
  name: string;
}

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    ButtonModule,
    BadgeModule,
    ProgressBarModule,
    DialogModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextModule,
    InputTextarea,
    CalendarModule,
    InputNumberModule,
    ChartModule,
    DropdownModule,
    ProgressSpinnerModule,
    TooltipModule
  ],
  providers: [EmployeeService]
})
export class UserProfileComponent implements OnInit, OnDestroy { // Added OnDestroy
  user = {
    name: '',
    email: '',
    phone: '',
    role: '',
    department: '',
    avatar: '',
    location: '',
    joinDate: ''
  };

  // Task count properties
  completedTasks: number = 0;
  inProgressTasksCount: number = 0;
  pendingTasks: number = 0;
  totalTasks: number = 0;
  isLoadingTaskData: boolean = true;
  error: string | null = null;
  currentUserProfile: Employee | null = null;

  // Additional metrics
  avgTasksPerDay: number = 3.2;
  onTimeDelivery: string = '94%';
  efficiencyScore: string = '8.7/10';
  focusTime: string = '6.2h';
  taskQuality: string = '9.1/10';
  overdueTasks: number = 2;
  todayTasks: number = 5;
  totalHours: number = 127;
  avgCompletion: number = 2.3;

  // Chart data
  chartData: any;
  chartOptions: any;
  priorityChartData: any;
  doughnutOptions: any;
  statusChartData: any;
  barOptions: any;

  // Dialog controls
  showAddTaskDialog: boolean = false;
  showAnalyticsDialog: boolean = false;
  showAllCompleted: boolean = false;

  // Profile completion dialog properties
  showProfileCompletionDialog: boolean = false;
  profileCompletionForm: FormGroup;
  isSubmittingProfile: boolean = false;
  Teams: Team[] = [
    { id: '001', name: 'Development Team' },
    { id: '002', name: 'Marketing Team' },
    { id: '003', name: 'Sales Team' },
    { id: '004', name: 'Operation Team' },
    { id: '005', name: 'Design Team' },
    { id: '006', name: 'HR Team' }
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

  // User's actual tasks from backend
  userTasks: Task[] = [];

  // Local tasks for UI
  localTasks: LocalTask[] = [];
  newTask: Partial<LocalTask> = {
    title: '',
    description: '',
    dueDate: new Date(),
    dueTime: '09:00',
    estimatedHours: 1,
    priority: 'medium',
    category: '',
    assignee: ''
  };

  timeOptions = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00',
    '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00', '17:30'
  ];

  // Enhanced Notification properties
  notifications: Notification[] = [];
  unreadNotificationCount: number = 0;
  showNotifications: boolean = false;
  isLoadingNotifications: boolean = false; // Added loading state
  notificationRefreshInterval: Subscription | null = null; // Added for real-time updates
  lastNotificationCount: number = 0; // Track changes in notification count

  constructor(
    private router: Router,
    private employeeService: EmployeeService,
    private notificationService: NotificationService,
    private fb: FormBuilder
  ) {
    // Initialize the profile completion form
    this.profileCompletionForm = this.fb.group({
      departmentId: ['', Validators.required],
      roleId: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    console.log('📋 USER PROFILE - Profile component initializing...');
    this.loadUserProfileFromToken();
    this.loadUserTasks();
    this.initializeCharts();
    this.loadNotifications();
    this.startNotificationPolling(); // Start real-time notification updates
    
    // Add debugging info
    console.log('🔍 USER PROFILE - Initialization complete. Checking token for user ID...');
    const userId = this.getUserIdFromToken();
    if (userId) {
      console.log('✅ USER PROFILE - User ID found during initialization:', userId);
    } else {
      console.log('⚠️ USER PROFILE - User ID not found during initialization, will use fallback methods');
    }
  }

  ngOnDestroy(): void {
    // Clean up subscriptions to prevent memory leaks
    this.stopNotificationPolling();
  }

  /**
   * Start polling for new notifications every 30 seconds
   */
  private startNotificationPolling(): void {
    let userId = this.getUserIdFromToken();
    
    // If we can't get user ID from token initially, try again after profile loads
    if (!userId) {
      console.log('🔔 User ID not available yet, will start polling after profile loads...');
      // We'll start polling once we have the user ID from the profile endpoint
      return;
    }
    
    console.log('🔔 Starting notification polling for user:', userId);
    
    // Poll every 30 seconds for new notifications
    this.notificationRefreshInterval = interval(30000).subscribe(() => {
      this.refreshNotifications();
    });
  }

  /**
   * Start polling with a specific user ID (called after getting ID from profile)
   */
  private startNotificationPollingWithUserId(userId: number): void {
    if (this.notificationRefreshInterval) {
      // Stop existing polling if any
      this.stopNotificationPolling();
    }
    
    console.log('🔔 Starting notification polling with user ID:', userId);
    
    // Poll every 30 seconds for new notifications
    this.notificationRefreshInterval = interval(30000).subscribe(() => {
      this.refreshNotifications();
    });
  }

  /**
   * Stop notification polling
   */
  private stopNotificationPolling(): void {
    if (this.notificationRefreshInterval) {
      console.log('🔕 Stopping notification polling');
      this.notificationRefreshInterval.unsubscribe();
      this.notificationRefreshInterval = null;
    }
  }

  /**
   * Refresh notifications silently (without showing loading indicators)
   */
  private refreshNotifications(): void {
    let userId = this.getUserIdFromToken();
    
    // If we can't get user ID from token, try using the current user profile
    if (!userId && this.currentUserProfile && this.currentUserProfile.id) {
      userId = this.currentUserProfile.id;
      console.log('🔄 Using user ID from current profile for refresh:', userId);
    }
    
    if (!userId) {
      console.warn('⚠️ Cannot refresh notifications: No user ID available');
      return;
    }

    // Load unread count first (lighter operation)
    this.notificationService.getUnreadNotificationCount(userId).subscribe({
      next: (count) => {
        const previousCount = this.unreadNotificationCount;
        this.unreadNotificationCount = count;
        
        // If there are new notifications, refresh the full list
        if (count > previousCount) {
          console.log(`🆕 New notifications detected! Count: ${count} (was: ${previousCount})`);
          this.loadNotificationList(userId);
          
          // Show visual indicator for new notifications
          this.showNewNotificationIndicator();
        }
      },
      error: (error) => {
        console.error('Error refreshing notification count:', error);
      }
    });
  }

  /**
   * Load full notification list
   */
  private loadNotificationList(userId: number): void {
    this.notificationService.getUserNotifications(userId).subscribe({
      next: (notifications) => {
        this.notifications = notifications.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        console.log('📬 Notifications refreshed:', notifications.length);
      },
      error: (error) => {
        console.error('Error loading notification list:', error);
      }
    });
  }

  /**
   * Show visual indicator for new notifications (you can customize this)
   */
  private showNewNotificationIndicator(): void {
    // Add a subtle animation or indicator to the notification bell
    const notificationElement = document.querySelector('.notification-header');
    if (notificationElement) {
      notificationElement.classList.add('new-notification-pulse');
      setTimeout(() => {
        notificationElement.classList.remove('new-notification-pulse');
      }, 2000);
    }
  }

  /**
   * Enhanced notification loading with better error handling and loading states
   */
  loadNotifications(): void {
    console.log('🔔 USER PROFILE - Starting to load notifications...');
    
    const userId = this.getUserIdFromToken();
    if (!userId) {
      console.warn('⚠️ USER PROFILE - Cannot load notifications: User ID not found, trying profile endpoint...');
      return; // getUserIdFromToken will handle the fallback
    }

    console.log('🔔 USER PROFILE - Loading notifications for user ID:', userId);
    this.loadNotificationsWithUserId(userId);
  }

  /**
   * Manual refresh notifications (called when user wants to refresh)
   */
  refreshNotificationsManually(): void {
    console.log('🔄 Manually refreshing notifications...');
    
    let userId = this.getUserIdFromToken();
    
    // If we can't get user ID from token, try using the current user profile
    if (!userId && this.currentUserProfile && this.currentUserProfile.id) {
      userId = this.currentUserProfile.id;
      console.log('🔄 Using user ID from current profile for manual refresh:', userId);
    }
    
    if (userId) {
      this.loadNotificationsWithUserId(userId);
    } else {
      console.warn('⚠️ Cannot manually refresh notifications: No user ID available');
      // Try to get user ID from profile as fallback
      this.getUserIdFromProfile();
    }
  }

  /**
   * Mark notification as read and update UI
   */
  markNotificationAsRead(notification: Notification): void {
    if (notification.read) return; // Already read

    console.log('📖 Marking notification as read:', notification.id);
    
    this.notificationService.markAsRead(notification.id).subscribe({
      next: (updatedNotification) => {
        // Update local notification object
        const index = this.notifications.findIndex(n => n.id === notification.id);
        if (index !== -1) {
          this.notifications[index] = updatedNotification;
        }
        
        // Update unread count
        this.unreadNotificationCount = Math.max(0, this.unreadNotificationCount - 1);
        
        console.log('✅ Notification marked as read successfully');
      },
      error: (error) => {
        console.error('❌ Error marking notification as read:', error);
      }
    });
  }

  /**
   * Mark all notifications as read
   */
  markAllNotificationsAsRead(): void {
    const unreadNotifications = this.notifications.filter(n => !n.read);
    if (unreadNotifications.length === 0) return;

    console.log('📖 Marking all notifications as read:', unreadNotifications.length);
    
    const unreadIds = unreadNotifications.map(n => n.id);
    this.notificationService.markMultipleAsRead(unreadIds).subscribe({
      next: (updatedNotifications) => {
        // Update local notifications
        updatedNotifications.forEach(updated => {
          const index = this.notifications.findIndex(n => n.id === updated.id);
          if (index !== -1) {
            this.notifications[index] = updated;
          }
        });
        
        // Reset unread count
        this.unreadNotificationCount = 0;
        
        console.log('✅ All notifications marked as read successfully');
      },
      error: (error) => {
        console.error('❌ Error marking all notifications as read:', error);
      }
    });
  }

  /**
   * Get notification display text with better formatting
   */
  getNotificationDisplayText(notification: Notification): string {
    return notification.message || notification.title || 'New notification';
  }

  /**
   * Get relative time for notification
   */
  getNotificationTimeAgo(notification: Notification): string {
    try {
      const createdDate = new Date(notification.createdAt);
      const now = new Date();
      const diffMs = now.getTime() - createdDate.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;
      
      return createdDate.toLocaleDateString();
    } catch (error) {
      return 'Recently';
    }
  }

  /**
   * Enhanced toggle notifications with auto-refresh
   */
  toggleNotifications(): void {
    this.showNotifications = !this.showNotifications;
    
    // If opening notifications panel, refresh the list
    if (this.showNotifications) {
      console.log('👁️ Opening notifications panel - refreshing...');
      this.refreshNotificationsManually();
    }
  }

  /**
   * Close notifications panel
   */
  closeNotifications(): void {
    this.showNotifications = false;
  }

  // Profile completion methods with enhanced user ID handling
  openProfileCompletionDialog() {
    this.isSubmittingProfile = true;
    
    this.employeeService.getCurrentUserProfile().subscribe({
      next: (userProfile: Employee) => {
        this.currentUserProfile = userProfile;
        console.log('✅ Current user profile loaded for dialog:', userProfile);
        
        // If we didn't have user ID for notifications before, start loading them now
        if (userProfile.id && !this.getUserIdFromToken()) {
          console.log('🔔 Starting notification loading with profile user ID:', userProfile.id);
          this.loadNotificationsWithUserId(userProfile.id);
          this.startNotificationPollingWithUserId(userProfile.id);
        }
        
        this.profileCompletionForm.patchValue({
          departmentId: userProfile.department_Id || null,
          roleId: userProfile.role_Id || null
        });
        
        this.showProfileCompletionDialog = true;
        this.isSubmittingProfile = false;
      },
      error: (error) => {
        console.error('❌ Error fetching user profile:', error);
        this.isSubmittingProfile = false;
      }
    });
  }

  submitProfileCompletion() {
    if (this.profileCompletionForm.valid && this.currentUserProfile && this.currentUserProfile.id) {
      this.isSubmittingProfile = true;
      
      const formData = this.profileCompletionForm.value;
      const userId = this.currentUserProfile.id;
      
      const updatePayload = {
        id: userId,
        firstname: this.currentUserProfile.firstname || '',
        lastname: this.currentUserProfile.lastname || '',
        email: this.currentUserProfile.email || '',
        department_Id: formData.departmentId,
        role_Id: formData.roleId
      };
      
      console.log('🔍 Update payload:', updatePayload);
      
      this.employeeService.updateEmployeeByUsingId(userId, updatePayload).subscribe({
        next: (response) => {
          console.log('✅ Profile updated successfully:', response);
          
          const selectedTeam = this.Teams.find(team => team.id === formData.departmentId);
          const selectedRole = this.roles.find(role => role.id === formData.roleId);
          
          if (selectedTeam) {
            this.user.department = selectedTeam.name;
          }
          if (selectedRole) {
            this.user.role = selectedRole.name;
          }
          
          this.isSubmittingProfile = false;
          this.showProfileCompletionDialog = false;
          this.currentUserProfile = null;
        },
        error: (error) => {
          console.error('❌ Error updating profile:', error);
          this.isSubmittingProfile = false;
        }
      });
    } else {
      Object.keys(this.profileCompletionForm.controls).forEach(key => {
        this.profileCompletionForm.get(key)?.markAsTouched();
      });
      
      if (!this.currentUserProfile || !this.currentUserProfile.id) {
        console.error('Current user profile not loaded or missing ID');
      }
    }
  }

  onProfileDialogHide() {
    this.profileCompletionForm.reset();
    this.currentUserProfile = null;
    this.isSubmittingProfile = false;
  }

  // Initialize charts (unchanged)
  initializeCharts() {
    this.chartData = {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [
        {
          label: 'Completed Tasks',
          data: [12, 15, 18, 14, 20, 25],
          borderColor: '#10b981',
          tension: 0.4
        }
      ]
    };

    this.chartOptions = {
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: true
        }
      }
    };

    this.priorityChartData = {
      labels: ['High', 'Medium', 'Low'],
      datasets: [{
        data: [30, 50, 20],
        backgroundColor: ['#ef4444', '#f59e0b', '#10b981']
      }]
    };

    this.doughnutOptions = {
      plugins: {
        legend: {
          position: 'bottom'
        }
      }
    };

    this.statusChartData = {
      labels: ['Completed', 'In Progress', 'Pending'],
      datasets: [{
        label: 'Tasks',
        data: [25, 15, 10],
        backgroundColor: ['#10b981', '#f59e0b', '#ef4444']
      }]
    };

    this.barOptions = {
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: true
        }
      }
    };
  }

  // Load user profile from token (unchanged)
  loadUserProfileFromToken() {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        this.router.navigate(['/login']);
        return;
      }

      const payload = JSON.parse(atob(token.split('.')[1]));
      
      const formattedRole = payload.role ? payload.role.replace('role_', '') : 'Employee';
      
      this.user = {
        name: payload.sub || 'User',
        email: payload.email || '',
        phone: payload.phone || '',
        role: formattedRole.charAt(0).toUpperCase() + formattedRole.slice(1).toLowerCase(),
        department: payload.department || 'General',
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(payload.sub || 'User')}&background=random`,
        location: payload.location || '',
        joinDate: payload.joinDate || ''
      };

      console.log('User profile loaded from token:', this.user);
    } catch (error) {
      console.error('Error loading user profile from token:', error);
      this.router.navigate(['/login']);
    }
  }

  // Task loading methods (unchanged from original)
  loadUserTasks() {
    console.log('Starting to load user tasks...');
    this.isLoadingTaskData = true;
    this.error = null;
    
    this.employeeService.getTasksByUser().subscribe({
      next: (tasks: Task[]) => {
        console.log('✅ User tasks loaded successfully:', tasks);
        
        this.userTasks = tasks;
        this.updateTaskStatisticsFromTasks(tasks);
        this.isLoadingTaskData = false;
        
        console.log('✅ Task processing completed successfully');
      },
      error: (error) => {
        console.error('❌ Error loading user tasks:', error);
        this.error = error.message || 'Failed to load tasks';
        this.isLoadingTaskData = false;
        
        console.log('🔄 Attempting fallback task loading method...');
        this.loadTaskDataFallback();
      }
    });
  }

  loadTaskDataFallback() {
    console.log('Using fallback method to load task counts...');
    
    this.employeeService.getAllTaskCounts().subscribe({
      next: (taskCounts) => {
        console.log('✅ Task counts loaded via fallback:', taskCounts);
        
        this.completedTasks = taskCounts.completed;
        this.inProgressTasksCount = taskCounts.inProgress;
        this.pendingTasks = taskCounts.pending;
        this.totalTasks = this.completedTasks + this.inProgressTasksCount + this.pendingTasks;
        
        this.isLoadingTaskData = false;
        console.log('✅ Fallback task loading completed');
      },
      error: (error) => {
        console.error('❌ Fallback method also failed:', error);
        this.error = 'Unable to load task data. Please check your connection and try again.';
        this.isLoadingTaskData = false;
        
        this.loadTaskCountsIndividually();
      }
    });
  }

  loadTaskCountsIndividually() {
    console.log('Loading task counts individually as last resort...');
    
    let loadedCount = 0;
    const totalToLoad = 3;
    
    const checkComplete = () => {
      loadedCount++;
      if (loadedCount === totalToLoad) {
        this.totalTasks = this.completedTasks + this.inProgressTasksCount + this.pendingTasks;
        this.isLoadingTaskData = false;
        console.log('✅ Individual task counts loaded');
      }
    };

    this.employeeService.getTaskCountByStatus('COMPLETED').subscribe({
      next: (count) => {
        this.completedTasks = count;
        console.log('Completed tasks count:', count);
        checkComplete();
      },
      error: (error) => {
        console.error('Error loading COMPLETED tasks:', error);
        this.completedTasks = 0;
        checkComplete();
      }
    });

    this.employeeService.getTaskCountByStatus('IN_PROGRESS').subscribe({
      next: (count) => {
        this.inProgressTasksCount = count;
        console.log('In Progress tasks count:', count);
        checkComplete();
      },
      error: (error) => {
        console.error('Error loading IN_PROGRESS tasks:', error);
        this.inProgressTasksCount = 0;
        checkComplete();
      }
    });

    this.employeeService.getTaskCountByStatus('TODO').subscribe({
      next: (count) => {
        this.pendingTasks = count;
        console.log('Pending tasks count:', count);
        checkComplete();
      },
      error: (error) => {
        console.error('Error loading TODO tasks:', error);
        this.pendingTasks = 0;
        checkComplete();
      }
    });
  }

  updateTaskStatisticsFromTasks(tasks: Task[]) {
    this.completedTasks = tasks.filter(task => task.status === 'COMPLETED').length;
    this.inProgressTasksCount = tasks.filter(task => task.status === 'IN_PROGRESS').length;
    this.pendingTasks = tasks.filter(task => task.status === 'TODO').length;
    this.totalTasks = tasks.length;
    
    console.log('📊 Task statistics updated:', {
      completed: this.completedTasks,
      inProgress: this.inProgressTasksCount,
      pending: this.pendingTasks,
      total: this.totalTasks
    });
  }

  // Enhanced method to get user ID from token with better debugging
  private getUserIdFromToken(): number | null {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.warn('❌ No token found in localStorage');
        return null;
      }
      
      const payload = JSON.parse(atob(token.split('.')[1]));
      console.log('🔍 USER PROFILE - Full token payload for user ID extraction:', payload);
      
      // Try different possible field names for user ID (prioritize userId first based on console logs)
      let userId = null;
      
      // Check common user ID field names - prioritize userId based on the token structure
      if (payload.userId) {
        userId = payload.userId;
        console.log('✅ USER PROFILE - Found user ID in payload.userId:', userId);
      } else if (payload.id) {
        userId = payload.id;
        console.log('✅ USER PROFILE - Found user ID in payload.id:', userId);
      } else if (payload.user_id) {
        userId = payload.user_id;
        console.log('✅ USER PROFILE - Found user ID in payload.user_id:', userId);
      } else if (payload.uid) {
        userId = payload.uid;
        console.log('✅ USER PROFILE - Found user ID in payload.uid:', userId);
      } else if (payload.sub && !isNaN(Number(payload.sub))) {
        // Sometimes 'sub' field contains the user ID as a number
        userId = Number(payload.sub);
        console.log('✅ USER PROFILE - Found user ID in payload.sub (converted to number):', userId);
      } else {
        // Log all available fields to help with debugging
        console.warn('❌ USER PROFILE - User ID not found in token. Available fields:', Object.keys(payload));
        console.warn('💡 USER PROFILE - Token payload values:', payload);
        
        // Try to get user profile from backend to get the ID
        this.getUserIdFromProfile();
        return null;
      }
      
      // Ensure it's a valid number
      const numericUserId = Number(userId);
      if (isNaN(numericUserId)) {
        console.error('❌ USER PROFILE - User ID is not a valid number:', userId);
        return null;
      }
      
      console.log('✅ USER PROFILE - Successfully extracted user ID:', numericUserId);
      return numericUserId;
      
    } catch (error) {
      console.error('❌ USER PROFILE - Error getting user ID from token:', error);
      return null;
    }
  }

  /**
   * Fallback method to get user ID from the user profile endpoint
   */
  private getUserIdFromProfile(): void {
    console.log('🔄 Attempting to get user ID from profile endpoint...');
    
    this.employeeService.getCurrentUserProfile().subscribe({
      next: (userProfile: Employee) => {
        if (userProfile && userProfile.id) {
          console.log('✅ Got user ID from profile endpoint:', userProfile.id);
          
          // Store the user ID temporarily and load notifications
          this.currentUserProfile = userProfile;
          this.loadNotificationsWithUserId(userProfile.id);
          
          // Start polling now that we have the user ID
          this.startNotificationPollingWithUserId(userProfile.id);
        } else {
          console.error('❌ Profile endpoint did not return user ID');
        }
      },
      error: (error) => {
        console.error('❌ Error getting user profile for ID:', error);
      }
    });
  }

  /**
   * Load notifications with a specific user ID
   */
  private loadNotificationsWithUserId(userId: number): void {
    console.log('🔔 USER PROFILE - Loading notifications with user ID:', userId);
    this.isLoadingNotifications = true;

    // Load all notifications
    this.notificationService.getUserNotifications(userId).subscribe({
      next: (notifications) => {
        this.notifications = notifications.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        console.log('📬 USER PROFILE - Notifications loaded successfully:', notifications.length);
        console.log('📬 USER PROFILE - Notification details:', notifications);
        this.isLoadingNotifications = false;
      },
      error: (error) => {
        console.error('❌ USER PROFILE - Error loading notifications:', error);
        this.isLoadingNotifications = false;
        this.notifications = [];
      }
    });

    // Load unread count
    this.notificationService.getUnreadNotificationCount(userId).subscribe({
      next: (count) => {
        this.unreadNotificationCount = count;
        this.lastNotificationCount = count;
        console.log('🔢 USER PROFILE - Unread notifications count:', count);
      },
      error: (error) => {
        console.error('❌ USER PROFILE - Error loading unread notification count:', error);
        this.unreadNotificationCount = 0;
      }
    });
  }

  // Helper methods and getters (unchanged)
  getCompletionPercentage(): number {
    if (this.totalTasks === 0) return 0;
    return Math.round((this.completedTasks / this.totalTasks) * 100);
  }

  get completionPercentage() {
    return this.getCompletionPercentage();
  }

  clearError() {
    this.error = null;
  }

  retryLoadingTasks() {
    this.clearError();
    this.loadUserTasks();
  }

  refreshTaskData() {
    console.log('🔄 Refreshing task data...');
    this.loadUserTasks();
  }

  getOverdueTasksCount(): number {
    return this.userTasks.filter(task => 
      task.status !== 'COMPLETED' && 
      task.dueDate && 
      this.isTaskOverdue(task.dueDate)
    ).length;
  }

  isTaskOverdue(dueDate: string): boolean {
    try {
      const due = new Date(dueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return due < today;
    } catch (error) {
      return false;
    }
  }

  getUpcomingTasksCount(): number {
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
    
    return this.userTasks.filter(task => 
      task.status !== 'COMPLETED' && 
      task.dueDate && 
      !this.isTaskOverdue(task.dueDate) &&
      new Date(task.dueDate) <= threeDaysFromNow
    ).length;
  }

  getTaskDistribution() {
    return {
      completed: this.completedTasks,
      inProgress: this.inProgressTasksCount,
      pending: this.pendingTasks,
      total: this.totalTasks,
      completionRate: this.getCompletionPercentage()
    };
  }

  // Local task management methods (unchanged)
  addTask() {
    if (this.newTask.title && this.newTask.description) {
      const task: LocalTask = {
        id: this.localTasks.length + 1,
        title: this.newTask.title!,
        description: this.newTask.description!,
        dueDate: this.newTask.dueDate!,
        dueTime: this.newTask.dueTime!,
        estimatedHours: this.newTask.estimatedHours!,
        status: 'pending',
        priority: this.newTask.priority as 'high' | 'medium' | 'low',
        category: this.newTask.category || '',
        assignee: this.newTask.assignee || ''
      };
      this.localTasks.push(task);
      this.showAddTaskDialog = false;
      this.resetNewTask();
    }
  }

  resetNewTask() {
    this.newTask = {
      title: '',
      description: '',
      dueDate: new Date(),
      dueTime: '09:00',
      estimatedHours: 1,
      priority: 'medium',
      category: '',
      assignee: ''
    };
  }

  getPriorityColor(priority: string): string {
    switch (priority) {
      case 'high':
        return '#ef4444';
      case 'medium':
        return '#f59e0b';
      case 'low':
        return '#10b981';
      default:
        return '#6b7280';
    }
  }

  getStatusColor(status: string): string {
    return status === 'completed' ? '#10b981' : '#f59e0b';
  }

  formatTime(time: string): string {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minutes} ${ampm}`;
  }

  // Navigation methods
  viewAllTasks() {
    this.router.navigate(['/employee/tasks']);
  }

  viewCompletedTasks() {
    this.router.navigate(['/employee/tasks'], { queryParams: { status: 'completed' } });
  }

  viewPendingTasks() {
    this.router.navigate(['/employee/tasks'], { queryParams: { status: 'pending' } });
  }

  viewInProgressTasks() {
    this.router.navigate(['/employee/tasks'], { queryParams: { status: 'in-progress' } });
  }

  saveDraft() {
    console.log('Saving draft...');
  }

  exportAnalytics() {
    console.log('Exporting analytics...');
  }

  // Template helper getters
  get pendingTasksList() {
    return this.userTasks?.filter(t => t.status === 'TODO') || [];
  }

  get completedTasksList() {
    return this.userTasks?.filter(t => t.status === 'COMPLETED') || [];
  }

  get hasNoPendingTasks() {
    return !this.userTasks || this.pendingTasksList.length === 0;
  }

  get hasCompletedTasks() {
    return this.userTasks && this.completedTasksList.length > 0;
  }

  get hasMoreThanThreeCompletedTasks() {
    return this.userTasks && this.completedTasksList.length > 3;
  }

  get displayedCompletedTasks() {
    return this.showAllCompleted ? 
      this.completedTasksList : 
      this.completedTasksList.slice(0, 3);
  }

  /**
   * Track notifications by ID for performance optimization
   */
  trackNotificationBy(index: number, notification: Notification): number {
    return notification.id;
  }

  /**
   * Debug method to inspect token structure (can be called from browser console)
   * Usage: component.debugTokenStructure()
   */
  debugTokenStructure(): void {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('❌ USER PROFILE - No token found in localStorage');
        return;
      }
      
      const payload = JSON.parse(atob(token.split('.')[1]));
      console.group('🔍 USER PROFILE - JWT Token Debug Information');
      console.log('📋 Full payload:', payload);
      console.log('🔑 Available fields:', Object.keys(payload));
      console.log('📧 Email field:', payload.email);
      console.log('👤 Sub field:', payload.sub);
      console.log('🆔 ID field:', payload.id);
      console.log('🆔 User ID field:', payload.userId);
      console.log('🆔 User_ID field:', payload.user_id);
      console.log('🆔 UID field:', payload.uid);
      console.log('🏢 Department:', payload.department);
      console.log('👔 Role:', payload.role);
      console.groupEnd();
      
      // Try to extract user ID using our logic
      const extractedUserId = this.getUserIdFromToken();
      console.log('✅ USER PROFILE - Extracted User ID using our method:', extractedUserId);
      
      // Test notification service connection
      if (extractedUserId) {
        console.log('🔔 USER PROFILE - Testing notification service connection...');
        this.testNotificationConnection(extractedUserId);
      }
      
    } catch (error) {
      console.error('❌ USER PROFILE - Error debugging token:', error);
    }
  }

  /**
   * Test notification service connection (debug method)
   */
  private testNotificationConnection(userId: number): void {
    console.log('🔔 USER PROFILE - Testing notification service for user:', userId);
    
    // Test unread count first
    this.notificationService.getUnreadNotificationCount(userId).subscribe({
      next: (count) => {
        console.log('✅ USER PROFILE - Notification service connection successful! Unread count:', count);
        
        // Test full notification list
        this.notificationService.getUserNotifications(userId).subscribe({
          next: (notifications) => {
            console.log('✅ USER PROFILE - Full notification list retrieved:', notifications.length, 'notifications');
            console.log('📬 USER PROFILE - Notification details:', notifications);
            
            // Update local state for immediate display
            this.notifications = notifications.sort((a, b) => 
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
            this.unreadNotificationCount = count;
            this.isLoadingNotifications = false;
            
            console.log('✅ USER PROFILE - Notifications updated in component state');
          },
          error: (error) => {
            console.error('❌ USER PROFILE - Error getting notification list:', error);
          }
        });
      },
      error: (error) => {
        console.error('❌ USER PROFILE - Error connecting to notification service:', error);
      }
    });
  }
} 
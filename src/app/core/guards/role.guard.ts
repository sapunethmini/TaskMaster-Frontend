// src/app/core/guards/role.guard.ts
import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot } from '@angular/router';
import { UserService } from '../../services/user-service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  
  constructor(
    private userService: UserService,
    private router: Router
  ) {}
  
  canActivate(route: ActivatedRouteSnapshot): boolean {
    const requiredRole = route.data['role'];
    console.log('RoleGuard: Checking access for role:', requiredRole);
    
    if (!this.userService.isLoggedIn()) {
      console.log('RoleGuard: User not logged in, redirecting to login page');
      this.router.navigate(['/login']);
      return false;
    }
    
    const currentUser = this.userService.getCurrentUser();
    console.log('RoleGuard: Current user:', currentUser);
    console.log('RoleGuard: Current user role:', currentUser?.role);
    console.log('RoleGuard: Required role:', requiredRole);
    
    if (requiredRole === 'admin' && currentUser?.role !== 'ROLE_ADMIN') {
      console.log('RoleGuard: User does not have admin role, redirecting to unauthorized page');
      this.router.navigate(['/unauthorized']);
      return false;
    }
    
    if (requiredRole === 'employee' && currentUser?.role !== 'ROLE_EMPLOYEE') {
      console.log('RoleGuard: User does not have employee role, redirecting to unauthorized page');
      this.router.navigate(['/unauthorized']);
      return false;
    }
    
    console.log('RoleGuard: Access granted for role:', requiredRole);
    return true;
  }
}
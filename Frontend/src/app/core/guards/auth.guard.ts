// role.guard.ts
import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot } from '@angular/router';
import { UserService } from  '../../services/user-service';

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
    
    if (!this.userService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return false;
    }
    
    if (requiredRole === 'admin' && !this.userService.isAdmin()) {
      this.router.navigate(['/unauthorized']);
      return false;
    }
    
    if (requiredRole === 'employee' && !this.userService.isEmployee()) {
      this.router.navigate(['/unauthorized']);
      return false;
    }
    
    return true;
  }
}
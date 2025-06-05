import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { MessageModule } from 'primeng/message';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { UserService } from '../../../services/user-service'; // Make sure this path is correct

@Component({
  selector: 'app-user-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextModule,
    PasswordModule,
    ButtonModule,
    CheckboxModule,
    MessageModule,
    RouterModule  
  ],
  templateUrl: './user-login.component.html',
  styleUrl: './user-login.component.css'
})
export class UserLoginComponent implements OnInit, AfterViewInit, OnDestroy {
  loginForm: FormGroup;
  submitted = false;
  loading = false;
  errorMessage = '';
  
  private starsAnimationId: number = 0;
  private snowAnimationId: number = 0;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
      rememberMe: [false]
    });
  }

  ngOnInit() {
    // Component initialization
  }

  ngAfterViewInit() {
    // Add boxicons link to head if not already present
    if (!document.querySelector('link[href*="boxicons"]')) {
      const link = document.createElement('link');
      link.href = 'https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css';
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }

    // Initialize animations
    this.initStarField();
    this.initSnowEffect();
  }

  ngOnDestroy() {
    // Clean up animations
    if (this.starsAnimationId) {
      cancelAnimationFrame(this.starsAnimationId);
    }
    if (this.snowAnimationId) {
      cancelAnimationFrame(this.snowAnimationId);
    }
  }

  private initStarField() {
    const canvas = document.getElementById('stars') as HTMLCanvasElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const stars: any[] = [];
    const MAX_STARS = 120;
    const SPEED_MIN = 0.3;
    const SPEED_MAX = 1.2;

    const rnd = (min: number, max: number) => Math.random() * (max - min) + min;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const createStar = () => ({
      x: rnd(0, canvas.width),
      y: rnd(0, canvas.height),
      r: rnd(0.5, 2),
      alpha: rnd(0.3, 1),
      speed: rnd(SPEED_MIN, SPEED_MAX),
      twinkle: rnd(0.01, 0.03)
    });

    const initStars = () => {
      for (let i = 0; i < MAX_STARS; i++) {
        stars.push(createStar());
      }
    };

    const animateStars = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      stars.forEach(star => {
        star.alpha += star.twinkle * (Math.random() > 0.5 ? 1 : -1);
        star.alpha = Math.max(0.3, Math.min(1, star.alpha));

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${star.alpha})`;
        ctx.fill();
      });

      this.starsAnimationId = requestAnimationFrame(animateStars);
    };

    window.addEventListener('resize', resize);
    resize();
    initStars();
    animateStars();
  }

  private initSnowEffect() {
    const canvas = document.getElementById('snow') as HTMLCanvasElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const flakes: any[] = [];
    const MAX = 120;
    const SPEED_MIN = 0.5;
    const SPEED_MAX = 1.8;
    const SIZE_MIN = 1;
    const SIZE_MAX = 3;
    const WIND = 0.15;

    const rnd = (min: number, max: number) => Math.random() * (max - min) + min;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const spawn = () => {
      flakes.push({
        x: rnd(0, canvas.width),
        y: -10,
        r: rnd(SIZE_MIN, SIZE_MAX),
        vy: rnd(SPEED_MIN, SPEED_MAX),
        vx: rnd(-WIND, WIND)
      });
    };

    const animateSnow = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (flakes.length < MAX) spawn();

      flakes.forEach((f, i) => {
        f.x += f.vx;
        f.y += f.vy;

        if (f.y > canvas.height + 10 || f.x < -10 || f.x > canvas.width + 10) {
          flakes.splice(i, 1);
        } else {
          ctx.beginPath();
          ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(255,255,255,0.9)';
          ctx.fill();
        }
      });

      this.snowAnimationId = requestAnimationFrame(animateSnow);
    };

    window.addEventListener('resize', resize);
    resize();
    animateSnow();
  }

  get f() {
    return this.loginForm.controls;
  }

  onSubmit() {
    this.submitted = true;
    this.errorMessage = '';
    
    if (this.loginForm.invalid) {
      return;
    }
    
    this.loading = true;
    
    const credentials = {
      username: this.loginForm.value.username,
      password: this.loginForm.value.password
    };
    
    console.log('Login form submitted:', credentials);
    
    // In user-login.component.ts
    this.userService.login(credentials).subscribe({
      next: (response) => {
        console.log('Login successful, response:', response);
        this.loading = false;
        
        // If remember me is checked, store this preference
        if (this.loginForm.value.rememberMe) {
          localStorage.setItem('rememberMe', 'true');
        }
        
        // Navigate based on user role from response
        if (response.role === 'ROLE_ADMIN') {
          this.router.navigate(['/admin/dashboard']);
        } else if (response.role === 'ROLE_EMPLOYEE') {
          this.router.navigate(['/employee/dashboard']);
        } else {
          console.error('Unknown role:', response.role);
          this.errorMessage = 'Invalid user role';
        }
      },
      error: (error) => {
        console.error('Login error:', error);
        this.loading = false;
        this.errorMessage = error.error?.message || 'Invalid username or password';
      }
    });
  }
}
import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../../services/user-service'; // Ensure path is correct

@Component({
  selector: 'app-user-signup',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './user-signup.component.html',
  styleUrl: './user-signup.component.css'
})
export class UserSignupComponent implements OnInit, AfterViewInit, OnDestroy {
  signupForm!: FormGroup;
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
    console.log('UserSignupComponent: Constructor initialized');
  }
  
  ngOnInit() {
    console.log('UserSignupComponent: ngOnInit called');
    this.initForm();
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
  
  initForm() {
    this.signupForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],  
      confirmPassword: ['', Validators.required]
    }, {
      validators: this.passwordMatchValidator
    });
    
    console.log('UserSignupComponent: Form initialized', this.signupForm);
  }
  
  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    
    if (password === confirmPassword) {
      return null;
    }
    
    return { passwordMismatch: true };
  }
  
  get f() {
    return this.signupForm.controls;
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
    const MAX = 330;
    const SPEED_MIN = 0.5;
    const SPEED_MAX = 1.8;
    const SIZE_MIN = 1;
    const SIZE_MAX = 2.6;
    const WIND = 0.55;

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

        if (f.y > canvas.height + 40 || f.x < -10 || f.x > canvas.width + 10) {
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

  private animateStars() {
    // This method is referenced in the star animation
    this.initStarField();
  }

  private animateSnow() {
    // This method is referenced in the snow animation
    this.initSnowEffect();
  }
  
  onSubmit() {
    console.log('UserSignupComponent: onSubmit called');
    this.submitted = true;
    this.errorMessage = '';
    
    if (this.signupForm.invalid) {
      // Your existing form validation code...
      return;
    }
    
    this.loading = true;
    
    // Prepare the data
    const userData = {
      username: this.signupForm.value.username,
      password: this.signupForm.value.password
    };
    
    console.log('UserSignupComponent: Submitting user data', userData);
    
    this.userService.signup(userData).subscribe({
      next: (response) => {
        console.log('Signup successful, redirecting to login');
        this.loading = false;
        this.router.navigate(['/login']);
      },
      error: (error) => {
        console.error('Signup error:', error);
        this.loading = false;
        
        // Check if the error is actually a successful response (status 201)
        if (error.status === 201) {
          console.log('Error is actually a successful response. Redirecting to login.');
          this.router.navigate(['/login']);
        } else {
          this.errorMessage = error.error?.message || 'Signup failed. Please try again.';
        }
      }
    });
  }
}
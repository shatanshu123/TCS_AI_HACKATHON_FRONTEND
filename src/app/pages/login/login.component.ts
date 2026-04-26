import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  isSignUp = signal(false);
  loginForm: FormGroup;
  signupForm: FormGroup;
  errorMessage = signal('');
  isLoading = signal(false);

  constructor(
    private fb: FormBuilder,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    this.signupForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(group: FormGroup) {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  toggleMode() {
    this.isSignUp.update(value => !value);
    this.errorMessage.set('');
  }

  onLogin() {
    if (this.loginForm.invalid) {
      this.errorMessage.set('Please fill in all fields correctly');
      return;
    }

    this.isLoading.set(true);

    // Disabled login process - just navigate to dashboard
    setTimeout(() => {
      this.router.navigate(['/dashboard']);
      this.isLoading.set(false);
    }, 500);
  }

  onSignup() {
    if (this.signupForm.invalid) {
      this.errorMessage.set('Please fill in all fields correctly');
      return;
    }

    this.isLoading.set(true);

    // Disabled signup process - just navigate to dashboard
    setTimeout(() => {
      this.router.navigate(['/dashboard']);
      this.isLoading.set(false);
    }, 500);
  }

  // Demo credentials
  fillDemoCredentials() {
    this.loginForm.patchValue({
      email: 'john@example.com',
      password: 'password123'
    });
  }
}

import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

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
    private router: Router,
    private authService: AuthService
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

  clearErrorMessage() {
    this.errorMessage.set('');
  }

  onLogin() {
    if (this.loginForm.invalid) {
      console.log('Form invalid, validation errors:', this.loginForm.errors);
      this.errorMessage.set('Please fill in all fields correctly');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    const { email, password } = this.loginForm.value;
    console.log('Form values:', { email, password, formValue: this.loginForm.value });

    this.authService.login(email, password)
      .then((response: any) => {
        this.isLoading.set(false);
        if (response.otp_required && response.user) {
          this.router.navigate(['/verify-otp'], { queryParams: { email, userId: response.user.id } });
        } else {
          this.router.navigate(['/dashboard']);
        }
      })
      .catch((error: any) => {
        this.isLoading.set(false);
        this.errorMessage.set(error?.message || 'Login failed');
      });
  }

  onSignup() {
    if (this.signupForm.invalid) {
      this.errorMessage.set('Please fill in all fields correctly');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    const { name, email, password, confirmPassword } = this.signupForm.value;

    this.authService.signup(name, email, password, confirmPassword)
      .then((response: any) => {
        this.isLoading.set(false);
        if (response.otp_required && response.user) {
          this.router.navigate(['/verify-otp'], { queryParams: { email, userId: response.user.id } });
        } else {
          this.router.navigate(['/dashboard']);
        }
      })
      .catch((error: any) => {
        this.isLoading.set(false);
        this.errorMessage.set(error?.message || 'Signup failed');
      });
  }
}

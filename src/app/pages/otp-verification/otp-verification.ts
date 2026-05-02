import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-otp-verification',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './otp-verification.html',
  styleUrls: ['./otp-verification.css'],
})
export class OtpVerification {
  otpForm: FormGroup;
  errorMessage = signal('');
  isLoading = signal(false);
  email = signal('');
  userId = signal('');

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService
  ) {
    this.otpForm = this.fb.group({
      otp: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]]
    });

    // Get email and userId from query params
    this.route.queryParams.subscribe(params => {
      this.email.set(params['email'] || '');
      this.userId.set(params['userId'] || '');
    });
  }

  onVerify() {
    if (this.otpForm.invalid) {
      this.errorMessage.set('Please enter a valid 6-digit OTP');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    const { otp } = this.otpForm.value;

    this.authService.verifyOtp(this.userId(), otp).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        this.isLoading.set(false);
        this.errorMessage.set(error.message);
      }
    });
  }

  onResendOtp() {
    if (!this.email()) {
      this.errorMessage.set('Email not available');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    this.authService.sendOtp(this.email()).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        // In demo, OTP is returned, but in real app, it's sent via email
        console.log('OTP sent:', response.otp);
      },
      error: (error) => {
        this.isLoading.set(false);
        this.errorMessage.set(error.message);
      }
    });
  }
}

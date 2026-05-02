import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, from, throwError, firstValueFrom } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';

export interface AuthUser {
  id: string;
  full_name: string;
  email: string;
  created_at: string;
  last_login?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = '/auth';
  private currentUser = signal<AuthUser | null>(null);
  private isAuthenticated = signal(false);

  constructor(private http: HttpClient, private router: Router) {
    this.checkAuthStatus();
  }

  getCurrentUser() {
    return this.currentUser.asReadonly();
  }

  isAuthenticatedSignal() {
    return this.isAuthenticated.asReadonly();
  }

  async login(email: string, password: string): Promise<any> {
    console.log('Login called with email:', email);
    const password_hash = await this.hashPassword(password);
    console.log('Password hash generated:', password_hash);
    
    return firstValueFrom(
      this.http.post<any>(`${this.apiUrl}/login`, { email, password_hash }, { withCredentials: true }).pipe(
        tap(response => {
          if (response.user && !response.otp_required) {
            this.currentUser.set(response.user);
            this.isAuthenticated.set(true);
            localStorage.setItem('authUser', JSON.stringify(response.user));
          }
        }),
        catchError(this.handleError)
      )
    );
  }

  async signup(full_name: string, email: string, password: string, confirm_password: string): Promise<any> {
    const password_hash = await this.hashPassword(password);
    
    return firstValueFrom(
      this.http.post<any>(`${this.apiUrl}/signup`, {
        full_name,
        email,
        password_hash,
        confirm_password_hash: password_hash,
      }).pipe(
        tap(response => {
          if (response.user && !response.otp_required) {
            this.currentUser.set(response.user);
            this.isAuthenticated.set(true);
            localStorage.setItem('authUser', JSON.stringify(response.user));
          }
        }),
        catchError(this.handleError)
      )
    );
  }

  sendOtp(email: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/send-otp`, { email });
  }

  verifyOtp(userId: string, otp: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/verify-otp`, { user_id: userId, otp_code: otp }, { withCredentials: true })
      .pipe(
        tap(response => {
          if (response.user) {
            this.currentUser.set(response.user);
            this.isAuthenticated.set(true);
            localStorage.setItem('authUser', JSON.stringify(response.user));
          }
        }),
        catchError(this.handleError)
      );
  }

  logout(): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/logout`, {}, { withCredentials: true })
      .pipe(
        tap(() => {
          // Success case
        }),
        catchError(error => {
          // Log the error but continue with logout
          console.warn('Logout request failed:', error);
          return throwError(() => error);
        }),
        tap({
          next: () => {
            // Clear state on success
            this.currentUser.set(null);
            this.isAuthenticated.set(false);
            localStorage.removeItem('authUser');
            this.router.navigate(['/login']);
          },
          error: () => {
            // Clear state even on error to ensure logout
            this.currentUser.set(null);
            this.isAuthenticated.set(false);
            localStorage.removeItem('authUser');
            this.router.navigate(['/login']);
          }
        })
      );
  }

  private checkAuthStatus(): void {
    const storedUser = localStorage.getItem('authUser');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      this.currentUser.set(user);
      this.isAuthenticated.set(true);
    }

    this.refreshCurrentUser();
  }

  private refreshCurrentUser(): void {
    this.http.get<any>(`${this.apiUrl}/me`, { withCredentials: true }).subscribe({
      next: response => {
        if (response.user) {
          this.currentUser.set(response.user);
          this.isAuthenticated.set(true);
          localStorage.setItem('authUser', JSON.stringify(response.user));
        } else {
          this.clearAuthState();
        }
      },
      error: () => {
        this.clearAuthState();
      }
    });
  }

  private clearAuthState(): void {
    this.currentUser.set(null);
    this.isAuthenticated.set(false);
    localStorage.removeItem('authUser');
  }

  private async hashPassword(password: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const digest = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(digest))
      .map(byte => byte.toString(16).padStart(2, '0'))
      .join('');
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An unknown error occurred';
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = error.error.message;
    } else {
      // Server-side error
      if (error.error && error.error.error) {
        errorMessage = error.error.error;
      } else {
        errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
      }
    }
    return throwError(() => new Error(errorMessage));
  }
}

import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  lastLogin?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUser = signal<AuthUser | null>(null);
  private isAuthenticated = signal(false);
  private users = signal<AuthUser[]>([
    { id: '1', name: 'John Doe', email: 'john@example.com' },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com' }
  ]);

  constructor(private router: Router) {
    this.loadUserFromStorage();
  }

  getCurrentUser() {
    return this.currentUser.asReadonly();
  }

  isAuthenticatedSignal() {
    return this.isAuthenticated.asReadonly();
  }

  login(email: string, password: string): boolean {
    // Mock authentication - in production, call your API
    const user = this.users().find(u => u.email === email);
    if (user && password.length >= 6) {
      const userWithLogin = { ...user, lastLogin: new Date() };
      this.currentUser.set(userWithLogin);
      this.isAuthenticated.set(true);
      localStorage.setItem('authUser', JSON.stringify(userWithLogin));
      localStorage.setItem('authToken', 'mock-token-' + Date.now());
      return true;
    }
    return false;
  }

  signup(name: string, email: string, password: string): boolean {
    // Mock signup - in production, call your API
    if (password.length < 6) {
      return false;
    }

    const existingUser = this.users().find(u => u.email === email);
    if (existingUser) {
      return false; // User already exists
    }

    const newUser: AuthUser = {
      id: (this.users().length + 1).toString(),
      name: name,
      email: email,
      lastLogin: new Date()
    };

    this.users.update(users => [...users, newUser]);
    this.currentUser.set(newUser);
    this.isAuthenticated.set(true);
    localStorage.setItem('authUser', JSON.stringify(newUser));
    localStorage.setItem('authToken', 'mock-token-' + Date.now());
    return true;
  }

  logout(): void {
    this.currentUser.set(null);
    this.isAuthenticated.set(false);
    localStorage.removeItem('authUser');
    localStorage.removeItem('authToken');
    this.router.navigate(['/login']);
  }

  private loadUserFromStorage(): void {
    const storedUser = localStorage.getItem('authUser');
    const token = localStorage.getItem('authToken');
    if (storedUser && token) {
      const user = JSON.parse(storedUser);
      // Parse lastLogin back to Date object if it exists
      if (user.lastLogin) {
        user.lastLogin = new Date(user.lastLogin);
      }
      this.currentUser.set(user);
      this.isAuthenticated.set(true);
    } else {
      // Set default user since login is disabled
      const defaultUser: AuthUser = { 
        id: '1', 
        name: 'Demo User', 
        email: 'demo@example.com',
        lastLogin: new Date()
      };
      this.currentUser.set(defaultUser);
      this.isAuthenticated.set(true);
    }
  }
}

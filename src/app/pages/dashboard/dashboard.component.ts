import { Component, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { InvoiceProcessingService, InvoiceData } from '../../invoice-processing.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {
  protected readonly title = signal('Invoice Processing Dashboard');
  
  files: File[] = [];
  processing = signal(false);
  results = signal<InvoiceData[]>([]);
  currentIndex = signal(0);
  progress = signal<{ current: number; total: number }>({ current: 0, total: 0 });
  uploadedCount = signal(0);
  processedCount = signal(0);
  errorCount = signal(0);
  showProfileDropdown = signal(false);

  constructor(
    private invoiceService: InvoiceProcessingService,
    private authService: AuthService,
    private router: Router
  ) {}

  get currentUser() {
    return this.authService.getCurrentUser();
  }

  onFileSelected(event: any) {
    this.files = Array.from(event.target.files);
    this.uploadedCount.set(this.files.length);
  }

  async processInvoices() {
    if (this.files.length === 0) return;

    this.processing.set(true);
    this.results.set([]);
    this.progress.set({ current: 0, total: this.files.length });
    this.processedCount.set(0);
    this.errorCount.set(0);

    for (let i = 0; i < this.files.length; i++) {
      const file = this.files[i];
      this.progress.update(p => ({ ...p, current: i + 1 }));

      try {
        const data = await this.invoiceService.processFile(file);
        this.results.update(results => [...results, data]);
        this.processedCount.update(count => count + 1);
      } catch (error) {
        this.errorCount.update(count => count + 1);
        console.error('Error processing file:', error);
      }
    }

    this.processing.set(false);
    this.progress.set({ current: 0, total: 0 });
  }

  nextInvoice() {
    if (this.currentIndex() < this.results().length - 1) {
      this.currentIndex.update(i => i + 1);
    }
  }

  previousInvoice() {
    if (this.currentIndex() > 0) {
      this.currentIndex.update(i => i - 1);
    }
  }

  downloadResults() {
    const dataStr = JSON.stringify(this.results(), null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `invoice-results-${new Date().getTime()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  clearResults() {
    this.results.set([]);
    this.files = [];
    this.currentIndex.set(0);
    this.uploadedCount.set(0);
    this.processedCount.set(0);
    this.errorCount.set(0);
  }

  toggleProfileDropdown() {
    this.showProfileDropdown.update(value => !value);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;
    const profileContainer = target.closest('.profile-container');
    if (!profileContainer) {
      this.showProfileDropdown.set(false);
    }
  }

  logout() {
    this.authService.logout();
  }

  formatLastLogin(lastLogin: Date | undefined): string {
    if (!lastLogin) return '';
    
    const now = new Date();
    const diffMs = now.getTime() - lastLogin.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffMinutes < 1) {
      return 'Just now';
    } else if (diffMinutes < 60) {
      return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else {
      return lastLogin.toLocaleDateString();
    }
  }
}

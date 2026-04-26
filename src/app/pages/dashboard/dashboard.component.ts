import { Component, signal, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { InvoiceAPIService } from '../../services/invoice-api.service';
import { InvoiceProcessingService, InvoiceData } from '../../invoice-processing.service';
import { UploadInvoicesResponse, ListInvoicesResponse } from '../../types/invoice-api.types';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
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
  useAPIMode = signal(true); // Use API-based processing
  uploadError = signal<string | null>(null);

  constructor(
    private invoiceService: InvoiceProcessingService,
    private invoiceAPI: InvoiceAPIService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadInvoiceStats();
  }

  loadInvoiceStats() {
    this.invoiceAPI.getAllInvoices().subscribe({
      next: (response: ListInvoicesResponse) => {
        const invoices = response.invoices;
        this.uploadedCount.set(invoices.length);
        this.processedCount.set(invoices.filter(inv => inv.status === 'completed' || inv.status === 'needs_review').length);
        this.errorCount.set(invoices.filter(inv => inv.status === 'failed' || !inv.validation.valid).length);
      },
      error: (err) => {
        console.error('Failed to load invoice stats:', err);
      }
    });
  }

  get currentUser() {
    return this.authService.getCurrentUser();
  }

  onFileSelected(event: any) {
    const selectedFiles = Array.from(event.target.files) as File[];
    if (selectedFiles.length === 0) {
      return;
    }

    if (selectedFiles.length > 1) {
      this.uploadError.set('You can upload only one PDF file at a time.');
      return;
    }

    const file = selectedFiles[0];
    const fileType = file.type || '';
    const isPdf = fileType === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    if (!isPdf) {
      this.uploadError.set('Only PDF files are allowed. Please select a valid PDF file.');
      return;
    }

    this.uploadError.set(null);
    this.processing.set(true);
    this.uploadedCount.set(1);
    this.files = selectedFiles;
    this.progress.set({ current: 0, total: 1 });

    this.invoiceAPI.uploadInvoices(selectedFiles).subscribe({
      next: (response: UploadInvoicesResponse) => {
        this.processing.set(false);
        this.files = [];
        this.uploadedCount.set(0);
        this.progress.set({ current: 0, total: 0 });
        this.router.navigate(['/invoice-list']);
      },
      error: (err) => {
        console.error('Upload failed:', err);
        this.uploadError.set('Failed to upload file. Please try again.');
        this.processing.set(false);
      }
    });
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

  formatLastLogin(date?: string | Date): string {
    if (!date) return '';

    const parsed = typeof date === 'string' ? new Date(date) : date;
    if (Number.isNaN(parsed.getTime())) return '';

    const now = new Date();
    const diffMs = now.getTime() - parsed.getTime();
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
      return parsed.toLocaleDateString();
    }
  }

  toggleProfileDropdown() {
    this.showProfileDropdown.update(state => !state);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.profile-container')) {
      this.showProfileDropdown.set(false);
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  navigateTo(path: string) {
    this.router.navigate([path]);
  }

  downloadResults() {
    const data = JSON.stringify(this.results(), null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `invoice-results-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  clearResults() {
    this.results.set([]);
    this.currentIndex.set(0);
    this.processedCount.set(0);
    this.errorCount.set(0);
  }
}

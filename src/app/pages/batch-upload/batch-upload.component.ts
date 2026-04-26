import { Component, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { InvoiceAPIService } from '../../services/invoice-api.service';
import { UploadInvoicesResponse } from '../../types/invoice-api.types';

@Component({
  selector: 'app-batch-upload',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './batch-upload.component.html',
  styleUrls: ['./batch-upload.component.css']
})
export class BatchUploadComponent implements OnInit, OnDestroy {
  uploading = signal(false);
  error = signal<string | null>(null);
  files: File[] = [];
  progress = signal<{ current: number; total: number }>({ current: 0, total: 0 });

  constructor(
    private invoiceAPI: InvoiceAPIService,
    private router: Router
  ) {}

  ngOnInit() {
    // Clear any previous batch job data
    sessionStorage.removeItem('batchJobId');
  }

  ngOnDestroy() {
    // Cleanup if needed
  }

  onFileSelected(event: any) {
    const selectedFiles = Array.from(event.target.files) as File[];
    if (selectedFiles.length === 0) {
      return;
    }

    if (selectedFiles.length > 50) {
      this.error.set('You can upload up to 50 files at once. Please select fewer files.');
      return;
    }

    const invalidFile = selectedFiles.find((file) => {
      const fileType = file.type || '';
      const isPdf = fileType === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
      return !isPdf;
    });
    if (invalidFile) {
      this.error.set('Only PDF files are allowed. Please select valid PDF files.');
      return;
    }

    this.error.set(null);
    this.uploading.set(true);
    this.files = selectedFiles;
    this.progress.set({ current: 0, total: selectedFiles.length });

    this.invoiceAPI.uploadInvoices(selectedFiles).subscribe({
      next: (response: UploadInvoicesResponse) => {
        this.uploading.set(false);
        this.files = [];
        this.progress.set({ current: 0, total: 0 });
        // Redirect to invoice list after successful upload
        this.router.navigate(['/invoice-list']);
      },
      error: (err) => {
        console.error('Upload failed:', err);
        this.error.set('Failed to upload file(s). Please try again.');
        this.uploading.set(false);
      }
    });
  }
}

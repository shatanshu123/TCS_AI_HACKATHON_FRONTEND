import { Component, OnInit, signal } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { InvoiceAPIService } from '../../services/invoice-api.service';
import { Invoice, ListInvoicesResponse } from '../../types/invoice-api.types';

@Component({
  selector: 'app-invoice-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './invoice-list.component.html',
  styleUrls: ['./invoice-list.component.css']
})
export class InvoiceListComponent implements OnInit {
  invoices = signal<Invoice[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  selectedInvoice = signal<Invoice | null>(null);
  showDetailsModal = signal(false);

  constructor(
    private invoiceAPI: InvoiceAPIService,
    private router: Router,
    private location: Location
  ) {}

  ngOnInit() {
    this.loadInvoices();
  }

  loadInvoices() {
    this.loading.set(true);
    this.error.set(null);

    this.invoiceAPI.getAllInvoices().subscribe({
      next: (response: ListInvoicesResponse) => {
        this.invoices.set(response.invoices);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load invoices:', err);
        this.error.set('Failed to load invoices. Please try again.');
        this.loading.set(false);
      }
    });
  }

  getConfidenceColor(confidence: number): string {
    if (confidence >= 80) return '#4CAF50';
    if (confidence >= 50) return '#FFC107';
    return '#F44336';
  }

  getConfidenceLevel(confidence: number): string {
    if (confidence >= 80) return 'High';
    if (confidence >= 50) return 'Medium';
    return 'Low';
  }

  getExtractionKeys(extraction: Record<string, any> | null | undefined): string[] {
    return extraction ? Object.keys(extraction) : [];
  }

  getExtractionValue(extraction: Record<string, any> | null | undefined, key: string): string {
    return extraction?.[key]?.value || 'N/A';
  }

  getExtractionConfidence(extraction: Record<string, any> | null | undefined, key: string): number {
    return extraction?.[key]?.confidence ?? 0;
  }

  getExtractionSource(extraction: Record<string, any> | null | undefined, key: string): string {
    return extraction?.[key]?.source || 'N/A';
  }

  editInvoice(invoice: Invoice) {
    this.router.navigate(['/invoice-detail', invoice.id]);
  }

  downloadInvoice(invoice: Invoice, event: Event) {
    event.stopPropagation();
    this.invoiceAPI.downloadInvoiceFile(invoice.id).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = invoice.original_filename;
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        console.error('Failed to download invoice:', err);
        alert('Failed to download invoice');
      }
    });
  }

  refreshInvoices() {
    this.loadInvoices();
  }

  goBack() {
    this.location.back();
  }
}

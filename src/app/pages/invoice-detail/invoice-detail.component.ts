import { Component, OnInit, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { InvoiceAPIService } from '../../services/invoice-api.service';
import { Invoice, UIConfidenceVisualization, ReviewFields } from '../../types/invoice-api.types';

@Component({
  selector: 'app-invoice-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './invoice-detail.component.html',
  styleUrls: ['./invoice-detail.component.css']
})
export class InvoiceDetailComponent implements OnInit {
  invoice = signal<Invoice | null>(null);
  uiVisualization = signal<UIConfidenceVisualization | null>(null);
  trustedHtmlReport = signal<SafeHtml | null>(null);
  readonly Object = Object;
  loading = signal(false);
  error = signal<string | null>(null);
  visualizationError = signal<{ field?: string; message: string } | null>(null);
  editingFields = signal<{ [key: string]: string }>({});
  isEditing = signal(false);
  savingChanges = signal(false);
  activeTab = signal<'extraction' | 'confidence' | 'visualization'>('extraction');

  private invoiceId: string | null = null;

  constructor(
    private invoiceAPI: InvoiceAPIService,
    private route: ActivatedRoute,
    private router: Router,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      this.invoiceId = params.get('id');
      if (this.invoiceId) {
        this.loadInvoice();
      }
    });
  }

  loadInvoice() {
    if (!this.invoiceId) return;

    this.loading.set(true);
    this.error.set(null);

    this.invoiceAPI.getInvoiceDetails(this.invoiceId).subscribe({
      next: (invoice: Invoice) => {
        this.invoice.set(invoice);
        this.initializeEditingFields(invoice);
        this.loadVisualizationData();
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load invoice:', err);
        this.error.set('Failed to load invoice details. Please try again.');
        this.loading.set(false);
      }
    });
  }

  loadVisualizationData() {
    if (!this.invoiceId) return;

    this.visualizationError.set(null);
    this.invoiceAPI.getUIConfidenceVisualization(this.invoiceId).subscribe({
      next: (visualization: UIConfidenceVisualization) => {
        this.uiVisualization.set(visualization);
        this.trustedHtmlReport.set(
          visualization?.widget_data?.html_report
            ? this.sanitizer.bypassSecurityTrustHtml(visualization.widget_data.html_report)
            : null
        );
        this.visualizationError.set(null);
      },
      error: (err) => {
        console.error('Failed to load visualization:', err);
        this.trustedHtmlReport.set(null);
        // Extract error information from API response
        const errorInfo = this.extractErrorInfo(err);
        this.visualizationError.set(errorInfo);
      }
    });
  }

  private extractErrorInfo(err: any): { field?: string; message: string } {
    // Log the error structure for debugging
    console.error('Detailed error structure:', JSON.stringify(err, null, 2));
    
    // Check if error has a direct error message with field
    if (err.error?.message) {
      return {
        field: err.error?.field,
        message: err.error.message
      };
    }
    
    // Check if error has details with field
    if (err.error?.detail) {
      return {
        field: err.error?.field,
        message: err.error.detail
      };
    }
    
    // Check for nested error object
    if (err.error?.error) {
      const nestedError = err.error.error;
      if (typeof nestedError === 'string') {
        return {
          field: err.error?.field,
          message: nestedError
        };
      }
      if (nestedError?.message) {
        return {
          field: nestedError?.field || err.error?.field,
          message: nestedError.message
        };
      }
    }
    
    // Check for error property as string
    if (err.error && typeof err.error === 'string') {
      return {
        message: err.error
      };
    }
    
    // Check for errors array
    if (err.error?.errors && Array.isArray(err.error.errors)) {
      const errorMessages = err.error.errors.join(', ');
      return {
        field: err.error?.field,
        message: errorMessages
      };
    }
    
    // Check for validation errors in response body
    if (err.error?.validation_errors) {
      const validationErrors = err.error.validation_errors;
      if (Array.isArray(validationErrors) && validationErrors.length > 0) {
        const firstError = validationErrors[0];
        return {
          field: firstError?.field,
          message: firstError?.message || (typeof firstError === 'string' ? firstError : 'Validation error')
        };
      }
    }

    // Check for validation object with errors array (specific to confidence/ui API)
    if (err.error?.validation?.errors && Array.isArray(err.error.validation.errors)) {
      const validationErrors = err.error.validation.errors;
      if (validationErrors.length > 0) {
        const firstError = validationErrors.find((e: any) => e && typeof e === 'object') || validationErrors[0];
        const field = firstError?.field || firstError?.field_name || firstError?.name || err.error?.validation?.field || err.error?.field;
        if (typeof firstError === 'string') {
          return {
            field,
            message: firstError
          };
        }
        return {
          field,
          message: firstError?.message || firstError?.detail || 'Validation error'
        };
      }
    }
    
    // Check for HTTP status error
    if (err.status) {
      let message = `API Error (${err.status})`;
      if (err.statusText) {
        message += `: ${err.statusText}`;
      }
      if (err.error?.message) {
        message += ` - ${err.error.message}`;
      }
      return {
        message: message
      };
    }
    
    // Fallback
    return {
      message: 'Failed to load visualization data. Please try again.'
    };
  }

  initializeEditingFields(invoice: Invoice) {
    const fields: { [key: string]: string } = {};
    Object.keys(invoice.extraction).forEach((key) => {
      fields[key] = invoice.extraction[key]?.value || '';
    });
    this.editingFields.set(fields);
  }

  private normalizeConfidence(confidence: number): number {
    if (confidence > 1) {
      return confidence / 100;
    }
    return confidence;
  }

  getConfidenceColor(confidence: number): string {
    const normalized = this.normalizeConfidence(confidence);
    if (normalized >= 0.8) return '#4CAF50';
    if (normalized >= 0.5) return '#FFC107';
    return '#F44336';
  }

  getConfidenceLevel(confidence: number): string {
    const normalized = this.normalizeConfidence(confidence);
    if (normalized >= 0.8) return 'High';
    if (normalized >= 0.5) return 'Medium';
    return 'Low';
  }

  toggleEditMode() {
    if (this.isEditing()) {
      this.isEditing.set(false);
      this.initializeEditingFields(this.invoice()!);
    } else {
      this.isEditing.set(true);
    }
  }

  saveChanges() {
    if (!this.invoiceId || !this.invoice()) return;

    this.savingChanges.set(true);
    const reviewPayload: ReviewFields = {
      fields: this.normalizeReviewFields(this.editingFields())
    };

    this.invoiceAPI.reviewInvoice(this.invoiceId, reviewPayload).subscribe({
      next: (updatedInvoice: Invoice) => {
        this.invoice.set(updatedInvoice);
        this.isEditing.set(false);
        this.error.set(null);
        this.savingChanges.set(false);
        alert('Invoice updated successfully!');
      },
      error: (err) => {
        console.error('Failed to save changes:', err);
        this.error.set('Failed to save changes. Please try again.');
        this.savingChanges.set(false);
      }
    });
  }

  normalizeReviewFields(fields: { [key: string]: string }): { [key: string]: string } {
    const normalized: { [key: string]: string } = {};
    const dateAliases = ['date', 'Date', 'DATE'];

    Object.keys(fields).forEach((key) => {
      const value = fields[key];
      if (dateAliases.includes(key)) {
        normalized['invoice_date'] = value;
      } else if (key === 'invoice_date' && value !== undefined) {
        normalized[key] = value;
      } else if (!dateAliases.includes(key)) {
        normalized[key] = value;
      }
    });

    return normalized;
  }

  cancelEdit() {
    this.isEditing.set(false);
    this.initializeEditingFields(this.invoice()!);
  }

  downloadInvoice() {
    if (!this.invoiceId || !this.invoice()) return;

    this.invoiceAPI.downloadInvoiceFile(this.invoiceId).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = this.invoice()!.original_filename;
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        console.error('Failed to download invoice:', err);
        alert('Failed to download invoice');
      }
    });
  }

  goBack() {
    this.router.navigate(['/invoice-list']);
  }

  updateFieldValue(field: string, value: string) {
    this.editingFields.update((fields) => ({
      ...fields,
      [field]: value
    }));
  }

  getExtractionKeys(extraction: Record<string, any> | null | undefined): string[] {
    const excludedKeys = ['source', 'tax_id_token'];
    return extraction
      ? Object.keys(extraction).filter((key) => !excludedKeys.includes(key))
      : [];
  }

  getVisualizationFields(): any[] {
    return (this.uiVisualization()?.widget_data?.fields || []).filter(
      (field) => field.field !== 'tax_id_token'
    );
  }

  getInvoiceValidationErrors(): Array<{ field?: string; message: string }> {
    const validation = this.invoice()?.validation;
    console.log('Full validation object:', validation);
    
    if (!validation?.errors) return [];
    
    const errors = validation.errors as any;
    const result: Array<{ field?: string; message: string }> = [];
    
    console.log('Errors type:', typeof errors);
    console.log('Is array?', Array.isArray(errors));
    console.log('Raw errors:', errors);
    
    const addError = (field: string | undefined, message: string) => {
      if (!message) return;
      result.push({ field, message });
    };
    
    const parseItem = (err: any, defaultField?: string) => {
      if (typeof err === 'string') {
        addError(defaultField, err);
        return;
      }
      if (typeof err === 'object' && err !== null) {
        const field = err.field || err.field_name || err.name || defaultField;
        if (err.message) {
          addError(field, err.message);
          return;
        }
        if (err.detail) {
          addError(field, err.detail);
          return;
        }
      }
      const serialized = this.serializeError(err);
      if (serialized) addError(defaultField, serialized);
    };
    
    // If it's an array
    if (Array.isArray(errors)) {
      errors.forEach((err: any) => parseItem(err));
      return result;
    }
    
    // If it's a simple string
    if (typeof errors === 'string') {
      addError(undefined, errors);
      return result;
    }
    
    // If it's an object
    if (typeof errors === 'object' && errors !== null) {
      // Direct field-aware object
      if (errors.message || errors.detail) {
        parseItem(errors, errors.field || errors.field_name || errors.name);
      }
      
      Object.entries(errors).forEach(([key, value]: [string, any]) => {
        if (['message', 'detail', 'code', 'status', 'type', 'field', 'field_name', 'name'].includes(key)) {
          return;
        }
        if (typeof value === 'string') {
          addError(this.formatFieldName(key), value);
        } else if (Array.isArray(value)) {
          value.forEach((item: any) => parseItem(item, this.formatFieldName(key)));
        } else if (typeof value === 'object' && value !== null) {
          parseItem(value, this.formatFieldName(key));
        }
      });
      
      if (result.length === 0) {
        addError(undefined, this.serializeError(errors));
      }
    }
    
    return result;
  }

  private formatFieldName(key: string): string {
    // Convert snake_case to Title Case
    return key
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  private serializeError(err: any): string {
    if (typeof err === 'string') return err;
    if (typeof err === 'number' || typeof err === 'boolean') return String(err);
    if (err === null || err === undefined) return '';
    if (Array.isArray(err)) {
      return err.map(e => this.serializeError(e)).filter(s => s).join('\n');
    }
    if (typeof err === 'object') {
      // If it has a message property, use that
      if (err.message) return err.message;
      // If it has a detail property, use that
      if (err.detail) return err.detail;
      // If it has a value property, use that
      if (err.value) return this.serializeError(err.value);
      // Try to extract readable content
      const entries: string[] = [];
      Object.entries(err).forEach(([key, value]: [string, any]) => {
        if (key && value) {
          entries.push(`${key}: ${this.serializeError(value)}`);
        }
      });
      if (entries.length > 0) return entries.join('\n');
      
      // Otherwise stringify
      try {
        return JSON.stringify(err, null, 2);
      } catch {
        return String(err);
      }
    }
    return String(err);
  }

  toDisplayString(value: any): string {
    return this.serializeError(value);
  }

  getInvoiceValidationWarnings(): { field: string; message: string }[] {
    return this.invoice()?.validation?.warnings || [];
  }

  getVisualizationSummary() {
    return this.uiVisualization()?.widget_data?.summary || {
      average_confidence: 0,
      high_confidence: 0,
      medium_confidence: 0,
      low_confidence: 0
    };
  }

  getAverageConfidence(): string {
    return this.getVisualizationSummary().average_confidence.toFixed(1);
  }

  getHighConfidenceCount(): number {
    return this.getVisualizationSummary().high_confidence || 0;
  }

  getMediumConfidenceCount(): number {
    return this.getVisualizationSummary().medium_confidence || 0;
  }

  getLowConfidenceCount(): number {
    return this.getVisualizationSummary().low_confidence || 0;
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
}

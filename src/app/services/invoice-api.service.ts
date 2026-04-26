import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Invoice,
  UploadInvoicesResponse,
  BatchUploadResponse,
  BatchJobStatus,
  ListInvoicesResponse,
  ConfidenceAnalysis,
  OverallConfidenceResponse,
  ConfidenceReportResponse,
  OCRConfidenceResponse,
  OCRHighlightedResponse,
  UIConfidenceVisualization,
  ReviewFields,
  HealthCheckResponse,
  ErrorResponse
} from '../types/invoice-api.types';

@Injectable({
  providedIn: 'root'
})
export class InvoiceAPIService {
  private apiUrl = 'http://localhost:5000/api';

  constructor(private http: HttpClient) {}

  /**
   * Health check endpoint
   */
  health(): Observable<HealthCheckResponse> {
    return this.http.get<HealthCheckResponse>(`${this.apiUrl.replace('/api', '')}/health`);
  }

  /**
   * Upload invoices synchronously
   * @param files Array of files to upload
   */
  uploadInvoices(files: File[]): Observable<UploadInvoicesResponse> {
    const formData = new FormData();
    files.forEach((file, index) => {
      formData.append('files', file);
    });
    return this.http.post<UploadInvoicesResponse>(`${this.apiUrl}/invoices`, formData);
  }

  /**
   * Upload invoices for batch processing (asynchronous)
   * @param files Array of files to upload
   */
  batchUploadInvoices(files: File[]): Observable<BatchUploadResponse> {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });
    return this.http.post<BatchUploadResponse>(`${this.apiUrl}/invoices/batch`, formData);
  }

  /**
   * Get batch job status
   * @param jobId UUID of the batch job
   */
  getBatchJobStatus(jobId: string): Observable<BatchJobStatus> {
    return this.http.get<BatchJobStatus>(`${this.apiUrl}/invoices/batch/${jobId}`);
  }

  /**
   * Get all invoices
   */
  getAllInvoices(): Observable<ListInvoicesResponse> {
    return this.http.get<ListInvoicesResponse>(`${this.apiUrl}/invoices`);
  }

  /**
   * Get invoice details
   * @param invoiceId UUID of the invoice
   */
  getInvoiceDetails(invoiceId: string): Observable<Invoice> {
    return this.http.get<Invoice>(`${this.apiUrl}/invoices/${invoiceId}`);
  }

  /**
   * Download invoice file
   * @param invoiceId UUID of the invoice
   */
  downloadInvoiceFile(invoiceId: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/invoices/${invoiceId}/file`, { responseType: 'blob' });
  }

  /**
   * Review and correct invoice fields
   * @param invoiceId UUID of the invoice
   * @param fields Fields to update
   */
  reviewInvoice(invoiceId: string, fields: ReviewFields): Observable<Invoice> {
    return this.http.patch<Invoice>(`${this.apiUrl}/invoices/${invoiceId}/review`, fields);
  }

  /**
   * Get overall confidence score
   * @param invoiceId UUID of the invoice
   */
  getOverallConfidence(invoiceId: string): Observable<OverallConfidenceResponse> {
    return this.http.get<OverallConfidenceResponse>(`${this.apiUrl}/invoices/${invoiceId}/overall-confidence`);
  }

  /**
   * Get field confidence analysis
   * @param invoiceId UUID of the invoice
   */
  getConfidenceAnalysis(invoiceId: string): Observable<ConfidenceAnalysis> {
    return this.http.get<ConfidenceAnalysis>(`${this.apiUrl}/invoices/${invoiceId}/confidence`);
  }

  /**
   * Get HTML confidence report
   * @param invoiceId UUID of the invoice
   */
  getConfidenceReport(invoiceId: string): Observable<ConfidenceReportResponse> {
    return this.http.get<ConfidenceReportResponse>(`${this.apiUrl}/invoices/${invoiceId}/confidence/report`);
  }

  /**
   * Get OCR confidence analysis
   * @param invoiceId UUID of the invoice
   */
  getOCRConfidence(invoiceId: string): Observable<OCRConfidenceResponse> {
    return this.http.get<OCRConfidenceResponse>(`${this.apiUrl}/invoices/${invoiceId}/ocr/confidence`);
  }

  /**
   * Get OCR confidence report
   * @param invoiceId UUID of the invoice
   */
  getOCRConfidenceReport(invoiceId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/invoices/${invoiceId}/ocr/confidence/report`);
  }

  /**
   * Get OCR text with highlighted low-confidence tokens
   * @param invoiceId UUID of the invoice
   */
  getOCRHighlighted(invoiceId: string): Observable<OCRHighlightedResponse> {
    return this.http.get<OCRHighlightedResponse>(`${this.apiUrl}/invoices/${invoiceId}/ocr/confidence/highlighted`);
  }

  /**
   * Get UI confidence visualization
   * @param invoiceId UUID of the invoice
   */
  getUIConfidenceVisualization(invoiceId: string): Observable<UIConfidenceVisualization> {
    return this.http.get<UIConfidenceVisualization>(`${this.apiUrl}/invoices/${invoiceId}/confidence/ui`);
  }
}

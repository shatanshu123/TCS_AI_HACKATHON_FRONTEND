/**
 * Invoice Processing API Types
 */

// Extraction field type
export interface ExtractionField {
  value: string;
  confidence: number;
  source: 'llm' | 'ocr' | 'reviewer';
}

// Extraction object containing multiple fields
export interface Extraction {
  [key: string]: ExtractionField;
}

// Validation result
export interface ValidationWarning {
  field: string;
  message: string;
}

export interface Validation {
  valid: boolean;
  errors: string[];
  warnings: ValidationWarning[];
}

// PII Information
export interface PII {
  masked: boolean;
  tokens_created: number;
  kinds: string[];
}

// Invoice response from API
export interface Invoice {
  id: string;
  original_filename: string;
  stored_filename: string;
  status: 'completed' | 'processing' | 'needs_review' | 'failed';
  upload_path: string;
  ocr_text_path: string;
  masked_text_path: string;
  pii_map_path: string;
  file_size: number;
  content_type: string;
  extraction: Extraction;
  validation: Validation;
  pii?: PII;
  overall_confidence?: number;
  confidence_level?: 'High' | 'Medium' | 'Low';
}

// Upload response (synchronous)
export interface UploadInvoicesResponse {
  count: number;
  invoices: Invoice[];
}

// Batch upload response (asynchronous)
export interface BatchUploadResponse {
  job_id: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  total_files: number;
}

// Batch job status response
export interface BatchJobStatus {
  id: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  created_at: string;
  updated_at: string;
  total: number;
  completed: number;
  results: Invoice[];
}

// List invoices response
export interface ListInvoicesResponse {
  invoices: Invoice[];
  count: number;
}

// Confidence field
export interface ConfidenceField {
  field: string;
  confidence: number;
  level: 'High' | 'Medium' | 'Low';
}

// Confidence summary
export interface ConfidenceSummary {
  average_confidence: number;
  high_confidence: number;
  medium_confidence: number;
  low_confidence: number;
  total_fields: number;
}

// Confidence analysis response
export interface ConfidenceAnalysis {
  invoice_id: string;
  original_filename: string;
  confidence_analysis: {
    fields: ConfidenceField[];
    summary: ConfidenceSummary;
  };
}

// Overall confidence response
export interface OverallConfidenceResponse {
  invoice_id: string;
  original_filename: string;
  overall_confidence: number;
  status: string;
}

// Confidence report response
export interface ConfidenceReportResponse {
  invoice_id: string;
  original_filename: string;
  html_report: string;
}

// OCR confidence response
export interface OCRConfidenceResponse {
  invoice_id: string;
  original_filename: string;
  ocr: {
    fields: any[];
    summary: ConfidenceSummary;
  };
}

// OCR highlighted response
export interface OCRHighlightedResponse {
  invoice_id: string;
  original_filename: string;
  html: string;
  statistics: ConfidenceSummary;
  warnings: string[];
}

// UI hint configuration
export interface UIHint {
  color_scheme: {
    high: string;
    medium: string;
    low: string;
  };
  show_confidence_percentages: boolean;
  enable_manual_override: boolean;
}

// UI confidence visualization response
export interface UIConfidenceVisualization {
  invoice_id: string;
  original_filename: string;
  widget_data: {
    fields: ConfidenceField[];
    summary: ConfidenceSummary;
    html_report: string;
    ui_hints: UIHint;
  };
}

// Review request payload
export interface ReviewFields {
  fields: {
    [key: string]: string;
  };
}

// Error response
export interface ErrorResponse {
  error: string;
}

// Health check response
export interface HealthCheckResponse {
  status: string;
  service: string;
}

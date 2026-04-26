# Invoice Processing API - Angular Integration Guide

## Overview

This document explains the complete API integration for the Invoice Processing application. The application now includes full support for the Invoice Processing API with comprehensive UI components for handling synchronous uploads, batch processing, confidence analysis, and invoice review workflows.

---

## Architecture

### New Components

The application has been enhanced with the following new components:

#### 1. **Invoice API Service** (`src/app/services/invoice-api.service.ts`)
- Central service for all API communications
- Handles all 15 API endpoints
- Supports both synchronous and asynchronous operations
- Provides type-safe methods using TypeScript interfaces

#### 2. **Invoice List Component** (`src/app/pages/invoice-list/`)
- Displays all processed invoices
- Shows overall confidence scores
- Provides quick preview of extracted data
- Download and edit capabilities

#### 3. **Invoice Detail Component** (`src/app/pages/invoice-detail/`)
- Detailed invoice view with full extraction data
- Three tabs: Extracted Data, Confidence Analysis, Visualization
- Edit and review interface with field-level editing
- Confidence visualization and analysis

#### 4. **Batch Upload Component** (`src/app/pages/batch-upload/`)
- Asynchronous batch file upload
- Real-time job status monitoring
- Progress tracking and result preview
- Session persistence for job tracking

#### 5. **Enhanced Dashboard** (`src/app/pages/dashboard/`)
- Quick navigation to new components
- Toggle between API and local processing
- Unified file upload interface
- Synchronous invoice processing option

---

## API Endpoints Integration

### Implemented Endpoints

| Method | Endpoint | Component | Feature |
|--------|----------|-----------|---------|
| GET | `/health` | Setup | Service health check |
| POST | `/api/invoices` | Dashboard | Synchronous upload & process |
| POST | `/api/invoices/batch` | Batch Upload | Asynchronous batch processing |
| GET | `/api/invoices/batch/{job_id}` | Batch Upload | Job status monitoring |
| GET | `/api/invoices` | Invoice List | Retrieve all invoices |
| GET | `/api/invoices/{id}` | Invoice Detail | Detailed invoice view |
| GET | `/api/invoices/{id}/file` | Invoice List/Detail | Download original file |
| PATCH | `/api/invoices/{id}/review` | Invoice Detail | Update extracted fields |
| GET | `/api/invoices/{id}/overall-confidence` | Dashboard | Overall confidence score |
| GET | `/api/invoices/{id}/confidence` | Invoice Detail | Field confidence analysis |
| GET | `/api/invoices/{id}/confidence/report` | Invoice Detail | HTML confidence report |
| GET | `/api/invoices/{id}/ocr/confidence` | Analysis | OCR token confidence |
| GET | `/api/invoices/{id}/ocr/confidence/report` | Analysis | OCR confidence report |
| GET | `/api/invoices/{id}/ocr/confidence/highlighted` | Analysis | Highlighted OCR text |
| GET | `/api/invoices/{id}/confidence/ui` | Invoice Detail | UI visualization data |

---

## Routing Configuration

New routes have been added to `app.routes.ts`:

```typescript
{ path: 'dashboard', component: DashboardComponent }
{ path: 'invoice-list', component: InvoiceListComponent }
{ path: 'invoice-detail/:id', component: InvoiceDetailComponent }
{ path: 'batch-upload', component: BatchUploadComponent }
```

---

## Data Types

All API response types are defined in `src/app/types/invoice-api.types.ts`:

### Key Types

- **Invoice**: Complete invoice data with extraction, validation, and PII info
- **ExtractionField**: Single extracted field with confidence and source
- **ConfidenceAnalysis**: Field-level and summary confidence data
- **BatchJobStatus**: Status information for batch processing jobs
- **UIConfidenceVisualization**: Complete UI visualization data

---

## Feature Workflows

### 1. Synchronous Invoice Upload (Dashboard)

```
User selects files → API processes files → Results displayed → Navigate to details
```

**Flow:**
1. User uploads files on Dashboard
2. Toggle "Use API Processing" for API mode
3. Files sent to `/api/invoices`
4. Immediate response with extracted data
5. Results shown with option to view details

### 2. Batch Processing (Batch Upload)

```
User uploads files → Job queued → Poll status → View results → Navigate to list
```

**Flow:**
1. User uploads files on Batch Upload page
2. Files sent to `/api/invoices/batch`
3. Receive job_id and start polling
4. Monitor progress with real-time updates
5. View results when complete
6. Navigate to Invoice List to review

### 3. Invoice Review and Correction (Invoice Detail)

```
User views invoice → Toggle edit mode → Modify fields → Save changes → Confidence updated
```

**Flow:**
1. User navigates to Invoice Detail
2. View extracted data with confidence scores
3. Click "Edit & Review"
4. Modify any extracted fields
5. Click "Save Changes"
6. Fields updated with confidence = 1.0 (reviewer source)

### 4. Confidence Analysis (Invoice Detail)

```
View overall confidence → Examine field-level scores → Analyze low-confidence items
```

**Flow:**
1. Dashboard shows overall confidence percentage
2. Invoice List displays confidence level (High/Medium/Low)
3. Invoice Detail shows field-level analysis
4. Visualization tab displays HTML report
5. Color coding: Green (High), Yellow (Medium), Red (Low)

---

## Configuration

### API Base URL

The API base URL is configured in `invoice-api.service.ts`:

```typescript
private apiUrl = 'http://localhost:5000/api';
```

**Change this to match your backend server URL.**

### Environment Setup

1. **HttpClientModule**: Enabled in `app.config.ts` with `provideHttpClient()`
2. **CORS**: Ensure backend allows CORS from your frontend origin
3. **Authentication**: Add interceptors if authentication is required

---

## Usage Examples

### Example 1: Upload and Process Files Synchronously

```typescript
// In Dashboard Component
const files = [...]; // Selected files
this.invoiceAPI.uploadInvoices(files).subscribe({
  next: (response) => {
    console.log('Invoices processed:', response.invoices);
  },
  error: (err) => console.error('Upload failed:', err)
});
```

### Example 2: Upload for Batch Processing

```typescript
// In Batch Upload Component
const files = [...];
this.invoiceAPI.batchUploadInvoices(files).subscribe({
  next: (response) => {
    const jobId = response.job_id;
    this.checkBatchStatus(); // Start polling
  }
});
```

### Example 3: Get Invoice Details with Confidence

```typescript
// In Invoice Detail Component
this.invoiceAPI.getInvoiceDetails(invoiceId).subscribe({
  next: (invoice) => {
    console.log('Extraction:', invoice.extraction);
    console.log('Validation:', invoice.validation);
  }
});

this.invoiceAPI.getUIConfidenceVisualization(invoiceId).subscribe({
  next: (viz) => {
    console.log('Visualization data:', viz.widget_data);
  }
});
```

### Example 4: Review and Update Invoice

```typescript
// In Invoice Detail Component
const reviewPayload = {
  fields: {
    invoice_number: 'INV-2024-CORRECTED',
    total_amount: '5250.00'
  }
};

this.invoiceAPI.reviewInvoice(invoiceId, reviewPayload).subscribe({
  next: (updatedInvoice) => {
    console.log('Invoice updated with reviewer source');
  }
});
```

---

## UI/UX Features

### Dashboard
- **Quick Navigation Cards**: Jump to Invoice List or Batch Upload
- **API Mode Toggle**: Switch between API and local processing
- **File Upload Area**: Drag & drop support with file list
- **Processing Stats**: Real-time upload/process/error counters

### Invoice List
- **Grid View**: Cards showing each invoice
- **Confidence Bars**: Visual representation of overall confidence
- **Status Badges**: Completion status at a glance
- **Details Modal**: Quick view without navigation
- **Bulk Actions**: Download and edit from card

### Invoice Detail
- **Tabbed Interface**: Extraction, Confidence, Visualization
- **Edit Mode**: Inline editing with save/cancel
- **Confidence Analysis**: Field-level confidence with color coding
- **Visualization Tab**: HTML confidence report
- **PII Information**: Privacy masking status
- **Metadata Display**: File info, size, content type

### Batch Upload
- **Upload Zone**: Drag & drop interface
- **File List**: Removable files before upload
- **Job Monitoring**: Real-time progress bar
- **Results Preview**: Quick view of completed files
- **Status Polling**: Automatic updates every 5 seconds

---

## Error Handling

### API Error Responses

The application handles the following error scenarios:

1. **400 Bad Request**: Validation errors (displayed in error messages)
2. **404 Not Found**: Invoice/job not found
3. **5xx Server Errors**: Network error handling with retry options
4. **Network Errors**: Offline detection and user feedback

### User Feedback

- Toast notifications for successful operations
- Error alerts with actionable messages
- Loading states during async operations
- Disabled buttons during processing

---

## Confidence Score Interpretation

### Levels

- **High Confidence (80-100%)**: Extracted data is reliable
- **Medium Confidence (50-79%)**: Review recommended
- **Low Confidence (0-49%)**: Manual correction likely needed

### Color Coding

- Green (#4CAF50): High confidence
- Yellow (#FFC107): Medium confidence
- Red (#F44336): Low confidence

### Source Attribution

- `llm`: LLM-based extraction
- `ocr`: OCR-based extraction
- `reviewer`: Human-reviewed correction (confidence = 1.0)

---

## Performance Considerations

### Batch Processing

- Recommended batch size: 5-100 files
- Processing time varies by file complexity
- Polling interval: 5 seconds (configurable)
- Session storage maintains job_id across page refreshes

### Confidence Analysis

- Lazy loading of visualization data
- HTML report cached after first fetch
- UI updates are optimized with signals

### File Handling

- Maximum file size: Backend dependent (configure in API)
- Supported formats: PDF, PNG, JPG, JPEG, GIF
- Client-side validation before upload

---

## Customization Guide

### Changing API Base URL

Edit `src/app/services/invoice-api.service.ts`:

```typescript
private apiUrl = 'https://your-api-server.com/api';
```

### Adding Authentication

Create an HTTP interceptor:

```typescript
// src/app/interceptors/auth.interceptor.ts
export class AuthInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const authToken = localStorage.getItem('token');
    if (authToken) {
      req = req.clone({
        setHeaders: { Authorization: `Bearer ${authToken}` }
      });
    }
    return next.handle(req);
  }
}
```

Add to `app.config.ts`:

```typescript
provideHttpClient(withInterceptors([authInterceptor]))
```

### Customizing Confidence Color Scheme

Edit component methods like `getConfidenceColor()`:

```typescript
getConfidenceColor(confidence: number): string {
  if (confidence >= 0.9) return '#00aa00'; // Custom high
  if (confidence >= 0.7) return '#ffaa00'; // Custom medium
  return '#aa0000'; // Custom low
}
```

---

## Testing the Integration

### Prerequisites

1. Backend API server running on `http://localhost:5000`
2. Angular development server running on `http://localhost:4200`
3. Test invoice files (PDF/images)

### Test Scenarios

1. **Upload Single Invoice**: Dashboard → Select file → Process
2. **Batch Upload**: Batch Upload page → Select multiple files → Monitor progress
3. **View Invoice**: Invoice List → Click card → View details
4. **Edit Invoice**: Invoice Detail → Edit & Review → Modify fields → Save
5. **Confidence Analysis**: Invoice Detail → Confidence tab → Review field scores
6. **Download**: Invoice List → Click Download button

---

## Troubleshooting

### Issue: API Connection Error

**Solution:**
1. Verify backend is running on correct port (default 5000)
2. Check CORS configuration in backend
3. Verify API URL in `invoice-api.service.ts`

### Issue: Files Not Uploading

**Solution:**
1. Check file format (PDF, PNG, JPG, JPEG, GIF)
2. Verify file size limits
3. Check browser console for detailed errors
4. Try synchronous upload if batch fails

### Issue: Confidence Scores Not Loading

**Solution:**
1. Ensure invoice is fully processed (status = "completed")
2. Check network tab in browser dev tools
3. Try refreshing the page
4. Verify API endpoints are accessible

---

## Next Steps

1. **Set up backend server** with the Invoice Processing API
2. **Configure API URL** in the service
3. **Test file uploads** with sample invoices
4. **Customize confidence thresholds** as needed
5. **Deploy to production** with appropriate CORS and security settings

---

## File Structure

```
src/app/
├── services/
│   ├── invoice-api.service.ts          (NEW)
│   ├── auth.service.ts
│   └── ...
├── types/
│   └── invoice-api.types.ts            (NEW)
├── pages/
│   ├── dashboard/
│   │   ├── dashboard.component.ts      (UPDATED)
│   │   ├── dashboard.component.html    (UPDATED)
│   │   └── dashboard.component.css     (UPDATED)
│   ├── invoice-list/                   (NEW)
│   │   ├── invoice-list.component.ts
│   │   ├── invoice-list.component.html
│   │   └── invoice-list.component.css
│   ├── invoice-detail/                 (NEW)
│   │   ├── invoice-detail.component.ts
│   │   ├── invoice-detail.component.html
│   │   └── invoice-detail.component.css
│   └── batch-upload/                   (NEW)
│       ├── batch-upload.component.ts
│       ├── batch-upload.component.html
│       └── batch-upload.component.css
├── app.config.ts                       (UPDATED)
├── app.routes.ts                       (UPDATED)
└── ...
```

---

## Summary

The Invoice Processing API integration is now complete with:

✅ Full API service with all 15 endpoints
✅ Type-safe TypeScript interfaces
✅ Four new UI components with rich features
✅ Confidence analysis and visualization
✅ Batch processing with job monitoring
✅ Invoice review and correction workflow
✅ Error handling and user feedback
✅ Responsive design and accessibility

The application is ready to connect to your backend API server!

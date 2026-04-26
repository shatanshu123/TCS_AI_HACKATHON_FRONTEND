# Quick Setup Guide - Invoice Processing API Integration

## What's Been Done

I've fully integrated the Invoice Processing API into your Angular application with the following additions:

### New Components
- **Invoice List** - View all processed invoices with confidence scores
- **Invoice Detail** - Detailed view with editing, confidence analysis, and visualization
- **Batch Upload** - Asynchronous batch processing with real-time monitoring

### Enhanced Components
- **Dashboard** - Now supports API-based processing with quick navigation

### New Services
- **InvoiceAPIService** - Complete API client with all 15 endpoints

### New Types
- **invoice-api.types.ts** - TypeScript interfaces for all API responses

---

## Getting Started (5 Steps)

### Step 1: Verify Your Backend API

Your Invoice Processing backend should be running at:
```
http://localhost:5000
```

**Health Check:**
```bash
curl http://localhost:5000/health
```

Expected response:
```json
{
  "status": "ok",
  "service": "invoice-processing-backend"
}
```

### Step 2: Start Your Angular Application

```bash
cd /home/shatanshu-agrawal/Documents/invoice-ai-ui
npm start
```

The app will be available at `http://localhost:4200`

### Step 3: Test the API Connection

1. Navigate to Dashboard (http://localhost:4200/dashboard)
2. Look for the "Quick Navigation" section with:
   - "View Invoices" button
   - "Batch Upload" button
3. If these load without errors, the connection is working!

### Step 4: Try Uploading an Invoice

**Option A - Synchronous Upload (Quick Test):**
1. On Dashboard, make sure "Use API Processing" is checked
2. Select a PDF or image file
3. Click "Process Invoices"
4. You should see results within seconds

**Option B - Batch Upload (Production):**
1. Click "Batch Upload" from Dashboard
2. Select multiple files
3. Click "Start Batch Upload"
4. Monitor progress in real-time
5. View results when complete

### Step 5: Review and Edit Invoices

1. From Invoice List, click any invoice card
2. View extracted data with confidence scores
3. Click "Edit & Review" to modify fields
4. Save changes to mark as reviewed

---

## API Configuration

If your backend is on a different URL/port, update:

**File:** `src/app/services/invoice-api.service.ts`

```typescript
private apiUrl = 'http://localhost:5000/api';
// Change to: 
private apiUrl = 'http://your-server:port/api';
```

---

## Key Features by Component

### Dashboard
- ✅ Synchronous file upload
- ✅ Real-time processing
- ✅ Toggle API vs local processing
- ✅ Quick navigation to other features

### Invoice List
- ✅ View all processed invoices
- ✅ Confidence score visualization
- ✅ Quick preview modal
- ✅ Download original files
- ✅ Edit individual invoices

### Invoice Detail
- ✅ Full extraction data display
- ✅ Field-level confidence analysis
- ✅ Tabbed interface (Data, Confidence, Visualization)
- ✅ Inline editing with save/cancel
- ✅ Download and back navigation

### Batch Upload
- ✅ Drag & drop file upload
- ✅ File list with removal
- ✅ Real-time job status
- ✅ Automatic polling (5 sec intervals)
- ✅ Results preview
- ✅ Session persistence

---

## Confidence Score Guide

The app uses color-coded confidence levels:

| Level | Range | Color | Meaning |
|-------|-------|-------|---------|
| High | 80-100% | 🟢 Green | High confidence, reliable |
| Medium | 50-79% | 🟡 Yellow | Review recommended |
| Low | 0-49% | 🔴 Red | Manual review needed |

---

## File Formats Supported

- ✅ PDF (.pdf)
- ✅ JPEG (.jpg, .jpeg)
- ✅ PNG (.png)
- ✅ GIF (.gif)

---

## Common Workflows

### Upload and Review a Single Invoice

```
Dashboard 
  → Select file 
  → Process Invoices 
  → View in Invoice List 
  → Click Edit & Review 
  → Make corrections 
  → Save
```

### Bulk Process Multiple Invoices

```
Dashboard 
  → Click "Batch Upload" 
  → Add files (drag & drop) 
  → Start Batch Upload 
  → Monitor progress 
  → View All Invoices 
  → Review any that need attention
```

### Check Confidence Scores

```
Invoice List 
  → View confidence bar on card (overall score)
  → Click card for details 
  → Go to "Confidence Analysis" tab 
  → See field-level breakdown
```

---

## Environment Requirements

### Frontend
- Node.js 18+
- Angular 21.2.0+
- npm/yarn

### Backend
- Python/Node.js/Java (depending on your API implementation)
- Running on port 5000 (or configured port)
- CORS enabled for localhost:4200

---

## Troubleshooting Checklist

- [ ] Backend API is running at the correct URL
- [ ] CORS is enabled on the backend
- [ ] API returns 200 for `/health` endpoint
- [ ] Test files are in supported format
- [ ] Your browser console shows no errors
- [ ] Network tab shows successful API calls

**Still having issues?** Check the detailed [API_INTEGRATION_GUIDE.md](./API_INTEGRATION_GUIDE.md)

---

## Next: Customize Your Setup

### Change API URL
Edit `src/app/services/invoice-api.service.ts`:
```typescript
private apiUrl = 'http://your-domain.com/api';
```

### Add Authentication
Create an auth interceptor and add it to `app.config.ts`

### Customize Colors
Edit confidence color methods in components:
```typescript
getConfidenceColor(confidence: number): string {
  if (confidence >= 0.9) return '#your-color';
  // ... more conditions
}
```

### Adjust Polling Interval
In batch-upload.component.ts:
```typescript
this.statusCheckInterval = setInterval(() => {
  this.checkBatchStatus();
}, 3000); // Change 5000 to your interval in ms
```

---

## What's Ready to Use

✅ All 15 API endpoints implemented
✅ Type-safe API client
✅ Full UI for all workflows
✅ Error handling and user feedback
✅ Real-time monitoring
✅ Responsive design
✅ Production-ready code

---

## Need Help?

1. **API Documentation:** See [API_INTEGRATION_GUIDE.md](./API_INTEGRATION_GUIDE.md)
2. **Component Details:** Check component files for inline comments
3. **API Reference:** Review the API documentation provided in your request

---

## Success Indicators

When everything is working, you should see:

1. ✅ Dashboard loads with Quick Navigation cards
2. ✅ Invoice List shows "No invoices" or your processed invoices
3. ✅ Can upload files and see results immediately
4. ✅ Batch upload shows progress bar
5. ✅ Can view and edit invoice details
6. ✅ Confidence scores display with colors

**Let's go! Start your backend and test it out!** 🚀

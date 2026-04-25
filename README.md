# Invoice AI Processing Assistant

An AI-powered assistant for automated invoice processing that accepts invoice uploads, extracts key data fields using OCR and pattern recognition, and presents results in a simple UI for review and correction.

## Features

- Upload multiple invoice documents (PDF or image formats)
- Automatic text extraction using OCR (Tesseract.js)
- Intelligent data extraction for vendor, amount, date, invoice number, and description
- Contextual validation of extracted fields
- Interactive review and correction interface
- Batch processing support

## Technology Stack

- Angular 21
- Tesseract.js for OCR
- pdf-parse for PDF text extraction
- TypeScript

## Development

### Prerequisites

- Node.js and npm
- Angular CLI

### Installation

```bash
npm install
```

### Development Server

```bash
npm start
```

Navigate to `http://localhost:4200/` (or the port shown in the terminal).

### Build

```bash
npm run build
```

## Usage

1. Click "Choose Files" to select invoice documents (PDF, JPG, PNG)
2. Click "Process Invoices" to start automated processing
3. Review extracted data for each invoice
4. Edit fields as needed and see validation status update
5. Use Previous/Next buttons to navigate through batch results

## Data Processing

The app uses:
- OCR for text extraction from images
- PDF parsing for document text
- Regex patterns for field identification
- Basic validation rules for data quality

## Privacy & Compliance

- All processing happens client-side
- No data is sent to external servers
- Suitable for sensitive financial documents
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
# TCS_AI_HACKATHON_FRONTEND

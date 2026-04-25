import { Injectable } from '@angular/core';
import { createWorker } from 'tesseract.js';
import * as pdfParse from 'pdf-parse';

export interface InvoiceData {
  vendor: string;
  amount: string;
  date: string;
  invoiceNumber: string;
  description: string;
  totalAmount?: number;
  validated: boolean;
  errors: string[];
}

@Injectable({
  providedIn: 'root'
})
export class InvoiceProcessingService {

  async processFile(file: File): Promise<InvoiceData> {
    try {
      let text = '';

      if (file.type === 'application/pdf') {
        text = await this.extractTextFromPDF(file);
      } else if (file.type.startsWith('image/')) {
        text = await this.extractTextFromImage(file);
      } else {
        throw new Error('Unsupported file type. Please upload PDF or image files.');
      }

      return this.extractInvoiceData(text);
    } catch (error) {
      console.error('Error processing file:', error);
      return {
        vendor: '',
        amount: '',
        date: '',
        invoiceNumber: '',
        description: `Error processing file: ${error instanceof Error ? error.message : 'Unknown error'}`,
        totalAmount: 0,
        validated: false,
        errors: ['Processing failed']
      };
    }
  }

  private async extractTextFromPDF(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const data = await (pdfParse as any)(new Uint8Array(arrayBuffer));
    return data.text;
  }

  private async extractTextFromImage(file: File): Promise<string> {
    const worker = await createWorker('eng');
    const { data: { text } } = await worker.recognize(file);
    await worker.terminate();
    return text;
  }

  private extractInvoiceData(text: string): InvoiceData {
    // Simple regex-based extraction (simulating GenAI)
    const vendor = this.extractVendor(text);
    const amount = this.extractAmount(text);
    const date = this.extractDate(text);
    const invoiceNumber = this.extractInvoiceNumber(text);
    const description = this.extractDescription(text);

    const errors = this.validateData({ vendor, amount, date, invoiceNumber, description, totalAmount: parseFloat(amount.replace(/,/g, '')) || 0, validated: false, errors: [] });

    return {
      vendor,
      amount,
      date,
      invoiceNumber,
      description,
      totalAmount: parseFloat(amount.replace(/,/g, '')) || 0,
      validated: errors.length === 0,
      errors
    };
  }

  private extractVendor(text: string): string {
    // Look for vendor name patterns
    const vendorPatterns = [
      /Vendor:\s*([^\n]+)/i,
      /From:\s*([^\n]+)/i,
      /Supplier:\s*([^\n]+)/i
    ];
    for (const pattern of vendorPatterns) {
      const match = text.match(pattern);
      if (match) return match[1].trim();
    }
    return '';
  }

  private extractAmount(text: string): string {
    // Look for amount patterns
    const amountPatterns = [
      /Total:\s*\$?([0-9,]+\.?[0-9]*)/i,
      /Amount:\s*\$?([0-9,]+\.?[0-9]*)/i,
      /\$([0-9,]+\.?[0-9]*)/
    ];
    for (const pattern of amountPatterns) {
      const match = text.match(pattern);
      if (match) return match[1].trim();
    }
    return '';
  }

  private extractDate(text: string): string {
    // Look for date patterns
    const datePatterns = [
      /Date:\s*([0-9]{1,2}[-\/][0-9]{1,2}[-\/][0-9]{4})/i,
      /Invoice Date:\s*([0-9]{1,2}[-\/][0-9]{1,2}[-\/][0-9]{4})/i,
      /([0-9]{1,2}[-\/][0-9]{1,2}[-\/][0-9]{4})/
    ];
    for (const pattern of datePatterns) {
      const match = text.match(pattern);
      if (match) return match[1].trim();
    }
    return '';
  }

  private extractInvoiceNumber(text: string): string {
    // Look for invoice number patterns
    const invoicePatterns = [
      /Invoice\s*#?\s*:\s*([A-Z0-9-]+)/i,
      /Invoice\s*Number:\s*([A-Z0-9-]+)/i,
      /Inv\s*#?\s*([A-Z0-9-]+)/i
    ];
    for (const pattern of invoicePatterns) {
      const match = text.match(pattern);
      if (match) return match[1].trim();
    }
    return '';
  }

  private extractDescription(text: string): string {
    // Simple description extraction
    const lines = text.split('\n').filter(line => line.trim().length > 10);
    return lines.slice(0, 3).join(' ').trim();
  }

  validateData(data: Partial<InvoiceData>): string[] {
    const errors: string[] = [];
    if (!data.vendor) errors.push('Vendor not found');
    if (!data.amount) errors.push('Amount not found');
    if (!data.date) errors.push('Date not found');
    if (!data.invoiceNumber) errors.push('Invoice number not found');
    return errors;
  }
}
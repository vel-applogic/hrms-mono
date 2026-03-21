import { existsSync } from 'node:fs';

import { Injectable } from '@nestjs/common';
import type { PayslipTemplateData } from '@repo/shared';
import { renderPayslipHtml } from '@repo/shared';
import puppeteer from 'puppeteer-core';

const CHROME_EXECUTABLE_PATHS = [
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome-stable',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium-browser',
  '/usr/bin/chromium',
];

@Injectable()
export class PdfGeneratorService {
  async generatePayslipPdf(data: PayslipTemplateData): Promise<Buffer> {
    const html = renderPayslipHtml(data);
    const executablePath = this.getChromePath();

    const browser = await puppeteer.launch({
      executablePath,
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    });

    try {
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: { top: '10mm', right: '10mm', bottom: '10mm', left: '10mm' },
      });
      return Buffer.from(pdfBuffer);
    } finally {
      await browser.close();
    }
  }

  private getChromePath(): string {
    const envPath = process.env.CHROME_EXECUTABLE_PATH;
    if (envPath) return envPath;

    for (const p of CHROME_EXECUTABLE_PATHS) {
      if (existsSync(p)) return p;
    }

    throw new Error(
      'Chrome/Chromium executable not found. Set CHROME_EXECUTABLE_PATH env variable or install Chrome.',
    );
  }
}

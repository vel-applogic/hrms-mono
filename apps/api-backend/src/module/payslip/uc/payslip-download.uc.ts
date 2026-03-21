import { Injectable } from '@nestjs/common';
import type { PayslipWithDetailsType } from '@repo/nest-lib';
import { CommonLoggerService, CurrentUserType, IUseCase, PayslipDao } from '@repo/nest-lib';
import { ApiError } from '@repo/shared';

import type { PayslipPdfData, PayslipPdfTableRow } from '../../../service/pdf/pdf-generator.service.js';
import { PdfGeneratorService } from '../../../service/pdf/pdf-generator.service.js';

const MONTH_LABELS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const ONES = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
const TENS = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

type Params = {
  currentUser: CurrentUserType;
  id: number;
};

@Injectable()
export class PayslipDownloadUc implements IUseCase<Params, Buffer> {
  constructor(
    private readonly logger: CommonLoggerService,
    private readonly payslipDao: PayslipDao,
    private readonly pdfGeneratorService: PdfGeneratorService,
  ) {}

  async execute(params: Params): Promise<Buffer> {
    this.logger.i('Downloading payslip PDF', { id: params.id });

    const payslip = await this.payslipDao.getById({ id: params.id });
    if (!payslip) {
      throw new ApiError('Payslip not found', 404);
    }

    const pdfData = this.mapToPdfData(payslip);
    return this.pdfGeneratorService.generatePayslipPdf(pdfData);
  }

  private formatAmount(value: number): string {
    return `\u20B9${value.toLocaleString('en-IN')}`;
  }

  private toWords(n: number): string {
    if (n === 0) return '';
    if (n < 20) return ONES[n]!;
    if (n < 100) return TENS[Math.floor(n / 10)]! + (n % 10 ? ' ' + ONES[n % 10]! : '');
    if (n < 1000) return ONES[Math.floor(n / 100)]! + ' Hundred' + (n % 100 ? ' ' + this.toWords(n % 100) : '');
    if (n < 100000) return this.toWords(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 ? ' ' + this.toWords(n % 1000) : '');
    if (n < 10000000) return this.toWords(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 ? ' ' + this.toWords(n % 100000) : '');
    return this.toWords(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 ? ' ' + this.toWords(n % 10000000) : '');
  }

  private numberToWords(amount: number): string {
    if (amount === 0) return 'Zero Rupees Only';
    const rupees = Math.floor(amount);
    const paise = Math.round((amount - rupees) * 100);
    let result = this.toWords(rupees) + ' Rupees';
    if (paise > 0) result += ' and ' + this.toWords(paise) + ' Paise';
    return result + ' Only';
  }

  private mapToPdfData(p: PayslipWithDetailsType): PayslipPdfData {
    const earnings = p.payslipLineItems.filter((li) => li.type === 'earning');
    const deductions = p.payslipLineItems.filter((li) => li.type === 'deduction');
    const lopItem = deductions.find((li) => li.title === 'Loss of Pay');

    const calendarDays = new Date(p.year, p.month, 0).getDate();
    const lopDays = lopItem && p.grossAmount > 0 ? Math.round((lopItem.amount * 30) / p.grossAmount) : 0;
    const paidDays = calendarDays - lopDays;

    const maxRows = Math.max(earnings.length, deductions.length);
    const tableRows: PayslipPdfTableRow[] = Array.from({ length: maxRows }, (_, i) => ({
      earningTitle: earnings[i]?.title ?? '',
      earningAmount: earnings[i] ? this.formatAmount(earnings[i]!.amount) : '',
      deductionTitle: deductions[i]?.title ?? '',
      deductionAmount: deductions[i] ? this.formatAmount(deductions[i]!.amount) : '',
    }));

    return {
      companyName: 'Company Name',
      companyAddress: 'Company Address',
      monthLabel: MONTH_LABELS[p.month - 1] ?? '',
      year: p.year,
      employeeFirstname: p.user.firstname,
      employeeLastname: p.user.lastname,
      employeeEmail: p.user.email,
      employeeId: p.userId,
      employeeDesignation: p.user.employees?.[0]?.designation ?? '',
      netAmountFormatted: this.formatAmount(p.netAmount),
      paidDays,
      lopDays,
      grossAmountFormatted: this.formatAmount(p.grossAmount),
      deductionAmountFormatted: this.formatAmount(p.deductionAmount),
      netAmountWordsFormatted: this.numberToWords(p.netAmount),
      tableRows,
    };
  }
}

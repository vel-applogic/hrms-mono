export const PAYSLIP_HTML_TEMPLATE = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Payslip - {{monthLabel}} {{year}}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      font-size: 12px;
      color: #1f2937;
      background: #fff;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .payslip { width: 100%; background: #fff; }

    /* ── Header ──────────────────────────────────────────────────── */
    .header {
      display: flex;
      align-items: flex-start;
      gap: 16px;
      border-bottom: 1px solid #e5e7eb;
      padding: 20px 24px;
    }
    .logo-box {
      width: 64px;
      height: 64px;
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 1px solid #d1d5db;
      background: #f3f4f6;
      color: #9ca3af;
      font-size: 10px;
      border-radius: 4px;
    }
    .company-name { font-size: 14px; font-weight: 700; color: #111827; }
    .company-address { font-size: 10px; color: #6b7280; margin-top: 2px; }
    .pay-month { margin-top: 6px; font-weight: 600; color: #374151; font-size: 12px; }

    /* ── Employee + Net Pay ──────────────────────────────────────── */
    .emp-net {
      display: grid;
      grid-template-columns: 1fr 1fr;
      border-bottom: 1px solid #e5e7eb;
    }
    .emp-col {
      border-right: 1px solid #e5e7eb;
      padding: 16px 24px;
    }
    .net-col { padding: 16px 24px; }
    .info-table { width: 100%; border-collapse: collapse; font-size: 11px; }
    .info-table td { padding: 2px 0; vertical-align: top; }
    .info-label { color: #6b7280; padding-right: 8px; white-space: nowrap; }
    .info-sep { color: #9ca3af; padding: 0 4px; }
    .info-value { color: #1f2937; }
    .info-value.bold { font-weight: 600; color: #111827; }

    .net-box {
      border: 1px solid #bbf7d0;
      background: #f0fdf4;
      border-radius: 6px;
      padding: 12px 16px;
      margin-bottom: 12px;
    }
    .net-amount { font-size: 20px; font-weight: 700; color: #16a34a; }
    .net-label { font-size: 10px; color: #6b7280; margin-top: 2px; }

    /* ── Income Details ──────────────────────────────────────────── */
    .income-section { padding: 16px 24px; }
    .section-title { font-weight: 600; color: #1f2937; margin-bottom: 12px; font-size: 13px; }
    .tables-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .data-table {
      width: 100%;
      border-collapse: collapse;
      border: 1px solid #e5e7eb;
      font-size: 11px;
    }
    .data-table thead tr { background: #f3f4f6; }
    .data-table th {
      border-bottom: 1px solid #e5e7eb;
      padding: 8px 12px;
      text-align: left;
      font-weight: 600;
      color: #374151;
    }
    .data-table th.right { text-align: right; }
    .data-table th:not(:last-child) { border-right: 1px solid #e5e7eb; }
    .data-table td {
      padding: 7px 12px;
      color: #374151;
      border-bottom: 1px solid #f3f4f6;
    }
    .data-table td:not(:last-child) { border-right: 1px solid #f3f4f6; }
    .data-table td.right { text-align: right; }
    .data-table tfoot tr { background: #f3f4f6; }
    .data-table tfoot td {
      border-top: 1px solid #e5e7eb;
      padding: 8px 12px;
      font-weight: 600;
      color: #1f2937;
      border-bottom: none;
    }
    .data-table tfoot td:not(:last-child) { border-right: 1px solid #e5e7eb; }
    .data-table tfoot td.right { text-align: right; }

    /* ── Net Payable Summary ─────────────────────────────────────── */
    .net-summary {
      border-top: 1px solid #e5e7eb;
      padding: 20px 24px;
      text-align: center;
    }
    .net-summary-title { font-weight: 600; color: #1f2937; font-size: 13px; }
    .net-summary-sub { font-size: 10px; color: #6b7280; margin-top: 2px; }
    .net-summary-amount { font-size: 22px; font-weight: 700; color: #16a34a; margin-top: 8px; }
    .net-summary-words { font-size: 10px; font-style: italic; color: #6b7280; margin-top: 4px; }

    /* ── Footer ──────────────────────────────────────────────────── */
    .doc-footer {
      border-top: 1px solid #e5e7eb;
      padding: 10px 24px;
      text-align: center;
    }
    .doc-footer p { font-size: 10px; color: #9ca3af; }
  </style>
</head>
<body>
<div class="payslip">

  <!-- Company Header -->
  <div class="header">
    <div class="logo-box">Logo</div>
    <div>
      <p class="company-name">{{companyName}}</p>
      <p class="company-address">{{companyAddress}}</p>
      <p class="pay-month">Payslip for the Month of {{monthLabel}} {{year}}</p>
    </div>
  </div>

  <!-- Employee Info + Net Pay -->
  <div class="emp-net">
    <div class="emp-col">
      <table class="info-table">
        <tbody>
          <tr>
            <td class="info-label">Employee Name</td>
            <td class="info-sep w-1">:</td>
            <td class="info-value bold">{{employeeFirstname}} {{employeeLastname}}</td>
          </tr>
         
          <tr>
            <td class="info-label">Email</td>
            <td class="info-sep">:</td>
            <td class="info-value bold"> {{employeeEmail}}</td>
          </tr>
          <tr>
            <td class="info-label">Employee ID</td>
            <td class="info-sep">:</td>
            <td class="info-value">{{employeeId}}</td>
          </tr>
          <tr>
            <td class="info-label">Designation</td>
            <td class="info-sep">:</td>
            <td class="info-value">{{employeeDesignation}}</td>
          </tr>
          <tr>
            <td class="info-label">Pay Period</td>
            <td class="info-sep">:</td>
            <td class="info-value">{{monthLabel}} {{year}}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="net-col">
      <div class="net-box">
        <p class="net-amount">{{netAmountFormatted}}</p>
        <p class="net-label">Total Net Pay</p>
      </div>
      <table class="info-table">
        <tbody>
          <tr>
            <td class="info-label">Paid Days</td>
            <td class="info-sep">:</td>
            <td class="info-value">{{paidDays}}</td>
          </tr>
          <tr>
            <td class="info-label">LOP Days</td>
            <td class="info-sep">:</td>
            <td class="info-value">{{lopDays}}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <!-- Income Details -->
  <div class="income-section">
    <p class="section-title">Income Details</p>
    <div class="tables-grid">

      <!-- Earnings -->
      <table class="data-table">
        <thead>
          <tr>
            <th>Earnings</th>
            <th class="right">Amount</th>
          </tr>
        </thead>
        <tbody>
          {{#each tableRows}}
          <tr>
            <td>{{this.earningTitle}}</td>
            <td class="right">{{this.earningAmount}}</td>
          </tr>
          {{/each}}
        </tbody>
        <tfoot>
          <tr>
            <td>Gross Earnings</td>
            <td class="right">{{grossAmountFormatted}}</td>
          </tr>
        </tfoot>
      </table>

      <!-- Deductions -->
      <table class="data-table">
        <thead>
          <tr>
            <th>Deductions</th>
            <th class="right">Amount</th>
          </tr>
        </thead>
        <tbody>
          {{#each tableRows}}
          <tr>
            <td>{{this.deductionTitle}}</td>
            <td class="right">{{this.deductionAmount}}</td>
          </tr>
          {{/each}}
        </tbody>
        <tfoot>
          <tr>
            <td>Total Deductions</td>
            <td class="right">{{deductionAmountFormatted}}</td>
          </tr>
        </tfoot>
      </table>

    </div>
  </div>

  <!-- Net Payable Summary -->
  <div class="net-summary">
    <p class="net-summary-title">Total Net Payable</p>
    <p class="net-summary-sub">Gross Earnings - Total Deductions</p>
    <p class="net-summary-amount">{{netAmountFormatted}}</p>
    <p class="net-summary-words">Amount In Words: {{netAmountWordsFormatted}}</p>
  </div>

  <!-- Footer -->
  <div class="doc-footer">
    <p>– This is a system-generated document. –</p>
  </div>

</div>
</body>
</html>`;

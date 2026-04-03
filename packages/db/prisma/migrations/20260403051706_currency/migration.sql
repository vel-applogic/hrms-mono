/*
  Warnings:

  - Added the required column `currency_id` to the `organization` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "organization" ADD COLUMN     "currency_id" INTEGER NOT NULL,
ADD COLUMN     "website" TEXT;

-- CreateTable
CREATE TABLE "currency" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "symbol" TEXT,

    CONSTRAINT "currency_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "organization" ADD CONSTRAINT "organization_currency_id_fkey" FOREIGN KEY ("currency_id") REFERENCES "currency"("id") ON DELETE RESTRICT ON UPDATE CASCADE;


-- Currency seed data with fixed IDs
-- Run after Prisma migrations: psql -U postgres -d hrms_db -f seed-currency.sql
-- Uses ON CONFLICT DO NOTHING so it is safe to run multiple times

INSERT INTO currency (id, code, name, symbol) VALUES
  (1, 'INR', 'Indian Rupee', '₹'),
  (2, 'USD', 'US Dollar', '$'),
  (3, 'EUR', 'Euro', '€'),
  (4, 'GBP', 'British Pound', '£'),
  (5, 'AED', 'UAE Dirham', 'د.إ'),
  (6, 'SAR', 'Saudi Riyal', '﷼'),
  (7, 'SGD', 'Singapore Dollar', 'S$'),
  (8, 'AUD', 'Australian Dollar', 'A$'),
  (9, 'CAD', 'Canadian Dollar', 'C$'),
  (10, 'JPY', 'Japanese Yen', '¥'),
  (11, 'CNY', 'Chinese Yuan', '¥'),
  (12, 'CHF', 'Swiss Franc', 'CHF'),
  (13, 'MYR', 'Malaysian Ringgit', 'RM'),
  (14, 'ZAR', 'South African Rand', 'R'),
  (15, 'BRL', 'Brazilian Real', 'R$'),
  (16, 'KWD', 'Kuwaiti Dinar', 'د.ك'),
  (17, 'QAR', 'Qatari Riyal', '﷼'),
  (18, 'OMR', 'Omani Rial', '﷼'),
  (19, 'BHD', 'Bahraini Dinar', '.د.ب'),
  (20, 'NZD', 'New Zealand Dollar', 'NZ$'),
  (21, 'THB', 'Thai Baht', '฿'),
  (22, 'IDR', 'Indonesian Rupiah', 'Rp'),
  (23, 'PHP', 'Philippine Peso', '₱'),
  (24, 'KRW', 'South Korean Won', '₩'),
  (25, 'SEK', 'Swedish Krona', 'kr'),
  (26, 'NOK', 'Norwegian Krone', 'kr'),
  (27, 'DKK', 'Danish Krone', 'kr'),
  (28, 'HKD', 'Hong Kong Dollar', 'HK$'),
  (29, 'TWD', 'Taiwan Dollar', 'NT$'),
  (30, 'PLN', 'Polish Zloty', 'zł')
ON CONFLICT (id) DO NOTHING;

-- Reset the sequence to max id so future inserts get correct IDs
SELECT setval('currency_id_seq', (SELECT MAX(id) FROM currency));
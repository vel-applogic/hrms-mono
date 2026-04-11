import { Injectable } from '@nestjs/common';
import { UserRoleDtoEnum } from '@repo/dto';
import { CommonLoggerService, PrismaService } from '@repo/nest-lib';

import { PasswordService } from '../../service/password.service.js';

@Injectable()
export class Seeder {
  constructor(
    private readonly prisma: PrismaService,
    private readonly passwordService: PasswordService,
    private readonly logger: CommonLoggerService,
  ) {}

  async seed() {
    this.logger.i('Seeding data start');
    await this.runMigration('seed-currencies', () => this.seedCurrencies());
    await this.runMigration('seed-countries', () => this.seedCountries());
    await this.runMigration('create-test-users', () =>
      this.createTestUsers([
        { email: 'superAdmin@test.com', firstname: 'Test', lastname: '01', organizationName: 'Test Organization', roles: [], isSuperAdmin: true },
        { email: 'admin@test.com', firstname: 'Test', lastname: '01', organizationName: 'Test Organization', roles: [UserRoleDtoEnum.admin], isSuperAdmin: false },
      ]),
    );
    await this.runMigration('create-test-employee', () => this.createTestEmployee());
    await this.runMigration('init-employee-leave-counters', () => this.initEmployeeLeaveCounters());
    await this.runMigration('seed-default-departments', () => this.seedDefaultDepartments());
    this.logger.i('Seeding data complete');
  }

  // run a migration
  private async runMigration(key: string, migration: () => Promise<void>) {
    const existing = await this.prisma.appMigration.findUnique({ where: { key } });
    if (existing) {
      this.logger.i(`Migration "${key}" already applied, skipping`);
      return;
    }

    this.logger.i(`Running migration "${key}"`);
    await migration();
    await this.prisma.appMigration.create({ data: { key } });
    this.logger.i(`Migration "${key}" complete`);
  }

  // seed the countries
  private async seedCurrencies() {
    const currencies = [
      { id: 1, code: 'AED', name: 'UAE Dirham', symbol: 'د.إ' },
      { id: 2, code: 'AFN', name: 'Afghan Afghani', symbol: '؋' },
      { id: 3, code: 'ALL', name: 'Albanian Lek', symbol: 'L' },
      { id: 4, code: 'AMD', name: 'Armenian Dram', symbol: '֏' },
      { id: 5, code: 'ANG', name: 'Netherlands Antillean Guilder', symbol: 'ƒ' },
      { id: 6, code: 'AOA', name: 'Angolan Kwanza', symbol: 'Kz' },
      { id: 7, code: 'ARS', name: 'Argentine Peso', symbol: '$' },
      { id: 8, code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
      { id: 9, code: 'AWG', name: 'Aruban Florin', symbol: 'ƒ' },
      { id: 10, code: 'AZN', name: 'Azerbaijani Manat', symbol: '₼' },
      { id: 11, code: 'BAM', name: 'Bosnia-Herzegovina Convertible Mark', symbol: 'KM' },
      { id: 12, code: 'BBD', name: 'Barbadian Dollar', symbol: 'Bds$' },
      { id: 13, code: 'BDT', name: 'Bangladeshi Taka', symbol: '৳' },
      { id: 14, code: 'BGN', name: 'Bulgarian Lev', symbol: 'лв' },
      { id: 15, code: 'BHD', name: 'Bahraini Dinar', symbol: '.د.ب' },
      { id: 16, code: 'BIF', name: 'Burundian Franc', symbol: 'FBu' },
      { id: 17, code: 'BMD', name: 'Bermudan Dollar', symbol: 'BD$' },
      { id: 18, code: 'BND', name: 'Brunei Dollar', symbol: 'B$' },
      { id: 19, code: 'BOB', name: 'Bolivian Boliviano', symbol: 'Bs.' },
      { id: 20, code: 'BRL', name: 'Brazilian Real', symbol: 'R$' },
      { id: 21, code: 'BSD', name: 'Bahamian Dollar', symbol: 'B$' },
      { id: 22, code: 'BTN', name: 'Bhutanese Ngultrum', symbol: 'Nu.' },
      { id: 23, code: 'BWP', name: 'Botswanan Pula', symbol: 'P' },
      { id: 24, code: 'BYN', name: 'Belarusian Ruble', symbol: 'Br' },
      { id: 25, code: 'BZD', name: 'Belize Dollar', symbol: 'BZ$' },
      { id: 26, code: 'CAD', name: 'Canadian Dollar', symbol: 'CA$' },
      { id: 27, code: 'CDF', name: 'Congolese Franc', symbol: 'FC' },
      { id: 28, code: 'CHF', name: 'Swiss Franc', symbol: 'CHF' },
      { id: 29, code: 'CLP', name: 'Chilean Peso', symbol: 'CL$' },
      { id: 30, code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
      { id: 31, code: 'COP', name: 'Colombian Peso', symbol: 'CO$' },
      { id: 32, code: 'CRC', name: 'Costa Rican Colon', symbol: '₡' },
      { id: 33, code: 'CUP', name: 'Cuban Peso', symbol: '₱' },
      { id: 34, code: 'CVE', name: 'Cape Verdean Escudo', symbol: 'Esc' },
      { id: 35, code: 'CZK', name: 'Czech Koruna', symbol: 'Kč' },
      { id: 36, code: 'DJF', name: 'Djiboutian Franc', symbol: 'Fdj' },
      { id: 37, code: 'DKK', name: 'Danish Krone', symbol: 'kr' },
      { id: 38, code: 'DOP', name: 'Dominican Peso', symbol: 'RD$' },
      { id: 39, code: 'DZD', name: 'Algerian Dinar', symbol: 'د.ج' },
      { id: 40, code: 'EGP', name: 'Egyptian Pound', symbol: 'E£' },
      { id: 41, code: 'ERN', name: 'Eritrean Nakfa', symbol: 'Nfk' },
      { id: 42, code: 'ETB', name: 'Ethiopian Birr', symbol: 'Br' },
      { id: 43, code: 'EUR', name: 'Euro', symbol: '€' },
      { id: 44, code: 'FJD', name: 'Fijian Dollar', symbol: 'FJ$' },
      { id: 45, code: 'FKP', name: 'Falkland Islands Pound', symbol: 'FK£' },
      { id: 46, code: 'GBP', name: 'British Pound', symbol: '£' },
      { id: 47, code: 'GEL', name: 'Georgian Lari', symbol: '₾' },
      { id: 48, code: 'GHS', name: 'Ghanaian Cedi', symbol: 'GH₵' },
      { id: 49, code: 'GIP', name: 'Gibraltar Pound', symbol: '£' },
      { id: 50, code: 'GMD', name: 'Gambian Dalasi', symbol: 'D' },
      { id: 51, code: 'GNF', name: 'Guinean Franc', symbol: 'FG' },
      { id: 52, code: 'GTQ', name: 'Guatemalan Quetzal', symbol: 'Q' },
      { id: 53, code: 'GYD', name: 'Guyanaese Dollar', symbol: 'GY$' },
      { id: 54, code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$' },
      { id: 55, code: 'HNL', name: 'Honduran Lempira', symbol: 'L' },
      { id: 56, code: 'HTG', name: 'Haitian Gourde', symbol: 'G' },
      { id: 57, code: 'HUF', name: 'Hungarian Forint', symbol: 'Ft' },
      { id: 58, code: 'IDR', name: 'Indonesian Rupiah', symbol: 'Rp' },
      { id: 59, code: 'ILS', name: 'Israeli New Shekel', symbol: '₪' },
      { id: 60, code: 'INR', name: 'Indian Rupee', symbol: '₹' },
      { id: 61, code: 'IQD', name: 'Iraqi Dinar', symbol: 'ع.د' },
      { id: 62, code: 'IRR', name: 'Iranian Rial', symbol: '﷼' },
      { id: 63, code: 'ISK', name: 'Icelandic Krona', symbol: 'kr' },
      { id: 64, code: 'JMD', name: 'Jamaican Dollar', symbol: 'J$' },
      { id: 65, code: 'JOD', name: 'Jordanian Dinar', symbol: 'JD' },
      { id: 66, code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
      { id: 67, code: 'KES', name: 'Kenyan Shilling', symbol: 'KSh' },
      { id: 68, code: 'KGS', name: 'Kyrgystani Som', symbol: 'сом' },
      { id: 69, code: 'KHR', name: 'Cambodian Riel', symbol: '៛' },
      { id: 70, code: 'KMF', name: 'Comorian Franc', symbol: 'CF' },
      { id: 71, code: 'KPW', name: 'North Korean Won', symbol: '₩' },
      { id: 72, code: 'KRW', name: 'South Korean Won', symbol: '₩' },
      { id: 73, code: 'KWD', name: 'Kuwaiti Dinar', symbol: 'د.ك' },
      { id: 74, code: 'KYD', name: 'Cayman Islands Dollar', symbol: 'CI$' },
      { id: 75, code: 'KZT', name: 'Kazakhstani Tenge', symbol: '₸' },
      { id: 76, code: 'LAK', name: 'Laotian Kip', symbol: '₭' },
      { id: 77, code: 'LBP', name: 'Lebanese Pound', symbol: 'L£' },
      { id: 78, code: 'LKR', name: 'Sri Lankan Rupee', symbol: 'Rs' },
      { id: 79, code: 'LRD', name: 'Liberian Dollar', symbol: 'L$' },
      { id: 80, code: 'LSL', name: 'Lesotho Loti', symbol: 'L' },
      { id: 81, code: 'LYD', name: 'Libyan Dinar', symbol: 'ل.د' },
      { id: 82, code: 'MAD', name: 'Moroccan Dirham', symbol: 'MAD' },
      { id: 83, code: 'MDL', name: 'Moldovan Leu', symbol: 'L' },
      { id: 84, code: 'MGA', name: 'Malagasy Ariary', symbol: 'Ar' },
      { id: 85, code: 'MKD', name: 'Macedonian Denar', symbol: 'ден' },
      { id: 86, code: 'MMK', name: 'Myanmar Kyat', symbol: 'K' },
      { id: 87, code: 'MNT', name: 'Mongolian Tugrik', symbol: '₮' },
      { id: 88, code: 'MOP', name: 'Macanese Pataca', symbol: 'MOP$' },
      { id: 89, code: 'MRU', name: 'Mauritanian Ouguiya', symbol: 'UM' },
      { id: 90, code: 'MUR', name: 'Mauritian Rupee', symbol: 'Rs' },
      { id: 91, code: 'MVR', name: 'Maldivian Rufiyaa', symbol: 'Rf' },
      { id: 92, code: 'MWK', name: 'Malawian Kwacha', symbol: 'MK' },
      { id: 93, code: 'MXN', name: 'Mexican Peso', symbol: 'MX$' },
      { id: 94, code: 'MYR', name: 'Malaysian Ringgit', symbol: 'RM' },
      { id: 95, code: 'MZN', name: 'Mozambican Metical', symbol: 'MT' },
      { id: 96, code: 'NAD', name: 'Namibian Dollar', symbol: 'N$' },
      { id: 97, code: 'NGN', name: 'Nigerian Naira', symbol: '₦' },
      { id: 98, code: 'NIO', name: 'Nicaraguan Cordoba', symbol: 'C$' },
      { id: 99, code: 'NOK', name: 'Norwegian Krone', symbol: 'kr' },
      { id: 100, code: 'NPR', name: 'Nepalese Rupee', symbol: 'Rs' },
      { id: 101, code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$' },
      { id: 102, code: 'OMR', name: 'Omani Rial', symbol: 'ر.ع.' },
      { id: 103, code: 'PAB', name: 'Panamanian Balboa', symbol: 'B/.' },
      { id: 104, code: 'PEN', name: 'Peruvian Sol', symbol: 'S/.' },
      { id: 105, code: 'PGK', name: 'Papua New Guinean Kina', symbol: 'K' },
      { id: 106, code: 'PHP', name: 'Philippine Peso', symbol: '₱' },
      { id: 107, code: 'PKR', name: 'Pakistani Rupee', symbol: 'Rs' },
      { id: 108, code: 'PLN', name: 'Polish Zloty', symbol: 'zł' },
      { id: 109, code: 'PYG', name: 'Paraguayan Guarani', symbol: '₲' },
      { id: 110, code: 'QAR', name: 'Qatari Rial', symbol: 'ر.ق' },
      { id: 111, code: 'RON', name: 'Romanian Leu', symbol: 'lei' },
      { id: 112, code: 'RSD', name: 'Serbian Dinar', symbol: 'din.' },
      { id: 113, code: 'RUB', name: 'Russian Ruble', symbol: '₽' },
      { id: 114, code: 'RWF', name: 'Rwandan Franc', symbol: 'RF' },
      { id: 115, code: 'SAR', name: 'Saudi Riyal', symbol: 'ر.س' },
      { id: 116, code: 'SBD', name: 'Solomon Islands Dollar', symbol: 'SI$' },
      { id: 117, code: 'SCR', name: 'Seychellois Rupee', symbol: 'Rs' },
      { id: 118, code: 'SDG', name: 'Sudanese Pound', symbol: 'ج.س.' },
      { id: 119, code: 'SEK', name: 'Swedish Krona', symbol: 'kr' },
      { id: 120, code: 'SGD', name: 'Singapore Dollar', symbol: 'S$' },
      { id: 121, code: 'SHP', name: 'Saint Helena Pound', symbol: '£' },
      { id: 122, code: 'SLE', name: 'Sierra Leonean Leone', symbol: 'Le' },
      { id: 123, code: 'SOS', name: 'Somali Shilling', symbol: 'Sh' },
      { id: 124, code: 'SRD', name: 'Surinamese Dollar', symbol: 'Sr$' },
      { id: 125, code: 'SSP', name: 'South Sudanese Pound', symbol: 'SS£' },
      { id: 126, code: 'STN', name: 'Sao Tome and Principe Dobra', symbol: 'Db' },
      { id: 127, code: 'SYP', name: 'Syrian Pound', symbol: 'S£' },
      { id: 128, code: 'SZL', name: 'Swazi Lilangeni', symbol: 'E' },
      { id: 129, code: 'THB', name: 'Thai Baht', symbol: '฿' },
      { id: 130, code: 'TJS', name: 'Tajikistani Somoni', symbol: 'SM' },
      { id: 131, code: 'TMT', name: 'Turkmenistani Manat', symbol: 'T' },
      { id: 132, code: 'TND', name: 'Tunisian Dinar', symbol: 'د.ت' },
      { id: 133, code: 'TOP', name: 'Tongan Paanga', symbol: 'T$' },
      { id: 134, code: 'TRY', name: 'Turkish Lira', symbol: '₺' },
      { id: 135, code: 'TTD', name: 'Trinidad and Tobago Dollar', symbol: 'TT$' },
      { id: 136, code: 'TWD', name: 'New Taiwan Dollar', symbol: 'NT$' },
      { id: 137, code: 'TZS', name: 'Tanzanian Shilling', symbol: 'TSh' },
      { id: 138, code: 'UAH', name: 'Ukrainian Hryvnia', symbol: '₴' },
      { id: 139, code: 'UGX', name: 'Ugandan Shilling', symbol: 'USh' },
      { id: 140, code: 'USD', name: 'US Dollar', symbol: '$' },
      { id: 141, code: 'UYU', name: 'Uruguayan Peso', symbol: '$U' },
      { id: 142, code: 'UZS', name: 'Uzbekistani Som', symbol: 'сўм' },
      { id: 143, code: 'VES', name: 'Venezuelan Bolivar', symbol: 'Bs.S' },
      { id: 144, code: 'VND', name: 'Vietnamese Dong', symbol: '₫' },
      { id: 145, code: 'VUV', name: 'Vanuatu Vatu', symbol: 'VT' },
      { id: 146, code: 'WST', name: 'Samoan Tala', symbol: 'WS$' },
      { id: 147, code: 'XAF', name: 'Central African CFA Franc', symbol: 'FCFA' },
      { id: 148, code: 'XCD', name: 'East Caribbean Dollar', symbol: 'EC$' },
      { id: 149, code: 'XOF', name: 'West African CFA Franc', symbol: 'CFA' },
      { id: 150, code: 'XPF', name: 'CFP Franc', symbol: '₣' },
      { id: 151, code: 'YER', name: 'Yemeni Rial', symbol: '﷼' },
      { id: 152, code: 'ZAR', name: 'South African Rand', symbol: 'R' },
      { id: 153, code: 'ZMW', name: 'Zambian Kwacha', symbol: 'ZK' },
      { id: 154, code: 'ZWL', name: 'Zimbabwean Dollar', symbol: 'Z$' },
    ];

    for (const currency of currencies) {
      await this.prisma.currency.upsert({
        where: { code: currency.code },
        update: {},
        create: currency,
      });
    }
    this.logger.i(`Currencies seeded: ${currencies.length}`);
  }

  // seed the countries
  private async seedCountries() {
    const countries = [
      { id: 1, code: 'AF', name: 'Afghanistan' },
      { id: 2, code: 'AX', name: 'Aland Islands' },
      { id: 3, code: 'AL', name: 'Albania' },
      { id: 4, code: 'DZ', name: 'Algeria' },
      { id: 5, code: 'AS', name: 'American Samoa' },
      { id: 6, code: 'AD', name: 'Andorra' },
      { id: 7, code: 'AO', name: 'Angola' },
      { id: 8, code: 'AI', name: 'Anguilla' },
      { id: 9, code: 'AQ', name: 'Antarctica' },
      { id: 10, code: 'AG', name: 'Antigua and Barbuda' },
      { id: 11, code: 'AR', name: 'Argentina' },
      { id: 12, code: 'AM', name: 'Armenia' },
      { id: 13, code: 'AW', name: 'Aruba' },
      { id: 14, code: 'AU', name: 'Australia' },
      { id: 15, code: 'AT', name: 'Austria' },
      { id: 16, code: 'AZ', name: 'Azerbaijan' },
      { id: 17, code: 'BS', name: 'Bahamas' },
      { id: 18, code: 'BH', name: 'Bahrain' },
      { id: 19, code: 'BD', name: 'Bangladesh' },
      { id: 20, code: 'BB', name: 'Barbados' },
      { id: 21, code: 'BY', name: 'Belarus' },
      { id: 22, code: 'BE', name: 'Belgium' },
      { id: 23, code: 'BZ', name: 'Belize' },
      { id: 24, code: 'BJ', name: 'Benin' },
      { id: 25, code: 'BM', name: 'Bermuda' },
      { id: 26, code: 'BT', name: 'Bhutan' },
      { id: 27, code: 'BO', name: 'Bolivia' },
      { id: 28, code: 'BQ', name: 'Bonaire, Sint Eustatius and Saba' },
      { id: 29, code: 'BA', name: 'Bosnia and Herzegovina' },
      { id: 30, code: 'BW', name: 'Botswana' },
      { id: 31, code: 'BV', name: 'Bouvet Island' },
      { id: 32, code: 'BR', name: 'Brazil' },
      { id: 33, code: 'IO', name: 'British Indian Ocean Territory' },
      { id: 34, code: 'BN', name: 'Brunei Darussalam' },
      { id: 35, code: 'BG', name: 'Bulgaria' },
      { id: 36, code: 'BF', name: 'Burkina Faso' },
      { id: 37, code: 'BI', name: 'Burundi' },
      { id: 38, code: 'CV', name: 'Cabo Verde' },
      { id: 39, code: 'KH', name: 'Cambodia' },
      { id: 40, code: 'CM', name: 'Cameroon' },
      { id: 41, code: 'CA', name: 'Canada' },
      { id: 42, code: 'KY', name: 'Cayman Islands' },
      { id: 43, code: 'CF', name: 'Central African Republic' },
      { id: 44, code: 'TD', name: 'Chad' },
      { id: 45, code: 'CL', name: 'Chile' },
      { id: 46, code: 'CN', name: 'China' },
      { id: 47, code: 'CX', name: 'Christmas Island' },
      { id: 48, code: 'CC', name: 'Cocos (Keeling) Islands' },
      { id: 49, code: 'CO', name: 'Colombia' },
      { id: 50, code: 'KM', name: 'Comoros' },
      { id: 51, code: 'CG', name: 'Congo' },
      { id: 52, code: 'CD', name: 'Congo, Democratic Republic of the' },
      { id: 53, code: 'CK', name: 'Cook Islands' },
      { id: 54, code: 'CR', name: 'Costa Rica' },
      { id: 55, code: 'CI', name: "Cote d'Ivoire" },
      { id: 56, code: 'HR', name: 'Croatia' },
      { id: 57, code: 'CU', name: 'Cuba' },
      { id: 58, code: 'CW', name: 'Curacao' },
      { id: 59, code: 'CY', name: 'Cyprus' },
      { id: 60, code: 'CZ', name: 'Czechia' },
      { id: 61, code: 'DK', name: 'Denmark' },
      { id: 62, code: 'DJ', name: 'Djibouti' },
      { id: 63, code: 'DM', name: 'Dominica' },
      { id: 64, code: 'DO', name: 'Dominican Republic' },
      { id: 65, code: 'EC', name: 'Ecuador' },
      { id: 66, code: 'EG', name: 'Egypt' },
      { id: 67, code: 'SV', name: 'El Salvador' },
      { id: 68, code: 'GQ', name: 'Equatorial Guinea' },
      { id: 69, code: 'ER', name: 'Eritrea' },
      { id: 70, code: 'EE', name: 'Estonia' },
      { id: 71, code: 'SZ', name: 'Eswatini' },
      { id: 72, code: 'ET', name: 'Ethiopia' },
      { id: 73, code: 'FK', name: 'Falkland Islands' },
      { id: 74, code: 'FO', name: 'Faroe Islands' },
      { id: 75, code: 'FJ', name: 'Fiji' },
      { id: 76, code: 'FI', name: 'Finland' },
      { id: 77, code: 'FR', name: 'France' },
      { id: 78, code: 'GF', name: 'French Guiana' },
      { id: 79, code: 'PF', name: 'French Polynesia' },
      { id: 80, code: 'TF', name: 'French Southern Territories' },
      { id: 81, code: 'GA', name: 'Gabon' },
      { id: 82, code: 'GM', name: 'Gambia' },
      { id: 83, code: 'GE', name: 'Georgia' },
      { id: 84, code: 'DE', name: 'Germany' },
      { id: 85, code: 'GH', name: 'Ghana' },
      { id: 86, code: 'GI', name: 'Gibraltar' },
      { id: 87, code: 'GR', name: 'Greece' },
      { id: 88, code: 'GL', name: 'Greenland' },
      { id: 89, code: 'GD', name: 'Grenada' },
      { id: 90, code: 'GP', name: 'Guadeloupe' },
      { id: 91, code: 'GU', name: 'Guam' },
      { id: 92, code: 'GT', name: 'Guatemala' },
      { id: 93, code: 'GG', name: 'Guernsey' },
      { id: 94, code: 'GN', name: 'Guinea' },
      { id: 95, code: 'GW', name: 'Guinea-Bissau' },
      { id: 96, code: 'GY', name: 'Guyana' },
      { id: 97, code: 'HT', name: 'Haiti' },
      { id: 98, code: 'HM', name: 'Heard Island and McDonald Islands' },
      { id: 99, code: 'VA', name: 'Holy See' },
      { id: 100, code: 'HN', name: 'Honduras' },
      { id: 101, code: 'HK', name: 'Hong Kong' },
      { id: 102, code: 'HU', name: 'Hungary' },
      { id: 103, code: 'IS', name: 'Iceland' },
      { id: 104, code: 'IN', name: 'India' },
      { id: 105, code: 'ID', name: 'Indonesia' },
      { id: 106, code: 'IR', name: 'Iran' },
      { id: 107, code: 'IQ', name: 'Iraq' },
      { id: 108, code: 'IE', name: 'Ireland' },
      { id: 109, code: 'IM', name: 'Isle of Man' },
      { id: 110, code: 'IL', name: 'Israel' },
      { id: 111, code: 'IT', name: 'Italy' },
      { id: 112, code: 'JM', name: 'Jamaica' },
      { id: 113, code: 'JP', name: 'Japan' },
      { id: 114, code: 'JE', name: 'Jersey' },
      { id: 115, code: 'JO', name: 'Jordan' },
      { id: 116, code: 'KZ', name: 'Kazakhstan' },
      { id: 117, code: 'KE', name: 'Kenya' },
      { id: 118, code: 'KI', name: 'Kiribati' },
      { id: 119, code: 'KP', name: 'North Korea' },
      { id: 120, code: 'KR', name: 'South Korea' },
      { id: 121, code: 'KW', name: 'Kuwait' },
      { id: 122, code: 'KG', name: 'Kyrgyzstan' },
      { id: 123, code: 'LA', name: 'Laos' },
      { id: 124, code: 'LV', name: 'Latvia' },
      { id: 125, code: 'LB', name: 'Lebanon' },
      { id: 126, code: 'LS', name: 'Lesotho' },
      { id: 127, code: 'LR', name: 'Liberia' },
      { id: 128, code: 'LY', name: 'Libya' },
      { id: 129, code: 'LI', name: 'Liechtenstein' },
      { id: 130, code: 'LT', name: 'Lithuania' },
      { id: 131, code: 'LU', name: 'Luxembourg' },
      { id: 132, code: 'MO', name: 'Macao' },
      { id: 133, code: 'MG', name: 'Madagascar' },
      { id: 134, code: 'MW', name: 'Malawi' },
      { id: 135, code: 'MY', name: 'Malaysia' },
      { id: 136, code: 'MV', name: 'Maldives' },
      { id: 137, code: 'ML', name: 'Mali' },
      { id: 138, code: 'MT', name: 'Malta' },
      { id: 139, code: 'MH', name: 'Marshall Islands' },
      { id: 140, code: 'MQ', name: 'Martinique' },
      { id: 141, code: 'MR', name: 'Mauritania' },
      { id: 142, code: 'MU', name: 'Mauritius' },
      { id: 143, code: 'YT', name: 'Mayotte' },
      { id: 144, code: 'MX', name: 'Mexico' },
      { id: 145, code: 'FM', name: 'Micronesia' },
      { id: 146, code: 'MD', name: 'Moldova' },
      { id: 147, code: 'MC', name: 'Monaco' },
      { id: 148, code: 'MN', name: 'Mongolia' },
      { id: 149, code: 'ME', name: 'Montenegro' },
      { id: 150, code: 'MS', name: 'Montserrat' },
      { id: 151, code: 'MA', name: 'Morocco' },
      { id: 152, code: 'MZ', name: 'Mozambique' },
      { id: 153, code: 'MM', name: 'Myanmar' },
      { id: 154, code: 'NA', name: 'Namibia' },
      { id: 155, code: 'NR', name: 'Nauru' },
      { id: 156, code: 'NP', name: 'Nepal' },
      { id: 157, code: 'NL', name: 'Netherlands' },
      { id: 158, code: 'NC', name: 'New Caledonia' },
      { id: 159, code: 'NZ', name: 'New Zealand' },
      { id: 160, code: 'NI', name: 'Nicaragua' },
      { id: 161, code: 'NE', name: 'Niger' },
      { id: 162, code: 'NG', name: 'Nigeria' },
      { id: 163, code: 'NU', name: 'Niue' },
      { id: 164, code: 'NF', name: 'Norfolk Island' },
      { id: 165, code: 'MK', name: 'North Macedonia' },
      { id: 166, code: 'MP', name: 'Northern Mariana Islands' },
      { id: 167, code: 'NO', name: 'Norway' },
      { id: 168, code: 'OM', name: 'Oman' },
      { id: 169, code: 'PK', name: 'Pakistan' },
      { id: 170, code: 'PW', name: 'Palau' },
      { id: 171, code: 'PS', name: 'Palestine' },
      { id: 172, code: 'PA', name: 'Panama' },
      { id: 173, code: 'PG', name: 'Papua New Guinea' },
      { id: 174, code: 'PY', name: 'Paraguay' },
      { id: 175, code: 'PE', name: 'Peru' },
      { id: 176, code: 'PH', name: 'Philippines' },
      { id: 177, code: 'PN', name: 'Pitcairn' },
      { id: 178, code: 'PL', name: 'Poland' },
      { id: 179, code: 'PT', name: 'Portugal' },
      { id: 180, code: 'PR', name: 'Puerto Rico' },
      { id: 181, code: 'QA', name: 'Qatar' },
      { id: 182, code: 'RE', name: 'Reunion' },
      { id: 183, code: 'RO', name: 'Romania' },
      { id: 184, code: 'RU', name: 'Russian Federation' },
      { id: 185, code: 'RW', name: 'Rwanda' },
      { id: 186, code: 'BL', name: 'Saint Barthelemy' },
      { id: 187, code: 'SH', name: 'Saint Helena' },
      { id: 188, code: 'KN', name: 'Saint Kitts and Nevis' },
      { id: 189, code: 'LC', name: 'Saint Lucia' },
      { id: 190, code: 'MF', name: 'Saint Martin' },
      { id: 191, code: 'PM', name: 'Saint Pierre and Miquelon' },
      { id: 192, code: 'VC', name: 'Saint Vincent and the Grenadines' },
      { id: 193, code: 'WS', name: 'Samoa' },
      { id: 194, code: 'SM', name: 'San Marino' },
      { id: 195, code: 'ST', name: 'Sao Tome and Principe' },
      { id: 196, code: 'SA', name: 'Saudi Arabia' },
      { id: 197, code: 'SN', name: 'Senegal' },
      { id: 198, code: 'RS', name: 'Serbia' },
      { id: 199, code: 'SC', name: 'Seychelles' },
      { id: 200, code: 'SL', name: 'Sierra Leone' },
      { id: 201, code: 'SG', name: 'Singapore' },
      { id: 202, code: 'SX', name: 'Sint Maarten' },
      { id: 203, code: 'SK', name: 'Slovakia' },
      { id: 204, code: 'SI', name: 'Slovenia' },
      { id: 205, code: 'SB', name: 'Solomon Islands' },
      { id: 206, code: 'SO', name: 'Somalia' },
      { id: 207, code: 'ZA', name: 'South Africa' },
      { id: 208, code: 'GS', name: 'South Georgia and the South Sandwich Islands' },
      { id: 209, code: 'SS', name: 'South Sudan' },
      { id: 210, code: 'ES', name: 'Spain' },
      { id: 211, code: 'LK', name: 'Sri Lanka' },
      { id: 212, code: 'SD', name: 'Sudan' },
      { id: 213, code: 'SR', name: 'Suriname' },
      { id: 214, code: 'SJ', name: 'Svalbard and Jan Mayen' },
      { id: 215, code: 'SE', name: 'Sweden' },
      { id: 216, code: 'CH', name: 'Switzerland' },
      { id: 217, code: 'SY', name: 'Syria' },
      { id: 218, code: 'TW', name: 'Taiwan' },
      { id: 219, code: 'TJ', name: 'Tajikistan' },
      { id: 220, code: 'TZ', name: 'Tanzania' },
      { id: 221, code: 'TH', name: 'Thailand' },
      { id: 222, code: 'TL', name: 'Timor-Leste' },
      { id: 223, code: 'TG', name: 'Togo' },
      { id: 224, code: 'TK', name: 'Tokelau' },
      { id: 225, code: 'TO', name: 'Tonga' },
      { id: 226, code: 'TT', name: 'Trinidad and Tobago' },
      { id: 227, code: 'TN', name: 'Tunisia' },
      { id: 228, code: 'TR', name: 'Turkey' },
      { id: 229, code: 'TM', name: 'Turkmenistan' },
      { id: 230, code: 'TC', name: 'Turks and Caicos Islands' },
      { id: 231, code: 'TV', name: 'Tuvalu' },
      { id: 232, code: 'UG', name: 'Uganda' },
      { id: 233, code: 'UA', name: 'Ukraine' },
      { id: 234, code: 'AE', name: 'United Arab Emirates' },
      { id: 235, code: 'GB', name: 'United Kingdom' },
      { id: 236, code: 'US', name: 'United States' },
      { id: 237, code: 'UM', name: 'United States Minor Outlying Islands' },
      { id: 238, code: 'UY', name: 'Uruguay' },
      { id: 239, code: 'UZ', name: 'Uzbekistan' },
      { id: 240, code: 'VU', name: 'Vanuatu' },
      { id: 241, code: 'VE', name: 'Venezuela' },
      { id: 242, code: 'VN', name: 'Vietnam' },
      { id: 243, code: 'VG', name: 'British Virgin Islands' },
      { id: 244, code: 'VI', name: 'U.S. Virgin Islands' },
      { id: 245, code: 'WF', name: 'Wallis and Futuna' },
      { id: 246, code: 'EH', name: 'Western Sahara' },
      { id: 247, code: 'YE', name: 'Yemen' },
      { id: 248, code: 'ZM', name: 'Zambia' },
      { id: 249, code: 'ZW', name: 'Zimbabwe' },
    ];

    for (const country of countries) {
      await this.prisma.country.upsert({
        where: { code: country.code },
        update: {},
        create: country,
      });
    }
    this.logger.i(`Countries seeded: ${countries.length}`);
  }

  // create test users
  private async createTestUsers(users: { email: string; firstname: string; lastname: string; organizationName: string; roles: UserRoleDtoEnum[]; isSuperAdmin: boolean }[]) {
    const hashedPassword = await this.passwordService.hash('test');

    for (const userData of users) {
      let organisation = await this.prisma.organization.findFirst({ where: { name: userData.organizationName } });
      if (!organisation) {
        organisation = await this.prisma.organization.create({
          data: {
            name: userData.organizationName,
            currency: { connect: { id: 60 } },
          },
        });
      }

      const user = await this.prisma.user.upsert({
        where: { email: userData.email },
        update: {},
        create: {
          email: userData.email,
          firstname: userData.firstname,
          lastname: userData.lastname,
          password: hashedPassword,
          isActive: true,
          isSuperAdmin: userData.isSuperAdmin,
        },
      });

      await this.prisma.organizationHasUser.upsert({
        where: { organizationId_userId: { organizationId: organisation.id, userId: user.id } },
        update: { roles: userData.roles },
        create: {
          userId: user.id,
          organizationId: organisation.id,
          roles: userData.roles,
        },
      });
    }

    this.logger.i('Test users created');
  }

  // create a sample employee with all possible data for the seeder-generated organisation
  private async createTestEmployee() {
    const org = await this.prisma.organization.findFirst({ where: { name: 'Test Organization' } });
    if (!org) {
      this.logger.w('Test Organization not found, skipping sample employee creation');
      return;
    }

    const hashedPassword = await this.passwordService.hash('test');

    // Create employee user
    const user = await this.prisma.user.upsert({
      where: { email: 'John@test.com' },
      update: {},
      create: {
        email: 'John@test.com',
        firstname: 'John',
        lastname: 'Doe',
        password: hashedPassword,
        isActive: true,
        isSuperAdmin: false,
      },
    });

    // Link user to organisation with employee role
    await this.prisma.organizationHasUser.upsert({
      where: { organizationId_userId: { organizationId: org.id, userId: user.id } },
      update: { roles: ['employee'] },
      create: { userId: user.id, organizationId: org.id, roles: ['employee'] },
    });

    // Create employee record
    const employee = await this.prisma.employee.upsert({
      where: { userId_organizationId: { userId: user.id, organizationId: org.id } },
      update: {},
      create: {
        userId: user.id,
        organizationId: org.id,
        employeeCode: 'EMP-001',
        personalEmail: 'john.doe.personal@email.com',
        dob: new Date('1995-06-15'),
        pan: 'ABCDE1234F',
        aadhaar: '123456789012',
        designation: 'Software Engineer',
        dateOfJoining: new Date('2025-01-15'),
        status: 'active',
        isBgVerified: true,
        emergencyContactName: 'Jane Doe',
        emergencyContactNumber: '9876543210',
        emergencyContactRelationship: 'Spouse',
      },
    });

    // Create branch and assign employee
    const branch = await this.prisma.branch.upsert({
      where: { id: 1 },
      update: {},
      create: { name: 'Head Office', organizationId: org.id },
    });

    await this.prisma.userInBranch.upsert({
      where: { userId_branchId: { userId: user.id, branchId: branch.id } },
      update: {},
      create: { userId: user.id, branchId: branch.id, organizationId: org.id },
    });

    // Create compensation (annual CTC of 12,00,000)
    const existingComp = await this.prisma.payrollCompensation.findFirst({
      where: { userId: user.id, organizationId: org.id, isActive: true },
    });

    if (!existingComp) {
      await this.prisma.payrollCompensation.create({
        data: {
          userId: user.id,
          organizationId: org.id,
          grossAmount: 1200000,
          effectiveFrom: new Date('2025-01-15'),
          isActive: true,
          payrollCompensationLineItems: {
            create: [
              { title: 'Basic Salary', amount: 600000 },
              { title: 'House Rent Allowance', amount: 300000 },
              { title: 'Special Allowance', amount: 200000 },
              { title: 'Conveyance Allowance', amount: 100000 },
            ],
          },
        },
      });
    }

    // Create deductions
    const existingDeduction = await this.prisma.payrollDeduction.findFirst({
      where: { userId: user.id, organizationId: org.id, isActive: true },
    });

    if (!existingDeduction) {
      await this.prisma.payrollDeduction.create({
        data: {
          userId: user.id,
          organizationId: org.id,
          effectiveFrom: new Date('2025-01-15'),
          isActive: true,
          payrollDeductionLineItems: {
            create: [
              { type: 'providentFund', frequency: 'monthly', amount: 1800 },
              { type: 'professionalTax', frequency: 'monthly', amount: 200 },
              { type: 'incomeTax', frequency: 'monthly', amount: 5000 },
              { type: 'insurance', frequency: 'monthly', amount: 500 },
            ],
          },
        },
      });
    }

    // Create employee leave counter
    const { getFinancialYearCode } = await import('@repo/shared');
    const financialYear = getFinancialYearCode(employee.dateOfJoining);
    await this.prisma.employeeLeaveCounter.upsert({
      where: { userId_organizationId_financialYear: { userId: user.id, organizationId: org.id, financialYear } },
      update: {},
      create: {
        userId: user.id,
        organizationId: org.id,
        financialYear,
        casualLeaves: 2,
        sickLeaves: 1,
        earnedLeaves: 0,
        totalLeavesUsed: 3,
        totalLeavesAvailable: 24,
      },
    });

    // Create organisation settings if not exists
    const existingSettings = await this.prisma.organizationSetting.findFirst({ where: { organizationId: org.id } });
    if (!existingSettings) {
      await this.prisma.organizationSetting.create({
        data: {
          organizationId: org.id,
          noOfDaysInMonth: 'thirty',
          totalLeaveInDays: 24,
          sickLeaveInDays: 10,
          earnedLeaveInDays: 10,
          casualLeaveInDays: 10,
          maternityLeaveInDays: 10,
          paternityLeaveInDays: 10,
        },
      });
    }

    // Create organisation address (India = id 104)
    const existingAddress = await this.prisma.organizationHasAddress.findFirst({ where: { organizationId: org.id } });
    if (!existingAddress) {
      const address = await this.prisma.address.create({
        data: {
          organizationId: org.id,
          countryId: 104,
          addressLine1: '123, Tech Park, Whitefield',
          addressLine2: 'Main Road, ITPL',
          city: 'Bangalore',
          state: 'Karnataka',
          postalCode: '560066',
          latitude: 12.9716,
          longitude: 77.5946,
        },
      });
      await this.prisma.organizationHasAddress.create({
        data: { organizationId: org.id, addressId: address.id },
      });
    }

    // Create organisation contacts
    const existingContacts = await this.prisma.organizationHasContact.findFirst({ where: { organizationId: org.id } });
    if (!existingContacts) {
      const contactsData = [
        { contact: '+91 80 1234 5678', contactType: 'phone' as const },
        { contact: '+91 98765 43210', contactType: 'phone' as const },
        { contact: 'hr@testorganization.com', contactType: 'email' as const },
        { contact: 'info@testorganization.com', contactType: 'email' as const },
        { contact: 'https://www.testorganization.com', contactType: 'website' as const },
        { contact: 'https://linkedin.com/company/testorganization', contactType: 'socialMediaLink' as const },
      ];
      for (const c of contactsData) {
        const contact = await this.prisma.contact.create({
          data: { organizationId: org.id, contact: c.contact, contactType: c.contactType },
        });
        await this.prisma.organizationHasContact.create({
          data: { organizationId: org.id, contactId: contact.id },
        });
      }
    }

    // Create employee feedback
    const adminUser = await this.prisma.user.findFirst({ where: { email: 'admin@test.com' } });
    if (adminUser) {
      const existingFeedback = await this.prisma.employeeFeedback.findFirst({ where: { userId: user.id, organizationId: org.id } });
      if (!existingFeedback) {
        await this.prisma.employeeFeedback.create({
          data: {
            userId: user.id,
            organizationId: org.id,
            createdById: adminUser.id,
            trend: 'positive',
            point: 5,
            title: 'Excellent first quarter performance',
            feedback: 'John has shown exceptional skills in his first quarter. Great team player and delivers quality code consistently.',
          },
        });
      }
    }

    this.logger.i('Sample employee created with full data', { userId: user.id, employeeId: employee.id });
  }

  // initialize the employee leave counters
  private async initEmployeeLeaveCounters() {
    const { getFinancialYearCode } = await import('@repo/shared');
    const orgSetting = await this.prisma.organizationSetting.findFirst({ orderBy: { createdAt: 'desc' } });
    const totalLeavesAvailable = orgSetting?.totalLeaveInDays ?? 24;
    const employees = await this.prisma.employee.findMany({ select: { userId: true, dateOfJoining: true, organizationId: true } });
    let created = 0;
    for (const emp of employees) {
      const financialYear = getFinancialYearCode(emp.dateOfJoining);
      const existing = await this.prisma.employeeLeaveCounter.findUnique({
        where: { userId_organizationId_financialYear: { userId: emp.userId, organizationId: emp.organizationId, financialYear } },
      });
      if (!existing) {
        await this.prisma.employeeLeaveCounter.create({
          data: {
            user: { connect: { id: emp.userId } },
            organization: { connect: { id: emp.organizationId } },
            financialYear,
            casualLeaves: 0,
            sickLeaves: 0,
            earnedLeaves: 0,
            totalLeavesUsed: 0,
            totalLeavesAvailable,
          },
        });
        created++;
      }
    }
    this.logger.i(`Employee leave counters initialized: ${created} created`);
  }

  private async seedDefaultDepartments() {
    const defaultDepartments = ['HR', 'IT', 'Development', 'Accounts', 'Admin', 'Sales', 'Marketing', 'Operations', 'Finance', 'Legal'];

    const organizations = await this.prisma.organization.findMany({ select: { id: true } });
    let created = 0;

    for (const org of organizations) {
      for (const name of defaultDepartments) {
        const existing = await this.prisma.department.findFirst({
          where: { name: { equals: name, mode: 'insensitive' }, organizationId: org.id },
        });
        if (!existing) {
          await this.prisma.department.create({
            data: { name, organization: { connect: { id: org.id } } },
          });
          created++;
        }
      }
    }

    this.logger.i(`Default departments seeded: ${created} created`);
  }
}

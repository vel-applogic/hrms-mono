const isProduction = process.env.NODE_ENV === 'production';

type LogLevel = 'info' | 'warn' | 'error';

type LogData = Record<string, unknown>;

const formatLog = (level: LogLevel, message: string, data?: LogData): string => {
  return JSON.stringify({
    level,
    message,
    ...data,
    timestamp: new Date().toISOString(),
  });
};

export const logger = {
  info: (message: string, data?: LogData): void => {
    if (isProduction) {
      console.log(formatLog('info', message, data));
    } else {
      console.info(message, data ?? '');
    }
  },

  warn: (message: string, data?: LogData): void => {
    if (isProduction) {
      console.log(formatLog('warn', message, data));
    } else {
      console.warn(message, data ?? '');
    }
  },

  error: (message: string, data?: LogData): void => {
    if (isProduction) {
      console.log(formatLog('error', message, data));
    } else {
      console.error(message, data ?? '');
    }
  },
};

export type RequestLogData = {
  method: string;
  url: string;
  pathname: string;
  search: string;
  ip: string | null;
  userAgent: string | null;
  referer: string | null;
  requestId: string | null;
  geo?: {
    country?: string;
    city?: string;
    region?: string;
  };
};

export const logRequest = (data: RequestLogData): void => {
  if (isProduction) {
    console.log(
      JSON.stringify({
        level: 'info',
        message: 'incoming_request',
        ...data,
        timestamp: new Date().toISOString(),
      }),
    );
  } else {
    console.info(`[${data.method}] ${data.pathname}${data.search}`, {
      ip: data.ip,
      userAgent: data.userAgent?.substring(0, 50),
    });
  }
};

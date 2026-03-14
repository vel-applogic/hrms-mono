import axios, { AxiosError, AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { format } from 'date-fns';
import { v4 as uuid } from 'uuid';

import { logger } from '../logger';
import { APIError, APIErrorResponseSchema } from './axios-error';

// APIErrorResponse strructure should match the responses from httpexceptionfilter, unknownexceptionfilter etc
type APIErrorResponse = {
  message?: string;
};

const SENSITIVE_KEYS = ['password', 'token', 'secret', 'apikey', 'api_key', 'authorization', 'credential', 'creditcard', 'credit_card', 'ssn', 'pin'];

const sanitizeBody = (data: unknown): unknown => {
  if (data === null || data === undefined) {
    return undefined;
  }

  if (Array.isArray(data)) {
    return data.map(sanitizeBody).filter((item) => item !== undefined);
  }

  if (typeof data === 'object') {
    const sanitized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data)) {
      if (value === undefined) {
        continue;
      }
      const lowerKey = key.toLowerCase();
      if (SENSITIVE_KEYS.some((sensitive) => lowerKey.includes(sensitive))) {
        sanitized[key] = '[REDACTED]';
      } else {
        const sanitizedValue = sanitizeBody(value);
        if (sanitizedValue !== undefined) {
          sanitized[key] = sanitizedValue;
        }
      }
    }
    return Object.keys(sanitized).length > 0 ? sanitized : undefined;
  }

  return data;
};

export const CreateAxiosInstance = (baseUrl: string): AxiosInstance => {
  const axiosInstance = axios.create({
    baseURL: baseUrl,
  });
  const onRequest = async (config: InternalAxiosRequestConfig): Promise<InternalAxiosRequestConfig> => {
    config.headers.set('Accept', 'application/json');
    if (!config.headers.get('Content-Type')) {
      config.headers.set('Content-Type', 'application/json');
    }

    if (!config.headers.get('x-request-id')) {
      const requestId = `${format(new Date(), 'yyMMdd:HHmmss')}-${uuid()}`.toLowerCase();
      config.headers.set('x-request-id', requestId);
    }

    const requestId = config.headers.get('x-request-id');
    logger.info('Request', { url: config.url, method: config.method, requestId, body: sanitizeBody(config.data) });
    return config;
  };

  const onRequestError = async (error: AxiosError): Promise<AxiosError> => {
    return Promise.reject(error);
  };

  const onResponse = (response: AxiosResponse): AxiosResponse => {
    const requestId = response.config.headers.get('x-request-id');
    logger.info('Response', { status: response.status, requestId });
    return response;
  };

  const onResponseError = async (error: AxiosError<APIErrorResponse>): Promise<APIError> => {
    const requestId = error.config?.headers.get('x-request-id') as string | undefined;
    const url = error.config?.url;
    const method = error.config?.method?.toUpperCase();
    const body = sanitizeBody(error.config?.data);

    logger.error('Response error', { status: error.response?.status, data: error.response?.data, requestId, url, method });

    const statusCode = error.response?.status ?? -1;
    const message = error.response?.data?.message ?? 'Something went wrong';
    const context = { url, method, requestId, body };

    try {
      const errorData = APIErrorResponseSchema.parse(error.response?.data);
      return Promise.reject(new APIError(statusCode, message, errorData.validationErrors, context));
    } catch (_err) {
      return Promise.reject(new APIError(statusCode, message, undefined, context));
    }
  };

  axiosInstance.interceptors.request.use(onRequest, onRequestError);
  axiosInstance.interceptors.response.use(onResponse, onResponseError);

  return axiosInstance;
};

export { type AxiosInstance } from 'axios';

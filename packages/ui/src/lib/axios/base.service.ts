import { AxiosInstance } from 'axios';
import { ZodSchema } from 'zod';

import { APIError } from './axios-error';

export abstract class BaseAxiosService {
  protected userId?: number;
  protected isDevMode: boolean = false;
  constructor(protected apiService: AxiosInstance) {
    this.isDevMode = process.env.APP_ENV !== 'prod';
  }

  abstract getAuthHeaderInfo(): Promise<{ userId: number; organizationId: number }>;

  private formatError(method: string, url: string, error: any): Error {
    // If it's already an APIError, re-throw it as-is to preserve validation errors
    if (error instanceof APIError) {
      return error;
    }

    let errorMessage = `[${method}] [${url}]`;

    // Extract status code if available (works for both Axios errors and plain objects with response)
    const status = error?.response?.status || error?.status;
    const message = error?.response?.data?.message || error?.response?.data || error?.message || String(error);

    if (status) {
      errorMessage += ` [${status}]`;
    }

    if (message) {
      errorMessage += ` ${message}`;
    }

    return new Error(errorMessage);
  }

  private handleResponse<R>(response: any, responseSchema: ZodSchema, method: string, url: string): R {
    // Check for successful response status (2xx)
    if (response.status >= 200 && response.status < 300) {
      try {
        return responseSchema.parse(response.data) as R;
      } catch (_parseError) {
        console.log('zod response parse error', _parseError);
        throw new Error('Failed to decode response payload ' + (this.isDevMode ? `for : [${method}] [${url}]` : ''));
      }
    }

    // Handle non-2xx status codes
    if (response.status === 400 && response.data?.validationErrors) {
      throw new APIError(400, response.data.message || 'Validation error', response.data.validationErrors);
    }

    throw new APIError(response.status, response.data?.message || `Request failed with status ${response.status}`);
  }

  private handleError(error: any, method: string, url: string): never {
    // If error is from axios (has response property)
    if (error.response) {
      const { status, data } = error.response;

      if (status === 400 && data?.validationErrors) {
        throw new APIError(400, data.message || 'Validation error', data.validationErrors);
      }

      throw new APIError(status, data?.message || `Request failed with status ${status}`);
    }

    // If error is already formatted, re-throw
    if (error instanceof APIError || error instanceof Error) {
      throw error;
    }

    throw this.formatError(method, url, error);
  }

  private async getAuthHeaders(): Promise<Record<string, number>> {
    const { userId, organizationId } = await this.getAuthHeaderInfo();
    return { 'x-user-id': userId, 'x-organization-id': organizationId };
  }

  protected async get<Result = [Error, 'Specify the Result type parameter'], R extends Result = Result>(params: { url: string; responseSchema: ZodSchema }): Promise<NoInfer<R>> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await this.apiService.get(params.url, { headers });
      return this.handleResponse<NoInfer<R>>(response, params.responseSchema, 'GET', params.url);
    } catch (error: unknown) {
      this.handleError(error, 'GET', params.url);
    }
  }

  protected async post<R = never, D = never>(params: { url: string; data: D; responseSchema: ZodSchema }): Promise<NoInfer<R>> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await this.apiService.post(params.url, params.data, { headers });
      return this.handleResponse<NoInfer<R>>(response, params.responseSchema, 'POST', params.url);
    } catch (error: unknown) {
      this.handleError(error, 'POST', params.url);
    }
  }

  protected async postFormData<R = never, D = never>(params: { url: string; data: NoInfer<D>; responseSchema: ZodSchema }): Promise<NoInfer<R>> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await this.apiService.postForm(params.url, params.data, { headers });
      return this.handleResponse<NoInfer<R>>(response, params.responseSchema, 'POST FORM', params.url);
    } catch (error: unknown) {
      this.handleError(error, 'POST FORM', params.url);
    }
  }

  protected async put<R = never, D = never>(params: { url: string; data: NoInfer<D>; responseSchema: ZodSchema }): Promise<NoInfer<R>> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await this.apiService.put(params.url, params.data, { headers });
      return this.handleResponse<NoInfer<R>>(response, params.responseSchema, 'PUT', params.url);
    } catch (error: unknown) {
      this.handleError(error, 'PUT', params.url);
    }
  }

  protected async patch<R = never, D = never>(params: { url: string; data: NoInfer<D>; responseSchema: ZodSchema }): Promise<NoInfer<R>> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await this.apiService.patch(params.url, params.data, { headers });
      return this.handleResponse<NoInfer<R>>(response, params.responseSchema, 'PATCH', params.url);
    } catch (error: unknown) {
      this.handleError(error, 'PATCH', params.url);
    }
  }

  protected async putFormData<R = never, D = never>(params: { url: string; data: NoInfer<D>; responseSchema: ZodSchema }): Promise<NoInfer<R>> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await this.apiService.putForm(params.url, params.data, { headers });
      return this.handleResponse<NoInfer<R>>(response, params.responseSchema, 'PUT FORM', params.url);
    } catch (error: unknown) {
      this.handleError(error, 'PUT FORM', params.url);
    }
  }

  protected async delete<R = never>(params: { url: string; responseSchema: ZodSchema }): Promise<NoInfer<R>> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await this.apiService.delete(params.url, { headers });
      return this.handleResponse<NoInfer<R>>(response, params.responseSchema, 'DELETE', params.url);
    } catch (error: unknown) {
      this.handleError(error, 'DELETE', params.url);
    }
  }

  protected async authPost<R = never, D = never>(params: { url: string; data: NoInfer<D>; responseSchema: ZodSchema }): Promise<NoInfer<R>> {
    try {
      const response = await this.apiService.post(params.url, params.data);
      return this.handleResponse<NoInfer<R>>(response, params.responseSchema, 'AUTH POST', params.url);
    } catch (error: unknown) {
      this.handleError(error, 'AUTH POST', params.url);
    }
  }

  protected async authPatch<R = never, D = never>(params: { url: string; data: NoInfer<D>; responseSchema: ZodSchema }): Promise<NoInfer<R>> {
    try {
      const response = await this.apiService.patch(params.url, params.data);
      return this.handleResponse<NoInfer<R>>(response, params.responseSchema, 'AUTH PATCH', params.url);
    } catch (error: unknown) {
      this.handleError(error, 'AUTH PATCH', params.url);
    }
  }
}

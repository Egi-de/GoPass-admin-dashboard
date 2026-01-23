import axios, { AxiosInstance, AxiosError } from 'axios';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    const baseURL = process.env.NEXT_PUBLIC_API_URL || 'https://gopass-backend-nlb1.onrender.com/api';
    
    this.client = axios.create({
      baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    console.log('🌐 API Client initialized with baseURL:', baseURL);
    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        console.log(`📤 API Request: ${config.method?.toUpperCase()} ${config.url}`, config.data);
        const token = localStorage.getItem('accessToken');
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        console.error('❌ Request error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        console.log(`✅ API Response: ${response.status}`, response.data);
        return response;
      },
      async (error: AxiosError) => {
        console.error('❌ API Error:', error.response?.status, error.response?.data);
        if (error.response?.status === 401) {
          // Clear auth and redirect to login ONLY if not already there
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          if (window.location.pathname !== '/login') {
             console.log('🔄 Redirecting to login due to 401');
             window.location.href = '/login';
          }
        }
        return Promise.reject(error);
      }
    );
  }

  async get<T>(url: string, params?: any) {
    const response = await this.client.get(url, { params });
    // Handle both { data: T } and direct T response formats
    return response.data.data || response.data;
  }

  async post<T>(url: string, data?: any) {
    const response = await this.client.post(url, data);
    // Handle both { data: T } and direct T response formats
    return response.data.data || response.data;
  }

  async put<T>(url: string, data?: any) {
    const response = await this.client.put(url, data);
    return response.data.data || response.data;
  }

  async patch<T>(url: string, data?: any) {
    const response = await this.client.patch(url, data);
    return response.data.data || response.data;
  }

  async delete<T>(url: string) {
    const response = await this.client.delete(url);
    return response.data.data || response.data;
  }
}

export const apiClient = new ApiClient();

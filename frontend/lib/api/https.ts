import axios from 'axios'
import axiosRetry from 'axios-retry'

const BASE_URL = process.env.NEXT_PUBLIC_MONITORING_API_URL || 'http://localhost:3001';

export const http = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

http.interceptors.response.use(
  (response) => {
    const res = response.data;

    if (res && typeof res === 'object' && 'code' in res && res.code !== '200' && res.code !== 200) {
      return Promise.reject(new Error(res.message || 'Terjadi kesalahan sistem'));
    }
    
    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosRetry(http, {
  retries: 2,
  retryDelay: axiosRetry.exponentialDelay,
  retryCondition: (error) => axiosRetry.isNetworkError(error) || error.response?.status === 502,
})

import { AxiosError } from "axios";
import { normalizeApiError } from './error'
import { http } from "./https";

let isInterceptorsSetup = false

export const setupInterceptors = () => {
  if (isInterceptorsSetup) return
  isInterceptorsSetup = true

  http.interceptors.request.use(
    (config) => {
      if (process.env.NODE_ENV === 'development') {
        console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`)
      }
      return config
    },
    (error) => {
      return Promise.reject(error)
    }
  )

  http.interceptors.response.use(
    (response) => {
      if (process.env.NODE_ENV === 'development') {
        console.log(`[API Response] Success ${response.config.method?.toUpperCase()} ${response.config.url}`)
      }
      return response
    },
    async (error: AxiosError) => {
      const normalized = normalizeApiError(error)

      if (process.env.NODE_ENV === 'development') {
        console.error(`[API Error] Status ${normalized.status}: ${normalized.message} (${error.config?.url})`)
      }

      if (normalized.status === 401) {
        console.warn('[API Auth] Request returned 401 Unauthorized.')
      } else if (normalized.status === 403) {
        console.warn('[API Auth] Request returned 403 Forbidden.')
      }

      return Promise.reject(normalized)
    },
  )
}


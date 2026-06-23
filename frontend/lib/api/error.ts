import type { AxiosError } from 'axios'

export type ApiError = {
  status: number,
  message?: string,
  errors?: Record<string, string[]>,
  code?: string | number | null
}

export function normalizeApiError(error: AxiosError): ApiError {
  const errorData = error.response?.data as Record<string, unknown> | undefined

  let message = 'Unknown error'
  if (errorData) {
    if (typeof errorData === 'string') {
      message = errorData
    } else if (Array.isArray(errorData.message)) {
      message = errorData.message.join(', ')
    } else if (typeof errorData.message === 'string') {
      message = errorData.message
    } else if (typeof errorData.error === 'string') {
      message = errorData.error
    } else if (Array.isArray(errorData.errors) && errorData.errors.length > 0) {
      message = errorData.errors.join(', ')
    } else if (errorData.errors && typeof errorData.errors === 'object') {
      message = Object.values(errorData.errors).flat().join(', ')
    } else if (errorData.message && typeof errorData.message === 'object') {
      message = JSON.stringify(errorData.message)
    }
  } else {
    message = error.message ?? 'Unknown error'
  }

  return {
    status: error.response?.status ?? 0,
    message,
    code: (typeof errorData?.code === 'string' || typeof errorData?.code === 'number') ? errorData.code : null,
  }
}

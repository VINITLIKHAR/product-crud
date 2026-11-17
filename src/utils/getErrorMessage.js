const getErrorMessage = (error, fallback = 'Something went wrong') => {
  const data = error?.response?.data
  if (typeof data === 'string' && data) return data
  if (error?.code === 'ECONNABORTED') return 'Request timed out. Please try again.'
  if (error?.message === 'Network Error') return 'Network error. Check your internet.'
  return fallback
}

export default getErrorMessage
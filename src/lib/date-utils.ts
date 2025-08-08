import { format } from 'date-fns'

export const formatSafeDate = (dateString?: string, formatStr: string = 'MMM dd, yyyy') => {
  if (!dateString) return 'Date not available'
  
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) {
      return 'Invalid date'
    }
    return format(date, formatStr)
  } catch (error) {
    return 'Invalid date'
  }
}

export const isValidDate = (dateString?: string): boolean => {
  if (!dateString) return false
  
  try {
    const date = new Date(dateString)
    return !isNaN(date.getTime())
  } catch (error) {
    return false
  }
}
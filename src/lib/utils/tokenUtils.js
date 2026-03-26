import { jwtDecode } from 'jwt-decode'
import { safeLocalStorage } from './storage'

export const decodeToken = (token) => {
  try {
    return jwtDecode(token)
  } catch (error) {
    console.error('Token decode error:', error)
    return null
  }
}

export const isTokenExpired = (token) => {
  try {
    const decoded = jwtDecode(token)
    const currentTime = Date.now() / 1000
    return decoded.exp < currentTime
  } catch (error) {
    console.error('Token expiration check error:', error)
    return true
  }
}

export const getTokenExpirationTime = (token) => {
  try {
    const decoded = jwtDecode(token)
    return decoded.exp * 1000 // Convert to milliseconds
  } catch (error) {
    console.error('Get token expiration error:', error)
    return null
  }
}

export const getTokenTimeUntilExpiry = (token) => {
  try {
    const decoded = jwtDecode(token)
    const currentTime = Date.now() / 1000
    return (decoded.exp - currentTime) * 1000 // Convert to milliseconds
  } catch (error) {
    console.error('Get time until expiry error:', error)
    return 0
  }
}

// Alias for compatibility
export const getTimeUntilExpiration = getTokenTimeUntilExpiry

export const handleTokenExpiration = () => {
  // Clear token and redirect to login
  if (typeof window !== 'undefined') {
    safeLocalStorage.removeItem('token')
    safeLocalStorage.removeItem('user')
    window.location.href = '/login'
  }
}

export const isTokenExpiringSoon = (token, minutesThreshold = 5) => {
  try {
    const decoded = jwtDecode(token)
    const currentTime = Date.now() / 1000
    const timeUntilExpiry = decoded.exp - currentTime
    const minutesUntilExpiry = timeUntilExpiry / 60
    
    return minutesUntilExpiry <= minutesThreshold && minutesUntilExpiry > 0
  } catch (error) {
    console.error('Token expiring soon check error:', error)
    return false
  }
}

export const refreshTokenIfNeeded = async (apiService) => {
  const token = safeLocalStorage.getItem('token')
  if (!token) return false

  if (isTokenExpiringSoon(token, 10)) { // Refresh if expiring in 10 minutes
    try {
      // Implement refresh logic here if your backend supports it
      // For now, we'll just return false to indicate no refresh happened
      return false
    } catch (error) {
      console.error('Token refresh error:', error)
      return false
    }
  }

  return true
}

'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { isTokenValid, removeToken } from '../utils/authUtils'
import { useGlobalError } from '../contexts/GlobalErrorContext'

export default function TokenValidationWrapper({ children, showWarning = true }) {
  const router = useRouter()
  const { showError } = useGlobalError()
  const [isValidating, setIsValidating] = useState(true)
  const [isValid, setIsValid] = useState(false)

  useEffect(() => {
    const validateToken = () => {
      const tokenValid = isTokenValid()
      
      if (!tokenValid) {
        if (showWarning) {
          showError('Your session has expired. Please log in again.')
        }
        removeToken()
        router.push('/login')
        return
      }
      
      setIsValid(tokenValid)
      setIsValidating(false)
    }

    validateToken()
  }, [router, showError, showWarning])

  if (isValidating) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!isValid) {
    return null
  }

  return <>{children}</>
}

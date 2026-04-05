import { NextResponse } from 'next/server';

/**
 * Standard API Response Handlers for Next.js App Router
 * These ensure consistent response structures and sanitize error messages in production.
 */

export const successResponse = (data = {}, message = 'Success', status = 200) => {
  return NextResponse.json(
    {
      success: true,
      message,
      ...data,
    },
    { status }
  );
};

export const errorResponse = (error, status = 500) => {
  // Always log the actual error on the server
  console.error(`[API ERROR] Status ${status}:`, error);

  const isProduction = process.env.NODE_ENV === 'production';
  
  // Extract user-friendly message
  let displayMessage = 'An unexpected error occurred. Please try again later.';
  
  if (!isProduction) {
    if (typeof error === 'string') {
      displayMessage = error;
    } else if (error instanceof Error) {
      displayMessage = error.message;
    } else if (error && typeof error === 'object' && error.message) {
      displayMessage = error.message;
    }
  } else {
    // In production, only allow safe messages
    if (status < 500 && error?.message) {
      displayMessage = error.message;
    } else if (status >= 500) {
      displayMessage = 'Internal Server Error';
    }
  }

  return NextResponse.json(
    {
      success: false,
      message: displayMessage,
      // Only include stack trace in development
      ...(isProduction ? {} : { stack: error?.stack }),
    },
    { status }
  );
};

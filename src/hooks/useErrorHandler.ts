
import { useCallback } from 'react';
import { useNotifications } from '@/hooks/useNotifications';

export interface ErrorWithContext {
  error: Error;
  context: string;
  userId?: string;
  roomId?: string;
  timestamp: number;
}

export const useErrorHandler = () => {
  const { addNotification } = useNotifications();

  const logError = useCallback((errorData: ErrorWithContext) => {
    console.error(`Error in ${errorData.context}:`, {
      error: errorData.error,
      context: errorData.context,
      userId: errorData.userId,
      roomId: errorData.roomId,
      timestamp: new Date(errorData.timestamp).toISOString(),
      stack: errorData.error.stack
    });

    // Send to error reporting service if available
    // Example: errorReportingService.captureException(errorData.error, errorData);
  }, []);

  const handleAsyncError = useCallback((
    error: Error, 
    context: string, 
    userId?: string, 
    roomId?: string,
    showNotification: boolean = true
  ) => {
    const errorData: ErrorWithContext = {
      error,
      context,
      userId,
      roomId,
      timestamp: Date.now()
    };

    logError(errorData);

    if (showNotification) {
      addNotification({
        title: "An error occurred",
        message: `Failed to ${context.toLowerCase()}. Please try again.`,
        type: "error"
      });
    }
  }, [logError, addNotification]);

  const handleFirebaseError = useCallback((
    error: any, 
    operation: string, 
    userId?: string, 
    roomId?: string
  ) => {
    let message = "An unexpected error occurred";
    
    // Handle specific Firebase error codes
    switch (error?.code) {
      case 'permission-denied':
        message = "You don't have permission to perform this action";
        break;
      case 'not-found':
        message = "The requested resource was not found";
        break;
      case 'unavailable':
        message = "Service is temporarily unavailable. Please try again";
        break;
      case 'deadline-exceeded':
        message = "Request timed out. Please check your connection";
        break;
      default:
        message = error?.message || message;
    }

    handleAsyncError(error, operation, userId, roomId);
    
    addNotification({
      title: "Firebase Error",
      message,
      type: "error"
    });
  }, [handleAsyncError, addNotification]);

  return {
    logError,
    handleAsyncError,
    handleFirebaseError
  };
};

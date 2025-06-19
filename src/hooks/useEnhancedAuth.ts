
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/utils/firebase/config';

interface SessionData {
  lastActivity: number;
  sessionId: string;
  deviceInfo: string;
}

export const useEnhancedAuth = () => {
  const { user, loading } = useAuth();
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [isSessionValid, setIsSessionValid] = useState(true);

  // Generate unique session ID
  const generateSessionId = useCallback(() => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  // Get device info for session tracking
  const getDeviceInfo = useCallback(() => {
    const userAgent = navigator.userAgent;
    const platform = navigator.platform;
    return `${platform} - ${userAgent.substring(0, 50)}...`;
  }, []);

  // Update user session activity
  const updateSessionActivity = useCallback(async () => {
    if (!user || !sessionData) return;

    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        lastActivity: new Date().toISOString(),
        sessionId: sessionData.sessionId,
        deviceInfo: sessionData.deviceInfo
      });
      
      setSessionData(prev => prev ? { ...prev, lastActivity: Date.now() } : null);
    } catch (error) {
      console.error('Failed to update session activity:', error);
    }
  }, [user, sessionData]);

  // Check session validity
  const checkSessionValidity = useCallback(() => {
    if (!sessionData) return true;
    
    const now = Date.now();
    const sessionTimeout = 24 * 60 * 60 * 1000; // 24 hours
    const isValid = now - sessionData.lastActivity < sessionTimeout;
    
    setIsSessionValid(isValid);
    return isValid;
  }, [sessionData]);

  // Initialize session
  useEffect(() => {
    if (user && !sessionData) {
      const newSessionData = {
        lastActivity: Date.now(),
        sessionId: generateSessionId(),
        deviceInfo: getDeviceInfo()
      };
      
      setSessionData(newSessionData);
      console.log('Enhanced Auth: Session initialized for user:', user.uid);
    }
  }, [user, sessionData, generateSessionId, getDeviceInfo]);

  // Periodic session activity updates
  useEffect(() => {
    if (!user || !sessionData) return;

    const interval = setInterval(() => {
      updateSessionActivity();
      checkSessionValidity();
    }, 5 * 60 * 1000); // Update every 5 minutes

    return () => clearInterval(interval);
  }, [user, sessionData, updateSessionActivity, checkSessionValidity]);

  // Activity event listeners
  useEffect(() => {
    const handleActivity = () => {
      if (sessionData) {
        setSessionData(prev => prev ? { ...prev, lastActivity: Date.now() } : null);
      }
    };

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => {
      document.addEventListener(event, handleActivity, { passive: true });
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity);
      });
    };
  }, [sessionData]);

  return {
    user,
    loading,
    sessionData,
    isSessionValid,
    updateSessionActivity,
    checkSessionValidity
  };
};

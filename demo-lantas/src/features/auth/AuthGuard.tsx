import React from 'react';
import { AuthSession } from '../../services/auth';
import { AuthScreen } from './AuthScreen';

interface AuthGuardProps {
  session: AuthSession | null;
  onAuthSuccess: (session: AuthSession, isNewProfile?: boolean) => void;
  children: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ 
  session, 
  onAuthSuccess, 
  children 
}) => {
  if (!session || !session.user) {
    return <AuthScreen onAuthSuccess={onAuthSuccess} />;
  }

  return <>{children}</>;
};

import React from 'react';
import { ProfilPage } from './ProfilPage';
import { UserProfile } from '../../core/types';

interface ProfilViewProps {
  user?: UserProfile | null;
  onNavigateTab?: (tab: string) => void;
  onOpenPersonaModal?: () => void;
  onOpenRobotChat?: (prompt?: string) => void;
  onSignOut?: () => void;
  onProfileUpdated?: (partial: Partial<UserProfile>) => void;
}

export const ProfilView: React.FC<ProfilViewProps> = (props) => {
  return <ProfilPage {...props} />;
};

export default ProfilView;

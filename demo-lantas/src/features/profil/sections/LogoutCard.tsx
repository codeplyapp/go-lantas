import React, { useState } from 'react';
import { LogOut, AlertTriangle } from 'lucide-react';
import { Sheet } from '../../../shared/components/Sheet';
import { Btn } from '../../../shared/components/Btn';
import { sound } from '../../../shared/services/sound';

interface LogoutCardProps {
  onSignOut?: () => void;
}

export const LogoutCard: React.FC<LogoutCardProps> = ({ 
  onSignOut
}) => {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const handleSignOutAction = () => {
    sound.playClick();
    setIsConfirmOpen(false);
    onSignOut?.();
  };

  return (
    <>
      <div className="pt-2">
        <button
          type="button"
          onClick={() => setIsConfirmOpen(true)}
          className="w-full py-3.5 px-4 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-xs btn-press"
        >
          <LogOut className="w-4 h-4" />
          <span>Keluar Akun</span>
        </button>
      </div>

      {/* Confirmation Sheet */}
      <Sheet
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        title="Keluar dari Akun"
        subtitle="Konfirmasi keluar dari sesi aktif GO Lantas"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-2.5 text-xs text-slate-700 py-1">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed font-medium">
              Anda akan keluar dari akun GO Lantas. Data akun Anda tetap tersimpan dengan aman.
            </p>
          </div>

          <div className="space-y-2.5 pt-1">
            {/* Keluar Akun */}
            {onSignOut && (
              <Btn
                variant="danger"
                className="w-full justify-start py-3 px-4 text-xs sm:text-sm"
                icon={<LogOut className="w-4 h-4 mr-1.5" />}
                onClick={handleSignOutAction}
              >
                Keluar dari Akun Ini (Sign Out)
              </Btn>
            )}

            {/* Batal */}
            <Btn
              variant="secondary"
              className="w-full text-xs sm:text-sm"
              onClick={() => setIsConfirmOpen(false)}
            >
              Batal
            </Btn>
          </div>
        </div>
      </Sheet>
    </>
  );
};

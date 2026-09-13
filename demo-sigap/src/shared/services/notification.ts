// Browser Web Notification API and In-App Toast Dispatcher

export interface ToastPayload {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'emergency';
  duration?: number;
}

export const NotificationService = {
  async requestPermission(): Promise<NotificationPermission> {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return await Notification.requestPermission();
    }
    return 'denied';
  },

  hasPermission(): boolean {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission === 'granted';
    }
    return false;
  },

  sendNotification(title: string, body: string, iconUrl = '/favicon.svg'): boolean {
    // 1. Dispatch In-App Toast (always works in demo)
    this.showInAppToast(title, body, 'info');

    // 2. Dispatch Native Browser Push Notification if permitted
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body,
          icon: iconUrl,
          badge: iconUrl,
          silent: false,
        });
        return true;
      } catch {
        return false;
      }
    }
    return false;
  },

  showInAppToast(title: string, message: string, type: ToastPayload['type'] = 'info') {
    if (typeof window !== 'undefined') {
      const payload: ToastPayload = {
        id: 'toast_' + Date.now() + '_' + Math.random().toString(36).substring(2, 5),
        title,
        message,
        type,
        duration: type === 'emergency' ? 7000 : 4500,
      };
      window.dispatchEvent(new CustomEvent('sigap_show_toast', { detail: payload }));
    }
  }
};

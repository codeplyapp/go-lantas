// Service Worker, Web Notification API, & Background Schedule Engine

export interface ToastPayload {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'emergency';
  duration?: number;
}

let serviceWorkerRegistration: ServiceWorkerRegistration | null = null;
let isSchedulerStarted = false;

export const NotificationService = {
  // Initialize Service Worker & Background Schedule Alarm Engine
  init() {
    if (typeof window === 'undefined') return;

    // 1. Register Service Worker for Background Push
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((reg) => {
          serviceWorkerRegistration = reg;
          console.log('[SIGAP] Service Worker active for background push notifications:', reg.scope);
        })
        .catch((err) => {
          console.warn('[SIGAP] Service Worker registration failed:', err);
        });
    }

    // 2. Start Background Schedule Alarm Engine
    if (!isSchedulerStarted) {
      isSchedulerStarted = true;
      this.startScheduleAlarmEngine();
    }
  },

  // Check schedules every 20 seconds and trigger OS notifications at scheduled times
  startScheduleAlarmEngine() {
    if (typeof window === 'undefined') return;

    const checkAndTriggerSchedules = () => {
      if (!this.hasPermission()) return;

      const now = new Date();
      const currentHourMinute = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace('.', ':');
      const todayDateKey = now.toISOString().split('T')[0];

      const schedules = [
        { id: 'notif_01', aktif: true, jam: '06:30', judul: '🎒 Jam Berangkat Sekolah (06:30)', pesan: 'Pastikan tali helm berbunyi KLIK! Periksa kaca spion dan nyalakan lampu utama motor Anda.' },
        { id: 'notif_02', aktif: true, jam: '15:30', judul: '🛵 Jam Pulang Padat (15:30)', pesan: 'Arus jalan sedang ramai. Jaga jarak aman minimal 3 detik dan jangan menyalip dari kiri!' },
        { id: 'notif_03', aktif: true, jam: '13:00', judul: '🌧️ Peringatan Cuaca Siang', pesan: 'Waspadai aspal licin saat hujan. Kurangi kecepatan maksimal 30 km/jam.' },
        { id: 'notif_04', aktif: true, jam: '19:00', judul: '⭐ Tantangan Kuis Harian GO Lantas', pesan: 'Jawab kuis keselamatan hari ini untuk mempertahankan streak dan raih poin tambahan!' },
      ];

      schedules.forEach((sch) => {
        if (sch.aktif) {
          // Check if time matches (e.g. "06:30", "13:00", "15:30", "19:00")
          if (sch.jam === currentHourMinute) {
            const lastFiredKey = `sigap_last_fired_${sch.id}`;
            const lastFiredDate = localStorage.getItem(lastFiredKey);

            if (lastFiredDate !== todayDateKey) {
              localStorage.setItem(lastFiredKey, todayDateKey);
              this.sendSystemNotification(
                sch.judul,
                sch.pesan,
                `schedule_${sch.id}`
              );
            }
          }
        }
      });
    };

    // Run check immediately and then every 20s
    checkAndTriggerSchedules();
    setInterval(checkAndTriggerSchedules, 20000);
  },

  // Request native OS notification permission
  async requestPermission(): Promise<NotificationPermission> {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const result = await Notification.requestPermission();
        if (result === 'granted') {
          this.showInAppToast(
            'Notifikasi Sistem Diaktifkan',
            'Go Lantas kini dapat mengirim pengingat keselamatan langsung ke sistem HP/Laptop Anda meskipun aplikasi sedang ditutup.',
            'success'
          );
          // Send test welcome notification
          setTimeout(() => {
            this.sendSystemNotification(
              '🛡️ Notifikasi Sistem Go Lantas Aktif',
              'Pengingat disiplin helm, jam sibuk ZOSS, dan kuis SIM harian akan muncul otomatis di bar notifikasi Anda.',
              'welcome_sigap'
            );
          }, 600);
        }
        return result;
      } catch (err) {
        console.warn('[SIGAP] Notification permission error:', err);
        return 'denied';
      }
    }
    return 'denied';
  },

  // Get current OS permission status
  getPermissionStatus(): NotificationPermission | 'unsupported' {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission;
    }
    return 'unsupported';
  },

  hasPermission(): boolean {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission === 'granted';
    }
    return false;
  },

  // Send Native System Notification (Banner on Desktop OS / Android Tray)
  sendSystemNotification(title: string, body: string, tag = 'sigap_notice'): boolean {
    // 1. Dispatch In-App Toast
    this.showInAppToast(title, body, 'info');

    // 2. Dispatch to Native OS via Service Worker (best for background) or Native API
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        if (serviceWorkerRegistration && 'showNotification' in serviceWorkerRegistration) {
          serviceWorkerRegistration.showNotification(title, {
            body,
            icon: '/favicon.svg',
            badge: '/favicon.svg',
            tag,
            data: { url: '/' },
          } as NotificationOptions);
          return true;
        } else {
          new Notification(title, {
            body,
            icon: '/favicon.svg',
            badge: '/favicon.svg',
            tag,
          });
          return true;
        }
      } catch (err) {
        console.warn('[SIGAP] Failed to show system notification:', err);
      }
    }
    return false;
  },

  sendNotification(title: string, body: string) {
    return this.sendSystemNotification(title, body);
  },

  // Send test external OS notification
  testNativeSystemNotification() {
    if (!this.hasPermission()) {
      this.requestPermission();
      return;
    }

    this.sendSystemNotification(
      '🎒 Pengingat Helm KLIK & STNK (06:30 WIB)',
      'Pastikan tali helm berbunyi KLIK! Periksa kaca spion dan nyalakan lampu utama motor sebelum berangkat sekolah di Banyuwangi.',
      'test_system_alarm_' + Date.now()
    );
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

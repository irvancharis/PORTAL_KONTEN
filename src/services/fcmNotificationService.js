import { getMessaging, getToken, onMessage, isSupported } from "firebase/messaging";
import { firebaseApp, saveFirestoreUser, getFirestoreUser } from "../firebase";

let messagingInstance = null;

/**
 * Inisialisasi Firebase Messaging secara aman (hanya jika didukung browser & service worker)
 */
export const initFirebaseMessaging = async () => {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    return null;
  }
  try {
    const supported = await isSupported();
    if (!supported) {
      console.warn("FCM Push Notifications tidak didukung di browser ini.");
      return null;
    }
    if (!messagingInstance && firebaseApp) {
      messagingInstance = getMessaging(firebaseApp);
    }
    return messagingInstance;
  } catch (error) {
    console.warn("Gagal inisialisasi FCM Messaging:", error);
    return null;
  }
};

/**
 * Minta izin notifikasi & generate Token FCM untuk user yang sedang login,
 * lalu simpan token ke database user di Firestore.
 * 
 * @param {Object} user - Objek data user yang sedang login
 * @returns {Promise<string|null>} Token FCM yang didapatkan atau null
 */
export const requestAndSyncFCMToken = async (user) => {
  if (!user || !user.id) return null;

  try {
    if (!("Notification" in window)) {
      console.warn("Browser tidak mendukung Web Notifications.");
      return null;
    }

    const messaging = await initFirebaseMessaging();
    if (!messaging) return null;

    // Pastikan service worker terdaftar
    let swRegistration = null;
    try {
      swRegistration = await navigator.serviceWorker.register("/firebase-messaging-sw.js", { scope: "/" });
      await navigator.serviceWorker.ready;
    } catch (swErr) {
      console.warn("Registrasi service worker FCM fallback:", swErr);
      swRegistration = await navigator.serviceWorker.getRegistration();
    }

    // Minta izin notifikasi ke browser
    let permission = Notification.permission;
    if (permission === "default") {
      permission = await Notification.requestPermission();
    }

    if (permission !== "granted") {
      console.info("Izin notifikasi tidak diberikan pengguna:", permission);
      return null;
    }

    // Ambil FCM Device Token
    const tokenOptions = swRegistration ? { serviceWorkerRegistration: swRegistration } : {};
    const fcmToken = await getToken(messaging, tokenOptions);

    if (fcmToken) {
      console.log("FCM Device Token didapatkan:", fcmToken.substring(0, 15) + "...");

      // Simpan di localStorage device saat ini
      localStorage.setItem("portal-fcm-token", fcmToken);

      // Simpan / update ke database Firestore user
      try {
        const latestUserDoc = await getFirestoreUser(user.id);
        const existingTokens = Array.isArray(latestUserDoc?.fcmTokens) ? latestUserDoc.fcmTokens : [];
        
        // Simpan token unik agar user bisa login dari beberapa device (HP & Laptop)
        const updatedTokens = Array.from(new Set([...existingTokens, fcmToken]));

        const updatedUserData = {
          ...(latestUserDoc || user),
          fcmToken: fcmToken, // Token aktif terakhir
          fcmTokens: updatedTokens, // Koleksi token semua perangkat user
          fcmUpdatedAt: new Date().toISOString()
        };

        await saveFirestoreUser(updatedUserData);
        console.log("Token FCM berhasil disimpan ke database profil user!");
      } catch (dbErr) {
        console.error("Gagal menyimpan token FCM ke database user:", dbErr);
      }

      return fcmToken;
    } else {
      console.warn("Tidak ada registrasi token FCM yang tersedia.");
      return null;
    }
  } catch (err) {
    console.warn("Terjadi kendala saat meminta / sinkronisasi token FCM:", err);
    return null;
  }
};

/**
 * Listener untuk menerima push notifikasi saat aplikasi sedang dibuka di foreground
 * @param {Function} callback - Callback function saat pesan diterima
 */
export const listenForegroundFCM = async (callback) => {
  const messaging = await initFirebaseMessaging();
  if (!messaging) return () => {};

  try {
    return onMessage(messaging, (payload) => {
      console.log("Pesan FCM foreground diterima:", payload);
      if (callback && typeof callback === "function") {
        callback(payload);
      }
    });
  } catch (err) {
    console.warn("Gagal mendengarkan FCM foreground:", err);
    return () => {};
  }
};

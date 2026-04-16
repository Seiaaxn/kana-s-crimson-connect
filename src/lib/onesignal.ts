// OneSignal push notification integration
declare global {
  interface Window {
    OneSignalDeferred?: Array<(OneSignal: any) => void>;
  }
}

const ONESIGNAL_APP_ID = '695a6409-6cb8-4c06-a686-cbf02221d1e5';

export function initOneSignal() {
  window.OneSignalDeferred = window.OneSignalDeferred || [];
  window.OneSignalDeferred.push(async (OneSignal: any) => {
    await OneSignal.init({
      appId: ONESIGNAL_APP_ID,
      notifyButton: { enable: true },
      allowLocalhostAsSecureOrigin: true,
    });
  });
}

export function setOneSignalExternalUserId(userId: string) {
  window.OneSignalDeferred = window.OneSignalDeferred || [];
  window.OneSignalDeferred.push(async (OneSignal: any) => {
    await OneSignal.login(userId);
  });
}

export function removeOneSignalExternalUserId() {
  window.OneSignalDeferred = window.OneSignalDeferred || [];
  window.OneSignalDeferred.push(async (OneSignal: any) => {
    await OneSignal.logout();
  });
}

export function sendOneSignalTag(key: string, value: string) {
  window.OneSignalDeferred = window.OneSignalDeferred || [];
  window.OneSignalDeferred.push(async (OneSignal: any) => {
    await OneSignal.User.addTag(key, value);
  });
}

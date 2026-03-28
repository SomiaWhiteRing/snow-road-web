import { registerSW } from "virtual:pwa-register";

let registrationStarted = false;
let resolveReady: (() => void) | null = null;
let rejectReady: ((reason?: unknown) => void) | null = null;

const serviceWorkerReadyPromise = import.meta.env.DEV
  ? Promise.resolve()
  : new Promise<void>((resolve, reject) => {
      resolveReady = resolve;
      rejectReady = reject;
    });

const failServiceWorkerReady = (reason: unknown) => {
  rejectReady?.(reason);
  rejectReady = null;
  resolveReady = null;
};

const markServiceWorkerReady = () => {
  resolveReady?.();
  rejectReady = null;
  resolveReady = null;
};

export const registerAppServiceWorker = () => {
  if (registrationStarted) {
    return serviceWorkerReadyPromise;
  }

  registrationStarted = true;

  if (import.meta.env.DEV) {
    return serviceWorkerReadyPromise;
  }

  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    const error = new Error("Service Worker is not supported in this browser.");
    failServiceWorkerReady(error);
    return Promise.reject(error);
  }

  try {
    registerSW({
      immediate: true,
      onNeedRefresh() {
        console.info("A new version is ready and will apply after restart.");
      },
      onOfflineReady() {
        console.info("Offline support is ready.");
      },
      onRegisterError(error) {
        failServiceWorkerReady(error);
      },
    });

    void navigator.serviceWorker.ready
      .then(() => {
        markServiceWorkerReady();
      })
      .catch((error) => {
        failServiceWorkerReady(error);
      });
  } catch (error) {
    failServiceWorkerReady(error);
  }

  return serviceWorkerReadyPromise;
};

export const waitForServiceWorkerReady = () => serviceWorkerReadyPromise;

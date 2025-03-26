import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import * as serviceWorkerRegistration from './lib/serviceWorkerRegistration';
import { Toaster } from "@/components/ui/toaster";

const root = createRoot(document.getElementById("root")!);

root.render(
  <>
    <App />
    <Toaster />
  </>
);

// Register the service worker for PWA capabilities
serviceWorkerRegistration.register({
  onSuccess: (registration) => {
    console.log('ServiceWorker registration successful with scope: ', registration.scope);
  },
  onUpdate: (registration) => {
    console.log('ServiceWorker update available');
    
    // Optional: Display a notification to users that there's an update
    const notification = document.createElement('div');
    notification.className = 'update-notification';
    notification.textContent = 'New version available! Please refresh to update.';
    notification.style.position = 'fixed';
    notification.style.bottom = '0';
    notification.style.right = '0';
    notification.style.backgroundColor = '#7C3AED';
    notification.style.color = 'white';
    notification.style.padding = '1rem';
    notification.style.borderRadius = '8px 0 0 0';
    notification.style.cursor = 'pointer';
    notification.style.zIndex = '9999';
    
    notification.addEventListener('click', () => {
      if (registration.waiting) {
        // Trigger the waiting service worker to become active
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      }
      window.location.reload();
    });
    
    document.body.appendChild(notification);
  },
});

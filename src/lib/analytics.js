const GA_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;

export function initAnalytics() {
  if (!GA_ID || !window.gtag) return;
  window.gtag('config', GA_ID, { anonymize_ip: true });
}

export function trackEvent(eventName, params = {}) {
  if (!window.gtag || !hasAnalyticsConsent()) return;
  window.gtag('event', eventName, params);
}

export function hasAnalyticsConsent() {
  return localStorage.getItem('oro_cookie_consent') === 'accepted';
}

export function setAnalyticsConsent(accepted) {
  localStorage.setItem('oro_cookie_consent', accepted ? 'accepted' : 'declined');
  if (accepted) initAnalytics();
}

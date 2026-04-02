const GA_MEASUREMENT_ID = 'G-XXXXXXXXXX';

let initialized = false;

export function initAnalytics() {
  if (initialized) return;
  if (typeof window === 'undefined') return;

  const script = document.createElement('script');
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  script.async = true;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  window.gtag = function () {
    window.dataLayer.push(arguments);
  };
  window.gtag('js', new Date());
  window.gtag('config', GA_MEASUREMENT_ID, { anonymize_ip: true });

  initialized = true;
}

export function trackEvent(eventName, params = {}) {
  if (!initialized) return;
  if (typeof window === 'undefined' || !window.gtag) return;
  window.gtag('event', eventName, params);
}

export function hasAnalyticsConsent() {
  return localStorage.getItem('oro_cookie_consent') === 'accepted';
}

export function setAnalyticsConsent(accepted) {
  localStorage.setItem('oro_cookie_consent', accepted ? 'accepted' : 'declined');
  if (accepted) initAnalytics();
}

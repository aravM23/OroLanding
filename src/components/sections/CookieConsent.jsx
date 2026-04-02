import { useState, useEffect } from 'react';
import { setAnalyticsConsent } from '../../lib/analytics';
import './CookieConsent.css';

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (localStorage.getItem('oro_cookie_consent') === null) {
      setVisible(true);
    }
  }, []);

  if (!visible) return null;

  const handleAccept = () => {
    setAnalyticsConsent(true);
    setVisible(false);
  };

  const handleDecline = () => {
    setAnalyticsConsent(false);
    setVisible(false);
  };

  return (
    <div className="cookie-banner">
      <p className="cookie-banner-text">
        We use analytics <a href="/cookies" className="cookie-banner-link">cookies</a> to understand how people find and use our site.
      </p>
      <div className="cookie-banner-actions">
        <button className="cookie-btn cookie-btn-accept" onClick={handleAccept}>Accept</button>
        <button className="cookie-btn cookie-btn-decline" onClick={handleDecline}>No thanks</button>
      </div>
    </div>
  );
}

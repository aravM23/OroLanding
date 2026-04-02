import { useEffect } from 'react'
import IntroSection from './components/sections/IntroSection'
import CookieConsent from './components/sections/CookieConsent'
import { hasAnalyticsConsent, initAnalytics } from './lib/analytics'

function App() {
  useEffect(() => {
    if (hasAnalyticsConsent()) initAnalytics();
  }, []);

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ background: 'var(--bg-dark)' }}>
      <IntroSection />
      <CookieConsent />
    </div>
  )
}

export default App

import { useState } from 'react';
import { TitleBar } from './components/TitleBar';
import { Calculator } from './components/Calculator';
import { HelpOverlay } from './components/HelpOverlay';
import { StingerOverlay } from './components/StingerOverlay';

function App() {
  const [showStinger, setShowStinger] = useState(true);

  return (
    <>
      {showStinger && <StingerOverlay onComplete={() => setShowStinger(false)} />}

      <TitleBar />
      <main style={{
        flex: 1,
        padding: 'var(--spacing-lg)',
        overflow: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--spacing-lg)',
        opacity: showStinger ? 0 : 1,
        transition: 'opacity 0.5s ease-in'
      }}>
        <header style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)' }}>
          <img
            src="./logo.png"
            alt="UNGOLIANT"
            style={{
              height: '28px',
              width: 'auto',
              objectFit: 'contain',
              alignSelf: 'flex-start'
            }}
          />
        </header>

        <Calculator />

        <footer style={{
          marginTop: 'auto',
          padding: 'var(--spacing-md) 0',
          textAlign: 'center',
          color: 'var(--text-dim)',
          fontSize: '0.75rem',
          letterSpacing: '0.02em'
        }}>
          version 1.0.1 - a product of BSOD Software
        </footer>

        <HelpOverlay />
      </main>
    </>
  )
}

export default App

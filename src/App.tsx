import { useState, useEffect } from 'react';
import { UnitConverter } from './components/UnitConverter';
import { TitleBar } from './components/TitleBar';
import { Calculator } from './components/Calculator';
import { HelpOverlay } from './components/HelpOverlay';
import { StingerOverlay } from './components/StingerOverlay';
import { UpdatePopup } from './components/UpdatePopup';
import { ArcadeGame } from './components/game/ArcadeGame';
import { Gamepad2 } from 'lucide-react';

function App() {
  const [showStinger, setShowStinger] = useState(true);
  const [updateInfo, setUpdateInfo] = useState<{ version: string } | null>(null);
  const [isGameOpen, setIsGameOpen] = useState(false);

  useEffect(() => {
    // Listen for update events from the main process
    if (window.ipcRenderer) {
      window.ipcRenderer.on('update-downloaded', (_event: any, version: string) => {
        setUpdateInfo({ version });
      });
    }
  }, []);

  const handleLaunchUpdate = () => {
    if (window.ipcRenderer) {
      window.ipcRenderer.send('restart-and-install');
    }
  };

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
        <header style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start'
        }}>
          <img
            src="./logo.png"
            alt="UNGOLIANT"
            style={{
              height: '28px',
              width: 'auto',
              objectFit: 'contain'
            }}
          />
          <UnitConverter />
        </header>

        <Calculator />

        <footer style={{
          marginTop: 'auto',
          padding: 'var(--spacing-md) 0',
          textAlign: 'center',
          color: 'var(--text-dim)',
          fontSize: '0.75rem',
          letterSpacing: '0.02em',
          position: 'relative',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <div style={{
            position: 'absolute',
            left: 0,
            bottom: 0,
            opacity: 0.3,
            transition: 'opacity 0.2s'
          }}
            className="game-trigger-container"
          >
            <button
              onClick={() => setIsGameOpen(true)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: 'var(--spacing-sm)'
              }}
              title="Ungoliant's Revenge"
            >
              <Gamepad2 size={20} />
            </button>
          </div>
          version 1.1.2 - a product of BSOD Software
        </footer>

        <HelpOverlay />

        {updateInfo && (
          <UpdatePopup
            version={updateInfo.version}
            onLaunch={handleLaunchUpdate}
          />
        )}

        {isGameOpen && (
          <ArcadeGame onClose={() => setIsGameOpen(false)} />
        )}
      </main>
    </>
  )
}

export default App

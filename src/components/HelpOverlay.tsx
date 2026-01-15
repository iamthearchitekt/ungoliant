import { useState } from 'react';
import { HelpCircle, X } from 'lucide-react';
import { Card } from './ui/Card';

export function HelpOverlay() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                style={{
                    position: 'fixed',
                    bottom: 'var(--spacing-md)',
                    right: 'var(--spacing-md)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-dim)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '0.85rem',
                    padding: '8px',
                    zIndex: 100,
                    transition: 'color 0.2s'
                }}
                className="help-button-toggle"
            >
                <HelpCircle size={16} />
                How to Use
            </button>

            {isOpen && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.85)',
                    backdropFilter: 'blur(4px)',
                    zIndex: 1000,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 'var(--spacing-xl)'
                }}
                    onClick={() => setIsOpen(false)}
                >
                    <Card style={{
                        maxWidth: '500px',
                        width: '100%',
                        position: 'relative',
                        animation: 'modalSlideUp 0.3s ease-out'
                    }} onClick={(e) => e.stopPropagation()}>
                        <button
                            onClick={() => setIsOpen(false)}
                            style={{
                                position: 'absolute',
                                top: 'var(--spacing-md)',
                                right: 'var(--spacing-md)',
                                background: 'none',
                                border: 'none',
                                color: 'var(--text-muted)',
                                cursor: 'pointer'
                            }}
                        >
                            <X size={20} />
                        </button>

                        <h2 style={{ marginTop: 0, marginBottom: 'var(--spacing-md)', color: 'var(--accent-primary)' }}>Guide: How to Estimate</h2>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)', color: 'var(--text-main)', fontSize: '0.95rem' }}>
                            <div>
                                <strong style={{ display: 'block', marginBottom: '4px' }}>1. Spool Analysis Mode</strong>
                                <p style={{ margin: 0, color: 'var(--text-muted)' }}>Use <strong>Gross Weight</strong> if you have a scale. Toggle <strong>Estimate by %</strong> to manually eye-ball the spool if you don't.</p>
                            </div>

                            <div>
                                <strong style={{ display: 'block', marginBottom: '4px' }}>2. Account for Spool Weight</strong>
                                <p style={{ margin: 0, color: 'var(--text-muted)' }}>When weighing, the app subtracts <strong>250g</strong> by default. Enable <strong>Set Spool Weight</strong> to customize this for specific brands.</p>
                            </div>

                            <div>
                                <strong style={{ display: 'block', marginBottom: '4px' }}>3. Input Required Print Size</strong>
                                <p style={{ margin: 0, color: 'var(--text-muted)' }}>Paste the weight required for your print from your slicer. The visualizer will show you the level <strong>after</strong> the print completes.</p>
                            </div>

                            <div>
                                <strong style={{ display: 'block', marginBottom: '4px' }}>4. Capacity & Real-Time Feedback</strong>
                                <p style={{ margin: 0, color: 'var(--text-muted)' }}>Enable <strong>Custom Size</strong> for non-standard 1kg spools. Results update instantly as you type.</p>
                            </div>
                        </div>
                    </Card>
                </div>
            )}
        </>
    );
}

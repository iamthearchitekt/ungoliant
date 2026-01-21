import './SpoolVisualizer.css';

interface SpoolData {
    index: number;
    percentage: number;
    status: 'full' | 'partial' | 'empty' | 'insufficient';
}

interface Props {
    spools: SpoolData[];
}

export function SpoolVisualizer({ spools }: Props) {
    const spoolList = spools && spools.length > 0 ? spools : [{ index: 0, percentage: 0, status: 'empty' as const }];

    // SVG Config
    const size = 160;
    const center = size / 2;
    const outerRadius = 70;
    const innerRadius = 25; // Reverted to standard size for better proportion

    // Calculate nonlinear depletion (physically accurate cross-sectional area)
    // Area = pi * (R_outer^2 - R_inner^2)
    const maxArea = Math.PI * (Math.pow(outerRadius, 2) - Math.pow(innerRadius, 2));

    console.log('Visualizer Render:', { spools });

    return (
        <div className="spool-stack-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            {spoolList.map((spool) => {
                const safePercentage = Math.max(0, Math.min(100, spool.percentage));
                const isEmpty = safePercentage === 0;
                const isRed = spool.status === 'insufficient';
                const color = isRed ? '#ef4444' : 'var(--accent-primary)';

                // Calculate current outer radius based on remaining area percentage
                // CurrentArea = Percentage * MaxArea
                // CurrentArea = pi * (R_curr^2 - R_inner^2)
                // R_curr = sqrt( (CurrentArea / pi) + R_inner^2 )
                const currentArea = (safePercentage / 100) * maxArea;
                const currentOuterRadius = Math.sqrt((currentArea / Math.PI) + Math.pow(innerRadius, 2));

                // For SVG stroke:
                // Width = Outer - Inner
                // Radius = Inner + (Width / 2)
                const currentThickness = Math.max(0, currentOuterRadius - innerRadius);
                const strokeRadius = innerRadius + (currentThickness / 2);

                return (
                    <div key={spool.index} className="spool-unit" style={{
                        width: size,
                        height: size,
                        position: 'relative',
                        zIndex: 1,
                        opacity: isEmpty ? 0.3 : 1, // Dim empty spools so they don't distract
                        transition: 'opacity 0.3s'
                    }}>
                        <svg
                            width={size}
                            height={size}
                            viewBox={`0 0 ${size} ${size}`}
                            className="technical-drawing"
                            style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }}
                        >
                            {/* Crosshair lines */}
                            <line x1="0" y1={center} x2={size} y2={center} className="blueprint-line faint" />
                            <line x1={center} y1="0" x2={center} y2={size} className="blueprint-line faint" />

                            {/* Spool Structure (Fixed Background) */}
                            {/* Outer Rim */}
                            <circle cx={center} cy={center} r={outerRadius} fill="var(--bg-card)" stroke="var(--border-subtle)" strokeWidth="1" />
                            <circle cx={center} cy={center} r={outerRadius - 4} fill="none" className="blueprint-line faint" />

                            {/* Inner Hub */}
                            <circle cx={center} cy={center} r={innerRadius} fill="var(--bg-surface)" className="blueprint-line" />

                            {/* Spokes (Fixed) */}
                            {[0, 60, 120, 180, 240, 300].map(angle => (
                                <line
                                    key={angle}
                                    x1={center + Math.cos(angle * Math.PI / 180) * 10}
                                    y1={center + Math.sin(angle * Math.PI / 180) * 10}
                                    x2={center + Math.cos(angle * Math.PI / 180) * outerRadius}
                                    y2={center + Math.sin(angle * Math.PI / 180) * outerRadius}
                                    className="blueprint-line"
                                    opacity="0.3"
                                />
                            ))}

                            {/* Filament Fill (Variable Thickness) */}
                            {safePercentage > 0 && (
                                <circle
                                    cx={center}
                                    cy={center}
                                    r={strokeRadius}
                                    fill="none"
                                    stroke={color}
                                    strokeWidth={currentThickness}
                                    strokeOpacity="0.8"
                                    style={{
                                        transition: 'stroke-width 0.5s ease-out, r 0.5s ease-out'
                                    }}
                                />
                            )}
                        </svg>

                        {/* Label Overlay */}
                        <div className="spool-label-overlay" style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            pointerEvents: 'none'
                        }}>
                            {isRed ? (
                                <span style={{ color: '#ef4444', fontWeight: 'bold', fontSize: '0.8rem' }}>LOW</span>
                            ) : (
                                !isEmpty && <span style={{ color: 'var(--text-primary)', fontWeight: 'bold', fontSize: '0.9rem' }}>
                                    {Math.round(safePercentage)}%
                                </span>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

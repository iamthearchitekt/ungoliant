import './SpoolVisualizer.css';
import './SpoolVisualizer.css';

interface Props {
    percentage: number;
    isInsufficient?: boolean;
}

export function SpoolVisualizer({ percentage, isInsufficient }: Props) {
    const safePercentage = Math.max(0, Math.min(100, percentage));

    // SVG Config
    const size = 200;
    const center = size / 2;
    const outerRadius = 90;
    const innerRadius = 30;
    const filamentMaxWidth = outerRadius - innerRadius - 5;

    // The "Filament" is a thick ring whose width or opacity could represent level, 
    // but the user likes the "Green graph fills and moves" like a circular graph.
    // So I'll keep the circular stroke but place it within the technical drawing.

    // Circumference for the green fill
    const fillRadius = (outerRadius + innerRadius) / 2;
    const circumference = 2 * Math.PI * fillRadius;
    const offset = circumference - (safePercentage / 100) * circumference;

    const color = isInsufficient ? '#ef4444' : 'var(--accent-primary)';

    // Spoke angles
    const spokes = [0, 60, 120, 180, 240, 300];

    return (
        <div className="spool-container" style={{ width: size, height: size }}>
            <svg
                width={size}
                height={size}
                viewBox={`0 0 ${size} ${size}`}
                className="technical-drawing"
            >
                {/* Crosshair lines for technical look */}
                <line x1="0" y1={center} x2={size} y2={center} className="blueprint-line faint" />
                <line x1={center} y1="0" x2={center} y2={size} className="blueprint-line faint" />

                {/* Outer Rim Structure */}
                <circle cx={center} cy={center} r={outerRadius} fill="none" className="blueprint-line" />
                <circle cx={center} cy={center} r={outerRadius - 4} fill="none" className="blueprint-line faint" />

                {/* Inner Hub Structure */}
                <circle cx={center} cy={center} r={innerRadius} fill="none" className="blueprint-line" />
                <circle cx={center} cy={center} r={10} fill="none" className="blueprint-line" />

                {/* Spokes */}
                {spokes.map(angle => (
                    <line
                        key={angle}
                        x1={center + Math.cos(angle * Math.PI / 180) * 10}
                        y1={center + Math.sin(angle * Math.PI / 180) * 10}
                        x2={center + Math.cos(angle * Math.PI / 180) * outerRadius}
                        y2={center + Math.sin(angle * Math.PI / 180) * outerRadius}
                        className="blueprint-line"
                    />
                ))}

                {/* Green Fill (Filament) - Drawn like a circular progress bar inside the flanges */}
                <circle
                    cx={center}
                    cy={center}
                    r={fillRadius}
                    fill="none"
                    stroke={color}
                    strokeWidth={filamentMaxWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeOpacity="0.4"
                    style={{
                        transition: 'stroke-dashoffset 1s ease-in-out, stroke 0.3s',
                        transform: 'rotate(-90deg)',
                        transformOrigin: 'center'
                    }}
                />
            </svg>

            {/* Center Label */}
            <div className="spool-label">
                {isInsufficient ? (
                    <>
                        <span className="spool-value warning">LOW</span>
                        <span className="spool-sub">FILAMENT</span>
                    </>
                ) : (
                    <>
                        <span className="spool-value">
                            {Math.round(safePercentage)}%
                        </span>
                        <span className="spool-sub">REMAINING</span>
                    </>
                )}
            </div>
        </div>
    );
}

import './TitleBar.css';

export function TitleBar() {
    return (
        <div className="titlebar app-region-drag">
            <div className="titlebar-content" style={{ display: 'flex', alignItems: 'center', height: '100%', paddingLeft: '12px' }}>
                {/* Logo removed to prevent duplication with App header logo */}
            </div>
        </div>
    );
}

import { PackageCheck, ArrowRight } from 'lucide-react';
import './UpdatePopup.css';

interface UpdatePopupProps {
    version: string;
    onLaunch: () => void;
}

export function UpdatePopup({ version, onLaunch }: UpdatePopupProps) {
    return (
        <div className="update-popup-overlay">
            <div className="update-popup-card">
                <div className="update-popup-header">
                    <PackageCheck size={32} className="update-icon" />
                    <h2>Update Complete!</h2>
                </div>

                <p className="update-popup-body">
                    Version <strong>v.{version}</strong> has been successfully installed and is ready to use.
                </p>

                <button className="launch-button" onClick={onLaunch}>
                    LAUNCH NEW VERSION
                    <ArrowRight size={18} />
                </button>
            </div>
        </div>
    );
}

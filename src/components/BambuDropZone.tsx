import { useState } from 'react';
import { FileUp, X, CheckCircle2, AlertCircle } from 'lucide-react';
import { parseProjectFile } from '../lib/fileParser';
import './BambuDropZone.css';

interface BambuDropZoneProps {
    onParsed: (weight: number) => void;
    onClose: () => void;
}

export function BambuDropZone({ onParsed, onClose }: BambuDropZoneProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const processFile = async (file: File) => {
        setStatus('idle');
        setErrorMessage('');

        try {
            const weight = await parseProjectFile(file);
            setStatus('success');
            setTimeout(() => {
                onParsed(weight);
                onClose();
            }, 800);
        } catch (err: any) {
            setStatus('error');
            const msg = err.message || 'Unknown error reading file.';
            setErrorMessage(msg.length > 80 ? msg.substring(0, 77) + '...' : msg);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) processFile(file);
    };

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) processFile(file);
    };

    return (
        <div className="bambu-drop-overlay" onClick={onClose}>
            <div
                className={`bambu-drop-zone ${isDragging ? 'active' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={(e) => {
                    e.stopPropagation();
                    document.getElementById('bambu-file-input')?.click();
                }}
            >
                <input
                    type="file"
                    id="bambu-file-input"
                    style={{ display: 'none' }}
                    accept=".gcode,.3mf"
                    onChange={handleFileInput}
                />
                <button className="close-drop-zone" onClick={onClose}>
                    <X size={20} />
                </button>

                <div className="bambu-icon-container">
                    {status === 'idle' && <FileUp size={48} />}
                    {status === 'success' && <CheckCircle2 size={48} style={{ color: 'var(--accent-primary)' }} />}
                    {status === 'error' && <AlertCircle size={48} style={{ color: '#ef4444' }} />}
                </div>

                <h3>{status === 'idle' ? 'Smart Sync' : status === 'success' ? 'Calculated!' : 'Error'}</h3>

                <p>
                    {status === 'idle' && 'Drag and drop your sliced .gcode or .3mf file here to auto-calculate filament usage.'}
                    {status === 'success' && 'Metadata extracted! Updating your calculator...'}
                    {status === 'error' && errorMessage}
                </p>

                {status === 'idle' && (
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: 'var(--spacing-md)' }}>
                        Supports Bambu Studio, OrcaSlicer, & PrusaSlicer
                    </div>
                )}
            </div>
        </div>
    );
}

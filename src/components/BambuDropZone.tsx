import { useState } from 'react';
import { FileUp, X, CheckCircle2, AlertCircle } from 'lucide-react';
import { parseGCode } from '../lib/filament';
import JSZip from 'jszip';
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
        const fileName = file.name.toLowerCase();
        setStatus('idle');
        setErrorMessage('');
        console.log(`[Smart Sync] Starting process for: ${fileName}`);

        try {
            let content = '';

            if (fileName.endsWith('.3mf')) {
                console.log('[Smart Sync] Detected .3mf, unzipping...');
                const buffer = await file.arrayBuffer();

                // Use the standard JSZip constructor
                const zip = new JSZip();
                const loadedZip = await zip.loadAsync(buffer);

                const allFiles = Object.keys(loadedZip.files);
                console.log(`[Smart Sync] Unzipped ${allFiles.length} files.`);

                // Priority 1: slice_info.xml or slice_info.config (Bambu/Orca consolidated summary)
                const sliceInfo = allFiles.find(f =>
                    f.toLowerCase().includes('slice_info.xml') ||
                    f.toLowerCase().includes('slice_info.config')
                );
                // Priority 2: G-code files
                const gcodeFiles = allFiles.filter(f => f.endsWith('.gcode'));
                // Priority 3: Config/XML files
                const configFiles = allFiles.filter(f =>
                    (f.endsWith('.config') || f.endsWith('.xml') || f.endsWith('.json')) &&
                    !f.includes('.model') && !f.includes('.rels') && f !== sliceInfo
                );

                const candidates = sliceInfo ? [sliceInfo, ...gcodeFiles, ...configFiles] : [...gcodeFiles, ...configFiles];

                if (candidates.length === 0) {
                    throw new Error('No readable metadata files found in this .3mf archive.');
                }

                console.log(`[Smart Sync] Scanning ${candidates.length} candidate files for filament data...`);

                for (const f of candidates) {
                    try {
                        const txt = await loadedZip.files[f].async('string');
                        const weight = parseGCode(txt);

                        if (weight > 0) {
                            console.log(`[Smart Sync] MATCH! Found ${weight}g in: ${f}`);
                            content = txt;
                            break;
                        }
                    } catch (e) {
                        console.warn(`[Smart Sync] Could not read file internal: ${f}`, e);
                    }
                }

                if (!content) {
                    throw new Error('Filament info not found in project (was this file sliced and saved?)');
                }
            } else if (fileName.endsWith('.gcode')) {
                content = await file.text();
            } else {
                setStatus('error');
                setErrorMessage('Unsupported file type. Please use .gcode or .3mf.');
                return;
            }

            const weight = parseGCode(content);

            if (weight > 0) {
                setStatus('success');
                setTimeout(() => {
                    onParsed(weight);
                    onClose();
                }, 800);
            } else {
                setStatus('error');
                setErrorMessage('Could not find filament mass data. Try slicing the file again.');
            }
        } catch (err: any) {
            console.error('[Smart Sync] Error:', err);
            setStatus('error');
            // Clean up the error message for the user
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

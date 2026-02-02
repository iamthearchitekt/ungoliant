import { useState, useRef, useEffect } from 'react';
import { Calculator } from 'lucide-react';
import './UnitConverter.css';

export function UnitConverter() {
    const [isOpen, setIsOpen] = useState(false);
    const [mm, setMm] = useState<string>('');
    const [inches, setInches] = useState<string>('');
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleMmChange = (value: string) => {
        setMm(value);
        if (value === '') {
            setInches('');
            return;
        }
        const num = parseFloat(value);
        if (!isNaN(num)) {
            // 1 mm = 0.0393701 inches
            const inVal = num / 25.4;
            setInches(inVal.toFixed(4).replace(/\.?0+$/, ''));
        }
    };

    const handleInchesChange = (value: string) => {
        setInches(value);
        if (value === '') {
            setMm('');
            return;
        }
        const num = parseFloat(value);
        if (!isNaN(num)) {
            // 1 inch = 25.4 mm
            const mmVal = num * 25.4;
            setMm(mmVal.toFixed(2).replace(/\.?0+$/, ''));
        }
    };

    return (
        <div className="unit-converter" ref={containerRef}>
            <button
                className={`converter-toggle ${isOpen ? 'active' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
                title="Unit Converter"
            >
                <Calculator size={20} />
            </button>

            {isOpen && (
                <div className="converter-popover">
                    <div className="converter-header">
                        <h3>Quick Convert</h3>
                    </div>
                    <div className="converter-body">
                        <div className="input-group">
                            <label>Millimeters</label>
                            <div className="input-wrapper">
                                <input
                                    type="number"
                                    value={mm}
                                    onChange={(e) => handleMmChange(e.target.value)}
                                    placeholder="0"
                                />
                                <span className="unit">mm</span>
                            </div>
                        </div>

                        <div className="converter-divider">=</div>

                        <div className="input-group">
                            <label>Inches</label>
                            <div className="input-wrapper">
                                <input
                                    type="number"
                                    value={inches}
                                    onChange={(e) => handleInchesChange(e.target.value)}
                                    placeholder="0"
                                />
                                <span className="unit">in</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

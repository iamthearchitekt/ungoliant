import { useState, useEffect } from 'react';
import { Card } from './ui/Card';
import { Input } from './ui/Input';
import { SpoolVisualizer } from './SpoolVisualizer';
import { MATERIALS, calculateFilament } from '../lib/filament';
import type { CalculationState } from '../lib/filament';
import { Calculator as CalcIcon, DollarSign, Scale } from 'lucide-react';
import './Calculator.css';

export function Calculator() {
    const [state, setState] = useState<CalculationState>({
        mode: 'mass',
        materialIndex: 0,
        density: MATERIALS[0].density,
        grossWeight: '1250',
        spoolWeight: '250',
        printWeight: '',
        filamentDiameter: '1.75',
        costPerKg: '',
        netWeight: 1000,
        usedWeight: 0,
        remainingAfterPrint: 1000,
        remainingPercentage: 100,
        estimatedLength: 0,
        printCost: 0,
        isCustomCapacity: false,
        spoolCapacity: '1000',
        isInsufficient: false,
        isPartiallyUsed: false,
        inputPercentage: '100'
    });

    const [customSpool, setCustomSpool] = useState(false);

    useEffect(() => {
        const results = calculateFilament(state);
        setState(prev => ({ ...prev, ...results }));
    }, [state.grossWeight, state.spoolWeight, state.printWeight, state.density, state.filamentDiameter, state.costPerKg, state.isPartiallyUsed, state.inputPercentage, state.spoolCapacity]);

    const handleChange = (field: keyof CalculationState, value: string | boolean) => {
        setState(prev => ({ ...prev, [field]: value }));
    };

    const handleMaterialChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const idx = parseInt(e.target.value);
        setState(prev => ({
            ...prev,
            materialIndex: idx,
            density: MATERIALS[idx].density
        }));
    };

    return (
        <div className="calculator-layout">
            <div className="calc-inputs">
                <Card className="calc-card">
                    <div className="calc-section-title">
                        <Scale size={16} /> Parameters
                    </div>

                    <div className="input-grid">
                        <div className="input-group">
                            <label>Material</label>
                            <select
                                value={state.materialIndex}
                                onChange={handleMaterialChange}
                                className="styled-select"
                            >
                                {MATERIALS.map((m, i) => (
                                    <option key={m.name} value={i}>{m.name} ({m.density} g/cm³)</option>
                                ))}
                            </select>
                        </div>

                        <Input
                            label="Filament Diameter"
                            suffix="mm"
                            value={state.filamentDiameter}
                            onChange={(e) => handleChange('filamentDiameter', e.target.value)}
                        />
                    </div>
                </Card>

                <Card className="calc-card" style={{ padding: 'var(--spacing-xl)', border: '1px solid var(--border-subtle)' }}>
                    <div className="calc-section-title" style={{ fontSize: '1.1rem', marginBottom: '1.5rem' }}>
                        <CalcIcon size={20} /> SPOOL ANALYSIS
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 'var(--spacing-xl)', alignItems: 'start' }}>
                        <div className="inputs-column" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                            <div className="primary-inputs" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                                {state.isPartiallyUsed ? (
                                    <Input
                                        label="Remaining %"
                                        placeholder="e.g. 75"
                                        suffix="%"
                                        value={state.inputPercentage}
                                        onChange={(e) => handleChange('inputPercentage', e.target.value)}
                                    />
                                ) : (
                                    <Input
                                        label="Gross Weight"
                                        placeholder="e.g. 1250"
                                        suffix="g"
                                        value={state.grossWeight}
                                        onChange={(e) => handleChange('grossWeight', e.target.value)}
                                    />
                                )}

                                <Input
                                    label="Print weight"
                                    placeholder="e.g. 50"
                                    suffix="g"
                                    value={state.printWeight}
                                    onChange={(e) => handleChange('printWeight', e.target.value)}
                                    style={{ borderColor: 'var(--accent-primary)' }}
                                />
                            </div>

                            <div className="input-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
                                {state.isCustomCapacity && (
                                    <Input
                                        label="Total Capacity"
                                        placeholder="1000"
                                        suffix="g"
                                        value={state.spoolCapacity}
                                        onChange={(e) => handleChange('spoolCapacity', e.target.value)}
                                    />
                                )}
                                {customSpool && !state.isPartiallyUsed && (
                                    <Input
                                        label="Empty Spool"
                                        placeholder="250"
                                        suffix="g"
                                        value={state.spoolWeight}
                                        onChange={(e) => handleChange('spoolWeight', e.target.value)}
                                    />
                                )}
                            </div>
                        </div>

                        <div className="checkboxes-column" style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 'var(--spacing-md)',
                            padding: 'var(--spacing-md)',
                            backgroundColor: 'var(--bg-surface-hover)',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid var(--border-subtle)'
                        }}>
                            <div className="checkbox-group">
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-muted)', cursor: 'pointer' }}>
                                    <input
                                        type="checkbox"
                                        checked={state.isPartiallyUsed}
                                        onChange={(e) => handleChange('isPartiallyUsed', e.target.checked)}
                                        style={{ accentColor: 'var(--accent-primary)' }}
                                    />
                                    Estimate by %
                                </label>
                            </div>

                            <div className="checkbox-group">
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-muted)', cursor: 'pointer' }}>
                                    <input
                                        type="checkbox"
                                        checked={state.isCustomCapacity}
                                        onChange={(e) => handleChange('isCustomCapacity', e.target.checked)}
                                        style={{ accentColor: 'var(--accent-primary)' }}
                                    />
                                    Custom Size
                                </label>
                            </div>

                            {!state.isPartiallyUsed && (
                                <div className="checkbox-group">
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-muted)', cursor: 'pointer' }}>
                                        <input
                                            type="checkbox"
                                            checked={customSpool}
                                            onChange={(e) => setCustomSpool(e.target.checked)}
                                            style={{ accentColor: 'var(--accent-primary)' }}
                                        />
                                        Set Spool Weight
                                    </label>
                                </div>
                            )}
                        </div>
                    </div>
                </Card>

                <Card className="calc-card">
                    <div className="calc-section-title">
                        <DollarSign size={16} /> Cost Analysis
                    </div>
                    <div className="input-grid">
                        <Input
                            label="Cost per Kg"
                            placeholder="0.00"
                            suffix="$"
                            type="number"
                            value={state.costPerKg}
                            onChange={(e) => handleChange('costPerKg', e.target.value)}
                        />
                    </div>
                </Card>

                {/* Print Cost Result */}
                <div className="print-cost-sticky">
                    <div className="result-item highlight large">
                        <span className="label">ESTIMATED PRINT COST</span>
                        <span className="value">${state.printCost.toFixed(2)}</span>
                    </div>
                </div>
            </div>

            <div className="calc-results">
                <Card className="visualizer-card">
                    <SpoolVisualizer
                        percentage={state.remainingPercentage}
                        isInsufficient={state.isInsufficient}
                    />

                    <div className="results-grid">
                        <div className="result-item">
                            <span className="label">Net Available</span>
                            <span className="value">{state.netWeight.toFixed(0)} <span className="unit">g</span></span>
                        </div>
                        <div className="result-item">
                            <span className="label">Remaining After Print</span>
                            <span className="value">{Math.max(0, state.remainingAfterPrint).toFixed(0)} <span className="unit">g</span></span>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}

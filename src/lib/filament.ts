export const MATERIALS = [
    { name: 'PLA', density: 1.24 },
    { name: 'ABS', density: 1.04 },
    { name: 'PETG', density: 1.27 },
    { name: 'TPU', density: 1.21 },
    { name: 'ASA', density: 1.07 },
    { name: 'PC', density: 1.20 },
    { name: 'Nylon', density: 1.15 },
    // Add generic
    { name: 'Custom', density: 1.24 }
];

export interface CalculationState {
    mode: 'mass' | 'length' | 'volume';
    materialIndex: number;
    density: number; // g/cm3

    // Inputs
    grossWeight: string; // g
    spoolWeight: string; // g
    printWeight: string; // g (New: Required for print)
    filamentDiameter: string; // mm

    // Advanced / Multi-Plate
    isAdvanced: boolean;
    plates: { id: string, mass: string }[];
    spoolQuantity: number; // 1-4

    // AMS Waste Calculation
    isWasteCalcEnabled: boolean;
    numberOfColors: number;

    // Price
    costPerKg: string; // currency

    // Custom Capacity (Spool Size)
    isCustomCapacity: boolean;
    spoolCapacity: string; // g or m depending on mode

    // Manual Override
    isPartiallyUsed: boolean;
    inputPercentage: string; // 0-100%

    // Computed
    netWeight: number; // g
    usedWeight: number; // g
    totalProjectWeight: number; // g
    spoolsNeeded: number;
    remainingAfterPrint: number; // g
    remainingPercentage: number;
    estimatedLength: number; // m
    printCost: number; // currency
    isInsufficient: boolean;
    spoolsData: { index: number, percentage: number, status: 'full' | 'partial' | 'empty' | 'insufficient' }[];
}

export function calculateFilament(state: CalculationState): Partial<CalculationState> {
    const gross = parseFloat(state.grossWeight) || 0;
    const spool = parseFloat(state.spoolWeight) || 0;
    const capacity = parseFloat(state.spoolCapacity) || 1000;
    const density = state.density || 1.24;
    const diameter = parseFloat(state.filamentDiameter) || 1.75;
    const cost = parseFloat(state.costPerKg) || 0;
    const inputPct = parseFloat(state.inputPercentage) || 100;

    // 1. Calculate Net Available on Spool
    let netAvailable = 0;
    if (state.isPartiallyUsed) {
        // Derivative mode: calculate weight from percentage
        netAvailable = (inputPct / 100) * capacity;
    } else {
        // Standard mode: Weighing
        // Standard mode: Weighing
        netAvailable = Math.max(0, gross - spool);
    }

    // Multi-Spool Support:
    // If quantity > 1, we assume all spools are full EXCEPT the one being weighed?
    // OR we assume they are "Identical Rolls in Stock".
    // User Request: "if the person has 2 rolls or more in stock they can indicate that."
    // Interpretation: "1 partially used roll (weighed) + (N-1) Full Rolls".
    // Let's assume (N-1) * Capacity.
    const numberOfSpools = Math.max(1, state.spoolQuantity || 1);
    const extraSpoolsWeight = (numberOfSpools - 1) * capacity;
    const totalNetAvailable = netAvailable + extraSpoolsWeight;

    // 2. Determine Required Weight (Single vs Multi-Plate)
    let printRequired = 0;
    let totalProjectWeight = 0;

    if (state.isAdvanced && state.plates.length > 0) {
        totalProjectWeight = state.plates.reduce((sum, p) => sum + (parseFloat(p.mass) || 0), 0);
        // Corrected Logic: The user wants to see if their stock covers the ENTIRE project.
        // Therefore, the "Used Weight" for calculation should be the Total Project Weight.
        printRequired = totalProjectWeight;
    } else {
        printRequired = parseFloat(state.printWeight) || 0;
        totalProjectWeight = printRequired;
    }

    // Apply Waste Calculation (AMS)
    if (state.isWasteCalcEnabled && state.numberOfColors > 1) {
        // Heuristic: 5% waste per additional color
        // e.g. 4 colors = 3 changes * 5% = 15% extra
        const wasteMultiplier = 1 + ((state.numberOfColors - 1) * 0.05);
        totalProjectWeight *= wasteMultiplier;
        printRequired *= wasteMultiplier;
    }

    // 3. Spools Needed calculation
    const spoolsNeeded = capacity > 0 ? Math.ceil(totalProjectWeight / capacity) : 1;

    // 4. Calculate Remaining AFTER Print (for the current/next plate)
    // 4. Calculate Remaining AFTER Print (for the current/next plate)
    // We compare TOTAL AVAILABLE vs Required
    const remainingAfter = totalNetAvailable - printRequired;
    const isInsufficient = remainingAfter < 0;

    // 5. Percentage Calculation for Visualizer
    // We need to calculate the state of each spool.
    // Total Remaining: Math.max(0, remainingAfter) -> Distribute bottom-up.
    const remainingToDistribute = Math.max(0, remainingAfter);

    const spoolsData = [];
    let currentDistributed = 0;

    // Spools are indexed 0 to N-1. 
    // Let's say index 0 is TOP (First to be used), index N-1 is BOTTOM.
    // We fill from bottom up.
    // Actually, visually we want 0 at top.

    for (let i = numberOfSpools - 1; i >= 0; i--) {
        // Capacity of THIS spool. 
        // If i === 0 (The "Active" spool being weighed), its max capacity is theoretically 'capacity',
        // but its CURRENT content is 'netAvailable'. 
        // But for "Remaining after print", we treat it as a pool.
        // Simplified: Each spool slot has 'capacity'.
        // We fill them up.

        let spoolCap = capacity;

        // Amount this spool holds
        const fillAmount = Math.min(spoolCap, Math.max(0, remainingToDistribute - currentDistributed));
        currentDistributed += fillAmount;

        const pct = (fillAmount / spoolCap) * 100;

        // Determine status
        let status: 'full' | 'partial' | 'empty' | 'insufficient' = 'empty';
        if (pct >= 99.9) status = 'full';
        else if (pct > 0) status = 'partial';
        else if (isInsufficient && i === 0) status = 'insufficient'; // Mark top as insufficient if red

        spoolsData.unshift({
            index: i,
            percentage: pct,
            status
        });
    }

    // Consolidated Percentage (Total System Status)
    let percentage = 0;
    const totalSystemCapacity = capacity * numberOfSpools;
    if (totalSystemCapacity > 0) {
        percentage = (remainingToDistribute / totalSystemCapacity) * 100;
    }


    // Volume & Length
    const volumeCm3 = totalNetAvailable / density;
    const radiusCm = (diameter / 2) / 10;
    const area = Math.PI * Math.pow(radiusCm, 2);
    const lengthCm = volumeCm3 / area;
    const lengthM = lengthCm / 100;

    const printCost = (totalProjectWeight / 1000) * cost;

    return {
        netWeight: netAvailable,
        usedWeight: printRequired,
        totalProjectWeight: totalProjectWeight,
        spoolsNeeded: spoolsNeeded,
        remainingAfterPrint: remainingAfter,
        remainingPercentage: percentage,
        estimatedLength: lengthM,
        printCost: printCost,
        isInsufficient: isInsufficient,
        spoolsData: spoolsData
    };
}

/**
 * Parses G-code or 3MF metadata to extract filament weight in grams.
 * Supports Bambu Studio, OrcaSlicer, PrusaSlicer, and generic formats.
 */
export function parseGCode(content: string): number {
    // Stage 1: Specific high-confidence patterns
    const highConfidencePatterns = [
        /filament used \[g\]\s*[:=]\s*([\d.,\s]+)/i,
        /total filament used \[g\]\s*[:=]\s*([\d.,\s]+)/i,
        /estimated filament weight \(g\)\s*[:=]\s*([\d.,\s]+)/i, // OrcaSlicer
        /filament_weight_g\s*[:=]\s*([\d.,\s]+)/i,
        /weight\s*[:=]\s*([\d.,\s]+)\s*g/i,
    ];

    for (const pattern of highConfidencePatterns) {
        const match = content.match(pattern);
        if (match && match[1]) {
            const values = match[1].split(',').map(v => parseFloat(v.trim()));
            const total = values.reduce((sum, v) => sum + (isNaN(v) ? 0 : v), 0);
            if (total > 0) return total;
        }
    }

    // Stage 2: Parenthetical or trailing gram markers
    // e.g. ; filament used = 7.82m (23.69g)
    // e.g. ; filament_weight: 12.3
    const secondTierPatterns = [
        /\(([\d.]+)\s*g\)/i,
        /filament.*?[:=]\s*([\d.]+)\s*g/i,
        /weight.*?[:=]\s*([\d.]+)\s*g/i
    ];

    for (const pattern of secondTierPatterns) {
        const match = content.match(pattern);
        if (match && match[1]) {
            const val = parseFloat(match[1]);
            if (val > 0) return val;
        }
    }

    // Stage 3: XML-style tags
    const xmlPatterns = [
        /<filament_used_g>([\d.,\s]+)<\/filament_used_g>/i,
        /<total_filament_used_g>([\d.,\s]+)<\/total_filament_used_g>/i,
        /<filament_used>([\d.,\s]+)<\/filament_used>/i,
        /used_g="([\d.,\s]+)"/i, // Bambu slice_info.config
        /filament_weight\s*=\s*"([\d.,\s]+)"/i
    ];

    for (const pattern of xmlPatterns) {
        const match = content.match(pattern);
        if (match && match[1]) {
            const values = match[1].split(',').map(v => parseFloat(v.trim()));
            const total = values.reduce((sum, v) => sum + (isNaN(v) ? 0 : v), 0);
            if (total > 0) return total;
        }
    }

    // Stage 4: Volume fallback (convert mm3/cm3 to g)
    const volumePatterns = [
        /filament used \[mm³\]\s*[:=]\s*(\d+\.?\d*)/i,
        /filament used \[cm³\]\s*[:=]\s*(\d+\.?\d*)/i,
        /<filament_used_mm3>([\d.]+)<\/filament_used_mm3>/i
    ];

    for (const pattern of volumePatterns) {
        const match = content.match(pattern);
        if (match && match[1]) {
            const volume = parseFloat(match[1]);
            const isCm3 = pattern.toString().includes('cm³');
            const volumeCm3 = isCm3 ? volume : volume / 1000;
            return volumeCm3 * 1.24; // Standard PLA density fallback
        }
    }

    // Stage 5: Final Fuzzy Match
    const fuzzyMatch = content.match(/filament.+?([\d.]+)\s*g/i);
    if (fuzzyMatch && fuzzyMatch[1]) return parseFloat(fuzzyMatch[1]);

    return 0;
}

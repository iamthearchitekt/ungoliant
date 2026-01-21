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
        netAvailable = Math.max(0, gross - spool);
    }

    // 2. Determine Required Weight (Single vs Multi-Plate)
    let printRequired = 0;
    let totalProjectWeight = 0;

    if (state.isAdvanced && state.plates.length > 0) {
        totalProjectWeight = state.plates.reduce((sum, p) => sum + (parseFloat(p.mass) || 0), 0);
        // In advanced mode, the "first plate" or current build might be what we check against the current spool
        // But the user wants project-wide estimation. 
        // Let's assume the "Print Required" for the CURRENT spool is the first plate if we're thinking about "what's on the printer now"
        // But for "Spools Needed", we use the total.
        printRequired = parseFloat(state.plates[0]?.mass) || 0;
    } else {
        printRequired = parseFloat(state.printWeight) || 0;
        totalProjectWeight = printRequired;
    }

    // 3. Spools Needed calculation
    const spoolsNeeded = capacity > 0 ? Math.ceil(totalProjectWeight / capacity) : 1;

    // 4. Calculate Remaining AFTER Print (for the current/next plate)
    let remainingAfter = netAvailable - printRequired;
    let isInsufficient = remainingAfter < 0;

    // 5. Percentage Calculation for Visualizer
    let percentage = 100;
    if (capacity > 0) {
        percentage = (remainingAfter / capacity) * 100;
    }

    // Volume & Length
    const volumeCm3 = netAvailable / density;
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
        isInsufficient: isInsufficient
    };
}

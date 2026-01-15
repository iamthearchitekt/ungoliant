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
    remainingAfterPrint: number; // g
    remainingPercentage: number;
    estimatedLength: number; // m
    printCost: number; // currency
    isInsufficient: boolean;
}

export function calculateFilament(state: CalculationState): Partial<CalculationState> {
    const gross = parseFloat(state.grossWeight) || 0;
    const spool = parseFloat(state.spoolWeight) || 0;
    const printRequired = parseFloat(state.printWeight) || 0;
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

    // 2. Calculate Remaining AFTER Print
    let remainingAfter = netAvailable - printRequired;
    let isInsufficient = remainingAfter < 0;

    // 3. Percentage Calculation for Visualizer
    // We visually represent how much of the "Total Capacity" is left after the print
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

    const printCost = (printRequired / 1000) * cost;

    return {
        netWeight: netAvailable,
        usedWeight: printRequired,
        remainingAfterPrint: remainingAfter,
        remainingPercentage: percentage,
        estimatedLength: lengthM,
        printCost: printCost,
        isInsufficient: isInsufficient
    };
}

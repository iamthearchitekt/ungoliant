const { calculateFilament } = require('./src/lib/filament');

const mockState = {
    mode: 'mass',
    materialIndex: 0,
    density: 1.24,
    grossWeight: '1250',
    spoolWeight: '250',
    printWeight: '100',
    filamentDiameter: '1.75',
    costPerKg: '20',
    isAdvanced: true,
    plates: [
        { id: '1', mass: '500' },
        { id: '2', mass: '600' }
    ],
    isCustomCapacity: false,
    spoolCapacity: '1000',
    isPartiallyUsed: false,
    inputPercentage: '100'
};

console.log("Testing Advanced Mode: 2 plates (500g + 600g = 1100g total)");
const results = calculateFilament(mockState);
console.log("Total Project Weight:", results.totalProjectWeight, "g (Expected: 1100)");
console.log("Spools Needed:", results.spoolsNeeded, "(Expected: 2)");
console.log("Remaining (current spool):", results.remainingAfterPrint, "g (Expected: 500)");
console.log("Print Cost:", results.printCost, "(Expected: 22)");

if (results.totalProjectWeight === 1100 && results.spoolsNeeded === 2) {
    console.log("\n✅ Logic Verification Passed!");
} else {
    console.log("\n❌ Logic Verification Failed!");
    process.exit(1);
}

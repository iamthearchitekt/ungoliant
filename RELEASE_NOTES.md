# Ungoliant v1.0.4 - The "Multi-Spool" Update 🧶

We're excited to announce **Ungoliant v1.0.4**, a major update focused on managing large projects, reducing waste, and making your filament planning smarter than ever.

## 🚀 New Features

### 1. Multi-Spool Support
Tracking filament for large projects is now built-in.
- **Quantity Tracking:** Specify how many identical spools you have in stock (1-4).
- **Smart Stacking:** The app now calculates your *Total Net Available* filament across all rolls.
- **Dynamic Visualizer:** The new visualizer renders your exact spool count in a vertical stack. Watch them deplete one-by-one as your project mass increases!
- **Accurate Depletion:** The animation is no longer a simple trick—it physically simulates the shrinking thickness of the filament on the spool for a realistic preview.

### 2. AMS Waste Calculator 🗑️
Bambu Lab AMS users, this one's for you.
- **Waste Estimation:** Enable "AMS Waste Mode" to automatically factor in purge waste based on color changes.
- **Smart Logic:** Uses a heuristic (approx. 5% per additional color) to ensure you don't run out mid-print due to purge tower consumption.

### 3. Advanced Project Sync 🔄
- **Per-Plate Imports:** In Advanced Mode, you can now upload individual `.3mf` or `.gcode` files for *each plate* in your project.
- **Smart Tally:** The calculator sums the mass of all plates to verify if your total filament stock (across all spools) is sufficient for the entire job.
- **Safety Alerts:** If your project mass exceeds your spool count, the "Spools Required" readout lights up **RED** to warn you instantly.

**Download v1.0.4 now and stop guessing your filament usage!**

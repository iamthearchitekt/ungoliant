import JSZip from 'jszip';
import { parseGCode } from './filament';

/**
 * Parses a loaded .3mf or .gcode file to find the total filament usage in grams.
 */
export async function parseProjectFile(file: File): Promise<number> {
    const fileName = file.name.toLowerCase();

    console.log(`[FileParser] Starting process for: ${fileName}`);

    try {
        let content = '';

        if (fileName.endsWith('.3mf')) {
            console.log('[FileParser] Detected .3mf, unzipping...');
            const buffer = await file.arrayBuffer();

            // Use the standard JSZip constructor
            const zip = new JSZip();
            const loadedZip = await zip.loadAsync(buffer);

            const allFiles = Object.keys(loadedZip.files);
            console.log(`[FileParser] Unzipped ${allFiles.length} files.`);

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

            console.log(`[FileParser] Scanning ${candidates.length} candidate files for filament data...`);

            for (const f of candidates) {
                try {
                    const txt = await loadedZip.files[f].async('string');
                    const weight = parseGCode(txt);

                    if (weight > 0) {
                        console.log(`[FileParser] MATCH! Found ${weight}g in: ${f}`);
                        // Just double check fuzzy match if it's super low confidence? 
                        // No, parseGCode is pretty robust now.
                        return weight;
                    }
                } catch (e) {
                    console.warn(`[FileParser] Could not read file internal: ${f}`, e);
                }
            }

            throw new Error('Filament info not found in project. (Ensure file is sliced)');

        } else if (fileName.endsWith('.gcode')) {
            content = await file.text();
            const weight = parseGCode(content);
            if (weight > 0) return weight;
            throw new Error('Could not find filament mass in G-code.');
        } else {
            throw new Error('Unsupported file type. Please use .gcode or .3mf.');
        }

    } catch (err: any) {
        console.error('[FileParser] Error:', err);
        throw err; // Propagate error for UI to handle
    }
}

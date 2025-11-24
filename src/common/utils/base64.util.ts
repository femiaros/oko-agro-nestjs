import { Buffer } from 'buffer';


/**
 * Normalize base64 input into a proper data URI (with MIME prefix).
 * Detects JPEG/PNG if missing.
 */
// export function normalizeBase64(base64: string): { base64: string; mimeType: string } {
//     // Case 1: If already a data URI with MIME type
//     const mimeMatch = base64.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,/);
//     // const mimeMatch = base64.match(/^data:([a-zA-Z0-9/+.-]+);base64,/); // - Try this line if application/pdf check dont work directly

//     if (mimeMatch) {
//         return { base64, mimeType: mimeMatch[1] };
//     }

//     // Case 2: Raw base64 (no header) → detect type by magic numbers
//     const buffer = Buffer.from(base64, 'base64');
//     let mimeType = 'application/octet-stream';

//     if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
//         mimeType = 'image/jpeg';
//     } else if (
//         buffer[0] === 0x89 &&
//         buffer[1] === 0x50 &&
//         buffer[2] === 0x4e &&
//         buffer[3] === 0x47
//     ) {
//         mimeType = 'image/png';
//     }else if (
//         buffer[0] === 0x25 &&
//         buffer[1] === 0x50 &&
//         buffer[2] === 0x44 &&
//         buffer[3] === 0x46
//     ) {
//         mimeType = 'application/pdf';
//     }

//     // Prefix the base64 with detected MIME type
//     const normalizedBase64 = `data:${mimeType};base64,${base64}`;
//     return { base64: normalizedBase64, mimeType };
// }

export function normalizeBase64(base64: string): { base64: string; mimeType: string } {
    const existingHeader = base64.match(/^data:([a-zA-Z0-9/+.-]+);base64,/);

    if (existingHeader) {
        return { base64, mimeType: existingHeader[1] };
    }

    const mimeType = detectMimeTypeFromBase64(base64) ?? 'application/octet-stream';
    return { base64: `data:${mimeType};base64,${base64}`, mimeType };
}

/**
 * Validate if base64 string is a supported image type (jpeg, jpg, png).
 */
export function isValidImageType(base64: string): boolean {
    try {
        const headerMatch = base64.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,/);

        if (headerMatch && headerMatch[1]) {
            const mimeType = headerMatch[1].toLowerCase();
            return ['image/jpeg', 'image/jpg', 'image/png'].includes(mimeType);
        }

        // Fallback: check magic numbers
        const base64Data = base64.replace(/^data:.*;base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');

        if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return true; // JPEG
        if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47)
        return true; // PNG

        return false;
    } catch {
        return false;
    }
}

/**
 * Validate base64 file size against a max size in bytes.
 * @param base64 base64 string
 * @param maxSizeBytes max size in bytes (e.g. 2 * 1024 * 1024 for 2MB, 600 * 1024 for 600KB)
 */
export function isValidBase64Size(base64: string, maxSizeBytes: number): boolean {
    try {
        // Strip header (case-insensitive)
        const base64Data = base64.replace(/^data:image\/[a-zA-Z0-9.+-]+;base64,/, '');
        // const base64Data = base64.replace(/^data:[a-zA-Z0-9/+.-]+;base64,/, '');

        // Remove padding
        const padding = (base64Data.match(/=*$/) || [''])[0].length;

        // Calculate size
        const sizeInBytes = (base64Data.length * 3) / 4 - padding;

        return sizeInBytes <= maxSizeBytes;
    } catch {
        return false;
    }
}

export function isValidBase64SizeGeneric(base64: string, maxBytes: number): boolean {
    try {
        const base64Data = base64.replace(/^data:[a-zA-Z0-9/+.-]+;base64,/, '');
        const padding = (base64Data.match(/=*$/) || [''])[0].length;
        const sizeInBytes = (base64Data.length * 3) / 4 - padding;
        return sizeInBytes <= maxBytes;
    } catch {
        return false;
    }
}


export function detectMimeTypeFromBase64(base64: string): string | null {
    // If it already starts with a data URI
    const headerMatch = base64.match(/^data:([a-zA-Z0-9/+.-]+);base64,/);
    if (headerMatch) {
        return headerMatch[1];
    }

    // Otherwise detect from magic bytes
    try {
        const buffer = Buffer.from(base64, 'base64');

        if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff)
        return 'image/jpeg';

        if (
        buffer[0] === 0x89 &&
        buffer[1] === 0x50 &&
        buffer[2] === 0x4e &&
        buffer[3] === 0x47
        )
        return 'image/png';

        if (
        buffer[0] === 0x25 &&  // %
        buffer[1] === 0x50 &&  // P
        buffer[2] === 0x44 &&  // D
        buffer[3] === 0x46     // F
        )
        return 'application/pdf';

        return null;
    } catch {
        return null;
    }
}
import { Buffer } from 'buffer';

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

        // JPEG
        if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return 'image/jpeg';

        // PNG
        if (
            buffer[0] === 0x89 &&
            buffer[1] === 0x50 &&
            buffer[2] === 0x4e &&
            buffer[3] === 0x47
        ) return 'image/png';

        // PDF
        if (
            buffer[0] === 0x25 &&  // %
            buffer[1] === 0x50 &&  // P
            buffer[2] === 0x44 &&  // D
            buffer[3] === 0x46     // F
        ) return 'application/pdf';

        // DOC (old Word format)
        if (
            buffer[0] === 0xd0 &&
            buffer[1] === 0xcf &&
            buffer[2] === 0x11 &&
            buffer[3] === 0xe0
        ) return 'application/msword';

        // DOCX (modern Word - ZIP container)
        if (
            buffer[0] === 0x50 &&
            buffer[1] === 0x4b &&
            buffer[2] === 0x03 &&
            buffer[3] === 0x04
        ) return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

        return null;
    } catch {
        return null;
    }
}

export const SUPPORTED_MIME_TYPES: ReadonlyArray<string> = [
    'image/jpeg',
    'image/png',
    'application/pdf',
    'application/msword', // .doc
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
];

export const PO_SUPPORTED_MIME_TYPES: ReadonlyArray<string> = [
    'application/pdf',
    'application/msword', // .doc
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
];
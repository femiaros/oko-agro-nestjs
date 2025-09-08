import { Buffer } from 'buffer';

export function normalizeBase64(base64: string): { base64: string; mimeType: string } {
    // Case 1: If already a data URI with MIME type
    const mimeMatch = base64.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,/);
    if (mimeMatch) {
        return { base64, mimeType: mimeMatch[1] };
    }

    // Case 2: Raw base64 (no header) → detect type by magic numbers
    const buffer = Buffer.from(base64, 'base64');

    let mimeType = 'application/octet-stream';
    if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
        mimeType = 'image/jpeg';
    } else if (
        buffer[0] === 0x89 &&
        buffer[1] === 0x50 &&
        buffer[2] === 0x4e &&
        buffer[3] === 0x47
    ) {
        mimeType = 'image/png';
    }

    // Prefix the base64 with detected MIME type
    const normalizedBase64 = `data:${mimeType};base64,${base64}`;
    return { base64: normalizedBase64, mimeType };
}

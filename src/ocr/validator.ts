import { FileValidationResult } from './types';

export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

/**
 * Validates the raw byte buffer against known image magic signatures.
 * Supports JPEG, PNG, and WebP.
 */
export function validateImageBuffer(bytes: Uint8Array, sizeBytes?: number): FileValidationResult {
  const actualSize = sizeBytes ?? bytes.byteLength;

  if (actualSize <= 0) {
    return {
      valid: false,
      error: 'The uploaded file is empty (0 bytes). Please upload a valid image.',
      sizeBytes: actualSize
    };
  }

  if (actualSize > MAX_FILE_SIZE_BYTES) {
    const sizeMb = (actualSize / (1024 * 1024)).toFixed(2);
    return {
      valid: false,
      error: `File size (${sizeMb} MB) exceeds the maximum allowed limit of 5.00 MB. Please upload a compressed or cropped photo.`,
      sizeBytes: actualSize
    };
  }

  if (bytes.length < 12) {
    return {
      valid: false,
      error: 'The uploaded file does not contain a valid image header.',
      sizeBytes: actualSize
    };
  }

  // 1. JPEG: FF D8 FF
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return {
      valid: true,
      format: 'jpeg',
      sizeBytes: actualSize
    };
  }

  // 2. PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  ) {
    return {
      valid: true,
      format: 'png',
      sizeBytes: actualSize
    };
  }

  // 3. WebP: RIFF (bytes 0-3) and WEBP (bytes 8-11)
  // 'R'=0x52, 'I'=0x49, 'F'=0x46, 'F'=0x46
  // 'W'=0x57, 'E'=0x45, 'B'=0x42, 'P'=0x50
  if (
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return {
      valid: true,
      format: 'webp',
      sizeBytes: actualSize
    };
  }

  return {
    valid: false,
    error: 'Unsupported or unverified image format. Only authentic JPEG, PNG, or WebP images are supported. PDF files, documents, or disguised files are not permitted.',
    sizeBytes: actualSize
  };
}

/**
 * Validates a browser File instance asynchronously by inspecting size and magic bytes.
 */
export async function validateUploadedFile(file: File): Promise<FileValidationResult> {
  if (!file) {
    return {
      valid: false,
      error: 'No file provided.'
    };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
    return {
      valid: false,
      error: `File size (${sizeMb} MB) exceeds the maximum allowed limit of 5.00 MB. Please upload a smaller image.`,
      sizeBytes: file.size
    };
  }

  try {
    // Read the first 64 bytes to inspect magic header
    const slice = file.slice(0, 64);
    const arrayBuffer = await slice.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    return validateImageBuffer(bytes, file.size);
  } catch (err) {
    return {
      valid: false,
      error: `Failed to inspect file: ${err instanceof Error ? err.message : 'Unknown error'}`
    };
  }
}

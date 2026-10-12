import { describe, it, expect } from 'vitest';
import { validateImageBuffer, MAX_FILE_SIZE_BYTES } from '../../src/ocr/validator';

describe('OCR Upload Validator - Magic Bytes & Size Limits', () => {
  it('accepts a valid JPEG buffer', () => {
    // FF D8 FF E0 ...
    const jpegHeader = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01]);
    const result = validateImageBuffer(jpegHeader, 1024);
    expect(result.valid).toBe(true);
    expect(result.format).toBe('jpeg');
    expect(result.error).toBeUndefined();
  });

  it('accepts a valid PNG buffer', () => {
    // 89 50 4E 47 0D 0A 1A 0A
    const pngHeader = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d]);
    const result = validateImageBuffer(pngHeader, 2048);
    expect(result.valid).toBe(true);
    expect(result.format).toBe('png');
    expect(result.error).toBeUndefined();
  });

  it('accepts a valid WebP buffer', () => {
    // RIFF .... WEBP
    const webpHeader = new Uint8Array([
      0x52, 0x49, 0x46, 0x46, // RIFF
      0x24, 0x00, 0x00, 0x00, // length
      0x57, 0x45, 0x42, 0x50, // WEBP
      0x56, 0x50, 0x38, 0x20  // VP8
    ]);
    const result = validateImageBuffer(webpHeader, 4096);
    expect(result.valid).toBe(true);
    expect(result.format).toBe('webp');
    expect(result.error).toBeUndefined();
  });

  it('rejects files exceeding 5 MB limit', () => {
    const jpegHeader = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01]);
    const oversized = MAX_FILE_SIZE_BYTES + 1024;
    const result = validateImageBuffer(jpegHeader, oversized);
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/exceeds the maximum allowed limit of 5.00 MB/);
  });

  it('rejects empty files (0 bytes)', () => {
    const emptyBuffer = new Uint8Array([]);
    const result = validateImageBuffer(emptyBuffer, 0);
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/empty/);
  });

  it('rejects buffers with insufficient header (< 12 bytes)', () => {
    const shortBuffer = new Uint8Array([0xff, 0xd8]);
    const result = validateImageBuffer(shortBuffer, 2);
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/valid image header/);
  });

  it('rejects arbitrary non-image text or disguised files (PDF / HTML / exe)', () => {
    // %PDF-1.5 -> 25 50 44 46
    const pdfHeader = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x35, 0x0a, 0x25, 0xd0, 0xd4]);
    const result = validateImageBuffer(pdfHeader, 5000);
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/Unsupported or unverified image format/);

    // MZ executable header: 4D 5A
    const exeHeader = new Uint8Array([0x4d, 0x5a, 0x90, 0x00, 0x03, 0x00, 0x00, 0x00, 0x04, 0x00, 0x00, 0x00]);
    const exeResult = validateImageBuffer(exeHeader, 5000);
    expect(exeResult.valid).toBe(false);
  });
});

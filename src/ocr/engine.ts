import { OcrProgressInfo } from './types';

export class OcrExecutionError extends Error {
  constructor(message: string, public readonly originalError?: unknown) {
    super(message);
    this.name = 'OcrExecutionError';
  }
}

/**
 * Runs client-side optical character recognition on an image file or blob.
 * Tesseract.js is dynamically imported on demand to preserve zero-cost bundle size
 * for users who use the calculator manually.
 */
export async function recognizeResultImage(
  imageSource: Blob | File | string,
  onProgress?: (info: OcrProgressInfo) => void,
  signal?: AbortSignal
): Promise<string> {
  if (typeof window === 'undefined') {
    throw new OcrExecutionError('OCR image recognition can only be executed in a browser client environment.');
  }

  if (signal?.aborted) {
    throw new OcrExecutionError('Recognition was cancelled before starting.');
  }

  onProgress?.({
    status: 'loading_engine',
    progress: 5,
    statusMessage: 'Loading browser recognition engine...'
  });

  // Dynamic import of Tesseract.js
  let tesseractModule;
  try {
    tesseractModule = await import('tesseract.js');
  } catch (err) {
    throw new OcrExecutionError('Failed to load OCR engine library. Check network connection.', err);
  }

  if (signal?.aborted) {
    throw new OcrExecutionError('Recognition cancelled by user.');
  }

  const { createWorker } = tesseractModule;
  let worker: any = null;

  try {
    onProgress?.({
      status: 'loading_engine',
      progress: 15,
      statusMessage: 'Initializing recognition worker...'
    });

    worker = await createWorker('eng', 1, {
      logger: (m: { status: string; progress: number }) => {
        if (signal?.aborted) return;

        let userMsg = 'Scanning document...';
        let mappedProgress = Math.round((m.progress || 0) * 100);

        if (m.status === 'loading tesseract core') {
          userMsg = 'Loading optical recognition core...';
          mappedProgress = Math.round(15 + (m.progress || 0) * 20);
        } else if (m.status === 'loading language traineddata') {
          userMsg = 'Loading recognition models...';
          mappedProgress = Math.round(35 + (m.progress || 0) * 25);
        } else if (m.status === 'recognizing text') {
          userMsg = `Scanning document text (${Math.round((m.progress || 0) * 100)}%)...`;
          mappedProgress = Math.round(60 + (m.progress || 0) * 35);
        }

        onProgress?.({
          status: m.status === 'recognizing text' ? 'recognizing' : 'loading_engine',
          progress: Math.min(95, Math.max(10, mappedProgress)),
          statusMessage: userMsg
        });
      }
    });

    if (signal?.aborted) {
      await worker.terminate();
      throw new OcrExecutionError('Recognition cancelled by user.');
    }

    onProgress?.({
      status: 'recognizing',
      progress: 65,
      statusMessage: 'Processing image pixels...'
    });

    const ret = await worker.recognize(imageSource);

    onProgress?.({
      status: 'parsing',
      progress: 98,
      statusMessage: 'Extracting academic credentials...'
    });

    const text = ret.data?.text || '';
    return text;
  } catch (err) {
    if (signal?.aborted) {
      throw new OcrExecutionError('Recognition cancelled by user.');
    }
    throw new OcrExecutionError(
      err instanceof Error ? err.message : 'An error occurred during optical character recognition.',
      err
    );
  } finally {
    if (worker) {
      try {
        await worker.terminate();
      } catch {
        // Ignored termination error
      }
    }
  }
}

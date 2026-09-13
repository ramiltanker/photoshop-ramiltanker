import type { ProgressHandler } from '../types';

const ROWS_PER_CHUNK = 32;

function waitForNextTask(): Promise<void> {
  return new Promise((resolve) => {
    const channel = new MessageChannel();

    channel.port1.onmessage = () => {
      channel.port1.close();
      resolve();
    };

    channel.port2.postMessage(null);
  });
}

export async function forEachRow(
  height: number,
  handleRow: (y: number) => void,
  onProgress?: ProgressHandler,
  signal?: AbortSignal
): Promise<boolean> {
  for (let y = 0; y < height; y += 1) {
    handleRow(y);

    if ((y + 1) % ROWS_PER_CHUNK === 0 && y + 1 < height) {
      onProgress?.((y + 1) / height);
      await waitForNextTask();

      if (signal?.aborted) {
        return false;
      }
    }
  }

  onProgress?.(1);

  return true;
}

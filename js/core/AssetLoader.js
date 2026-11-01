/** Small concurrent preload/cache helper. Failed optional assets never block startup. */
export class AssetLoader {
  static imageCache = new Map();
  static audioCache = new Map();

  static async load(sources = [], { concurrency = 8, onProgress = () => {} } = {}) {
    const paths = [...new Set(sources.filter((src) => typeof src === 'string' && src.trim()))];
    let completed = 0;
    let cursor = 0;
    const worker = async () => {
      while (cursor < paths.length) {
        const src = paths[cursor++];
        try {
          if (/\.(mp3|wav|ogg|opus|m4a|aac)(?:[?#]|$)/i.test(src)) {
            let audio = this.audioCache.get(src);
            if (!audio) {
              audio = new Audio();
              audio.preload = 'auto';
              audio.src = src;
              this.audioCache.set(src, audio);
              await new Promise((resolve) => {
                if (audio.readyState >= 2) return resolve();
                const done = () => {
                  audio.removeEventListener('canplaythrough', done);
                  audio.removeEventListener('error', done);
                  resolve();
                };
                audio.addEventListener('canplaythrough', done, { once: true });
                audio.addEventListener('error', done, { once: true });
                audio.load();
                setTimeout(done, 2500);
              });
            }
          } else if (/\.(png|jpe?g|webp|gif|avif)(?:[?#]|$)/i.test(src)) {
            let image = this.imageCache.get(src);
            if (!image) {
              image = new Image();
              image.decoding = 'async';
              this.imageCache.set(src, image);
              await new Promise((resolve) => {
                image.onload = async () => {
                  try {
                    await image.decode?.();
                  } catch {}
                  resolve();
                };
                image.onerror = resolve;
                image.src = src;
                if (image.complete) resolve();
              });
            }
          }
        } finally {
          completed++;
          onProgress(completed, paths.length, src);
        }
      }
    };
    await Promise.all(Array.from({ length: Math.min(concurrency, paths.length) }, worker));
    return { total: paths.length, images: this.imageCache, audio: this.audioCache };
  }
}

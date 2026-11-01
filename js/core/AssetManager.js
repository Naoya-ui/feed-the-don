import { AssetLoader } from './AssetLoader.js';

/** Public asset facade: deduplicated image/audio preload with progress and cache access. */
export class AssetManager extends AssetLoader {
  static async preload(sources = [], options = {}) {
    return this.load(sources, options);
  }
  static getImage(src) {
    return this.imageCache.get(src) || null;
  }
  static getAudio(src) {
    return this.audioCache.get(src) || null;
  }
}

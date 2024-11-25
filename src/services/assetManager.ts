import { shallowRef } from 'vue';
import { openDB, IDBPDatabase } from 'idb';
import router from '../router';

interface AssetDB {
  assets: {
    key: string;
    value: Blob;
  };
}

// 资产列表配置
const ASSET_LIST = {
  sprite: [
    'ax.png', 'bearman.png', 'blackbear.png', 'candle0.png', 'candle1.png',
    'candle2.png', 'chas0.png', 'chas1.png', 'chas2.png', 'cloak.png',
    'coldeco.png', 'epitaph0.png', 'epitaph1.png', 'fish00.png', 'fish01.png',
    'flower0.png', 'flower1.png', 'gameover.png', 'gameover2.png', 'hell0.png',
    'hell1.png', 'hell2.png', 'iceflare.png', 'inn.png', 'kudou.png',
    'lighter.png', 'lucifer.png', 'memo.png', 'nazo00.png', 'noenemy.png',
    'self.png', 'selfclosed.png', 'shop.png', 'snow0.png', 'snow1.png',
    'snow2.png', 'snowdoll.png', 'snowman.png', 'snowman2.png', 'snowman3.png',
    'snowman4.png', 'snowwes.png', 'snowwes2.png', 'snowwes3.png', 'snowwes4.png',
    'title.png', 'warning.png', 'welcome.png', 'whitebear.png', 'whitebear2.png',
    'zereta.png'
  ],
  cg: [
    'black.bmp', 'dark00.bmp', 'dark01.bmp', 'dark02.bmp',
    'scene_colde00.bmp', 'scene_colde01.bmp', 'scene_engine.bmp',
    'scene_fire.bmp', 'scene_fireball.bmp', 'scene_fish.bmp',
    'scene_house00.bmp', 'scene_house01.bmp', 'scene_house02.bmp',
    'scene_house03.bmp', 'scene_kudou.bmp', 'scene_kudou02.bmp',
    'scene_self00.bmp', 'scene_self01.bmp', 'scene_self02.bmp',
    'scene_self03.bmp', 'scene_self04.bmp', 'scene_self05.bmp',
    'scene_self06.bmp', 'scene_self07.bmp', 'scene_self08.bmp',
    'scene_self09.bmp', 'scene_self10.bmp', 'scene_snowball.bmp',
    'scene_white.bmp'
  ],
  music: [
    'coldecot.mp3', 'fuleuden.mp3', 'haruyori.mp3', 'haumu.mp3',
    'macchi.mp3', 'simoyake.mp3', 'sironotuiku.mp3', 'thanatos.mp3',
    'yukimichi.mp3', 'yukio.mp3'
  ],
  sound: [
    'break.wav', 'bub.wav', 'dh.wav', 'dun.wav', 'duty.wav',
    'eat.wav', 'fire.wav', 'hyuun.wav', 'kin.wav', 'open.wav',
    'popon.wav', 'roar.wav', 'spell00.wav', 'spell01.wav', 'spell02.wav',
    'spell03.wav', 'spell04.wav', 'spell05.wav', 'spell06.wav', 'spell07.wav',
    'spell08.wav', 'spell09.wav', 'suka.wav', 'thathatha.wav', 'turn.wav',
    'up.wav', 'weak.wav', 'zurl.wav', 'step.wav'
  ],
  story: [
    'story00.txt', 'story01.txt', 'story02.txt', 'story03.txt',
    'story04.txt', 'story05.txt', 'story06.txt', 'story07.txt',
    'story08.txt', 'story09.txt', 'story10.txt', 'story_close.txt'
  ]
};

// 缓存已加载的资源
const assetCache = new Map<string, string>();

class AssetManager {
  private db: IDBPDatabase<AssetDB> | null = null;
  private totalAssets: number = 0;
  private loadedAssets: number = 0;
  private urlCache: Map<string, string> = new Map();
  private imageUrls: string[] = [];

  constructor() {
    this.totalAssets = Object.values(ASSET_LIST).reduce(
      (sum, files) => sum + files.length,
      0
    );
  }

  async init() {
    this.db = await openDB<AssetDB>('game-assets', 1, {
      upgrade(db) {
        db.createObjectStore('assets', { keyPath: 'key' });
      },
    });
  }

  async hasAssets(): Promise<boolean> {
    await this.ensureDB();
    const count = await this.db!.count('assets');
    return count === this.totalAssets;
  }

  private async ensureDB() {
    if (!this.db) {
      await this.init();
    }
  }

  async loadAllAssets(onProgress?: (current: number, total: number) => void) {
    await this.ensureDB();
    this.loadedAssets = 0;

    for (const [type, files] of Object.entries(ASSET_LIST)) {
      for (const file of files) {
        try {
          const key = `${type}/${file}`;
          const existing = await this.db!.get('assets', key);
          if (!existing) {
            const assetPath = `/assets/${type}/${file}`;
            const response = await fetch(assetPath);
            if (!response.ok) {
              throw new Error(`Failed to load ${key}`);
            }
            const blob = await response.blob();
            await this.db!.put('assets', {
              key,
              value: blob
            });
          }

          this.loadedAssets++;
          onProgress?.(this.loadedAssets, this.totalAssets);
        } catch (error) {
          console.error(`Error loading asset ${type}/${file}:`, error);
          throw error;
        }
      }
    }
  }

  async getAsset(path: string): Promise<Blob> {
    await this.ensureDB();
    const asset = await this.db!.get('assets', path);
    if (!asset) {
      await router.push('/loading');
      throw new Error(`Asset not found: ${path}`);
    }
    return asset.value;
  }

  /**
   * 获取资产的 URL
   * @param path 资产路径 (例如: 'sprite/snow0.png')
   * @returns 资产的 URL
   */
  async getAssetUrl(path: string): Promise<string> {
    // 检查缓存
    if (this.urlCache.has(path)) {
      return this.urlCache.get(path)!;
    }

    try {
      const blob = await this.getAsset(path);
      const url = URL.createObjectURL(blob);
      this.urlCache.set(path, url);
      return url;
    } catch (error) {
      console.error(`Failed to get asset URL for ${path}:`, error);
      // 不再直接返回fallback图片，而是让错误传播出去，触发重定向
      throw error;
    }
  }

  /**
   * 清理指定资产的 URL 缓存
   * @param path 资产路径
   */
  clearAssetUrl(path: string) {
    const url = this.urlCache.get(path);
    if (url) {
      URL.revokeObjectURL(url);
      this.urlCache.delete(path);
    }
  }

  /**
   * 清理所有 URL 缓存
   */
  clearAllAssetUrls() {
    this.urlCache.forEach(url => URL.revokeObjectURL(url));
    this.urlCache.clear();
  }

  /**
   * 组件使用的便捷方法
   * @param path 资产路径
   * @returns ref对象，包含资产URL
   */
  useAsset(path: string) {
    const url = shallowRef('');

    // 如果已经在缓存中，直接返回
    if (assetCache.has(path)) {
      url.value = assetCache.get(path)!;
      return url;
    }

    // 如果不在缓存中，说明是动态生成的路径（如 snow0.png, snow1.png, snow2.png）
    // 使用 getAssetUrl 方法从 IndexedDB 获取资源
    this.getAssetUrl(path)
      .then(assetUrl => {
        // 获取到 URL 后也加入缓存
        assetCache.set(path, assetUrl);
        url.value = assetUrl;
      })
      .catch(error => {
        console.error(`加载资源失败: ${path}`, error);
      });

    return url;
  }

  // 清理函数 - 在应用退出时调用
  clearAssets() {
    assetCache.forEach(url => {
      URL.revokeObjectURL(url);
    });
    assetCache.clear();
  }

  // 获取所有图片资源的路径
  getImagePaths(): string[] {
    const imagePaths: string[] = [];

    // 添加 sprite 和 cg 类型的资源
    ['sprite', 'cg'].forEach(type => {
      ASSET_LIST[type as keyof typeof ASSET_LIST].forEach(file => {
        imagePaths.push(`${type}/${file}`);
      });
    });

    return imagePaths;
  }

  // 预加载所有图片
  async preloadAllImages(onProgress?: (current: number, total: number) => void): Promise<void> {
    const imagePaths = this.getImagePaths();
    let loadedCount = 0;
    const total = imagePaths.length;

    const promises = imagePaths.map(path => {
      return new Promise<void>((resolve, reject) => {
        this.getAssetUrl(path)
          .then(url => {
            // 同时存入 assetCache，这样 useAsset 可以直接使用
            assetCache.set(path, url);
            this.addImageUrl(url);
            loadedCount++;
            onProgress?.(loadedCount, total);
            resolve();
          })
          .catch(reject);
      });
    });

    await Promise.all(promises);
  }

  // 获取所有需要预加载的图片URL
  getPreloadImageUrls(): string[] {
    return this.imageUrls;
  }

  // 添加需要预加载的图片URL
  addImageUrl(url: string) {
    if (!this.imageUrls.includes(url)) {
      this.imageUrls.push(url);
    }
  }
}

export const assetManager = new AssetManager(); 
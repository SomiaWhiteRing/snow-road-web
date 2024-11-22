import { assetManager } from './assetManager';

class SoundManager {
  private audioPool: HTMLAudioElement[] = [];
  private readonly POOL_SIZE = 8; // 音频池大小
  private currentIndex = 0;

  constructor() {
    // 初始化音频池
    for (let i = 0; i < this.POOL_SIZE; i++) {
      const audio = new Audio();
      audio.volume = 0.6; // 默认音量
      this.audioPool.push(audio);
    }
  }

  // 播放音效
  async playSound(soundName: string) {
    try {
      // 获取音效文件URL
      const soundUrl = await assetManager.getAssetUrl(`sound/${soundName}`);
      
      // 获取下一个可用的音频元素
      const audio = this.audioPool[this.currentIndex];
      
      // 重置音频
      audio.pause();
      audio.currentTime = 0;
      
      // 设置新的音源并播放
      audio.src = soundUrl;
      await audio.play();
      
      // 更新索引
      this.currentIndex = (this.currentIndex + 1) % this.POOL_SIZE;
    } catch (error) {
      console.error('播放音效失败:', soundName, error);
    }
  }

  // 设置音量
  setVolume(volume: number) {
    const clampedVolume = Math.max(0, Math.min(1, volume));
    this.audioPool.forEach(audio => {
      audio.volume = clampedVolume;
    });
  }

  // 停止所有音效
  stopAll() {
    this.audioPool.forEach(audio => {
      audio.pause();
      audio.currentTime = 0;
    });
  }
}

// 创建单例实例
export const soundManager = new SoundManager();

// 定义常用音效名称常量
export const SOUND = {
  BREAK: 'break.wav',
  BUBBLE: 'bub.wav',
  DAMAGE: 'dh.wav',
  DUN: 'dun.wav',
  DUTY: 'duty.wav',
  EAT: 'eat.wav',
  FIRE: 'fire.wav',
  HYUUN: 'hyuun.wav',
  KIN: 'kin.wav',
  OPEN: 'open.wav',
  POPON: 'popon.wav',
  ROAR: 'roar.wav',
  SPELL_0: 'spell00.wav',
  SPELL_1: 'spell01.wav',
  SPELL_2: 'spell02.wav',
  SPELL_3: 'spell03.wav',
  SPELL_4: 'spell04.wav',
  SPELL_5: 'spell05.wav',
  SPELL_6: 'spell06.wav',
  SPELL_7: 'spell07.wav',
  SPELL_8: 'spell08.wav',
  SPELL_9: 'spell09.wav',
  SUKA: 'suka.wav',
  THATHATHA: 'thathatha.wav',
  TURN: 'turn.wav',
  UP: 'up.wav',
  WEAK: 'weak.wav',
  ZURL: 'zurl.wav'
} as const; 
import { soundManager, SOUND } from '../services/soundManager'

declare module '@vue/runtime-core' {
  export interface ComponentCustomProperties {
    $sound: typeof soundManager
    $SOUND: typeof SOUND
  }
} 
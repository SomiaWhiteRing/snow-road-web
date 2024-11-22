import { createI18n } from 'vue-i18n';
import { messages } from './messages';
import { enemyNames } from './enemies';
import { spellNames } from './spells';
import { equipmentNames } from './equipment';

export const i18n = createI18n({
  legacy: false, // 使用 Composition API 模式
  locale: 'zh', // 设置默认语言为中文
  fallbackLocale: 'en', // 设置回退语言为英语
  messages,
  enemyNames,
  spellNames,
  equipmentNames
}); 
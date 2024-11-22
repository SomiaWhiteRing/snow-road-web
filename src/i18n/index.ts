import { createI18n } from 'vue-i18n';
import { base } from './base';
import { enemyNames } from './enemies';
import { spellNames } from './spells';
import { equipmentNames } from './equipment';
import { controlNames } from './control';

// 合并所有翻译
const mergedMessages = {
  zh: {
    ...base.zh,
    ...enemyNames.zh,
    ...spellNames.zh,
    ...equipmentNames.zh,
    ...controlNames.zh
  },
  ja: {
    ...base.ja,
    ...enemyNames.ja,
    ...spellNames.ja,
    ...equipmentNames.ja,
    ...controlNames.ja
  },
  en: {
    ...base.en,
    ...enemyNames.en,
    ...spellNames.en,
    ...equipmentNames.en,
    ...controlNames.en
  }
};

export const i18n = createI18n({
  legacy: false,
  locale: 'zh',
  fallbackLocale: 'ja',
  messages: mergedMessages
}); 
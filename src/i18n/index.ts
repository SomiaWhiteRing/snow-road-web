import { createI18n } from 'vue-i18n';
import { base } from './base';
import { enemyNames } from './enemies';
import { spellNames } from './spells';
import { equipmentNames } from './equipment';
import { controlNames } from './control';
import { eventMessages } from './events';

// 合并所有翻译
const mergedMessages = {
  zh: {
    ...base.zh,
    ...enemyNames.zh,
    ...spellNames.zh,
    ...equipmentNames.zh,
    ...controlNames.zh,
    ...eventMessages.zh
  },
  ja: {
    ...base.ja,
    ...enemyNames.ja,
    ...spellNames.ja,
    ...equipmentNames.ja,
    ...controlNames.ja,
    ...eventMessages.ja
  },
  en: {
    ...base.en,
    ...enemyNames.en,
    ...spellNames.en,
    ...equipmentNames.en,
    ...controlNames.en,
    ...eventMessages.en
  }
};

export const i18n = createI18n({
  legacy: false,
  locale: 'zh',
  fallbackLocale: 'ja',
  messages: mergedMessages
}); 
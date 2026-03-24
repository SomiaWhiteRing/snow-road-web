import { defineStore } from "pinia";
import {
  detectAutoLocale,
  detectAutoRotateScreen,
  loadStoredLocalePreference,
  loadStoredRotateScreenPreference,
  persistLocalePreference,
  persistRotateScreenPreference,
  type SupportedLocale,
} from "../utils/preferences";

export const useSettingsStore = defineStore("settings", {
  state: () => ({
    autoRotateScreen: detectAutoRotateScreen(),
    rotateScreenPreference: loadStoredRotateScreenPreference(),
    autoLocale: detectAutoLocale(),
    localePreference: loadStoredLocalePreference() as SupportedLocale | null,
  }),
  getters: {
    effectiveRotateScreen: (state) =>
      state.rotateScreenPreference ?? state.autoRotateScreen,
    effectiveLocale: (state) => state.localePreference ?? state.autoLocale,
  },
  actions: {
    setRotateScreenPreference(value: boolean | null) {
      this.rotateScreenPreference = value;
      persistRotateScreenPreference(value);
    },

    toggleRotateScreen() {
      this.setRotateScreenPreference(!this.effectiveRotateScreen);
    },

    setLocalePreference(value: SupportedLocale | null) {
      this.localePreference = value;
      persistLocalePreference(value);
    },
  },
});

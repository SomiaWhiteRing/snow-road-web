<template>
  <div class="game-view">
    <div class="scene-area">
      <div class="scene-canvas">
        <img
          class="scene-base"
          :src="useAsset(`sprite/snow${gameStore.distance % 3}.png`)"
          alt="scene"
        />
        <img
          v-if="currentSprite"
          class="sub-event"
          :class="{ 'battle-sprite': isInBattle }"
          :src="useAsset(currentSprite)"
          alt="sub-event"
        />
        <img
          v-if="battleSpriteFlashVisible && currentSprite"
          class="sub-event battle-sprite-flash"
          :class="battleSpriteFlashClass"
          :src="useAsset(currentSprite)"
          alt="battle-flash"
        />
        <SnowEffect />
        <EnemyStatus v-if="isInBattle" />
        <div v-if="anotherFilterVisible" class="another-screen-filter"></div>
        <div
          v-if="bossBattleMarkerVisible"
          class="boss-battle-marker"
          :style="bossBattleMarkerStyle"
        >
          ＢＯＳＳ
        </div>
        <div
          v-if="battleAreaFlashVisible"
          class="battle-scene-flash"
          :class="battleAreaFlashClass"
        ></div>
      </div>
      <EventMessage :message="message" />

      <ControlPanel
        v-if="overlay === 'control'"
        @close="overlay = 'none'"
        @action="handleControlAction"
      />

      <div v-if="overlay === 'shop'" class="shop-panel">
        <img
          class="shop-title-image"
          :src="useAsset('sprite/welcome.png')"
          alt="shop title"
        />
        <button
          v-for="offer in shopOffers"
          :key="offer.slot"
          class="shop-button"
          :class="`shop-button-${offer.slot}`"
          :disabled="offer.state !== 'available'"
          @click="purchaseShopOffer(offer)"
        >
          {{ getShopOfferLabel(offer) }}
        </button>
        <div class="shop-matches">
          {{ t("game.shop.matches", { count: gameStore.items.matches }) }}
        </div>
        <button class="shop-exit-button" @click="overlay = 'none'">
          {{ t("game.magic.exit") }}
        </button>
      </div>
    </div>

    <div class="status-area">
      <div class="character">
        <img :src="useAsset('sprite/self.png')" alt="character" />
      </div>

      <StatusPanel
        :battle-attack-bonus="isInBattle ? battleAttackBonus : 0"
        :battle-defense-bonus="isInBattle ? battleDefenseBonus : 0"
      />

      <button
        v-if="
          !gameOver &&
          !gameCompleted &&
          overlay === 'none' &&
          !isInBattle &&
          !storyLoading &&
          !storyVisible &&
          !systemDialogVisible
        "
        class="settings-open-button"
        @click="openSettingsOverlay"
      >
        {{ t('game.actions.settings') }}
      </button>

      <template
        v-if="
          !gameOver &&
          !gameCompleted &&
          overlay === 'none' &&
          !isInBattle &&
          !storyLoading &&
          !storyVisible &&
          !systemDialogVisible
        "
      >
        <div
          v-if="currentEvent === 'inn' && message !== currentExtra.afterMessage"
          class="field-button-slot field-button-slot-left-top"
        >
          <button
            :disabled="gameStore.items.matches < (currentExtra.cost ?? 0)"
            @click="handleInn"
          >
            {{ t("game.actions.inn") }}
          </button>
        </div>

        <div
          v-if="
            currentEvent === 'inn' &&
            message !== currentExtra.afterMessage &&
            gameStore.learnedSkills.includes('secret')
          "
          class="field-button-slot field-button-slot-left-mid"
        >
          <button @click="handleInnSecret">
            {{ t("control.secret") }}
          </button>
        </div>

        <div
          v-if="currentEvent === 'save' && message !== currentExtra.afterMessage"
          class="field-button-slot field-button-slot-left-top"
        >
          <button
            :disabled="gameStore.items.matches < (currentExtra.cost ?? 0)"
            @click="handleSave"
          >
            {{ t("game.actions.candle") }}
          </button>
        </div>

        <div
          v-if="currentEvent === 'shop'"
          class="field-button-slot field-button-slot-left-top"
        >
          <button @click="openShop">
            {{ t("game.actions.shop") }}
          </button>
        </div>

        <div class="field-button-slot field-button-slot-right-top">
          <button @click="handleForward">
            {{ t("game.actions.forward") }}
          </button>
        </div>
        <div
          v-if="gameStore.hasMagic"
          class="field-button-slot field-button-slot-right-mid"
        >
          <button @click="openMagicOverlay">
            {{ t("game.actions.magic") }}
          </button>
        </div>
        <div class="field-button-slot field-button-slot-right-bottom">
          <button @click="overlay = 'control'">
            {{ t("game.actions.control") }}
          </button>
        </div>
        <div
          v-if="gameStore.fuel > 0"
          class="field-button-slot field-button-slot-wide-top"
        >
          <button @click="handleUseStar">
            {{ t("game.actions.lighter", { count: gameStore.fuel }) }}
          </button>
        </div>
        <div class="field-button-slot field-button-slot-wide-bottom">
          <button @click="handleUseMatch">
            {{ t("game.actions.matches", { count: gameStore.items.matches }) }}
          </button>
        </div>
      </template>

      <template
        v-if="
          !gameOver &&
          !gameCompleted &&
          overlay === 'none' &&
          isInBattle &&
          !storyLoading &&
          !storyVisible &&
          !systemDialogVisible
        "
      >
        <template v-if="battleEquipChoiceVisible">
          <div class="battle-button-slot battle-button-slot-wide-top">
            <button @click="equipPendingEquipment">
              {{ t("game.actions.equip") }}
            </button>
          </div>
          <div class="battle-button-slot battle-button-slot-wide-bottom">
            <button @click="declinePendingEquipment">
              {{ t("game.actions.do_not_equip") }}
            </button>
          </div>
        </template>
        <template v-else-if="battleStepVisible">
          <div class="battle-button-slot battle-button-slot-right-top">
            <button @click="battleStep">≫</button>
          </div>
        </template>
        <template v-else>
          <div class="battle-button-slot battle-button-slot-right-top">
            <button @click="attackEnemy">
              {{ t("game.actions.fight") }}
            </button>
          </div>
          <div
            v-if="gameStore.hasMagic"
            class="battle-button-slot battle-button-slot-right-mid"
          >
            <button @click="openMagicOverlay">
              {{ t("game.actions.magic") }}
            </button>
          </div>
          <div class="battle-button-slot battle-button-slot-right-bottom">
            <button @click="attemptEscape">
              {{ t("game.actions.flee") }}
            </button>
          </div>
          <div
            v-if="canUseSecret"
            class="battle-button-slot battle-button-slot-left-mid"
          >
            <button @click="useSecret">
              {{ t("control.secret") }}
            </button>
          </div>
          <div v-if="canUseDrive" class="battle-button-slot battle-button-slot-wide-top">
            <button @click="useDrive">
              {{ t(driveLabelKey) }}
            </button>
          </div>
          <div
            v-if="canUseFlip"
            class="battle-button-slot battle-button-slot-wide-bottom"
          >
            <button @click="useFlip">
              {{ t(flipLabelKey) }}
            </button>
          </div>
          <div
            v-if="gameStore.fuel > 0"
            class="buttons buttons-3 battle-item-buttons"
          >
            <button @click="handleUseStar">
              {{ t("game.actions.lighter", { count: gameStore.fuel }) }}
            </button>
          </div>
        </template>
      </template>

      <div v-if="overlay === 'magic'" class="magic-sidebar">
        <button
          v-for="(spell, index) in SPELLS"
          :key="spell.id"
          v-show="isSpellLearned(spell.id)"
          class="magic-sidebar-button"
          :style="{ top: `${MAGIC_BUTTON_TOPS[index] ?? 10}px` }"
          :disabled="!canCastSpell(spell)"
          @click="castSpell(spell.id)"
        >
          {{ getSpellSidebarLabel(spell) }}
        </button>
        <button class="magic-sidebar-exit" @click="closeMagicOverlay">
          {{ t("game.magic.exit") }}
        </button>
      </div>

      <div
        v-if="overlay === 'settings'"
        class="modal-overlay settings-overlay"
        @click="closeSettingsOverlay"
      >
        <div class="story-panel settings-panel" @click.stop>
          <div class="panel-title">{{ t("game.settings.title") }}</div>
          <div class="settings-columns">
            <section class="settings-section">
              <div class="settings-section-title">
                {{ t("game.settings.language") }}
              </div>
              <div class="settings-button-group">
                <button
                  v-for="option in settingLanguageOptions"
                  :key="option.code"
                  :class="{ 'settings-button-active': settingsStore.effectiveLocale === option.code }"
                  @click="setGameLocale(option.code)"
                >
                  {{ option.label }}
                </button>
              </div>
            </section>
            <section class="settings-section">
              <div class="settings-section-title">
                {{ t("game.settings.system") }}
              </div>
              <div class="settings-button-group">
                <button
                  :class="{ 'settings-button-active': settingsStore.effectiveRotateScreen }"
                  @click="toggleScreenRotation"
                >
                  {{ t("game.settings.rotate_screen") }}
                </button>
                <button @click="restartFromSettings">
                  {{ t("game.actions.restart") }}
                </button>
                <button :disabled="!storedSaveAvailable" @click="restoreSavedGame">
                  {{ t("game.settings.load_save") }}
                </button>
                <button
                  :disabled="!clearRecordAvailable"
                  @click="openClearRecordViewer"
                >
                  {{ t("game.settings.clear_record") }}
                </button>
              </div>
            </section>
          </div>
          <div class="settings-footer">
            <button @click="closeSettingsOverlay">
              {{ t("game.magic.exit") }}
            </button>
          </div>
        </div>
      </div>

      <div v-if="gameCompleted" class="ending-message">
        {{ t(endingMessageKey) }}
      </div>
      <div v-if="gameCompleted" class="buttons buttons-3">
        <button @click="restartGame">
          {{ t("game.actions.restart") }}
        </button>
      </div>
    </div>

    <div v-if="overlay === 'spellBuild'" class="spell-build-screen">
      <div class="spell-build-page">
        <img
          class="spell-build-background"
          :src="useAsset('sprite/selfclosed.png')"
          alt="spell build"
        />
        <div
          class="spell-build-list"
          :class="{ 'spell-build-list-compact': spellBuildUsesCompactFont }"
        >
          {{ spellBuildListText }}
        </div>
        <div v-if="spellBuildMpLabel" class="spell-build-mp">
          {{ spellBuildMpLabel }}
        </div>
        <input
          v-if="spellBuildInputVisible"
          ref="spellBuildInputEl"
          v-model="spellBuildInput"
          class="spell-build-input"
          autocomplete="off"
          autocapitalize="off"
          spellcheck="false"
          @keydown.enter.prevent="buildSpell"
        />
        <button class="spell-build-button" @click="buildSpell">
          {{ spellBuildButtonLabel }}
        </button>
      </div>
    </div>

    <div
      v-if="cutsceneVisible"
      class="cutscene-overlay"
      :class="{ 'gameover-overlay': gameOver, 'story-overlay': storyVisible }"
      @click="handleCutsceneOverlayClick"
    >
      <img
        v-if="cutsceneImagePath"
        class="cutscene-image"
        :src="useAsset(cutsceneImagePath)"
        :alt="gameOver ? 'game over' : 'story'"
      />
      <div
        v-if="storyPanelVisible"
        class="cutscene-panel"
        :class="{ 'gameover-panel': gameOver }"
      >
        <div class="cutscene-text">{{ cutsceneText }}</div>
      </div>
    </div>

    <div
      v-if="clearRecordViewerVisible"
      class="modal-overlay clear-record-overlay"
      @click="closeClearRecordViewer"
    >
      <div class="clear-record-panel" @click.stop>
        <div class="clear-record-title">
          {{ t("game.settings.clear_record") }}
        </div>
        <div
          v-if="availableClearRecordFiles.length > 1"
          class="clear-record-tabs"
        >
          <button
            v-for="file in availableClearRecordFiles"
            :key="file"
            :class="{ 'clear-record-tab-active': selectedClearRecordFile === file }"
            @click="selectClearRecordFile(file)"
          >
            {{ file }}
          </button>
        </div>
        <div class="clear-record-filename">{{ selectedClearRecordFile }}</div>
        <div class="clear-record-body">{{ activeClearRecordText }}</div>
        <div class="clear-record-footer">
          <button @click="closeClearRecordViewer">
            {{ t("game.magic.exit") }}
          </button>
        </div>
      </div>
    </div>

    <div v-if="systemDialogVisible" class="modal-overlay system-dialog-overlay">
      <div class="system-dialog-panel" @click.stop>
        <div class="system-dialog-titlebar">
          {{ systemDialog?.title }}
        </div>
        <div class="system-dialog-body">
          <div class="system-dialog-message">{{ systemDialog?.message }}</div>
        </div>
        <div class="system-dialog-buttons">
          <button
            v-if="systemDialog?.kind === 'alert'"
            @click="resolveSystemDialog(true)"
          >
            OK
          </button>
          <template v-else>
            <button @click="resolveSystemDialog(true)">
              {{ t("game.story.yes") }}
            </button>
            <button @click="resolveSystemDialog(false)">
              {{ t("game.story.no") }}
            </button>
          </template>
        </div>
      </div>
    </div>

    <BackgroundMusic :suspended="bgmSuspended" :override-track="bgmOverrideTrack" />
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onUnmounted, ref, watch } from "vue";
import { useGameStore } from "../stores/game";
import { useSettingsStore } from "../stores/settings";
import SnowEffect from "../components/SnowEffect.vue";
import ControlPanel from "../components/ControlPanel.vue";
import StatusPanel from "../components/StatusPanel.vue";
import EventMessage from "../components/EventMessage.vue";
import EnemyStatus from "@/components/EnemyStatus.vue";
import { assetManager } from "../services/assetManager";
import { useI18n } from "vue-i18n";
import { createForwardService } from "../services/forwardService";
import { type EnemyType } from "../types/enemies";
import BackgroundMusic from "../components/BackgroundMusic.vue";
import { SPELLS } from "../types/spells";
import {
  calculateMagicDamage,
  calculatePhysicalDamage,
  createSpecialEquipment,
  createShopOffers,
  instantiateEnemy,
  type BattleEnemy,
  type ShopOffer,
} from "../services/gameMechanics";
import {
  isPlayerName,
  normalizePlayerName,
  PLAYER_NAME_IDS,
} from "../utils/playerName";
import {
  loadStoryScript,
  type StoryAction,
  type StoryFrame,
} from "../services/storyService";
import { soundManager, SOUND } from "../services/soundManager";
import {
  getOriginalFinishTexts,
  ORIGINAL_CLEAR_RECORD_FILES,
  type OriginalClearRecordFile,
} from "../constants/originalFinish";

type OverlayType =
  | "none"
  | "control"
  | "shop"
  | "magic"
  | "spellBuild"
  | "settings";
type FieldEvent =
  | "nothing"
  | "shop"
  | "inn"
  | "save"
  | "matches"
  | "thought"
  | "note"
  | "battle";

interface EventExtra {
  cost?: number;
  afterMessage?: string;
  afterSprite?: string;
  getNum?: number;
}

interface SystemDialogState {
  kind: "alert" | "confirm";
  title: string;
  message: string;
}

type ClearRecordCache = Partial<Record<OriginalClearRecordFile, boolean>>;

interface StoryOptions {
  suppressStageAdvance?: boolean;
}

interface BattleLevelUpResult {
  hpIncrease: number;
  mpIncreased: boolean;
  attackIncreased: boolean;
  defenseIncreased: boolean;
}

type StoryMusicMode = "inherit" | "stop" | "track";
type BattleCommand = "attack" | "magic" | null;
type BattleAreaFlashKind = "none" | "white" | "ice" | "fire";
type BattleSpriteFlashKind = "none" | "hit" | "strong";
type BattleFlowState =
  | 0
  | 1
  | 2
  | 3
  | 5
  | 10
  | 11
  | 12
  | 20
  | 101
  | 102
  | 103
  | 104
  | 105
  | 106
  | 107
  | 110
  | 111
  | 120
  | 130
  | "lose_finalize";

const BATTLE_STATE = {
  idle: 0,
  judge: 1,
  playerAction: 2,
  enemyAction: 3,
  starDance: 5,
  secretIntro: 10,
  secretHit: 11,
  secretRecoil: 12,
  escapeFailed: 20,
  winExp: 0x65,
  levelCheck: 0x66,
  levelHp: 0x67,
  levelMp: 0x68,
  levelAttack: 0x69,
  levelDefense: 0x6a,
  levelLoop: 0x6b,
  equipPrompt: 0x6e,
  equipApply: 0x6f,
  matchReward: 0x78,
  winFinalize: 0x82,
} as const;

const SAVE_KEY = "snow-road-web-save";
const CLEAR_RECORD_KEY = "snow-road-web-clear-records";
const BATTLE_EFFECT_TICK_MS = 50;
const MAGIC_BUTTON_TOPS = [10, 35, 60, 85, 115, 145, 170, 200, 225, 250] as const;
const SPELL_SOUNDS = [
  SOUND.SPELL_0,
  SOUND.SPELL_1,
  SOUND.SPELL_2,
  SOUND.SPELL_3,
  SOUND.SPELL_4,
  SOUND.SPELL_5,
  SOUND.SPELL_6,
  SOUND.SPELL_7,
  SOUND.SPELL_8,
  SOUND.SPELL_9,
] as const;

const gameStore = useGameStore();
const settingsStore = useSettingsStore();
const i18n = useI18n();
const { t, te } = i18n;
const isEnglishLocale = computed(() =>
  String(i18n.locale.value).toLowerCase().startsWith("en")
);
const forwardService = createForwardService(i18n);

const overlay = ref<OverlayType>("none");
const currentEvent = ref<FieldEvent>("nothing");
const currentSprite = ref("");
const currentExtra = ref<EventExtra>({});
const message = ref("");
const spellBuildInput = ref("");
const spellBuildInputEl = ref<HTMLInputElement | null>(null);
const shopOffers = ref<ShopOffer[]>([]);
const shopDistance = ref<number | null>(null);
const battleAttackBonus = ref(0);
const battleDefenseBonus = ref(0);
const gameOver = ref(false);
const gameCompleted = ref(false);
const endingMessageKey = ref("game.battle.final_clear");
const storyActions = ref<StoryAction[]>([]);
const storyCursor = ref(0);
const storyFrame = ref<StoryFrame | null>(null);
const storyStageAdvanced = ref(false);
const storySuppressStageAdvance = ref(false);
const storyVisible = ref(false);
const storyLoading = ref(false);
const storyMusicMode = ref<StoryMusicMode>("inherit");
const storyMusicTrack = ref<string | null>(null);
const systemDialog = ref<SystemDialogState | null>(null);
const pendingEquipmentChoice = ref<BattleEnemy["rewardEquipment"] | null>(null);
const pendingLevelUpResult = ref<BattleLevelUpResult | null>(null);
const storedSaveAvailable = ref(false);
const clearRecordViewerVisible = ref(false);
const clearRecordCache = ref<ClearRecordCache>({});
const selectedClearRecordFile = ref<OriginalClearRecordFile>(
  ORIGINAL_CLEAR_RECORD_FILES[0]
);
const battleState = ref<BattleFlowState>(BATTLE_STATE.idle);
const battlePlayerPending = ref(false);
const battleEnemyPending = ref(false);
const battleCommand = ref<BattleCommand>(null);
const battleSpellId = ref<string | null>(null);
const battleStarDanceCounter = ref(0);
const battleAreaFlashKind = ref<BattleAreaFlashKind>("none");
const battleSpriteFlashKind = ref<BattleSpriteFlashKind>("none");
const battleEffectTicks = ref(0);
const battleDeathFlashVisible = ref(false);
let battleEffectTimer: number | null = null;
const bossBattleMarkerOffset = ref({ x: 0, y: 0 });
let bossBattleMarkerTimer: number | null = null;
let systemDialogResolver: ((result: boolean) => void) | null = null;

const useAsset = (path: string) => assetManager.useAsset(path).value;

const isInBattle = computed(() => Boolean(gameStore.battle.enemy.id));
const battleEquipChoiceVisible = computed(
  () =>
    isInBattle.value &&
    battleState.value === BATTLE_STATE.equipPrompt &&
    Boolean(pendingEquipmentChoice.value)
);
const battleStepVisible = computed(
  () =>
    isInBattle.value &&
    battleState.value !== BATTLE_STATE.idle &&
    !battleEquipChoiceVisible.value
);
const battleEffectPulseVisible = computed(
  () => battleEffectTicks.value > 0 && battleEffectTicks.value % 2 === 1
);
const battleAreaFlashVisible = computed(
  () =>
    battleDeathFlashVisible.value ||
    (battleEffectPulseVisible.value && battleAreaFlashKind.value !== "none")
);
const battleAreaFlashClass = computed(() => ({
  "battle-scene-flash-white":
    battleDeathFlashVisible.value || battleAreaFlashKind.value === "white",
  "battle-scene-flash-ice": battleAreaFlashKind.value === "ice",
  "battle-scene-flash-fire": battleAreaFlashKind.value === "fire",
  "battle-scene-flash-solid": battleDeathFlashVisible.value,
}));
const battleSpriteFlashVisible = computed(
  () =>
    isInBattle.value &&
    Boolean(currentSprite.value) &&
    battleEffectPulseVisible.value &&
    battleSpriteFlashKind.value !== "none"
);
const battleSpriteFlashClass = computed(() =>
  battleSpriteFlashKind.value === "strong"
    ? "battle-sprite-flash-strong"
    : "battle-sprite-flash-hit"
);
const bossBattleMarkerVisible = computed(
  () => isInBattle.value && Boolean(gameStore.battle.enemy.isBoss)
);
const bossBattleMarkerStyle = computed(() => ({
  left: `${80 + bossBattleMarkerOffset.value.x}px`,
  top: `${180 + bossBattleMarkerOffset.value.y}px`,
}));
const originalFinishTexts = computed(() =>
  getOriginalFinishTexts(String(i18n.locale.value))
);
const systemDialogVisible = computed(() => systemDialog.value !== null);
const anotherFilterVisible = computed(() => gameStore.stage >= 10);
const availableClearRecordFiles = computed(() =>
  ORIGINAL_CLEAR_RECORD_FILES.filter((file) => Boolean(clearRecordCache.value[file]))
);
const clearRecordAvailable = computed(
  () => availableClearRecordFiles.value.length > 0
);
const settingLanguageOptions = [
  { code: "zh", label: "中文" },
  { code: "ja", label: "日本語" },
  { code: "en", label: "English" },
] as const;
const currentStoryFrame = computed(() => storyFrame.value);
const cutsceneVisible = computed(() => gameOver.value || storyVisible.value);
const gameOverImagePath = computed(() =>
  gameStore.stage >= 10 ? "sprite/gameover2.png" : "sprite/gameover.png"
);
const cutsceneImagePath = computed(() =>
  gameOver.value ? gameOverImagePath.value : currentStoryFrame.value?.imagePath ?? ""
);
const cutsceneText = computed(() =>
  gameOver.value ? t("game.battle.game_over") : currentStoryFrame.value?.text ?? ""
);
const storyPanelVisible = computed(
  () => !gameOver.value && cutsceneText.value.length > 0
);
const bgmOverrideTrack = computed(() =>
  storyVisible.value && storyMusicMode.value === "track"
    ? storyMusicTrack.value
    : null
);
const activeClearRecordText = computed(
  () => originalFinishTexts.value.clearRecordTexts[selectedClearRecordFile.value] ?? ""
);
const bgmSuspended = computed(
  () => gameOver.value || (storyVisible.value && storyMusicMode.value === "stop")
);
type SpellEntry = (typeof SPELLS)[number];

const isSpellLearned = (spellId: string) =>
  gameStore.learnedSpells.includes(spellId);
const getSpellShortLabel = (spell: SpellEntry) =>
  te(`spellShort.${spell.id}`) ? String(t(`spellShort.${spell.id}`)) : spell.shortLabel;
const getSpellLocalizedName = (spell: SpellEntry) =>
  te(`spell.${spell.id}`) ? String(t(`spell.${spell.id}`)) : spell.name;
const getSpellBuildBracket = (spell: SpellEntry) =>
  spell.isVirtualMp ? ["(", ")"] : ["[", "]"];
const canCastSpell = (spell: SpellEntry) =>
  gameStore.canSpendMp(spell.mpCost, spell.isVirtualMp) &&
  (isInBattle.value || spell.canUseOutsideBattle);
const getSpellSidebarLabel = (spell: SpellEntry) => {
  const [open, close] = getSpellBuildBracket(spell);
  return `${getSpellShortLabel(spell)}${open}${spell.mpCost}${close}`;
};
const allSpellsLearned = computed(
  () => gameStore.learnedSpells.length >= SPELLS.length
);
const spellBuildClosed = computed(
  () => allSpellsLearned.value || gameStore.spellBuildRemaining <= 0
);
const spellBuildInputVisible = computed(() => !spellBuildClosed.value);
const spellBuildUsesCompactFont = computed(
  () => !String(i18n.locale.value).toLowerCase().startsWith("ja")
);
const spellBuildListText = computed(() =>
  SPELLS.map((spell) => {
    const [open, close] = getSpellBuildBracket(spell);
    const label = gameStore.learnedSpells.includes(spell.id)
      ? getSpellLocalizedName(spell)
      : "Hidden";
    return `- ${label}${open}${spell.mpCost}${close} -`;
  }).join("\n")
);
const spellBuildMpLabel = computed(() => {
  if (gameStore.maxMp <= 0) {
    return "";
  }

  if (gameStore.virtualMp > 0) {
    return `ＭＰ：${gameStore.mp}＋${gameStore.virtualMp}／${gameStore.maxMp}`;
  }

  return `ＭＰ：${gameStore.mp}／${gameStore.maxMp}`;
});
const spellBuildButtonLabel = computed(() => {
  if (allSpellsLearned.value) {
    return t("game.magic.built_out");
  }

  if (gameStore.spellBuildRemaining <= 0) {
    return t("game.magic.exit");
  }

  return t("game.magic.whisper_remaining", {
    count: gameStore.spellBuildRemaining,
  });
});
const canUseDrive = computed(
  () =>
    gameStore.learnedSkills.includes("drive") &&
    Boolean(gameStore.weapon.id) &&
    (gameStore.weapon.attack ?? 0) > 0
);
const canUseFlip = computed(
  () =>
    gameStore.learnedSkills.includes("flip") &&
    Boolean(gameStore.armor.id) &&
    (gameStore.armor.defense ?? 0) > 0
);
const canUseSecret = computed(
  () => gameStore.learnedSkills.includes("secret")
);
const driveLabelKey = computed(() =>
  gameStore.learnedSkills.includes("overdrive")
    ? "control.overdrive"
    : "control.drive"
);
const flipLabelKey = computed(() =>
  gameStore.learnedSkills.includes("flip_flop")
    ? "control.flip_flop"
    : "control.flip"
);

const syncStoredSaveAvailability = () => {
  storedSaveAvailable.value = localStorage.getItem(SAVE_KEY) !== null;
};

const syncSelectedClearRecordFile = () => {
  if (availableClearRecordFiles.value.length === 0) {
    selectedClearRecordFile.value = ORIGINAL_CLEAR_RECORD_FILES[0];
    return;
  }

  if (availableClearRecordFiles.value.includes(selectedClearRecordFile.value)) {
    return;
  }

  selectedClearRecordFile.value =
    availableClearRecordFiles.value[availableClearRecordFiles.value.length - 1];
};

const loadClearRecordCache = () => {
  const raw = localStorage.getItem(CLEAR_RECORD_KEY);
  if (!raw) {
    clearRecordCache.value = {};
    syncSelectedClearRecordFile();
    return;
  }

  try {
    const parsed = JSON.parse(raw);
    const nextCache: ClearRecordCache = {};

    for (const file of ORIGINAL_CLEAR_RECORD_FILES) {
      if (parsed?.[file] === true || typeof parsed?.[file] === "string") {
        nextCache[file] = true;
      }
    }

    clearRecordCache.value = nextCache;
    syncSelectedClearRecordFile();
  } catch (error) {
    console.error("Failed to load clear record cache.", error);
    clearRecordCache.value = {};
    syncSelectedClearRecordFile();
  }
};

const persistClearRecordCache = () => {
  try {
    localStorage.setItem(CLEAR_RECORD_KEY, JSON.stringify(clearRecordCache.value));
  } catch (error) {
    console.error("Failed to persist clear record cache.", error);
  }
};

const cacheClearRecord = (file: OriginalClearRecordFile) => {
  clearRecordCache.value = {
    ...clearRecordCache.value,
    [file]: true,
  };
  selectedClearRecordFile.value = file;
  persistClearRecordCache();
};

const resolveSystemDialog = (result: boolean) => {
  const resolver = systemDialogResolver;
  systemDialogResolver = null;
  systemDialog.value = null;
  resolver?.(result);
};

const showSystemAlert = (title: string, message: string) =>
  new Promise<void>((resolve) => {
    systemDialog.value = { kind: "alert", title, message };
    systemDialogResolver = () => resolve();
  });

const showSystemConfirm = (title: string, message: string) =>
  new Promise<boolean>((resolve) => {
    systemDialog.value = { kind: "confirm", title, message };
    systemDialogResolver = resolve;
  });

const resetRuntimeState = () => {
  gameStore.resetGame();
  overlay.value = "none";
  currentEvent.value = "nothing";
  currentSprite.value = "";
  currentExtra.value = {};
  message.value = "";
  spellBuildInput.value = "";
  shopOffers.value = [];
  shopDistance.value = null;
  battleAttackBonus.value = 0;
  battleDefenseBonus.value = 0;
  gameOver.value = false;
  gameCompleted.value = false;
  endingMessageKey.value = "game.battle.final_clear";
  resetStoryState();
  storyLoading.value = false;
  systemDialog.value = null;
  systemDialogResolver = null;
  pendingEquipmentChoice.value = null;
  pendingLevelUpResult.value = null;
  clearRecordViewerVisible.value = false;
  resetBattleFlow();
};

const loadSave = () => {
  const raw = localStorage.getItem(SAVE_KEY);
  if (!raw) {
    return false;
  }

  try {
    const parsed = JSON.parse(raw);
    gameStore.$patch(parsed);

    if (
      typeof parsed?.items?.stars === "number" &&
      gameStore.starCapacity === 0 &&
      gameStore.fuel === 0
    ) {
      gameStore.starCapacity = parsed.items.stars;
      gameStore.fuel = parsed.items.stars;
    }

    if (
      Array.isArray(parsed?.learnedSkills) &&
      parsed.learnedSkills.includes("primeval") &&
      !gameStore.playerName
    ) {
      gameStore.setPlayerName(PLAYER_NAME_IDS.LARA_FLARE);
    } else if (gameStore.playerName) {
      gameStore.setPlayerName(normalizePlayerName(gameStore.playerName));
    }

    if (
      typeof parsed?.continuousAttackHits === "number" &&
      parsed.continuousAttackHits > 1
    ) {
      gameStore.activateStarDance();
    }

    if (gameStore.battle.enemy.id) {
      if (typeof gameStore.battle.enemy.matchReward !== "number") {
        gameStore.battle.enemy.matchReward = 0;
      }
      currentEvent.value = "battle";
      currentSprite.value = gameStore.battle.enemy.spritePath;
    }

    gameStore.nextExp = gameStore.calculateNextExp();
    return true;
  } catch (error) {
    console.error("Failed to load save data.", error);
    return false;
  }
};

const createPlayerSnapshot = () => ({
  level: gameStore.level,
  maxHp: gameStore.maxHp,
  maxMp: gameStore.maxMp,
  attack: gameStore.attack,
  defense: gameStore.defense,
  totalAttack: gameStore.totalAttack,
  totalDefense: gameStore.totalDefense,
});

const resetStoryState = () => {
  storyActions.value = [];
  storyCursor.value = 0;
  storyFrame.value = null;
  storyStageAdvanced.value = false;
  storySuppressStageAdvance.value = false;
  storyVisible.value = false;
  storyMusicMode.value = "inherit";
  storyMusicTrack.value = null;
};

const advanceStageFromStory = () => {
  if (storySuppressStageAdvance.value || storyStageAdvanced.value) {
    return;
  }

  gameStore.stage += 1;
  storyStageAdvanced.value = true;
};

const playStoryWave = (soundPath: string | null) => {
  if (!soundPath) {
    return;
  }

  const filename = soundPath.replace(/^sound[\\/]/i, "");
  void soundManager.playSound(filename);
};

const applyStoryMidiAction = (track: string | null) => {
  if (track) {
    storyMusicMode.value = "track";
    storyMusicTrack.value = track;
    return;
  }

  storyMusicMode.value = "stop";
  storyMusicTrack.value = null;
};

const finishStoryWithEnd = () => {
  soundManager.playSound(SOUND.THATHATHA);
  advanceStageFromStory();
  resetStoryState();
  message.value = "";
};

const finishStoryWithFinish = async () => {
  soundManager.playSound(SOUND.THATHATHA);
  resetStoryState();
  message.value = "";
  const finishTexts = originalFinishTexts.value;

  const recordFile: OriginalClearRecordFile =
    gameStore.stage >= 10 ? "おまけ.txt" : "あとがき.txt";

  await showSystemAlert(
    finishTexts.clearDialogTitle,
    gameStore.stage >= 10
      ? finishTexts.absoluteClearMessage
      : finishTexts.clearMessage
  );

  cacheClearRecord(recordFile);
  await showSystemAlert(
    finishTexts.clearDialogTitle,
    finishTexts.getClearOutputMessage(recordFile)
  );

  if (gameStore.stage === 9 && gameStore.distance <= 1000 && !gameStore.scarred) {
    const shouldEnterAnother = await showSystemConfirm(
      finishTexts.anotherQualificationTitle,
      finishTexts.anotherQualificationMessage
    );

    if (shouldEnterAnother) {
      gameStore.stage += 1;
      currentEvent.value = "nothing";
      currentSprite.value = "";
      currentExtra.value = {};
      message.value = "";

      for (const hellMessage of finishTexts.hellMessages) {
        await showSystemAlert(finishTexts.hellTitle, hellMessage);
      }
    }
  }

  await showSystemAlert(
    String(t("game.settings.title")),
    String(t("game.system.clear_record_cached", { file: recordFile }))
  );
};

const calculateScarLoss = (maxHp: number) => Math.trunc((maxHp + 9) / 10);

const clearBattleEffectTimer = () => {
  if (battleEffectTimer === null) {
    return;
  }

  window.clearInterval(battleEffectTimer);
  battleEffectTimer = null;
};

const clearBattlePulseEffect = () => {
  clearBattleEffectTimer();
  battleEffectTicks.value = 0;
  battleAreaFlashKind.value = "none";
  battleSpriteFlashKind.value = "none";
};

const resetBattleSceneEffects = () => {
  clearBattlePulseEffect();
  battleDeathFlashVisible.value = false;
};

const advanceBattleEffectTick = () => {
  battleEffectTicks.value -= 1;

  if (battleEffectTicks.value > 0) {
    return;
  }

  clearBattlePulseEffect();
};

const clearBossBattleMarkerTimer = () => {
  if (bossBattleMarkerTimer === null) {
    return;
  }

  window.clearInterval(bossBattleMarkerTimer);
  bossBattleMarkerTimer = null;
};

const updateBossBattleMarkerOffset = () => {
  bossBattleMarkerOffset.value = {
    x: Math.floor(Math.random() * 10),
    y: Math.floor(Math.random() * 10),
  };
};

const syncBossBattleMarker = () => {
  clearBossBattleMarkerTimer();

  if (!bossBattleMarkerVisible.value) {
    bossBattleMarkerOffset.value = { x: 0, y: 0 };
    return;
  }

  updateBossBattleMarkerOffset();
  bossBattleMarkerTimer = window.setInterval(
    updateBossBattleMarkerOffset,
    BATTLE_EFFECT_TICK_MS
  );
};

const beginBattlePulseEffect = ({
  area = "none",
  sprite = "none",
  ticks = 10,
}: {
  area?: BattleAreaFlashKind;
  sprite?: BattleSpriteFlashKind;
  ticks?: number;
} = {}) => {
  battleDeathFlashVisible.value = false;
  battleAreaFlashKind.value = area;
  battleSpriteFlashKind.value = sprite;
  battleEffectTicks.value = ticks;
  clearBattleEffectTimer();
  advanceBattleEffectTick();

  if (battleEffectTicks.value <= 0) {
    return;
  }

  battleEffectTimer = window.setInterval(advanceBattleEffectTick, BATTLE_EFFECT_TICK_MS);
};

const holdBattleDeathFlash = () => {
  clearBattlePulseEffect();
  battleDeathFlashVisible.value = true;
};

const openStory = async (storyId: string, options: StoryOptions = {}) => {
  storyLoading.value = true;
  try {
    const script = await loadStoryScript(
      storyId,
      i18n.locale.value as "zh" | "ja" | "en"
    );
    resetStoryState();
    storyActions.value = script.actions;
    storySuppressStageAdvance.value = Boolean(options.suppressStageAdvance);
    advanceStory();
  } catch (error) {
    console.error(`Failed to load story script: ${storyId}`, error);
  } finally {
    storyLoading.value = false;
  }
};

const advanceStory = () => {
  while (storyCursor.value < storyActions.value.length) {
    const action = storyActions.value[storyCursor.value];
    storyCursor.value += 1;

    switch (action.type) {
      case "cg":
        continue;
      case "midi":
        applyStoryMidiAction(action.track);
        continue;
      case "wave":
        playStoryWave(action.sound);
        continue;
      case "getName":
        gameStore.setPlayerName(action.name);
        continue;
      case "notext":
        continue;
      case "incStage":
        advanceStageFromStory();
        continue;
      case "text":
        storyFrame.value = action.frame;
        storyVisible.value = true;
        return;
      case "end":
        finishStoryWithEnd();
        return;
      case "finish":
        void finishStoryWithFinish();
        return;
    }
  }

  resetStoryState();
};

const openCurrentStageStory = () =>
  openStory(`story${String(gameStore.stage).padStart(2, "0")}`);

const handleCutsceneOverlayClick = () => {
  if (gameOver.value || !storyVisible.value) {
    return;
  }

  advanceStory();
};

const resetBattleFlow = () => {
  battleState.value = BATTLE_STATE.idle;
  battlePlayerPending.value = false;
  battleEnemyPending.value = false;
  battleCommand.value = null;
  battleSpellId.value = null;
  battleStarDanceCounter.value = 0;
  pendingLevelUpResult.value = null;
  resetBattleSceneEffects();
};

const startBattle = (enemyTemplate: EnemyType) => {
  pendingEquipmentChoice.value = null;
  const translatedEnemy = {
    ...enemyTemplate,
    name: te(`enemy.${enemyTemplate.id}`)
      ? t(`enemy.${enemyTemplate.id}`)
      : enemyTemplate.name,
  };
  const enemy = instantiateEnemy(translatedEnemy, createPlayerSnapshot());
  gameStore.setBattleEnemy(enemy);
  currentEvent.value = "battle";
  currentSprite.value = enemy.spritePath;
  overlay.value = "none";
  battleAttackBonus.value = 0;
  battleDefenseBonus.value = 0;
  resetBattleFlow();
};

const clearBattleResolutionState = () => {
  battleAttackBonus.value = 0;
  battleDefenseBonus.value = 0;
  overlay.value = "none";
  pendingEquipmentChoice.value = null;
  resetBattleFlow();
  gameStore.clearStarDance();
};

const finalizeBattleEscape = () => {
  const enemy = { ...gameStore.battle.enemy };
  clearBattleResolutionState();
  currentEvent.value = "nothing";
  currentSprite.value = "";
  gameStore.clearBattleEnemy();
  soundManager.playSound(SOUND.TURN);
  message.value = t("game.battle.escape_success", { enemy: enemy.name });
};

const finalizeBattleWin = () => {
  const enemy = { ...gameStore.battle.enemy };
  clearBattleResolutionState();
  currentEvent.value = "nothing";
  currentSprite.value = "";
  gameStore.clearBattleEnemy();

  if (enemy.isBoss) {
    void openCurrentStageStory();
  }
};

const finalizeBattleLose = () => {
  soundManager.stopAll();
  clearBattleResolutionState();
  gameOver.value = true;
  currentSprite.value = "";
  gameStore.clearBattleEnemy();
  message.value = t("game.battle.game_over");
};

const equipPendingEquipment = () => {
  const equipment = pendingEquipmentChoice.value;
  if (!equipment || !isInBattle.value) {
    return;
  }

  if (equipment.kind === "weapon") {
    gameStore.setWeapon({
      id: equipment.id,
      name: equipment.name,
      attack: equipment.power,
    });
  } else {
    gameStore.setArmor({
      id: equipment.id,
      name: equipment.name,
      defense: equipment.power,
    });
  }

  soundManager.playSound(SOUND.EAT);
  message.value = t("game.battle.equipment_equipped", {
    name: equipment.name,
  });
  pendingEquipmentChoice.value = null;
  battleState.value = BATTLE_STATE.matchReward;
};

const declinePendingEquipment = () => {
  if (!pendingEquipmentChoice.value || !isInBattle.value) {
    return;
  }

  pendingEquipmentChoice.value = null;
  battleState.value = BATTLE_STATE.matchReward;
  advanceBattleState();
};

const rollTwenty = () => Math.floor(Math.random() * 20) === 0;

const beginBattleLevelUp = () => {
  const requiredExp = gameStore.level * 5;
  if (gameStore.exp < requiredExp) {
    return false;
  }

  gameStore.exp -= requiredExp;
  gameStore.level += 1;
  gameStore.nextExp = gameStore.calculateNextExp();

  const x = Math.floor(Math.random() * 6) + 1;
  const hpIncrease = Math.floor(gameStore.potential / 5) + x;
  gameStore.maxHp += hpIncrease;
  gameStore.potential += 6 - x;

  let mpIncreased = false;
  if (gameStore.maxMp > 0 && gameStore.potential >= 5 && rollTwenty()) {
    gameStore.potential -= 5;
    gameStore.maxMp += 1;
    mpIncreased = true;
  }

  let attackIncreased = false;
  if (gameStore.potential >= 5 && rollTwenty()) {
    gameStore.potential -= 5;
    gameStore.attack += 1;
    attackIncreased = true;
  }

  let defenseIncreased = false;
  if (gameStore.potential >= 5 && rollTwenty()) {
    gameStore.potential -= 5;
    gameStore.defense += 1;
    defenseIncreased = true;
  }

  pendingLevelUpResult.value = {
    hpIncrease,
    mpIncreased,
    attackIncreased,
    defenseIncreased,
  };

  return true;
};

const isMagicImmune = () =>
  isPlayerName(gameStore.playerName, PLAYER_NAME_IDS.LARA_FLARE);

const performEnemyMagic = (): { line: string; defeated: boolean } => {
  const enemy = gameStore.battle.enemy;
  const enemyMagic = enemy.magic;

  if (!enemyMagic) {
    return performEnemyAttack();
  }

  const magicId = gameStore.stage >= 10 ? "cremate" : "freeze";
  const magicName = t(`game.magicNames.${magicId}`);
  const damage = calculateMagicDamage(enemy.mp, gameStore.mp + gameStore.virtualMp);
  enemy.mp = Math.max(0, enemy.mp - 1);
  beginBattlePulseEffect({
    area: magicId === "freeze" ? "ice" : "fire",
  });

  if (isMagicImmune() || damage <= 0) {
    soundManager.playSound(SOUND.KIN);
    return {
      line: t("game.battle.enemy_magic_blocked", {
        enemy: enemy.name,
        magic: magicName,
      }),
      defeated: false,
    };
  }

  soundManager.playSound(SOUND.DUTY);
  gameStore.hp = Math.max(0, gameStore.hp - damage);

  return {
    line: t("game.battle.enemy_magic_hit", {
      enemy: enemy.name,
      magic: magicName,
      damage,
    }),
    defeated: gameStore.hp <= 0,
  };
};

const performEnemyTurn = () => {
  const enemy = gameStore.battle.enemy;
  const useMagic = Boolean(enemy.magic) && enemy.mp > 0 && Math.random() < 0.5;

  return useMagic ? performEnemyMagic() : performEnemyAttack();
};

const performEnemyAttack = (): { line: string; defeated: boolean } => {
  const enemy = gameStore.battle.enemy;
  const defense = gameStore.totalDefense + battleDefenseBonus.value;
  const damage = calculatePhysicalDamage(enemy.attack, defense);

  if (damage <= 0) {
    soundManager.playSound(SOUND.KIN);
    return {
      line: t("game.battle.attack_deflected", { enemy: enemy.name }),
      defeated: false,
    };
  }

  soundManager.playSound(SOUND.ZURL);
  beginBattlePulseEffect({ area: "white" });
  gameStore.hp = Math.max(0, gameStore.hp - damage);

  if (gameStore.hp <= 0) {
    return {
      line: t("game.battle.damage_taken", { enemy: enemy.name, damage }),
      defeated: true,
    };
  }

  return {
    line: t("game.battle.damage_taken", { enemy: enemy.name, damage }),
    defeated: false,
  };
};

const decayBattleResources = () => {
  gameStore.decayVirtualMp();
  battleAttackBonus.value = Math.max(0, battleAttackBonus.value - 1);
  battleDefenseBonus.value = Math.max(0, battleDefenseBonus.value - 1);
};

const playSpellSound = (spellId: string) => {
  const spell = SPELLS.find((entry) => entry.id === spellId);
  if (!spell) {
    return;
  }

  const spellSound = SPELL_SOUNDS[SPELLS.indexOf(spell)];
  if (spellSound) {
    soundManager.playSound(spellSound);
  }
};

const applySpellEffect = (
  spellId: string,
  currentTotalMp: number
): {
  line: string;
  enemyDefeated: boolean;
  battleEffect: BattleSpriteFlashKind | "none";
} => {
  const spell = SPELLS.find((entry) => entry.id === spellId);
  if (!spell) {
    return {
      line: "",
      enemyDefeated: false,
      battleEffect: "none",
    };
  }

  if (spell.power !== undefined) {
    const power = spell.id === "become_charcoal_max" ? currentTotalMp : spell.power;
    const damage = Math.max(0, power - gameStore.battle.enemy.mp);
    gameStore.battle.enemy.hp = Math.max(0, gameStore.battle.enemy.hp - damage);
    soundManager.playSound(damage > 0 ? SOUND.FIRE : SOUND.KIN);

    return {
      line:
        damage > 0
          ? t("game.magic.damage_dealt", {
              name: t(`spell.${spell.id}`),
              damage,
            })
          : t("game.magic.no_effect", { name: t(`spell.${spell.id}`) }),
      enemyDefeated: gameStore.battle.enemy.hp <= 0,
      battleEffect: damage > 0 ? "strong" : "none",
    };
  }

  let line = "";

  switch (spell.id) {
    case "warmth_of_others":
      gameStore.hp = gameStore.maxHp;
      soundManager.playSound(SOUND.UP);
      line = t("game.magic.hp_restored");
      break;
    case "light":
      gameStore.addVirtualMp(5);
      soundManager.playSound(SOUND.HYUUN);
      line = t("game.magic.virtual_mp_added", { value: gameStore.virtualMp });
      break;
    case "sun_in_palm":
      gameStore.multiplyVirtualMp(2);
      line = t("game.magic.virtual_mp_multiplied", { value: gameStore.virtualMp });
      break;
    case "spring_dream": {
      const weapon = createSpecialEquipment(
        "weapon",
        t("equipment.spring_dream"),
        "spring_dream",
        gameStore.level
      );
      gameStore.setWeapon({
        id: weapon.id,
        name: weapon.name,
        attack: weapon.power,
        virtualAttack: weapon.virtualBonus,
      });
      soundManager.playSound(SOUND.UP);
      line = t("game.magic.weapon_generated", { power: weapon.power });
      break;
    }
    case "summer_sky": {
      const armor = createSpecialEquipment(
        "armor",
        t("equipment.summer_sky"),
        "summer_sky",
        gameStore.level
      );
      gameStore.setArmor({
        id: armor.id,
        name: armor.name,
        defense: armor.power,
        virtualDefense: armor.virtualBonus,
      });
      soundManager.playSound(SOUND.UP);
      line = t("game.magic.armor_generated", { power: armor.power });
      break;
    }
    case "warmer_than_spring_and_summer":
      gameStore.activateStarDance();
      soundManager.playSound(SOUND.DAMAGE);
      line = t("game.magic.star_dance_ready");
      break;
    default:
      line = t("game.magic.no_effect", { name: t(`spell.${spell.id}`) });
      break;
  }

  return {
    line,
    enemyDefeated: gameStore.battle.enemy.hp <= 0,
    battleEffect: "none",
  };
};

const executePlayerBattleAction = () => {
  if (battleCommand.value === "magic") {
    const spellId = battleSpellId.value;
    const spell = SPELLS.find((entry) => entry.id === spellId);

    if (!spell) {
      battlePlayerPending.value = false;
      battleState.value = BATTLE_STATE.judge;
      return;
    }

    if (!gameStore.canSpendMp(spell.mpCost, spell.isVirtualMp)) {
      message.value = t("game.magic.not_enough_mp");
      battlePlayerPending.value = false;
      battleState.value = BATTLE_STATE.judge;
      return;
    }

    const currentTotalMp = gameStore.mp + gameStore.virtualMp;
    gameStore.spendMp(spell.mpCost, spell.isVirtualMp);
    const result = applySpellEffect(spell.id, currentTotalMp);
    if (result.battleEffect !== "none") {
      beginBattlePulseEffect({ sprite: result.battleEffect });
    }
    message.value = result.line;
    battlePlayerPending.value = false;
    battleState.value = BATTLE_STATE.judge;
    return;
  }

  const enemy = gameStore.battle.enemy;
  const damage = calculatePhysicalDamage(
    gameStore.totalAttack + battleAttackBonus.value,
    enemy.defense
  );

  enemy.hp = Math.max(0, enemy.hp - damage);
  soundManager.playSound(damage > 0 ? SOUND.DUN : SOUND.KIN);
  if (damage > 0) {
    beginBattlePulseEffect({ sprite: "hit" });
  }
  message.value =
    damage > 0
      ? t("game.battle.damage_dealt", { enemy: enemy.name, damage })
      : t("game.battle.player_missed", { enemy: enemy.name });

  if (gameStore.starDanceActive && gameStore.fuel > 0 && enemy.hp > 0) {
    battleStarDanceCounter.value = 0;
    battleState.value = BATTLE_STATE.starDance;
    return;
  }

  battlePlayerPending.value = false;
  battleState.value = BATTLE_STATE.judge;
};

const executeStarDanceStep = () => {
  if (
    !gameStore.starDanceActive ||
    gameStore.fuel <= 0 ||
    battleStarDanceCounter.value >= gameStore.fuel ||
    gameStore.battle.enemy.hp <= 0
  ) {
    battlePlayerPending.value = false;
    battleState.value = BATTLE_STATE.judge;
    return;
  }

  const enemy = gameStore.battle.enemy;
  const damage = calculatePhysicalDamage(
    gameStore.totalAttack + battleAttackBonus.value,
    enemy.defense
  );

  enemy.hp = Math.max(0, enemy.hp - damage);
  battleStarDanceCounter.value += 1;
  soundManager.playSound(damage > 0 ? SOUND.DUN : SOUND.KIN);
  if (damage > 0) {
    beginBattlePulseEffect({ sprite: "hit" });
  }
  message.value =
    damage > 0
      ? t("game.battle.damage_dealt", { enemy: enemy.name, damage })
      : t("game.battle.player_missed", { enemy: enemy.name });

  if (battleStarDanceCounter.value >= gameStore.fuel || enemy.hp <= 0) {
    battlePlayerPending.value = false;
    battleState.value = BATTLE_STATE.judge;
    return;
  }

  battleState.value = BATTLE_STATE.starDance;
};

const executeEnemyBattleAction = () => {
  const result = performEnemyTurn();
  message.value = result.line;
  battleEnemyPending.value = false;
  battleState.value = BATTLE_STATE.judge;
};

const advanceBattleState = () => {
  if (!isInBattle.value) {
    return;
  }

  overlay.value = "none";

  while (isInBattle.value) {
    switch (battleState.value) {
      case BATTLE_STATE.idle:
        return;
      case BATTLE_STATE.judge:
        if (gameStore.hp <= 0) {
          soundManager.playSound(SOUND.WEAK);
          holdBattleDeathFlash();
          message.value = t("game.battle.death_notice");
          battleState.value = "lose_finalize";
          return;
        }

        if (gameStore.battle.enemy.hp <= 0) {
          soundManager.playSound(SOUND.BREAK);
          message.value = t("game.battle.enemy_defeated", {
            enemy: gameStore.battle.enemy.name,
          });
          battleState.value = BATTLE_STATE.winExp;
          return;
        }

        if (battlePlayerPending.value && battleEnemyPending.value) {
          battleState.value =
            Math.random() < 0.5
              ? BATTLE_STATE.playerAction
              : BATTLE_STATE.enemyAction;
          continue;
        }

        if (battlePlayerPending.value) {
          battleState.value = BATTLE_STATE.playerAction;
          continue;
        }

        if (battleEnemyPending.value) {
          battleState.value = BATTLE_STATE.enemyAction;
          continue;
        }

        decayBattleResources();
        battleState.value = BATTLE_STATE.idle;
        return;
      case BATTLE_STATE.playerAction:
        executePlayerBattleAction();
        return;
      case BATTLE_STATE.enemyAction:
        executeEnemyBattleAction();
        return;
      case BATTLE_STATE.starDance:
        executeStarDanceStep();
        return;
      case BATTLE_STATE.secretIntro:
        soundManager.playSound(SOUND.ROAR);
        message.value = t("game.battle.secret_phrase");
        battleState.value = BATTLE_STATE.secretHit;
        return;
      case BATTLE_STATE.secretHit: {
        const damage = gameStore.maxHp;
        gameStore.battle.enemy.hp = Math.max(0, gameStore.battle.enemy.hp - damage);
        soundManager.playSound(SOUND.DUN);
        beginBattlePulseEffect({ sprite: "hit" });
        message.value = t("game.battle.secret_damage", {
          enemy: gameStore.battle.enemy.name,
          damage,
        });
        battleState.value = BATTLE_STATE.secretRecoil;
        return;
      }
      case BATTLE_STATE.secretRecoil: {
        const maxHpLoss = calculateScarLoss(gameStore.maxHp);
        soundManager.playSound(SOUND.DUTY);
        gameStore.loseMaxHp(maxHpLoss);
        gameStore.markScarred();
        message.value = t("game.battle.secret_recoil", { value: maxHpLoss });
        battlePlayerPending.value = false;
        battleState.value = BATTLE_STATE.judge;
        return;
      }
      case BATTLE_STATE.escapeFailed:
        message.value = t("game.battle.escape_failed");
        battlePlayerPending.value = false;
        battleEnemyPending.value = true;
        battleState.value = BATTLE_STATE.judge;
        return;
      case BATTLE_STATE.winExp:
        if (gameStore.battle.enemy.exp > 0) {
          gameStore.exp += gameStore.battle.enemy.exp;
        }
        message.value = t("game.battle.exp_gain", {
          exp: gameStore.battle.enemy.exp,
        });
        battleState.value = BATTLE_STATE.levelCheck;
        return;
      case BATTLE_STATE.levelCheck:
        if (!beginBattleLevelUp()) {
          battleState.value = BATTLE_STATE.equipPrompt;
          continue;
        }

        soundManager.playSound(SOUND.OPEN);
        message.value = t("game.battle.level_up");
        battleState.value = BATTLE_STATE.levelHp;
        return;
      case BATTLE_STATE.levelHp:
        if (!pendingLevelUpResult.value) {
          battleState.value = BATTLE_STATE.levelCheck;
          continue;
        }

        message.value = t("game.battle.max_hp_up", {
          value: pendingLevelUpResult.value.hpIncrease,
        });
        battleState.value = BATTLE_STATE.levelMp;
        return;
      case BATTLE_STATE.levelMp:
        if (!pendingLevelUpResult.value?.mpIncreased) {
          battleState.value = BATTLE_STATE.levelAttack;
          continue;
        }

        message.value = t("game.battle.max_mp_up");
        battleState.value = BATTLE_STATE.levelAttack;
        return;
      case BATTLE_STATE.levelAttack:
        if (!pendingLevelUpResult.value?.attackIncreased) {
          battleState.value = BATTLE_STATE.levelDefense;
          continue;
        }

        message.value = t("game.battle.attack_up");
        battleState.value = BATTLE_STATE.levelDefense;
        return;
      case BATTLE_STATE.levelDefense:
        if (!pendingLevelUpResult.value?.defenseIncreased) {
          battleState.value = BATTLE_STATE.levelLoop;
          continue;
        }

        message.value = t("game.battle.defense_up");
        battleState.value = BATTLE_STATE.levelLoop;
        return;
      case BATTLE_STATE.levelLoop:
        pendingLevelUpResult.value = null;
        battleState.value = BATTLE_STATE.levelCheck;
        continue;
      case BATTLE_STATE.equipPrompt:
        if (!gameStore.battle.enemy.rewardEquipment) {
          battleState.value = BATTLE_STATE.matchReward;
          continue;
        }

        pendingEquipmentChoice.value = { ...gameStore.battle.enemy.rewardEquipment };
        message.value = t("game.battle.equipment_prompt", {
          name: gameStore.battle.enemy.rewardEquipment.name,
        });
        return;
      case BATTLE_STATE.matchReward:
        const matchReward = gameStore.battle.enemy.matchReward ?? 0;
        if (matchReward <= 0) {
          battleState.value = BATTLE_STATE.winFinalize;
          continue;
        }

        soundManager.playSound(SOUND.POPON);
        gameStore.items.matches += matchReward;
        message.value = t("game.battle.match_reward", {
          value: matchReward,
        });
        battleState.value = BATTLE_STATE.winFinalize;
        return;
      case BATTLE_STATE.winFinalize:
        finalizeBattleWin();
        return;
      case "lose_finalize":
        finalizeBattleLose();
        return;
      default:
        battleState.value = BATTLE_STATE.idle;
        return;
    }
  }
};

const beginBattleCommand = (command: Exclude<BattleCommand, null>, spellId?: string) => {
  if (!isInBattle.value || battleStepVisible.value) {
    return;
  }

  overlay.value = "none";
  battleCommand.value = command;
  battleSpellId.value = spellId ?? null;
  battlePlayerPending.value = true;
  battleEnemyPending.value = true;
  battleStarDanceCounter.value = 0;
  battleState.value = BATTLE_STATE.judge;
  advanceBattleState();
};

const battleStep = () => {
  if (!battleStepVisible.value) {
    return;
  }

  advanceBattleState();
};

const attackEnemy = () => {
  beginBattleCommand("attack");
};

const useDrive = () => {
  const currentPower = gameStore.weapon.attack ?? 0;
  if (!gameStore.weapon.id || currentPower <= 0) {
    return;
  }

  const weaponName = gameStore.weapon.name ?? t("game.shop.weapon");
  const gain = gameStore.learnedSkills.includes("overdrive")
    ? gameStore.attack
    : Math.floor(Math.random() * 3) + 3;

  battleAttackBonus.value += gain;
  gameStore.weapon.attack = Math.max(0, currentPower - 1);
  soundManager.playSound(SOUND.HYUUN);

  if ((gameStore.weapon.attack ?? 0) <= 0) {
    gameStore.clearWeapon();
    battleAttackBonus.value = 0;
    message.value = [
      t("game.battle.drive_ready", { name: weaponName }),
      t("game.battle.drive_broken", { name: weaponName }),
    ].join("\n");
    return;
  }

  message.value = t("game.battle.drive_ready", { name: weaponName });
};

const useFlip = () => {
  const currentPower = gameStore.armor.defense ?? 0;
  if (!gameStore.armor.id || currentPower <= 0) {
    return;
  }

  const armorName = gameStore.armor.name ?? t("game.shop.armor");
  const gain = gameStore.learnedSkills.includes("flip_flop")
    ? gameStore.defense
    : Math.floor(Math.random() * 3) + 3;

  battleDefenseBonus.value += gain;
  gameStore.armor.defense = Math.max(0, currentPower - 1);
  soundManager.playSound(SOUND.HYUUN);

  if ((gameStore.armor.defense ?? 0) <= 0) {
    gameStore.clearArmor();
    battleDefenseBonus.value = 0;
    message.value = [
      t("game.battle.flip_ready", { name: armorName }),
      t("game.battle.flip_broken", { name: armorName }),
    ].join("\n");
    return;
  }

  message.value = t("game.battle.flip_ready", { name: armorName });
};

const useSecret = () => {
  if (!isInBattle.value || battleStepVisible.value) {
    return;
  }

  if (gameStore.battle.enemy.isBoss) {
    soundManager.playSound(SOUND.BUBBLE);
    message.value = t("game.battle.secret_boss_blocked");
    return;
  }

  overlay.value = "none";
  battleCommand.value = null;
  battleSpellId.value = null;
  battlePlayerPending.value = true;
  battleEnemyPending.value = true;
  battleStarDanceCounter.value = 0;
  battleState.value = BATTLE_STATE.secretIntro;
  advanceBattleState();
};

const attemptEscape = () => {
  if (!isInBattle.value || battleStepVisible.value) {
    return;
  }

  if (Math.random() < 0.8) {
    finalizeBattleEscape();
    return;
  }

  overlay.value = "none";
  battleCommand.value = null;
  battleSpellId.value = null;
  battlePlayerPending.value = false;
  battleEnemyPending.value = true;
  battleStarDanceCounter.value = 0;
  battleState.value = BATTLE_STATE.escapeFailed;
  advanceBattleState();
};

const handleUseMatch = () => {
  if (gameStore.items.matches <= 0) {
    message.value = t("game.items.no_matches");
    soundManager.playSound(SOUND.BUBBLE);
    return;
  }

  if (gameStore.hp >= gameStore.maxHp) {
    message.value = t("game.items.match_wasted");
    soundManager.playSound(SOUND.BUBBLE);
    return;
  }

  const healed = gameStore.useMatch();
  if (healed <= 0) {
    message.value = t("game.items.match_wasted");
    soundManager.playSound(SOUND.BUBBLE);
    return;
  }

  currentSprite.value = "sprite/chas1.png";
  message.value = t("game.items.match_healed", { value: healed });
  soundManager.playSound(SOUND.SUKA);
};

const handleUseStar = () => {
  if (gameStore.fuel <= 0) {
    message.value = t("game.items.no_lighter");
    soundManager.playSound(SOUND.BUBBLE);
    return;
  }

  if (gameStore.hp >= gameStore.maxHp && gameStore.mp >= gameStore.maxMp) {
    message.value = t("game.items.lighter_wasted");
    soundManager.playSound(SOUND.BUBBLE);
    return;
  }

  if (!gameStore.useLighter()) {
    message.value = t("game.items.no_lighter");
    soundManager.playSound(SOUND.BUBBLE);
    return;
  }

  currentSprite.value = "sprite/lighter.png";
  message.value = t("game.items.star_restored");
  soundManager.playSound(SOUND.FIRE);
};

const handleForward = () => {
  if (
    gameOver.value ||
    gameCompleted.value ||
    storyLoading.value ||
    storyVisible.value ||
    systemDialogVisible.value
  ) {
    return;
  }

  gameStore.clearVirtualMp();
  overlay.value = "none";

  const nextDistance = gameStore.distance + 1;
  if (nextDistance === 1001 && gameStore.stage < 10) {
    gameStore.distance = nextDistance;
    currentEvent.value = "nothing";
    currentSprite.value = "";
    currentExtra.value = {};
    void openStory("story_close", { suppressStageAdvance: true });
    return;
  }

  const event = forwardService.handleForward();
  currentEvent.value = event.type as FieldEvent;
  currentSprite.value = event.sprite ?? "";
  currentExtra.value = event.extra ?? {};
  message.value = event.message ?? "";

  if (event.type === "matches" && event.extra?.getNum) {
    gameStore.items.matches += event.extra.getNum;
  }

  if (event.type === "battle" && event.enemy) {
    startBattle(event.enemy);
  }
};

const handleInn = () => {
  const cost = currentExtra.value.cost ?? 0;
  if (gameStore.items.matches < cost) {
    soundManager.playSound(SOUND.BUBBLE);
    message.value = t("game.items.not_enough_matches");
    return;
  }

  gameStore.items.matches -= cost;
  gameStore.restoreAll();
  soundManager.playSound(SOUND.UP);
  message.value = currentExtra.value.afterMessage ?? t("events.inn.after");
};

const handleInnSecret = () => {
  const maxHpLoss = calculateScarLoss(gameStore.maxHp);
  const afterMessage = [
    t("game.events.inn_free"),
    t("game.battle.secret_lost_hp", { value: maxHpLoss }),
  ].join("\n");

  gameStore.restoreAll();
  gameStore.loseMaxHp(maxHpLoss);
  gameStore.markScarred();
  currentExtra.value = {
    ...currentExtra.value,
    afterMessage,
  };
  soundManager.playSound(SOUND.TURN);
  window.setTimeout(() => {
    soundManager.playSound(SOUND.DUTY);
  }, 180);
  message.value = afterMessage;
};

const handleSave = () => {
  const cost = currentExtra.value.cost ?? 0;
  if (gameStore.items.matches < cost) {
    soundManager.playSound(SOUND.BUBBLE);
    message.value = t("game.items.not_enough_matches");
    return;
  }

  gameStore.items.matches -= cost;
  currentSprite.value = currentExtra.value.afterSprite ?? currentSprite.value;
  localStorage.setItem(SAVE_KEY, JSON.stringify(gameStore.$state));
  syncStoredSaveAvailability();
  soundManager.playSound(SOUND.POPON);
  message.value = t("game.system.saved");
};

const openMagicOverlay = () => {
  soundManager.playSound(SOUND.POPON);
  overlay.value = "magic";
};

const closeMagicOverlay = () => {
  soundManager.playSound(SOUND.THATHATHA);
  overlay.value = "none";
};

const openSettingsOverlay = () => {
  soundManager.playSound(SOUND.POPON);
  overlay.value = "settings";
};

const closeSettingsOverlay = () => {
  soundManager.playSound(SOUND.THATHATHA);
  clearRecordViewerVisible.value = false;
  overlay.value = "none";
};

const openClearRecordViewer = () => {
  if (!clearRecordAvailable.value) {
    return;
  }

  syncSelectedClearRecordFile();
  soundManager.playSound(SOUND.POPON);
  clearRecordViewerVisible.value = true;
};

const closeClearRecordViewer = () => {
  soundManager.playSound(SOUND.THATHATHA);
  clearRecordViewerVisible.value = false;
};

const selectClearRecordFile = (file: OriginalClearRecordFile) => {
  if (!availableClearRecordFiles.value.includes(file)) {
    return;
  }

  selectedClearRecordFile.value = file;
};

const setGameLocale = (localeCode: "zh" | "ja" | "en") => {
  settingsStore.setLocalePreference(localeCode);
  i18n.locale.value = settingsStore.effectiveLocale;
};

const toggleScreenRotation = () => {
  settingsStore.toggleRotateScreen();
};

const openShop = () => {
  if (shopDistance.value !== gameStore.distance) {
    shopOffers.value = createShopOffers(
      gameStore.stage,
      gameStore.items.books,
      gameStore.starCapacity
    );
    shopDistance.value = gameStore.distance;
  }
  overlay.value = "shop";
};

const getShopOfferName = (offer: ShopOffer) => {
  if (offer.kind === "weapon" || offer.kind === "armor") {
    return offer.equipmentId ? t(`equipment.${offer.equipmentId}`) : "";
  }

  if (offer.kind === "book") {
    return t("game.shop.book");
  }

  if (offer.kind === "star") {
    return t("game.shop.star");
  }

  return "";
};

const formatShopMatchCost = (cost: number) =>
  String(t("game.shop.match_cost", { count: cost }));

const getShopOfferLabel = (offer: ShopOffer) => {
  if (offer.state === "sold_out") {
    return t("game.shop.sold_out");
  }

  if (offer.state === "already_read") {
    return t("game.shop.already_read");
  }

  const name = getShopOfferName(offer);

  if (offer.kind === "weapon" || offer.kind === "armor") {
    const power = offer.power ?? 0;
    return isEnglishLocale.value
      ? `${name} (${power}): ${formatShopMatchCost(offer.cost)}`
      : `${name}（${power}）：${formatShopMatchCost(offer.cost)}`;
  }

  return isEnglishLocale.value
    ? `${name}: ${formatShopMatchCost(offer.cost)}`
    : `${name}：${formatShopMatchCost(offer.cost)}`;
};

const purchaseShopOffer = (offer: ShopOffer) => {
  if (offer.state !== "available") {
    return;
  }

  if (gameStore.items.matches < offer.cost) {
    soundManager.playSound(SOUND.BUBBLE);
    return;
  }

  gameStore.items.matches -= offer.cost;
  offer.state = "sold_out";
  soundManager.playSound(SOUND.EAT);

  if (offer.kind === "weapon" && offer.equipmentId) {
    const name = t(`equipment.${offer.equipmentId}`);
    gameStore.setWeapon({
      id: offer.equipmentId,
      name,
      attack: offer.power ?? 0,
    });
    return;
  }

  if (offer.kind === "armor" && offer.equipmentId) {
    const name = t(`equipment.${offer.equipmentId}`);
    gameStore.setArmor({
      id: offer.equipmentId,
      name,
      defense: offer.power ?? 0,
    });
    return;
  }

  if (offer.kind === "book") {
    gameStore.items.books = true;
    return;
  }

  if (offer.kind !== "star") {
    return;
  }

  gameStore.buyStarMark();
};

const handleControlAction = (payload: {
  action: "spell_build" | "primeval";
  cost: number;
}) => {
  if (payload.action === "primeval") {
    gameStore.consumeMaxHp(payload.cost);
    gameStore.setPlayerName(PLAYER_NAME_IDS.LARA_FLARE);
    return;
  }

  if (payload.action !== "spell_build") {
    return;
  }

  spellBuildInput.value = "";
  gameStore.consumeMaxHp(payload.cost);
  gameStore.setSpellBuildRemaining(3);
  overlay.value = "spellBuild";
};

const closeSpellBuilder = () => {
  spellBuildInput.value = "";
  gameStore.setSpellBuildRemaining(0);
  overlay.value = "none";
};

const restartGame = () => {
  resetRuntimeState();
};

const restartFromSettings = () => {
  closeSettingsOverlay();
  resetRuntimeState();
};

const restoreSavedGame = () => {
  if (!storedSaveAvailable.value) {
    return;
  }

  closeSettingsOverlay();
  resetRuntimeState();
  loadSave();
};

const resolveSpellCandidates = (rawInput: string) => {
  const input = rawInput.trim();
  if (!input) {
    return [];
  }

  return SPELLS.filter((spell) => {
    const localizedName = getSpellLocalizedName(spell);
    return input === spell.name || input === localizedName;
  });
};

const buildSpell = () => {
  if (spellBuildClosed.value) {
    closeSpellBuilder();
    return;
  }

  gameStore.consumeSpellBuildAttempt();
  const spell = resolveSpellCandidates(spellBuildInput.value).find(
    (entry) =>
      !gameStore.learnedSpells.includes(entry.id) &&
      gameStore.canSpendMp(entry.mpCost, entry.isVirtualMp)
  );
  spellBuildInput.value = "";

  if (!spell) {
    soundManager.playSound(SOUND.BUBBLE);
    return;
  }

  gameStore.learnSpell(spell.id);
  playSpellSound(spell.id);
};

const castSpell = (spellId: string) => {
  const spell = SPELLS.find((entry) => entry.id === spellId);
  if (!spell) {
    return;
  }

  if (!canCastSpell(spell)) {
    return;
  }

  if (isInBattle.value) {
    beginBattleCommand("magic", spell.id);
    return;
  }

  const currentTotalMp = gameStore.mp + gameStore.virtualMp;
  gameStore.spendMp(spell.mpCost, spell.isVirtualMp);
  message.value = applySpellEffect(spell.id, currentTotalMp).line;
};

watch(bossBattleMarkerVisible, syncBossBattleMarker, { immediate: true });
watch(
  [overlay, spellBuildInputVisible],
  async ([currentOverlay, inputVisible]) => {
    if (currentOverlay !== "spellBuild" || !inputVisible) {
      return;
    }

    await nextTick();
    spellBuildInputEl.value?.focus();
  },
  { immediate: true }
);

onUnmounted(() => {
  resetBattleSceneEffects();
  clearBossBattleMarkerTimer();
});

syncStoredSaveAvailability();
loadClearRecordCache();
loadSave();
</script>

<style lang="scss" scoped>
body {
  background: #fff;
}

.game-view {
  position: relative;
  display: flex;
  width: 100%;
  height: 100%;
  padding: 40px 25px 50px;
  background: #000;
  font-size: 12px;
  image-rendering: pixelated;
  gap: 25px;

  .scene-area {
    width: 300px;
    position: relative;
    flex-shrink: 0;

    .scene-canvas {
      position: relative;
      width: 100%;
      height: 300px;
      overflow: hidden;
      background: #000;
      image-rendering: pixelated;
    }

    .scene-base,
    .sub-event {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
    }

    .scene-base {
      z-index: 0;
    }

    .sub-event {
      z-index: 1;
    }

    .battle-sprite-flash {
      z-index: 4;
      pointer-events: none;
      opacity: 0.88;
    }

    .battle-sprite-flash-hit {
      filter: sepia(1) saturate(8) hue-rotate(-18deg) brightness(1.2) contrast(1.2);
      mix-blend-mode: screen;
    }

    .battle-sprite-flash-strong {
      filter: sepia(1) saturate(10) hue-rotate(-14deg) brightness(1.45) contrast(1.3);
      mix-blend-mode: screen;
      opacity: 0.96;
    }

    .battle-scene-flash {
      position: absolute;
      inset: 0;
      z-index: 5;
      pointer-events: none;
      opacity: 0.78;
      mix-blend-mode: screen;
    }

    .battle-scene-flash-white {
      background: #fff;
    }

    .battle-scene-flash-ice {
      background: #8080ff;
    }

    .battle-scene-flash-fire {
      background: #ff0000;
    }

    .battle-scene-flash-solid {
      opacity: 1;
    }

    .boss-battle-marker {
      position: absolute;
      z-index: 5;
      color: #ffffff;
      font-size: 28px;
      font-weight: 700;
      line-height: 1;
      letter-spacing: 1px;
      text-shadow:
        1px 1px 0 #000,
        -1px 1px 0 #000,
        1px -1px 0 #000,
        -1px -1px 0 #000;
      pointer-events: none;
      background-color: rgba(0, 0, 0, 0.6);
      padding: 4px 8px;
    }

    :deep(.snow-canvas) {
      z-index: 2;
    }

    .shop-panel {
      position: absolute;
      top: 25px;
      left: 25px;
      width: 250px;
      height: 250px;
      background: #ccccff;
      z-index: 10;

      .shop-title-image {
        position: absolute;
        top: 20px;
        left: 25px;
        width: 200px;
        height: 30px;
        image-rendering: pixelated;
      }

      .shop-button,
      .shop-exit-button {
        position: absolute;
        text-align: center;
      }

      .shop-button {
        left: 30px;
        width: 190px;
        height: 21px;
      }

      .shop-button-0 {
        top: 80px;
      }

      .shop-button-1 {
        top: 110px;
      }

      .shop-button-2 {
        top: 140px;
      }

      .shop-button-3 {
        top: 170px;
      }

      .shop-matches {
        position: absolute;
        left: 10px;
        top: 230px;
        color: #000077;
        font-size: 14px;
        font-weight: 700;
        line-height: 1;
        white-space: nowrap;
      }

      .shop-exit-button {
        left: 198px;
        top: 223px;
        width: 50px;
        height: 25px;
      }
    }
  }

  .status-area {
    width: 100%;
    position: relative;

    .character {
      position: absolute;
      top: 0;
      left: 0;
      width: 150px;

      img {
        width: 100%;
        height: auto;
      }
    }

    .settings-open-button {
      position: absolute;
      top: 0;
      left: 173px;
      z-index: 20;
      width: 50px;
      min-width: 50px;
      height: 25px;
    }

    .buttons {
      position: absolute;
      right: 0;
      display: flex;
      flex-direction: row;
      gap: 2px;

      &.buttons-1 {
        bottom: 110px;
      }

      &.buttons-2 {
        bottom: 60px;
      }

      &.buttons-3 {
        bottom: 0;
      }
    }

    .field-button-slot {
      position: absolute;
      display: flex;
      justify-content: flex-end;

      button {
        width: 50px;
        min-width: 50px;
        height: 25px;
      }

      &.field-button-slot-right-top {
        bottom: 110px;
        right: 0;
      }

      &.field-button-slot-right-mid {
        bottom: 85px;
        right: 0;
      }

      &.field-button-slot-right-bottom {
        bottom: 60px;
        right: 0;
      }

      &.field-button-slot-left-top {
        bottom: 110px;
        right: 50px;
      }

      &.field-button-slot-left-mid {
        bottom: 85px;
        right: 50px;
      }

      &.field-button-slot-wide-top {
        bottom: 25px;
        right: 0;

        button {
          width: 75px;
          min-width: 75px;
        }
      }

      &.field-button-slot-wide-bottom {
        bottom: 0;
        right: 0;

        button {
          width: 75px;
          min-width: 75px;
        }
      }
    }

    .battle-button-slot {
      position: absolute;
      display: flex;
      justify-content: flex-end;

      button {
        width: 50px;
        min-width: 50px;
        height: 25px;
      }

      &.battle-button-slot-right-top {
        bottom: 110px;
        right: 0;
      }

      &.battle-button-slot-right-mid {
        bottom: 85px;
        right: 0;
      }

      &.battle-button-slot-right-bottom {
        bottom: 60px;
        right: 0;
      }

      &.battle-button-slot-left-mid {
        bottom: 85px;
        right: 50px;
      }

      &.battle-button-slot-wide-top {
        bottom: 25px;
        right: 0;

        button {
          width: 75px;
          min-width: 75px;
        }
      }

      &.battle-button-slot-wide-bottom {
        bottom: 0;
        right: 0;

        button {
          width: 75px;
          min-width: 75px;
        }
      }
    }

    .battle-item-buttons {
      bottom: 0;
    }

    .magic-sidebar {
      position: absolute;
      top: 0;
      right: 0;
      width: 75px;
      height: 311px;
      background: #000;
      z-index: 12;

      .magic-sidebar-button,
      .magic-sidebar-exit {
        position: absolute;
        left: 0;
        width: 75px;
        height: 25px;
        padding: 0;
      }

      .magic-sidebar-exit {
        left: 24px;
        top: 285px;
        width: 50px;
      }
    }

    .ending-message {
      position: absolute;
      right: 0;
      bottom: 0;
      color: #fff;
      background: rgba(0, 0, 0, 0.8);
      padding: 4px 6px;
      line-height: 1.2;
    }
  }

    .another-screen-filter {
      position: absolute;
      inset: 0;
      z-index: 3;
      pointer-events: none;
      background: rgba(148, 0, 0, 0.22);
      mix-blend-mode: screen;
    box-shadow: inset 0 0 120px rgba(255, 0, 0, 0.24);
  }

  .spell-build-screen {
    position: absolute;
    inset: 0;
    z-index: 25;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    box-sizing: border-box;
    background: #000;
  }

  .spell-build-page {
    position: relative;
    width: 600px;
    height: 400px;
    flex-shrink: 0;
    background: #808080;
    overflow: hidden;
  }

  .spell-build-background {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    display: block;
    image-rendering: pixelated;
  }

  .spell-build-list,
  .spell-build-mp {
    position: absolute;
    z-index: 1;
    color: #00ffff;
    font-style: italic;
    font-weight: 700;
    text-shadow: 3px 3px 0 #000;
  }

  .spell-build-list {
    left: 20px;
    top: 30px;
    width: 281px;
    height: 311px;
    overflow: hidden;
    white-space: pre-wrap;
    overflow-wrap: anywhere;
    font-size: 19px;
    line-height: 1.12;
  }

  .spell-build-list-compact {
    font-size: 16px;
    line-height: 1.14;
  }

  .spell-build-mp {
    left: 290px;
    top: 180px;
    width: 271px;
    height: 71px;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    font-size: 19px;
    line-height: 1.2;
  }

  .spell-build-input {
    position: absolute;
    z-index: 2;
    left: 300px;
    top: 30px;
    width: 281px;
    height: 27px;
    box-sizing: border-box;
    padding: 0 6px;
    color: #ff0000;
    background: #770000;
    border: 2px inset #d4d0c8;
    font-size: 19px;
    font-weight: 700;
    line-height: 1;
    outline: none;
  }

  .spell-build-button {
    position: absolute;
    z-index: 2;
    left: 390px;
    top: 70px;
    width: 191px;
    height: 31px;
    padding: 0;
    font-size: 16px;
    font-weight: 700;
  }

  button {
    white-space: nowrap;
  }

  .cutscene-overlay {
    position: absolute;
    inset: 0;
    background: #000;
    z-index: 30;

    &.story-overlay {
      cursor: pointer;
    }

    .cutscene-image {
      width: 100%;
      height: 100%;
      display: block;
      object-fit: contain;
      image-rendering: pixelated;
    }

    .cutscene-panel {
      position: absolute;
      left: 28px;
      right: 28px;
      bottom: 24px;
      display: flex;
      align-items: flex-end;
      gap: 12px;
      padding: 14px 16px;
      color: #fff;
      background: rgba(0, 0, 0, 0.8);
      border: 1px solid rgba(255, 255, 255, 0.4);
    }

    .cutscene-text {
      flex: 1;
      white-space: pre-wrap;
      line-height: 1.6;
    }

    .cutscene-button {
      flex-shrink: 0;
      align-self: flex-end;
    }

    .gameover-panel {
      left: 50%;
      right: auto;
      width: min(360px, calc(100% - 56px));
      transform: translateX(-50%);
      flex-direction: column;
      align-items: center;
      text-align: center;
    }
  }

  .modal-overlay {
    position: absolute;
    inset: 0;
    padding: 40px 25px 50px;
    display: flex;
    z-index: 31;

    .story-panel {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 12px;
      padding: 16px;
      color: #fff;
      background: rgba(10, 10, 10, 0.92);
      border: 1px solid #666;
      min-height: 0;
    }

    .story-text {
      flex: 1;
      overflow: auto;
      white-space: pre-wrap;
      line-height: 1.6;
    }
  }

  .system-dialog-overlay {
    align-items: center;
    justify-content: center;
    padding: 24px;
    background: transparent;
    z-index: 32;

    .system-dialog-panel {
      width: min(340px, 100%);
      color: #000;
      background: #d4d0c8;
      border: 2px solid;
      border-color: #ffffff #404040 #404040 #ffffff;
      box-shadow: 2px 2px 0 #000;
    }

    .system-dialog-titlebar {
      padding: 3px 6px;
      color: #fff;
      font-weight: 700;
      line-height: 1.2;
      background: linear-gradient(90deg, #000080 0%, #1084d0 100%);
    }

    .system-dialog-body {
      padding: 18px 16px 10px;
    }

    .system-dialog-message {
      min-height: 48px;
      white-space: pre-wrap;
      line-height: 1.5;
    }

    .system-dialog-buttons {
      display: flex;
      justify-content: center;
      gap: 12px;
      padding: 0 16px 14px;

      button {
        min-width: 72px;
      }
    }
  }

  .settings-overlay {
    align-items: center;
    justify-content: center;
    padding: 24px;
    background: rgba(0, 0, 0, 0.94);

    .settings-panel {
      flex: 0 0 auto;
      width: min(360px, 100%);
      gap: 16px;
    }

    .settings-columns {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 16px;
    }

    .settings-section {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .settings-section-title {
      font-weight: 700;
    }

    .settings-button-group {
      display: flex;
      flex-direction: column;
      gap: 8px;

      button {
        width: 100%;
        min-width: 0;
        height: 25px;
      }
    }

    .settings-button-active {
      background: #dcdcdc;
    }

    .settings-footer {
      display: flex;
      justify-content: flex-end;
    }
  }

  .clear-record-overlay {
    align-items: center;
    justify-content: center;
    padding: 24px;
    background: rgba(0, 0, 0, 0.94);
    z-index: 32;

    .clear-record-panel {
      width: min(520px, 100%);
      max-height: 100%;
      display: flex;
      flex-direction: column;
      gap: 12px;
      padding: 16px;
      color: #fff;
      background: rgba(10, 10, 10, 0.92);
      border: 1px solid #666;
      min-height: 0;
    }

    .clear-record-title {
      font-weight: 700;
    }

    .clear-record-tabs {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .clear-record-tab-active {
      background: #dcdcdc;
    }

    .clear-record-filename {
      color: #aaa;
      line-height: 1.2;
    }

    .clear-record-body {
      flex: 1;
      overflow: auto;
      white-space: pre-wrap;
      line-height: 1.6;
      padding: 12px;
      border: 1px solid #666;
      background: rgba(0, 0, 0, 0.4);
    }

    .clear-record-footer {
      display: flex;
      justify-content: flex-end;
    }
  }
}
</style>

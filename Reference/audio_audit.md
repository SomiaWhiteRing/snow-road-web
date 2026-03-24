# 原版音效出现位置与 Web 对照审计

## 范围与证据

- 原版资源目录：`original_game/snow/dat/*.wav`
- 原版脚本：`original_game/snow/dat/story04.txt`
- 原版反汇编：`C:\Users\旻\AppData\Local\Temp\snow-road-disasm\snow_code_disasm.txt`
- Web 资源与调用点：
  - `src/services/assetManager.ts`
  - `src/services/soundManager.ts`
  - `src/services/forwardService.ts`
  - `src/components/ControlPanel.vue`
  - `src/views/Game.vue`
  - `src/views/Loading.vue`
  - `src/services/storyService.ts`

本文只记录三类内容：

- `逆向确认`：已经能直接落到 `snow.exe` 调用地址，或原版故事脚本 `#wave`。
- `Web 现状`：当前仓库里实际存在的资源和实际调用点。
- `对照结论`：只写是否对上，不在这里发散推测实现方案。

## 快速结论

- 原版实际存在 `28` 个 wav 音效。
- Web 资源目录里实际有 `29` 个 wav，其中多了原版没有的 `step.wav`。
- Web 常量里还多定义了一个 `THATHA = thatha.wav`，但资源目录中没有这个文件，代码里也没有调用。
- 原版的 WAV 播放总线已经坐实是：
  - `0x5BE3C -> 0x5BDE4 -> winmm.PlaySoundA`
  - 传入 flags 为 `0x20003 / 0x2000B`
  - 也就是按“文件名”播放现有磁盘文件，不是资源音、不是系统别名、也不是内存音
- 因此 `step.wav` 不可能是“原版有声但漏抽文件”这一类问题。
- 原版另一条音频系统是 `dat/GuruGuruSMF.dll`，对应 `0x5BF70` 一系调用；当前已见调用点都落在 BGM / 音乐切换相关链路，不像地图前进的短促点击音。
- 当前 Web 端最大偏差不是“缺文件”，而是“触发语义错位”：
  - 用原版不存在的 `step.wav` 覆盖了大量地图/UI 音效位置。
  - 把 `spell00.wav ~ spell09.wav` 用到了正常施法上；原版它们只用于咒文构筑成功。
  - `turn.wav / up.wav / dh.wav` 已有资源但没有接到原版对应逻辑。
  - `fire.wav / duty.wav / kin.wav / popon.wav / thathatha.wav / bub.wav` 只实现了部分原版落点。

## 原版资源总表

原版 `original_game/snow/dat` 中实际存在的 wav 文件如下：

- `break.wav`
- `bub.wav`
- `dh.wav`
- `dun.wav`
- `duty.wav`
- `eat.wav`
- `fire.wav`
- `hyuun.wav`
- `kin.wav`
- `open.wav`
- `popon.wav`
- `roar.wav`
- `spell00.wav`
- `spell01.wav`
- `spell02.wav`
- `spell03.wav`
- `spell04.wav`
- `spell05.wav`
- `spell06.wav`
- `spell07.wav`
- `spell08.wav`
- `spell09.wav`
- `suka.wav`
- `thathatha.wav`
- `turn.wav`
- `up.wav`
- `weak.wav`
- `zurl.wav`

## 原版音效位置与 Web 对照

| 音效 | 原版位置（逆向确认） | Web 现状 | 对照结论 |
| --- | --- | --- | --- |
| `break.wav` | `0x478E88 / 0x77677`：击败敌人 | `src/views/Game.vue:1293`，敌人 HP `<= 0` 时播放 | `对上` |
| `bub.wav` | `0x472698 / 0x71623`：商店钱不够；`0x473128 / 0x72063`：旅馆火柴不够；`0x4733A8 / 0x722D7`、`0x72373`：存档火柴不够或失败；`0x473574 / 0x72476`、`0x724C9`：擦火柴失败/浪费；`0x4736B4 / 0x72632`、`0x7265A`：ライター失败/浪费；`0x475068 / 0x74001`：咒文构筑失败；`0x479294 / 0x7825B`：Boss 战禁止 `奥の手` | `src/views/Game.vue:1552,1590,1596,1603,1615,1621,1627,1778,1910` 已覆盖 Boss 战 `奥の手`、擦火柴失败、ライター失败、商店钱不够、咒文构筑失败；`handleInn` / `handleSave` 的失败分支没有补原版音效 | `部分对上` |
| `dh.wav` | `0x47575C / 0x74735`：`≪星舞い≫` 生效，显示 `星がまたたいた……` | `src/services/soundManager.ts` 有 `DAMAGE = 'dh.wav'`，但代码里没有任何 `SOUND.DAMAGE` 调用；`src/views/Game.vue:1153-1155` 的 `星舞い` 只有状态变化，没有原版音效 | `未实现` |
| `dun.wav` | `0x477F34 / 0x76E6D`：对敌造成物理伤害；战斗 `奥の手` 的伤害结算也会走这条命中链 | `src/views/Game.vue:1208,1247,1339`：普通攻击命中、`≪星舞い≫` 连击命中、战斗 `奥の手` 伤害 | `基本对上` |
| `duty.wav` | `0x47324C / 0x721A2`：免费旅馆 `奥の手` 的 MaxHP 代价；`0x478438 / 0x77313`：敌方魔法命中；`0x478F5C / 0x77957`：战斗 `奥の手` 反动 | `src/views/Game.vue:1350,1701`：战斗 `奥の手` 反动、旅馆 `奥の手` 代价已对上；但 `src/views/Game.vue:1003` 把敌方魔法命中做成了 `FIRE`，没有用 `DUTY` | `部分对上` |
| `eat.wav` | `0x4726AC / 0x71632`：商店购买成功；`0x4790D8 / 0x77CE4`：胜利后确认“装備した” | `src/views/Game.vue:909,1784`：战后装备确认、商店购买成功 | `对上` |
| `fire.wav` | `0x473700 / 0x72672`：ライター成功；`0x478210 / 0x7715A`：攻击魔法命中敌人 | `src/views/Game.vue:1633`：ライター成功已对上；但 `src/views/Game.vue:1003` 把敌方魔法命中做成了 `FIRE`，而玩家攻击魔法命中没有补这条原版音效 | `部分对上` |
| `hyuun.wav` | `0x4738B4 ~ 0x473B1C`：制御成功项统一播放；`0x4755B4 / 0x74513`：生成虚构 MP；`0x4793EC / 0x782E5`：`ドライヴ`；`0x479568 / 0x78455`：`フリップ` | `src/components/ControlPanel.vue:170` 覆盖全部制御点击；`src/views/Game.vue:1503,1531` 覆盖 `ドライヴ / フリップ`；但 `src/views/Game.vue:1113-1119` 的 `ゆびさきにともしびを` 没有补原版 `HYUUN` | `部分对上` |
| `kin.wav` | `0x477F78 / 0x76ECE`：玩家物理攻击 miss；`0x478258 / 0x771B1`：攻击魔法无效；`0x478490 / 0x77374`：敌方魔法无效/玩家免疫 | `src/views/Game.vue:1208,1247` 用在玩家普通攻击或 `≪星舞い≫` miss；`src/views/Game.vue:1029` 也把敌人物理攻击被挡下时做成了 `KIN`；但攻击魔法无效、敌方魔法被无效化这两条原版落点都没补 | `部分对上` |
| `open.wav` | `0x478FFC / 0x77A99`：升级 | `src/views/Game.vue:1379`：升级开始时播放 | `对上` |
| `popon.wav` | `0x472D7C / 0x71D0A`：地图捡火柴/火柴盒；`0x4733E8 / 0x7231E`：存档成功；`0x4790FC / 0x77D73`：胜利后火柴奖励；`0x47C8EC / 0x7B8BD`：高可信 UI 打开音，当前最像魔法面板打开 | `src/services/forwardService.ts:244` 覆盖地图捡火柴；`src/views/Game.vue:1443` 覆盖战后火柴奖励；`handleSave` 没有原版成功音；打开商店/魔法面板也没有对应 UI 音 | `部分对上` |
| `roar.wav` | `0x478F08 / 0x77901`：战斗 `奥の手` 咆哮台词 | `src/views/Game.vue:1332`：战斗 `奥の手` 开场台词 | `对上` |
| `spell00.wav ~ spell09.wav` | 咒文构筑成功时，按学到的具体咒文播放对应文件；失败则不是这组音效 | `src/views/Game.vue:1917-1919`：咒文构筑成功时确实播放对应 `spellNN.wav`；但 `src/views/Game.vue:1189,1951` 也在正常施法时调用了 `playSpellSound` | `部分对上，且有错配` |
| `suka.wav` | `0x4735C0 / 0x724E1`：擦火柴成功；`original_game/snow/dat/story04.txt:91`：`#wave suka.wav` | `src/views/Game.vue:1609`：擦火柴成功；`src/services/storyService.ts:123-126` + `src/views/Game.vue:659-665,768-769` 已支持故事脚本 `#wave`，因此 `story04` 里的 `suka.wav` 也能播 | `对上` |
| `thathatha.wav` | `0x473834 / 0x727D5`：标题开始点击；`0x475C00 / 0x74BAA`：故事页结束/切回主流程；`0x479224 / 0x781FF`：一条战斗状态切换；`0x47C92C / 0x7B901`：高可信 UI 关闭音，当前最像魔法面板关闭 | `src/views/Loading.vue:187` 只覆盖标题开始点击；其余故事结束、战斗状态切换、UI 关闭都还没补 | `部分对上` |
| `turn.wav` | `0x473034 / 0x71FF6`：免费旅馆 `奥の手` 成功；`0x478FAC / 0x779C6`：逃跑成功 | 资源已在 `public/assets/sound/turn.wav`，但没有任何 `SOUND.TURN` 调用；`src/views/Game.vue:859-866` 的逃跑成功无音效，`handleInnSecret` 也没播 `TURN` | `未实现` |
| `up.wav` | `0x473158 / 0x720B8`：花火柴取暖成功；`0x4754D0 / 0x74498`：HP 全回复；`0x475640 / 0x745EC`：生成 `春ノ夢`；`0x4756E0 / 0x7468C`：生成 `夏ノ空` | 资源已在 `public/assets/sound/up.wav`，但没有任何 `SOUND.UP` 调用；`src/views/Game.vue:1675-1684` 的旅馆成功、`1110-1151` 的全回复/生成装备法术都没有补原版 `UP` | `未实现` |
| `weak.wav` | `0x478E50 / 0x77622`：玩家死亡前刷白并进入 GameOver | `src/views/Game.vue:1285`：玩家 HP `<= 0` 时播放 | `对上` |
| `zurl.wav` | 现有逆向笔记把 `0x477FA0` 解释为“敌人物理命中玩家时播放 `zurl.wav` 并触发白闪”；当前没有发现更强的反证 | `src/views/Game.vue:1036`：敌人物理攻击命中时播放，且同步触发白闪 | `按当前逆向笔记看是对上的` |

## Web 端额外项

| 项目 | Web 现状 | 结论 |
| --- | --- | --- |
| `step.wav` | `public/assets/sound/step.wav` 存在；`src/services/forwardService.ts:185,193,209,222,236,259,273,278,290,298` 被大量用于前进、遭遇、旅馆、便条、商店、存档等地图/UI 通用声 | `原版不存在，是 Web 自造占位音` |
| `THATHA = 'thatha.wav'` | `src/services/soundManager.ts:88` 定义了常量，但 `public/assets/sound` 没有该文件，代码里也没有调用 | `死常量，应视为无效项` |

## `STEP` 的进一步说明

Web 当前把 `STEP` 用在了这些位置：

- 熊警告出现
- 普通敌 / 装备敌 / Boss 遭遇出现
- 主角独白
- 什么都没有发生
- 便条出现
- 旅馆出现
- 商店出现
- 存档蜡烛出现

就静态逆向目前能确认的部分，原版对这些位置并不存在一条统一的“步进音 wav”：

- 原版唯一明确的地图事件出现音是：
  - 火柴 / 火柴盒出现时的 `popon.wav`
- 旅馆、商店、存档、魔法面板等系统，原版的音效落在“进一步操作成功/失败或开关面板”上，而不是统一落在“事件出现”的瞬间：
  - 旅馆成功/失败：`up.wav / bub.wav`
  - 免费旅馆 `奥の手`：`turn.wav / duty.wav`
  - 存档成功/失败：`popon.wav / bub.wav`
  - 商店购买成功/失败：`eat.wav / bub.wav`
  - 魔法页开/关：高可信为 `popon.wav / thathatha.wav`

因此，`STEP` 在 Web 里的问题不是“文件名错了但语义对”，而是把两类原版行为糊成了一种占位：

- 一部分原版其实应该是别的已知 wav
- 另一部分从当前 exe 静态证据看，更接近“本体不播专门音效”

若实机在这些位点确实还能听到短促声，目前最稳妥的结论是：

- 它不是来自一个缺失的 `step.wav`
- 也不是来自原版的隐藏资源 wav 播放链
- 要继续分辨那声音究竟是“别的已有 wav 被复用”，还是“系统/UI 层的非游戏资源声音”，需要补动态追踪或录屏录音对照

## 按文件看 Web 当前音效落点

- `src/views/Loading.vue`
  - 只有标题开始 `THATHATHA`
- `src/components/ControlPanel.vue`
  - 制御成功统一 `HYUUN`
- `src/services/forwardService.ts`
  - 地图前进流程大量使用 `STEP`
  - 捡火柴使用 `POPON`
- `src/views/Game.vue`
  - 承担了绝大多数战斗、道具、商店、升级、咒文构筑音效
  - 也负责故事脚本 `#wave`

这意味着后续若要继续按原版修音效，主战场基本就是：

- `src/services/forwardService.ts`
- `src/views/Game.vue`

## 结论摘要

- 原版音效位置已经基本够写出一份“逐条补齐”的清单了，阻碍不在资源，而在触发逻辑。
- 第一优先级差异是：
  - 去掉 `STEP` 这种原版没有的总线音。
  - 把 `TURN / UP / DH` 接回原版事件。
  - 把施法音从 `spellNN.wav` 改回原版的效果音体系。
  - 给 `存档成功/失败`、`旅馆成功/失败`、`魔法面板开关`、`故事结束切回主流程` 补原版 UI 音。

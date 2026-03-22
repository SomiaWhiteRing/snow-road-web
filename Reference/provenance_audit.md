# 雪道来源审计与结构总表

本文件用于把当前项目中的内容按来源分层，避免把 `逆向结果`、`文档总结`、`推测编纂` 混写后继续污染实现。

## 统计口径

- 统计对象不是“句子数”，也不是“文件数”，而是“可以单独指导实现的一条机制/结构知识”。
- 同一主题如果同时包含多个独立结论，会拆成多条。
- 若一条知识能直接追到 `snow.exe`、`FORMMAIN.dfm`、原始故事脚本、或 exe 字符串/地址，则归为 `逆向结果`。
- 若一条知识主要来自 `説明書.html`、攻略页、原版 `readme.txt` 等文字资料，则归为 `文档总结`。
- 若一条知识仍是为了让 Web 版运行而做的结构映射、统一抽象、或未被原版完全坐实的补写，则归为 `推测编纂`。

## 当前总量

按上面的“知识条目”口径，当前项目已整理出：

- `逆向结果`：24 条
- `文档总结`：8 条
- `推测编纂`：6 条

总计 `38` 条。

## 一、逆向结果 24 条

1. `snow.exe` 为 32 位 Delphi Windows GUI 程序，并直接导入 `PlaySoundA` 与 `GuruGuruSMF.dll`。
2. `FORMMAIN.dfm` 已确认标题页、故事页、主场景页、咒文页、GameOver 页及 `PanelControl / PanelShop / PanelMagic` 结构。
3. 制御面板按钮项、显示条件、事件入口与动态耗费已能从 `0x473CD8` 等入口直接定位。
4. 前进事件主分布是 `Random(100)` 的硬编码分段，不是经验权重。
5. 火柴事件内部有二次 `Random(100)`，`1%` 为火柴盒 `+10`，否则 `+1`。
6. 旅馆价格公式是从 `1` 开始再独立乘 `2 / 5 / 10`，不是均匀随机。
7. 熊警告只会在第一次真正抽到熊类敌人时替换该次遭遇，且每 Stage 只触发一次。
8. 普通敌人的 Stage 候选池顺序已从代码表中确认。
9. 普通敌人抽选采用三角权重，不是等概率。
10. 装备遭遇概率、`rank` 生成、武器/防具二选一、遭遇敌方数值公式已确认。
11. 装备遭遇战后会进入“拾取后是否装备”的独立状态流，不会自动换装。
12. 标题点击开局不会播 `story00`；Boss 战后按当前 Stage 号加载 `storyXX`；未进 Another 时在 `distance == 1001` 自动播 `story_close`。
13. `#end / #incStage / #finish` 的脚本语义和 `#finish` 对 Another 入口的触发点已确认。
14. Another 条件实际绑定 `stage == 9`、`distance <= 1000`、`傷アリ == 0` 与报告标记。
15. `傷アリ` 的已确认来源包括免费旅馆 `奥の手` 与战斗 `奥の手`，且扣血公式是 `ceil(MaxHP / 10)`。
16. `ドライヴ / フリップ` 是免费动作；`オーバードライヴ / フリップフロップ` 改写增量；整轮结束统一衰减；`攻撃 / 魔法` 先后手为 `50% / 50%`。
17. `#GetName` 会把参数直接写入玩家记录开头；`story08` 中存在 `#GetName ララアクス`。
18. `原初へ` 的显示条件、点击入口与真实效果已确认，本质是把当前名字改为 `ララフレア`，并扣 `99 MaxHP`。
19. 敌方魔法名、伤害公式、`ララフレア` 完全耐性、以及施法后敌方 `MP - 1` 已确认。
20. `呪文構築` 的三次 `つぶやく` 流程、按钮文案、`調べ尽くした`、以及 `≪星舞い≫` 的 flag 与追加攻击机制已确认。
21. 战斗的 `戦う / 魔法 / 奥の手 / 逃跑失败` 都要挂在 `BtnBattleStep = ≫` 的步进状态机上逐步推进；战斗内 `火柴 / ライター` 则和 `ドライヴ / フリップ` 一样属于免费动作，不进入该状态机。
22. 战斗胜利后的 `经验 -> 升级链 -> 装备确认 -> 火柴奖励 -> 战斗结束清理` 也是独立的状态链；其中升级不会自动回复当前 HP / MP。
23. 升级所需 EXP 公式已从 `0x47611C` 坐实为 `当前 LV * 5`。
24. 当前敌人结构 `+0x110` 就是胜利火柴奖励字段；装备遭遇、普通敌人、BOSS 的具体奖励值已从 `0x476174 / 0x477168 / 0x478D59` 对齐出来。

## 二、文档总结 8 条

1. 普通物理攻击公式在 `説明書.html` 中有明确说明。
2. 逃跑成功率“约 80%”来自原版说明文档。
3. 升级时 `Potential` 的增长/消耗与 `MaxHP / MaxMP / 攻防` 成长规则来自说明书与攻略页。
4. 自动贩卖机里武器、防具、书、星印的价格来自装备/攻略页。
5. 咒文名表、MP 消耗表、表面效果说明可由 `spell.html` 汇总。
6. 虚构 MP 的一般规则，如生成、翻倍、移动归零、战斗内回合衰减、上限等，主要来自说明/攻略页。
7. `春ノ夢 / 夏ノ空` 的强度成长表与 `LV` 关系来自 `equip.html` 的整理。
8. 大部分公开敌人与 Boss 的数值表来自 `enemy.html`，但不含 Another 最终隐藏内容。

## 三、推测编纂 6 条

1. 当前 Web 版把原版玩家记录中的“星位总数”和“当前点亮数”映射为 `starCapacity / fuel`，这是基于 `+0x114 / +0x118` 的合理拆分，但还没把所有更新点完全逆全。
2. 当前 [Game.vue](/c:/Users/旻/Documents/GitHub/snow-road-web/src/views/Game.vue) 用 Vue 事件流重建了原版战斗状态机，这在行为目标上对齐，但不是原状态编号的逐 case 直译。
3. 当前 [types/enemies.ts](/c:/Users/旻/Documents/GitHub/snow-road-web/src/types/enemies.ts) 中的 `magic.chance` 等字段是 Web 层运行所需抽象，不对应原版数据结构中的原始存储形式。
4. 当前 [types/enemies.ts](/c:/Users/旻/Documents/GitHub/snow-road-web/src/types/enemies.ts) 中 `ルシファー` 等 Another 深层数据并未全部由逆向坐实，仍应视为暂存实现值。
5. 当前 [types/spells.ts](/c:/Users/旻/Documents/GitHub/snow-road-web/src/types/spells.ts) 把原版咒文效果整理成统一 schema，这是一层现代实现抽象，不是原版内部结构原样再现。
6. [forward.txt](/c:/Users/旻/Documents/GitHub/snow-road-web/Reference/forward.txt) 是面向实现的约束摘要，不是原始证据本身；其中每条都应继续回指到 exe 或原版资料来源。

## 四、原始资料层

这些文件是“证据源”，不应和总结文档混用：

- `original_game/snow/snow.exe`
- `original_game/snow/dat/*.txt`
- `temp_rh/FORMMAIN.dfm`
- `extracted_strings.txt`
- `original_game/snow/説明書.html`
- `original_game/snow/readme.txt`
- `Reference/enemy.html`
- `Reference/equip.html`
- `Reference/spell.html`
- `Reference/stage.html`
- `Reference/another.html`
- `Reference/control.txt`

## 五、当前文档层

- [reverse_engineering_notes.md](/c:/Users/旻/Documents/GitHub/snow-road-web/Reference/reverse_engineering_notes.md)
  - 角色：证据笔记主表
  - 问题：目前仍混有少量文档总结与实现指向
- [forward.txt](/c:/Users/旻/Documents/GitHub/snow-road-web/Reference/forward.txt)
  - 角色：给实现侧看的行为约束清单
  - 问题：它不是证据源，只是消化后的 checklist
- [provenance_audit.md](/c:/Users/旻/Documents/GitHub/snow-road-web/Reference/provenance_audit.md)
  - 角色：来源审计与结构总表

## 六、当前实现结构

### 1. 运行主干

- [Game.vue](/c:/Users/旻/Documents/GitHub/snow-road-web/src/views/Game.vue)
  - 主循环、战斗、故事推进、商店、菜单、存档
  - 来源性质：`混合，以推测编纂为主`
- [game.ts](/c:/Users/旻/Documents/GitHub/snow-road-web/src/stores/game.ts)
  - 统一玩家状态与战斗状态
  - 来源性质：`混合，以逆向映射为主`

### 2. 规则层

- [forwardService.ts](/c:/Users/旻/Documents/GitHub/snow-road-web/src/services/forwardService.ts)
  - 前进事件、敌池、装备遭遇、旅馆价格
  - 来源性质：`逆向结果主导`
- [storyService.ts](/c:/Users/旻/Documents/GitHub/snow-road-web/src/services/storyService.ts)
  - 故事脚本 directive 解析
  - 来源性质：`逆向结果主导`
- [gameMechanics.ts](/c:/Users/旻/Documents/GitHub/snow-road-web/src/services/gameMechanics.ts)
  - 通用数值、战斗实体实例化、商店列表
  - 来源性质：`混合`

### 3. 数据表层

- [types/control.ts](/c:/Users/旻/Documents/GitHub/snow-road-web/src/types/control.ts)
  - 制御项与费用规则
  - 来源性质：`逆向结果主导`
- [types/equipment.ts](/c:/Users/旻/Documents/GitHub/snow-road-web/src/types/equipment.ts)
  - 装备列表与特殊装备成长公式
  - 来源性质：`文档总结主导`
- [types/enemies.ts](/c:/Users/旻/Documents/GitHub/snow-road-web/src/types/enemies.ts)
  - 敌人/Boss 数值表
  - 来源性质：`文档总结 + 推测编纂混合`
- [types/spells.ts](/c:/Users/旻/Documents/GitHub/snow-road-web/src/types/spells.ts)
  - 咒文名表、消耗与 Web 抽象效果
  - 来源性质：`文档总结 + 推测编纂混合`

### 4. 表现层

- `src/components/*.vue`
  - UI 组件层
  - 来源性质：`推测编纂 / 现代重写`
- `src/i18n/*.ts`
  - 多语言文本层
  - 来源性质：`推测编纂 / 翻译整理`

## 七、后续整理原则

后续新增结论时，统一按下面顺序落档：

1. 先在 `reverse_engineering_notes.md` 或原始资料旁写清证据来源、地址、字符串、脚本片段。
2. 再把已经确认会影响实现的内容压缩进 `forward.txt`。
3. 若某实现仍不得不采用桥接方案，必须在本文件登记为 `推测编纂`，并注明对应代码文件。

未经过上述三步的内容，不应直接宣称为 `1:1`。

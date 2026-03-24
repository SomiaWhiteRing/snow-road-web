# BOSS / 剧情 / 魔法界面对照审计

本文只整理本轮围绕以下 7 项的原版逆向结果，以及 Web 端已落实的修正：

1. 每 100 步 BOSS 战前的 `ＢＯＳＳ` 抖动字
2. BOSS 剧情结束回到游戏后，主消息区清空
3. BOSS 后剧情在没有 `#midi` 指令时，沿用战斗中的 BGM
4. 装备怪物战胜后，先询问“是否装备”
5. 买到书后，不在状态栏写“已持书”，而是插入 `魔法` 按钮
6. `呪文構築` 是覆盖主界面的独立页面，不是小弹窗
7. 学习魔法需要满足原版的真实条件

## 证据来源

- 原版 exe 反汇编
- 原版窗体资源 [FORMMAIN.dfm](/c:/Users/旻/Documents/GitHub/snow-road-web/temp_rh/FORMMAIN.dfm)
- 原版剧情脚本
  - [story00.txt](/c:/Users/旻/Documents/GitHub/snow-road-web/original_game/snow/dat/story00.txt)
  - [story07.txt](/c:/Users/旻/Documents/GitHub/snow-road-web/original_game/snow/dat/story07.txt)
  - [story08.txt](/c:/Users/旻/Documents/GitHub/snow-road-web/original_game/snow/dat/story08.txt)
  - [story09.txt](/c:/Users/旻/Documents/GitHub/snow-road-web/original_game/snow/dat/story09.txt)
- 既有总笔记
  - [reverse_engineering_notes.md](/c:/Users/旻/Documents/GitHub/snow-road-web/Reference/reverse_engineering_notes.md)
  - [magic_system.md](/c:/Users/旻/Documents/GitHub/snow-road-web/Reference/magic_system.md)

## 逐项结论

### 1. BOSS 抖动字

- 原版：
  - 前进逻辑 `0x472ED4` 在 `distance % 100 == 0` 时直接进入 `0x477B28`
  - `0x477B28` 置 `0x489D2C = 1`
  - 战斗初始化 `0x477508` 再把它复制到 `0x489D2D`
  - 战斗绘制 `0x47A6D0` 调 `0x479150` 读该 flag，并以
    - `x = 200 + Random(10)`
    - `y = 100 + Random(10)`
    在战斗区绘制全角 `ＢＯＳＳ`
- 结论：
  - 这不是一次性提示图，而是战斗区里持续抖动的文字层
  - 它绘制在怪物图前方，直到战斗结束 `0x477DB8` 清掉 flag
- Web 修正：
  - 在 [Game.vue](/c:/Users/旻/Documents/GitHub/snow-road-web/src/views/Game.vue) 中新增 boss 标记层与随机抖动定时器

### 2. 剧情结束后清空主消息

- 原版：
  - BOSS 战后走 `0x478DDC -> 0x475A58(0)` 进入 `storyXX`
  - 剧情结束走 `0x475BA8`
  - 从页面切换与实机表现看，返回主界面时不会保留战斗遭遇文本或剧情文本
- 备注：
  - 这条静态上还没抓到“单独清空主字符串缓存”的最后一个独立调用点
  - 但调用路径与实机表现都支持“故事结束后主消息应为空”
- Web 修正：
  - 在 [Game.vue](/c:/Users/旻/Documents/GitHub/snow-road-web/src/views/Game.vue) 的 `finishStoryWithEnd / finishStoryWithFinish` 里显式清空 `message`

### 3. 没有 `#midi` 时沿用当前 BGM

- 原版：
  - `#midi 文件名` 由 `0x475C14` 调 `0x45CF70`
    - 会先 `GGSStop`
    - 再加载并播放新 MIDI
  - 空 `#midi` 由 `0x475C14` 调 `0x45CFF4`
    - 只做停止 MIDI
  - 若脚本里根本没有 `#midi`
    - `0x475A58 / 0x475BA8` 本身不会主动改音乐
    - 当前音乐会继续播放
- 脚本对照：
  - [story00.txt](/c:/Users/旻/Documents/GitHub/snow-road-web/original_game/snow/dat/story00.txt) 没有 `#midi`
  - [story07.txt](/c:/Users/旻/Documents/GitHub/snow-road-web/original_game/snow/dat/story07.txt#L2) 明确切到 `coldecot.mid`
  - [story08.txt](/c:/Users/旻/Documents/GitHub/snow-road-web/original_game/snow/dat/story08.txt#L47) 空 `#midi`
  - [story09.txt](/c:/Users/旻/Documents/GitHub/snow-road-web/original_game/snow/dat/story09.txt#L1) 开头空 `#midi`
- Web 修正：
  - 之前的实现把“未指定 `#midi`”和“显式停歌”混成了同一个 `null`
  - 现改为三态：
    - `inherit`
    - `stop`
    - `track`
  - 因此剧情只有在脚本显式写空 `#midi` 时才静音

### 4. 装备怪物掉落后先问是否装备

- 原版：
  - 胜利链 `0x6E -> 0x478C6F`
    - 显示 `〈装备名〉を拾った。 / 装備しますか？`
  - 只有选“装備する”后，`0x6F -> 0x478CE2`
    - 才调用 `0x470604` 真正应用装备
- Web 状态：
  - 这块此前已经对齐
  - 当前 [Game.vue](/c:/Users/旻/Documents/GitHub/snow-road-web/src/views/Game.vue) 保留了 `battleEquipChoiceVisible / equipPendingEquipment / declinePendingEquipment`

### 5. 买书后的 `魔法` 按钮显示方式

- 原版：
  - `player[+0x5f]` 为“已读过书” flag
  - `0x47B7BC` 直接用它控制主界面的 `BtnMagic`
  - DFM 位置固定：
    - `BtnMain`：`Top = 210`
    - `BtnMagic`：`Top = 235`
    - `BtnControl`：`Top = 260`
  - 状态栏不额外显示“已持书”
- Web 修正：
  - [game.ts](/c:/Users/旻/Documents/GitHub/snow-road-web/src/stores/game.ts) 的 `hasMagic` 已改成 `items.books`
  - [StatusPanel.vue](/c:/Users/旻/Documents/GitHub/snow-road-web/src/components/StatusPanel.vue) 去掉了“已持书”状态行
  - [Game.vue](/c:/Users/旻/Documents/GitHub/snow-road-web/src/views/Game.vue) 把场景按钮改回纵向布局，使 `進む / 魔法 / 制御` 对应原版位置

### 6. `呪文構築` 是独立页面

- 原版：
  - DFM 明确存在独立页 `PageSpell`
  - 其内部是整页构造：
    - `ImgSpell`
    - `LabSpell`
    - `LabSpellMP`
    - `EditSpell`
    - `BtnBuildSpell`
- 结论：
  - 这是专属页面，不是主界面上的小弹窗
- Web 修正：
  - 旧的 scene 内小 overlay 已移除
  - 现改成覆盖主界面的独立 `spell-build-screen`

### 7. 学习魔法的真实条件

- 原版：
  - 先买书
  - 进入 `呪文構築` 时只扣一次 `3 MaxHP`
  - 获得 3 次 `つぶやく`
  - 每次点按钮时：
    1. 先减次数
    2. 用输入框文本和 10 个完整咒文名按 index 顺序精确比较
    3. 找到第一个“尚未习得且当前可用 MP 足够”的咒文才成功
- 学习判定不是看 `MaxMP`，而是：
  - `己ならざるのぬくもりよ / 春ノ夢 / 夏ノ空`
    - 只看当前真实 MP
  - 其他咒文
    - 看 `当前真实 MP + 虚构 MP`
- 两个 `消し炭になあれ`：
  - 是两个独立 spell index
  - 必须先学到 `1 MP` 版
  - 同样输入之后才会继续落到 `20 MP` 版
- Web 修正：
  - [Game.vue](/c:/Users/旻/Documents/GitHub/snow-road-web/src/views/Game.vue) 的构筑匹配已改回“只认原版完整咒文名的精确匹配”
  - [spells.ts](/c:/Users/旻/Documents/GitHub/snow-road-web/src/types/spells.ts) 补上了原版短标签，供 `魔法` 侧栏显示

## 在原版里继续测试魔法的最短路径

若当前是 `MP 0/x`，先测试这三个 0 消耗咒文：

- `焦げろ`
- `ゆびさきにともしびを`
- `手のひらに太陽を`

之后：

1. 先在地图上施放 `ゆびさきにともしびを`
2. 再施放 `手のひらに太陽を`
3. 不要前进，因为前进会清空虚构 MP
4. 立刻回到 `呪文構築` 测 `消し炭になあれ / 爆ぜろ / 春よりも夏よりもあたたかい日`
5. 若要测 `己ならざるのぬくもりよ / 春ノ夢 / 夏ノ空`，必须先把真实 MP 回到 `3 / 5`

## 本轮落地文件

- [src/views/Game.vue](/c:/Users/旻/Documents/GitHub/snow-road-web/src/views/Game.vue)
- [src/stores/game.ts](/c:/Users/旻/Documents/GitHub/snow-road-web/src/stores/game.ts)
- [src/components/StatusPanel.vue](/c:/Users/旻/Documents/GitHub/snow-road-web/src/components/StatusPanel.vue)
- [src/types/spells.ts](/c:/Users/旻/Documents/GitHub/snow-road-web/src/types/spells.ts)

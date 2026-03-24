# 咒文构筑界面逆向摘录

本页只记录这次针对 `呪文構築` 界面的新增坐实项，证据来自：

- `temp_rh/FORMMAIN.dfm`
- `snow.exe` 反汇编 / 字符串表
- 原版实机截图对照

## 1. 页面结构不是自定义弹窗

`FORMMAIN.dfm` 直接定义了独立页 `PageSpell`：

- `PageSpell`: `600x400`
- `ImgSpell`
- `LabSpell`
- `LabSpellMP`
- `EditSpell`
- `BtnBuildSpell`

这说明原版的咒文构筑不是主界面上临时拼出的 overlay，而是固定页。

## 2. 控件坐标与样式

`FORMMAIN.dfm` 中 spell 页控件参数：

- `LabSpell`
  - `Left = 20`
  - `Top = 30`
  - `Width = 281`
  - `Height = 311`
  - `Font.Color = clAqua`
  - `Font.Height = -19`
  - `Font.Style = [fsBold, fsItalic]`
- `LabSpellMP`
  - `Left = 290`
  - `Top = 180`
  - `Width = 271`
  - `Height = 71`
  - `Alignment = taCenter`
  - 字体同 `LabSpell`
- `EditSpell`
  - `Left = 300`
  - `Top = 30`
  - `Width = 281`
  - `Height = 27`
  - `Color = 119`
  - `Font.Color = clRed`
  - `Font.Height = -19`
  - `Font.Style = [fsBold]`
- `BtnBuildSpell`
  - `Left = 390`
  - `Top = 70`
  - `Width = 191`
  - `Height = 31`
  - `Font.Height = -16`
  - `Font.Style = [fsBold]`

其中 `Color = 119` 对应深红底，和原版截图中的输入框底色一致。

## 3. 背景图是 `dat/selfclosed.bmp`

在 `snow.exe` 中：

- `dat/selfclosed.bmp` 字符串位于 `0x47C4E0`
- 初始化代码在 `0x47C473 ~ 0x47C486` 把它加载进 spell 页对应图像控件

结合 DFM 中 spell 页只有一个图像控件 `ImgSpell`，可以坐实：

- `呪文構築` 页背景图就是 `selfclosed.bmp`

## 4. 左侧列表的真实内容

`0x474B6C` 会重建 `LabSpell` 的 caption。

已确认：

- 它按 spell index `0 -> 9` 逐行输出
- 已习得时显示完整咒文名
- 未习得时显示 `Hidden`
- 对“只能用真实 MP”的咒文使用方括号
- 其他咒文使用圆括号

对应字符串：

- `0x474E68`: `- Hidden[`
- `0x474E7C`: `] -\r\n`
- `0x474E8C`: `- Hidden(`
- `0x474EA0`: `) -\r\n`

因此原版左栏不是标题或说明文，而是 10 行咒文列表。

## 5. MP 显示格式

`0x474C56 ~ 0x474D44` 会刷新 `LabSpellMP`。

对应字符串：

- `0x474EB0`: `ＭＰ：`
- `0x474EC0`: `＋`
- `0x474ECC`: `／`

规则：

- `maxMp <= 0` 时，`LabSpellMP` 为空
- `virtualMp > 0` 时显示 `ＭＰ：当前MP＋虚构MP／MaxMP`
- 否则显示 `ＭＰ：当前MP／MaxMP`

## 6. 输入框与按钮状态

`0x474D58 ~ 0x474E1E` 会根据状态改按钮 caption，并决定 `EditSpell` 是否显示。

对应字符串：

- `0x474ED8`: `調べ尽くした`
- `0x474EF0`: `EXIT`
- `0x474F00`: `つぶやく（残り１回）`
- `0x474F20`: `つぶやく（残り２回）`
- `0x474F40`: `つぶやく（残り３回）`

规则：

- 剩余 `3 / 2 / 1` 次时，按钮显示对应 `つぶやく`
- 剩余 `0` 次时按钮显示 `EXIT`
- 10 个咒文全部习得后按钮显示 `調べ尽くした`
- `EXIT / 調べ尽くした` 状态下，`EditSpell` 不显示

## 7. 原版没有额外“反馈栏”或 placeholder

spell 页的 DFM 控件只有：

- 背景图
- 左侧列表
- MP 标签
- 输入框
- 一个按钮

因此原版界面中没有：

- 额外标题
- 咒文构筑成本说明栏
- 输入框 placeholder
- 独立的“成功 / 失败反馈文本框”

成功与否的页面内反馈主要来自：

- 左侧列表是否更新为已习得咒文
- 按钮文案变化
- `spellNN.wav / bub.wav`

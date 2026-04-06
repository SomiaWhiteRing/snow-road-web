import { getLocalizedEquipmentName } from "../utils/equipmentLocalization";

export const ORIGINAL_CLEAR_RECORD_FILES = [
  "あとがき.txt",
  "おまけ.txt",
  "レポート.txt",
] as const;

export type OriginalClearRecordFile =
  (typeof ORIGINAL_CLEAR_RECORD_FILES)[number];

type OriginalFinishLocale = "zh" | "ja" | "en";

interface OriginalFinishTexts {
  clearDialogTitle: string;
  clearMessage: string;
  absoluteClearMessage: string;
  anotherQualificationTitle: string;
  anotherQualificationMessage: string;
  hellTitle: string;
  hellMessages: readonly string[];
  clearRecordTexts: Record<OriginalClearRecordFile, string>;
  getClearOutputMessage: (filename: OriginalClearRecordFile) => string;
}

export interface OriginalReportState {
  level: number;
  potential: number;
  hp: number;
  maxHp: number;
  maxMp: number;
  mp: number;
  baseAttack: number;
  baseDefense: number;
  hasMagic: boolean;
  learnedSpellStates: boolean[];
  scarred: boolean;
  cleared: boolean;
  absoluteCleared: boolean;
  weaponId?: string;
  weaponName?: string;
  weaponPower: number;
  armorId?: string;
  armorName?: string;
  armorPower: number;
  matches: number;
  litStars: number;
  totalStars: number;
  distance: number;
  stage: number;
}

const ORIGINAL_FINISH_TEXTS: Record<OriginalFinishLocale, OriginalFinishTexts> = {
  zh: {
    clearDialogTitle: "雪道",
    clearMessage: "通关",
    absoluteClearMessage: "绝对通关",
    anotherQualificationTitle: "有资格",
    anotherQualificationMessage: "要继续前往更前方的世界吗？",
    hellTitle: "地狱",
    hellMessages: ["再度成形，醒来了。", "从熔岩中爬了出来。"],
    clearRecordTexts: {
      "あとがき.txt": `【后记 - 关于寒冷】

　开始制作这个游戏，是几个月前某个夏日的事。那时候，我正因寒冷而发抖。因为房间里的空调开得太足了。那时房间里只有我一个人。除此之外谁也不在。所以我本来随时都可以不用顾虑任何人，想什么时候关掉空调都行。可是，我没有关掉空调。因为那台眼看就要热失控的笔记本电脑，必须连房间一起降温才行。不知为何，那台笔记本没有冷却风扇的排气口，买来还不到两年，看起来却已经相当衰弱了，稍微一热起来，就会发出像在痛苦呻吟般的嗡鸣声。即便如此，除了把整个房间都降温之外，我想不出任何能让它继续勉强运转的办法。这就是寒冷的背景。

　从前有位作家，因为受不了空调的寒冷，写下了诅咒空调的歌。然而我在空调的寒冷之中，反倒被激起了对冬日寒冷的憧憬。更准确地说，那份憧憬并不是针对寒冷本身，而是针对寒冷中的温暖，像是暖炉、火炉、肉包、篝火、炖菜电视广告里描绘出的东西，或是人的体温之类的那些事物。于是我一时兴起，做了一个“像是卖火柴的一个少女，在纷飞而降的雪道中行走”的软件。这就是《雪道》的原型。那时的画面构成，与如今的完成版几乎没有差别。之后我一边随手画出雪男ゆきお和雪女ゆきこ来阻拦少女的去路，一边放入旅店和自动贩卖机之类的设施，就这样逐渐把它充实成了 RPG。

　现在想来，最开始先做出了这场“飘落的雪”，大概正是促使我把本作完成的动力。

　本作能够被你玩到最后，实在非常感谢。

2005/11/08　ポーン`,
      "おまけ.txt": `辛苦了。未必是什么读来有趣的东西，不过还是把附加资料刊在下面。

【关于游戏系统的想法】
　为了今后在别处还能再利用，这次就把所采用的手法及其意图记录下来。

・一有机会就引入随机数
　⇒自动生成新的刺激
　　※注意：自动生成的新鲜感是有极限的

・旅店的价格是随机的
　⇒让玩家根据当时的状况与住宿费的高低，判断自己该不该住

・“失去一种有益之物，再得到另一种有益之物”的系统
　・支付基础ＨＰ来获得某种能力
　・支付基础ＨＰ来发动秘技
　・支付武器攻击力来发动驱动、过载驱动
　・支付防具防御力来发动翻转、超越翻转
　・消耗ＭＰ（＝魔法防御）来发动魔法
　・消耗星舞次数（＝星印的数量）来完全恢复
　・支付火柴（回复手段）来购买商品

　⇒要求玩家进行思考与价值判断

・越得到就越难再得到的参数：攻击力、防御力、MP、星印、等级
　⇒抑制平衡崩坏与数值膨胀

・通关简单，Another 难解
　⇒没时间的人、容易腻的人，只要顺利通关就可以了
　⇒觉得不够的人、还没腻的人，再去打 Another 就可以了

・可以保留 Stage 进度（可以回避 Boss 战）
　⇒让玩家自己调整平衡

・显示敌方状态值
　⇒因为本作需要连参数 1 点的差异都纳入考虑，所以公开了


【关于其他想法】
・尽量让画面简略
　⇒可以节省作画时间，因而能多画一些张数
　⇒也能让画所表现的东西更容易理解

・稍微改一改画再复用（主要是颜色）
　⇒做起来轻松，对玩家来说应该也算挺有趣

・玩心：咒文构筑
　⇒从游戏性上来说是个浪费很多的系统。算是换换心情。
　　※注意：如果加入太多这种玩心，就会变得像小游戏合集

・想到的点子尽量立刻实现
　⇒即使是觉得有趣的点子，过一阵子也可能不再觉得有趣。要趁它还没腐坏前实现。


【关于某件事】
　本作在这里刊出一部分源代码。不作解说。若能读懂，也许就会明白什么。

    101: begin
      setMainText(IntToStr(Enemy.Exp) + '点の経験値を得た。');
      Inc(Player.Exp, Enemy.Exp);
    end;
    102: begin
      if Player.Exp < NeedEXP then begin
        stepBattle(110);
        Exit;
      end;

      Dec(Player.Exp, NeedEXP);
      Inc(Player.LV);
      WavePlay('dat\\open.wav');
      setMainTextByPlayer('レベルが上がった！');
    end;
    103: begin
      dice := Random(6) + 1;
      bonus := dice + Player.Potential div 5;
      Inc(Player.MaxHP, bonus);
      setMainText('最大ＨＰが' + IntToStr(bonus) + '点上がった！');
      Inc(Player.Potential, 6 - dice);
    end;
    104: begin
      if (Player.MaxMP <= 0)or(Random(20) <> 0)or(Player.Potential < 5) then begin
        stepBattle;
        Exit;
      end;

      Dec(Player.Potential, 5);
      Inc(Player.MaxMP);
      setMainText('最大ＭＰが1点上がった！');
      updateSpec(Player);
    end;
    105: begin
      if (Random(20) <> 0)or(Player.Potential < 5) then begin
        stepBattle;
        Exit;
      end;

      Dec(Player.Potential, 5);
      Inc(Player.BaseATK);
      setMainText('攻撃力が1点上がった！');
      updateSpec(Player);
    end;
    106: begin
      if (Random(20) <> 0)or(Player.Potential < 5) then begin
        stepBattle;
        Exit;
      end;

      Dec(Player.Potential, 5);
      Inc(Player.BaseDEF);
      setMainText('防御力が1点上がった！');
      updateSpec(Player);
    end;`,
      "レポート.txt": "",
    },
    getClearOutputMessage: (filename) =>
      `辛苦了。\r\n已在文件夹中输出『${filename}』。\r\n（可在设置中的“通关记录”查看）`,
  },
  ja: {
    clearDialogTitle: "雪道",
    clearMessage: "クリア",
    absoluteClearMessage: "絶対クリア",
    anotherQualificationTitle: "資格あり",
    anotherQualificationMessage: "さらに先の世界へ進みますか？",
    hellTitle: "地獄",
    hellMessages: ["ふたたび形を成し、目覚めました。", "溶岩から這い出ました。"],
    clearRecordTexts: {
      "あとがき.txt": `【あとがき - 寒さについて】

　このゲームを作り始めたのは、今から数ヶ月前のある夏の日です。その頃、ぼくは寒さに震えていました。部屋でクーラーが効き過ぎだったからです。そのとき部屋にいたのはぼく一人だけでした。他には誰もいませんでした。だから僕は誰に遠慮することもなく、クーラーをいつだって止めることが出来ました。しかし、ぼくはクーラーを止めませんでした。なぜなら今にも熱暴走しそうなノートPCを、部屋ごと冷やす必要があったからです。どういう訳か冷却ファンの排気口を持っていないそのノートPCは、買ってから二年足らずで既にかなり衰弱していたようで、ちょっとあったまると苦悶するような唸り声をあげていました。それでもなお無理矢理運転させる手段を、部屋ごと冷やす以外に、僕は思いつくことができませんでした。これが寒さの背景です。

　昔ある作家は、クーラーの寒さに耐えかねてクーラーに対する呪詛を歌いました。しかし僕はクーラーの寒さの中で、むしろ冬の寒さに対する憧憬を引き起こされました。もっと正確に言えばその憧憬は寒さそのものに対するものではなく、寒さの中のあったかさ、暖炉だとかストーブだとか、肉まんだとか焚き火だとか、シチューのテレビCMで描かれるものだとか人肌だとか、そういったものでした。そして発作的に、「マッチ売りと思しき一人の少女が、舞い降る雪道の中を歩く」だけのソフトを作りました。これが雪道の原型です。その時の画面構成は現在の完成版とほとんど変わりません。そして雪男のゆきおと雪女のゆきこを殴り描きして少女の行く手を阻ませたり、宿や自販機などの施設を置いたりしていきながら、RPGとして作りこんでいきました。

　思うに、最初にこの「舞い降る雪」を作ったことが、本作を完成させるモチベーションになったのではないかと思います。

　本作を最後までプレイしてくださって、ありがとうございました。

2005/11/08　ポーン`,
      "おまけ.txt": `お疲れ様です。読んで面白いものではないかも知れませんが、以下におまけの資料を掲載します。

【ゲームシステムの考え方について】
　今後どこかで再利用するために、今回用いた手法とその意図を書き留めておきます。

・隙あらば乱数を介在させた
　⇒新しい刺激を自動生成する
　　※注意：自動生成される新しさには限界がある

・宿屋の値段がランダム
　⇒その時の状況と宿代の多寡によって、泊まるべきか否かを判断させる

・「ある有益なものを失って別の有益なものを得る」システム
　・基礎ＨＰを支払って何かの能力を得る
　・基礎ＨＰを支払って奥の手を発動
　・武器の攻撃力を支払ってドライヴ、オーバードライヴを発動
　・防具の防御力を支払ってフリップ、フリップフロップを発動
　・ＭＰ（＝魔法防御）を消費して魔法を発動
　・星舞回数（＝星印の数）を消費して完全回復
　・マッチ（回復手段）を支払って商品の購入

　⇒プレイヤーに思考、価値判断を要求する

・得れば得るほど得がたくなるパラメータ：攻撃力、防御力、MP、星印、レベル
　⇒バランス崩壊およびインフレの抑制

・クリアは簡単、アナザーは難解
　⇒時間がない人、飽き易い人は気分よくクリアだけすればいい
　⇒もの足りない人、飽きてない人はアナザーもやればいい

・ステージ進行を保留できる（ボス戦を回避できる）
　⇒プレイヤー自身によってバランスを調整させる

・敵ステータスの表示
　⇒本作の場合、パラメータ1点の違いも考慮する必要があったので公開した


【その他の考え方について】
・絵の簡略化を心がけた
　⇒描く時間を節約できる、その分多くの枚数を描ける
　⇒その絵によって表されるものが分かり易くなる

・絵をちょっとだけ変えて再利用（主に色）
　⇒作成が楽な割にはプレイヤーにとっても割と楽しいはず

・遊び：呪文構築
　⇒ゲーム的には無駄の多いシステム。気分転換。
　　※注意：あまり遊びを導入しすぎるとミニゲーム集のようになってしまう

・思いついたアイデアはなるべくすぐに実装した
　⇒面白いと思ったアイデアでも、時間が経つと面白く思えなくなる場合がある。腐る前に実装する。


【ある事について】
　本作の、ソースコードの一部を掲載します。解説はいたしません。読み解ければ、何かが分かるかも知れません。

    101: begin
      setMainText(IntToStr(Enemy.Exp) + '点の経験値を得た。');
      Inc(Player.Exp, Enemy.Exp);
    end;
    102: begin
      if Player.Exp < NeedEXP then begin
        stepBattle(110);
        Exit;
      end;

      Dec(Player.Exp, NeedEXP);
      Inc(Player.LV);
      WavePlay('dat\\open.wav');
      setMainTextByPlayer('レベルが上がった！');
    end;
    103: begin
      dice := Random(6) + 1;
      bonus := dice + Player.Potential div 5;
      Inc(Player.MaxHP, bonus);
      setMainText('最大ＨＰが' + IntToStr(bonus) + '点上がった！');
      Inc(Player.Potential, 6 - dice);
    end;
    104: begin
      if (Player.MaxMP <= 0)or(Random(20) <> 0)or(Player.Potential < 5) then begin
        stepBattle;
        Exit;
      end;

      Dec(Player.Potential, 5);
      Inc(Player.MaxMP);
      setMainText('最大ＭＰが1点上がった！');
      updateSpec(Player);
    end;
    105: begin
      if (Random(20) <> 0)or(Player.Potential < 5) then begin
        stepBattle;
        Exit;
      end;

      Dec(Player.Potential, 5);
      Inc(Player.BaseATK);
      setMainText('攻撃力が1点上がった！');
      updateSpec(Player);
    end;
    106: begin
      if (Random(20) <> 0)or(Player.Potential < 5) then begin
        stepBattle;
        Exit;
      end;

      Dec(Player.Potential, 5);
      Inc(Player.BaseDEF);
      setMainText('防御力が1点上がった！');
      updateSpec(Player);
    end;`,
      "レポート.txt": "",
    },
    getClearOutputMessage: (filename) =>
      `お疲れ様でした。\r\nフォルダに『${filename}』を出力しました。\r\n（設定の「記録」から確認できます）`,
  },
  en: {
    clearDialogTitle: "Snow Path",
    clearMessage: "Clear",
    absoluteClearMessage: "Absolute Clear",
    anotherQualificationTitle: "Qualified",
    anotherQualificationMessage: "Do you wish to proceed to the world beyond?",
    hellTitle: "Hell",
    hellMessages: [
      "It took shape once more and awoke.",
      "It crawled out from the lava.",
    ],
    clearRecordTexts: {
      "あとがき.txt": `【Afterword - On the Cold】

　I began making this game on a summer day a few months ago. Back then, I was shivering from the cold. The air conditioner in my room was working too well. At that time I was the only one in the room. No one else was there. So there was nothing stopping me from turning the air conditioner off whenever I wanted. But I did not turn it off. That was because I had to cool the entire room in order to cool down a notebook PC that looked as though it might overheat at any moment. For some reason that notebook PC, which had no exhaust vent for its cooling fan, already seemed badly worn out even though it had been less than two years since I bought it, and whenever it warmed up even a little it would let out groaning noises as if it were in agony. Even so, I could think of no way to keep forcing it to run other than cooling the entire room. That is the background of this cold.

　Long ago, a certain writer could not bear the cold of an air conditioner and sang a curse against it. But in the cold of the air conditioner, I instead found myself stirred into longing for winter cold. More precisely, that longing was not for cold itself, but for warmth within the cold: fireplaces, stoves, steamed buns, bonfires, the things shown in stew commercials on television, body heat, and such things. Then, on impulse, I made a piece of software in which “a lone girl, who seems to be a match seller, walks along a snow road where flakes are drifting down.” That was the prototype of Snow Path. The screen composition at that time was hardly different from the completed version now. Then, while sketching in Yukio the snowman and Yukiko the snow woman to block the girl's path, and placing inns, vending machines, and other facilities, I gradually developed it into an RPG.

　Looking back, I think that creating this “falling snow” first may have been what gave me the motivation to finish the work.

　Thank you very much for playing this work all the way to the end.

2005/11/08  Porn`,
      "おまけ.txt": `Thank you. This may not be especially entertaining to read, but I have included the bonus materials below.

【Thoughts on the Game System】
　I am writing down the methods I used this time, and the intentions behind them, so that I may reuse them somewhere in the future.

・I inserted randomness whenever there was room for it
　=> automatically generate fresh stimuli
　　* Note: there are limits to the novelty that can be generated automatically

・Inn prices are random
　=> make the player decide whether they should stay or not based on the situation at the time and the size of the fee

・A system of “losing one beneficial thing to gain another beneficial thing”
　・Pay base HP to gain some ability
　・Pay base HP to trigger the trump card
　・Pay weapon attack power to activate Drive / Overdrive
　・Pay armor defense power to activate Flip / Flip-Flop
　・Consume MP (= magic defense) to activate magic
　・Consume Star Dance count (= number of star marks) for full recovery
　・Pay matches (a means of recovery) to buy goods

　=> demands thought and value judgments from the player

・Parameters that become harder to gain the more you gain them: attack, defense, MP, star marks, level
　=> restrain balance collapse and inflation

・Clearing is easy; Another is difficult to decipher
　=> people without much time, or people who tire easily, can simply clear the game feeling satisfied
　=> people who want more, or have not yet tired of it, can also play Another

・Stage progression can be put on hold (boss battles can be avoided)
　=> let the player adjust the balance for themselves

・Display enemy stats
　=> in this work, even a difference of one point in a parameter needed to be taken into account, so I revealed them


【Other Thoughts】
・I tried to keep the artwork simple
　=> it saves drawing time, and lets me draw more images with that time
　=> it also makes what the picture represents easier to understand

・Slightly alter and reuse artwork (mainly color)
　=> easy to make, and should also be fairly enjoyable for the player

・A playful element: spell construction
　=> as a game system it contains much waste; a change of pace
　　* Note: if too many playful elements are introduced, it starts to feel like a collection of minigames

・I implemented ideas as soon as I thought of them
　=> even ideas that feel interesting may stop feeling interesting after time passes. Implement them before they rot.


【On a Certain Matter】
　I will present part of this work's source code. I will not explain it. If you can read it, perhaps you may understand something.

    101: begin
      setMainText(IntToStr(Enemy.Exp) + '点の経験値を得た。');
      Inc(Player.Exp, Enemy.Exp);
    end;
    102: begin
      if Player.Exp < NeedEXP then begin
        stepBattle(110);
        Exit;
      end;

      Dec(Player.Exp, NeedEXP);
      Inc(Player.LV);
      WavePlay('dat\\open.wav');
      setMainTextByPlayer('レベルが上がった！');
    end;
    103: begin
      dice := Random(6) + 1;
      bonus := dice + Player.Potential div 5;
      Inc(Player.MaxHP, bonus);
      setMainText('最大ＨＰが' + IntToStr(bonus) + '点上がった！');
      Inc(Player.Potential, 6 - dice);
    end;
    104: begin
      if (Player.MaxMP <= 0)or(Random(20) <> 0)or(Player.Potential < 5) then begin
        stepBattle;
        Exit;
      end;

      Dec(Player.Potential, 5);
      Inc(Player.MaxMP);
      setMainText('最大ＭＰが1点上がった！');
      updateSpec(Player);
    end;
    105: begin
      if (Random(20) <> 0)or(Player.Potential < 5) then begin
        stepBattle;
        Exit;
      end;

      Dec(Player.Potential, 5);
      Inc(Player.BaseATK);
      setMainText('攻撃力が1点上がった！');
      updateSpec(Player);
    end;
    106: begin
      if (Random(20) <> 0)or(Player.Potential < 5) then begin
        stepBattle;
        Exit;
      end;

      Dec(Player.Potential, 5);
      Inc(Player.BaseDEF);
      setMainText('防御力が1点上がった！');
      updateSpec(Player);
    end;`,
      "レポート.txt": "",
    },
    getClearOutputMessage: (filename) =>
      `Thank you.\r\n"${filename}" was written to the folder.\r\n(View it from "Record" in Settings.)`,
  },
};

const normalizeOriginalFinishLocale = (locale: string): OriginalFinishLocale => {
  const normalized = locale.toLowerCase();

  if (normalized.startsWith("en")) {
    return "en";
  }

  if (normalized.startsWith("zh")) {
    return "zh";
  }

  return "ja";
};

export const getOriginalFinishTexts = (locale: string): OriginalFinishTexts =>
  ORIGINAL_FINISH_TEXTS[normalizeOriginalFinishLocale(locale)];

const buildOriginalStageLine = (
  locale: OriginalFinishLocale,
  stage: number
): string => {
  if (stage <= 0) {
    return "";
  }

  if (stage === 9) {
    return locale === "zh"
      ? "位于 Stage Final。"
      : locale === "en"
        ? "At Stage Final."
        : "Stage Finalにいる。";
  }

  if (stage >= 10) {
    return locale === "zh"
      ? "位于 Stage Another。"
      : locale === "en"
        ? "At Stage Another."
        : "Stage Anotherにいる。";
  }

  return locale === "zh"
    ? `位于 Stage ${stage}。`
    : locale === "en"
      ? `At Stage ${stage}.`
      : `Stage ${stage}にいる。`;
};

const buildOriginalSpellLine = (state: OriginalReportState) =>
  Array.from({ length: 10 }, (_, index) =>
    state.learnedSpellStates[index] ? "らら" : "るー"
  ).join("");

const resolveOriginalReportEquipmentName = (
  locale: string,
  equipmentId: string | undefined,
  legacyName: string | undefined
) => {
  const localizedName = getLocalizedEquipmentName(equipmentId, locale);
  return localizedName || legacyName || "";
};

export const buildOriginalReportText = (
  locale: string,
  state: OriginalReportState
) => {
  const normalizedLocale = normalizeOriginalFinishLocale(locale);
  const weaponName = resolveOriginalReportEquipmentName(
    normalizedLocale,
    state.weaponId,
    state.weaponName
  );
  const armorName = resolveOriginalReportEquipmentName(
    normalizedLocale,
    state.armorId,
    state.armorName
  );
  const lines: string[] = [];

  if (normalizedLocale === "zh") {
    lines.push("- 雪道的足迹 -");
    lines.push("");
    lines.push(`等级：${state.level}`);
    lines.push(`潜力：${state.potential}`);
    lines.push(`ＨＰ：${state.hp}／${state.maxHp}`);
    if (state.maxMp > 0) {
      lines.push(`ＭＰ：${state.mp}／${state.maxMp}`);
    }
    lines.push(`基础攻击力：${state.baseAttack}`);
    lines.push(`基础防御力：${state.baseDefense}`);
    if (state.hasMagic) {
      lines.push(buildOriginalSpellLine(state));
    }
    if (state.scarred) {
      lines.push("傷アリ");
    }
    if (state.cleared) {
      lines.push("【通关】");
    }
    if (state.absoluteCleared) {
      lines.push("【埋葬了难以想象之物】");
    }
    lines.push("");
    if (weaponName) {
      lines.push(`武器：${weaponName}（${state.weaponPower}）`);
    }
    if (armorName) {
      lines.push(`防具：${armorName}（${state.armorPower}）`);
    }
    lines.push(`火柴${state.matches}根`);
    if (state.totalStars > 0) {
      lines.push("★".repeat(state.litStars) + "☆".repeat(state.totalStars - state.litStars));
    }
    lines.push("");
    lines.push(`${state.distance}步目`);
    const stageLine = buildOriginalStageLine(normalizedLocale, state.stage);
    if (stageLine) {
      lines.push(stageLine);
    }
    return lines.join("\n");
  }

  if (normalizedLocale === "en") {
    lines.push("- Footprints on Snow Path -");
    lines.push("");
    lines.push(`Level: ${state.level}`);
    lines.push(`Potential: ${state.potential}`);
    lines.push(`HP: ${state.hp}/${state.maxHp}`);
    if (state.maxMp > 0) {
      lines.push(`MP: ${state.mp}/${state.maxMp}`);
    }
    lines.push(`Base Attack: ${state.baseAttack}`);
    lines.push(`Base Defense: ${state.baseDefense}`);
    if (state.hasMagic) {
      lines.push(buildOriginalSpellLine(state));
    }
    if (state.scarred) {
      lines.push("Scarred");
    }
    if (state.cleared) {
      lines.push("[CLEAR]");
    }
    if (state.absoluteCleared) {
      lines.push("[LAID AN UNFATHOMABLE THING TO REST]");
    }
    lines.push("");
    if (weaponName) {
      lines.push(`Weapon: ${weaponName} (${state.weaponPower})`);
    }
    if (armorName) {
      lines.push(`Armor: ${armorName} (${state.armorPower})`);
    }
    lines.push(`Matches: ${state.matches}`);
    if (state.totalStars > 0) {
      lines.push("★".repeat(state.litStars) + "☆".repeat(state.totalStars - state.litStars));
    }
    lines.push("");
    lines.push(`Step ${state.distance}`);
    const stageLine = buildOriginalStageLine(normalizedLocale, state.stage);
    if (stageLine) {
      lines.push(stageLine);
    }
    return lines.join("\n");
  }

  lines.push("- 雪道の足跡 -");
  lines.push("");
  lines.push(`レベル：${state.level}`);
  lines.push(`ポテンシャル：${state.potential}`);
  lines.push(`ＨＰ：${state.hp}／${state.maxHp}`);
  if (state.maxMp > 0) {
    lines.push(`ＭＰ：${state.mp}／${state.maxMp}`);
  }
  lines.push(`基礎攻撃力：${state.baseAttack}`);
  lines.push(`基礎防御力：${state.baseDefense}`);
  if (state.hasMagic) {
    lines.push(buildOriginalSpellLine(state));
  }
  if (state.scarred) {
    lines.push("傷アリ");
  }
  if (state.cleared) {
    lines.push("【クリア】");
  }
  if (state.absoluteCleared) {
    lines.push("【とてつもないものを葬った】");
  }
  lines.push("");
  if (weaponName) {
    lines.push(`武器：${weaponName}（${state.weaponPower}）`);
  }
  if (armorName) {
    lines.push(`防具：${armorName}（${state.armorPower}）`);
  }
  lines.push(`マッチ${state.matches}本`);
  if (state.totalStars > 0) {
    lines.push("★".repeat(state.litStars) + "☆".repeat(state.totalStars - state.litStars));
  }
  lines.push("");
  lines.push(`${state.distance}歩目`);
  const stageLine = buildOriginalStageLine(normalizedLocale, state.stage);
  if (stageLine) {
    lines.push(stageLine);
  }
  return lines.join("\n");
};

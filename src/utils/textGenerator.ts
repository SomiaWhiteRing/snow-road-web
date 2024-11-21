interface TextGeneratorOptions {
  maxChars?: number;
  lineCount?: number;
  maxAttempts?: number;
}

export function generateControlText(
  texts: string[],
  options: TextGeneratorOptions = {}
): string[] {
  const {
    maxChars = /[a-zA-Z]/.test(texts[0]) ? 100 : 50,
    lineCount = 25,
    maxAttempts = 20
  } = options;

  // 获取字符串中所有句号和逗号的位置
  const getPunctuationPositions = (text: string): number[] => {
    const positions: number[] = [];
    let pos = -1;
    while ((pos = text.indexOf('。', pos + 1)) !== -1) {
      positions.push(pos);
    }
    pos = -1;
    while ((pos = text.indexOf('，', pos + 1)) !== -1) {
      positions.push(pos);
    }
    return positions.sort((a, b) => a - b);
  };

  // 检查两组标点位置是否有重叠
  const hasOverlappingPositions = (positions1: number[], positions2: number[]): boolean => {
    return positions1.some(pos => positions2.includes(pos));
  };

  const lines: string[] = [];
  let lastUsedTexts: string[] = [];
  let lastPunctuationPositions: number[] = [];

  // 将文本分割成句子
  const splitIntoSegments = (text: string): string[] => {
    // 使用更精确的分割方式，确保包含标点符号
    return text.split(/([^。，]+[。，])/).filter(segment => segment.trim().length > 0);
  };

  // 检查两行文本是否有重复的句子
  const hasRepeatingSegments = (text1: string, text2: string): boolean => {
    if (!text1 || !text2) return false;

    const segments1 = splitIntoSegments(text1);
    const segments2 = splitIntoSegments(text2);

    return segments1.some(segment =>
      segments2.some(seg2 =>
        // 移除标点符号后比较内容
        segment.replace(/[。，]/g, '') === seg2.replace(/[。，]/g, '')
      )
    );
  };

  // 生成单行文本
  const generateLine = (): string => {
    let attempts = 0;

    while (attempts < maxAttempts) {
      let selectedText = "";
      let availableTexts = texts.filter(text => !lastUsedTexts.includes(text));

      while (selectedText.length < maxChars && availableTexts.length > 0) {
        const randomIndex = Math.floor(Math.random() * availableTexts.length);
        const randomText = availableTexts[randomIndex];

        const tempText = selectedText + randomText;

        // 检查添加新文本后是否会与上一行产生重复
        if (lines.length > 0 && hasRepeatingSegments(lines[lines.length - 1], tempText)) {
          availableTexts = availableTexts.filter(t => t !== randomText);
          continue;
        }

        selectedText = tempText;
        lastUsedTexts = [randomText];
        availableTexts = texts.filter(text => !lastUsedTexts.includes(text));
      }

      if (selectedText.length > maxChars) {
        selectedText = selectedText.slice(0, maxChars);
      }

      const currentPunctuationPositions = getPunctuationPositions(selectedText);

      // 检查标点位置是否重叠
      if (!lastPunctuationPositions.length ||
        !hasOverlappingPositions(currentPunctuationPositions, lastPunctuationPositions)) {

        // 最后一次检查，确保没有重复
        if (lines.length === 0 || !hasRepeatingSegments(lines[lines.length - 1], selectedText)) {
          lastPunctuationPositions = currentPunctuationPositions;
          return selectedText;
        }
      }

      attempts++;
    }

    return "";
  };

  // 生成指定行数的文本
  for (let i = 0; i < lineCount; i++) {
    let lineText = generateLine();
    while (!lineText) {
      lineText = generateLine();
    }
    lines.push(lineText);
  }

  return lines;
} 
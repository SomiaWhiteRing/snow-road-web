import { assetManager } from "./assetManager";
import { normalizePlayerName } from "../utils/playerName";
import type { SupportedLocale } from "../utils/preferences";

export interface StoryFrame {
  imagePath: string;
  text: string;
}

export type StoryAction =
  | {
      type: "text";
      frame: StoryFrame;
    }
  | {
      type: "cg";
      imagePath: string;
    }
  | {
      type: "midi";
      track: string | null;
    }
  | {
      type: "wave";
      sound: string | null;
    }
  | {
      type: "getName";
      name: string;
    }
  | {
      type: "notext";
    }
  | {
      type: "incStage";
    }
  | {
      type: "end";
    }
  | {
      type: "finish";
    };

export interface StoryScript {
  actions: StoryAction[];
}

const normalizeStoryImagePath = (rawPath: string) => {
  const filename = rawPath.replace(/^dat[\\/]/i, "").trim();
  return `cg/${filename}`;
};

const normalizeMusicPath = (rawPath: string) => {
  const filename = rawPath.replace(/^dat[\\/]/i, "").trim();
  if (!filename) {
    return null;
  }

  return `music/${filename.replace(/\.mid$/i, ".mp3")}`;
};

const normalizeSoundPath = (rawPath: string) => {
  const filename = rawPath.replace(/^dat[\\/]/i, "").trim();
  if (!filename) {
    return null;
  }

  return `sound/${filename}`;
};

const pushTextAction = (
  actions: StoryAction[],
  imagePath: string,
  textLines: string[],
  allowEmpty = false
) => {
  if (!allowEmpty && textLines.length === 0) {
    return;
  }

  actions.push({
    type: "text",
    frame: {
      imagePath,
      text: textLines.join("\n"),
    },
  });
};

const getStoryAssetPath = (storyId: string, locale: SupportedLocale) =>
  locale === "ja" ? `story/${storyId}.txt` : `story/${locale}/${storyId}.txt`;

const isHtmlDocument = (content: string) =>
  /^\s*<!doctype html/i.test(content) || /^\s*<html/i.test(content);

export const loadStoryScript = async (
  storyId: string,
  locale: SupportedLocale = "ja"
): Promise<StoryScript> => {
  const assetPath = getStoryAssetPath(storyId, locale);
  let blob = await assetManager.getAsset(assetPath);
  let content = await blob.text();

  if (isHtmlDocument(content)) {
    blob = await assetManager.refreshAsset(assetPath);
    content = await blob.text();
  }

  if (isHtmlDocument(content)) {
    throw new Error(`Story asset is HTML instead of script: ${assetPath}`);
  }

  const lines = content.replace(/\r/g, "").split("\n");

  const actions: StoryAction[] = [];
  let currentImagePath = "";
  let textBuffer: string[] = [];

  for (const line of lines) {
    const lowerLine = line.toLowerCase();

    if (line === "") {
      pushTextAction(actions, currentImagePath, textBuffer, true);
      textBuffer = [];
      continue;
    }

    if (lowerLine === "#cg" || lowerLine.startsWith("#cg ")) {
      currentImagePath = normalizeStoryImagePath(line.slice(3).trim());
      actions.push({
        type: "cg",
        imagePath: currentImagePath,
      });
      continue;
    }

    if (lowerLine === "#midi" || lowerLine.startsWith("#midi ")) {
      actions.push({
        type: "midi",
        track: normalizeMusicPath(line.slice(5)),
      });
      continue;
    }

    if (lowerLine === "#wave" || lowerLine.startsWith("#wave ")) {
      actions.push({
        type: "wave",
        sound: normalizeSoundPath(line.slice(5)),
      });
      continue;
    }

    if (lowerLine === "#getname" || lowerLine.startsWith("#getname ")) {
      actions.push({
        type: "getName",
        name: normalizePlayerName(line.slice("#GetName ".length)),
      });
      continue;
    }

    if (lowerLine === "#notext") {
      actions.push({
        type: "notext",
      });
      continue;
    }

    if (lowerLine === "#incstage") {
      actions.push({
        type: "incStage",
      });
      continue;
    }

    if (lowerLine === "#end" || lowerLine === "#finish") {
      actions.push({
        type: lowerLine === "#finish" ? "finish" : "end",
      });
      continue;
    }

    if (line.startsWith("#")) {
      continue;
    }

    textBuffer.push(line);
  }

  pushTextAction(actions, currentImagePath, textBuffer);

  return {
    actions,
  };
};

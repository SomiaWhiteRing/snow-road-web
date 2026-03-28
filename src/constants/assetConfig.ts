import assetConfig from "../config/asset-config.json";

const trimTrailingSlash = (value: string) => value.replace(/\/+$/, "");

const normalizePathPrefix = (value: string) => {
  const pathname = new URL(value).pathname.replace(/\/+$/, "");
  return pathname === "" ? "/" : `${pathname}/`;
};

export const ASSET_BASE_URL = trimTrailingSlash(assetConfig.baseUrl);
export const ASSET_VERSION = assetConfig.version;
export const ASSET_URL_ORIGIN = new URL(ASSET_BASE_URL).origin;
export const ASSET_URL_PATH_PREFIX = normalizePathPrefix(ASSET_BASE_URL);

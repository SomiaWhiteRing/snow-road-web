import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { mkdir, readdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..", "..");
const infraConfigPath = path.resolve(__dirname, "assets.config.json");
const runtimeAssetConfigPath = path.resolve(
  projectRoot,
  "src",
  "config",
  "asset-config.json"
);
const runtimeAssetsDir = path.resolve(projectRoot, "public", "assets");

const infraConfig = JSON.parse(readFileSync(infraConfigPath, "utf8"));
const allowedOrigins = Array.isArray(infraConfig.allowedOrigins)
  ? infraConfig.allowedOrigins.filter((origin) => typeof origin === "string" && origin.length > 0)
  : [];

if (allowedOrigins.length === 0) {
  throw new Error("assets.config.json must include at least one allowedOrigins entry.");
}

const MIME_TYPES = new Map([
  [".png", "image/png"],
  [".bmp", "image/bmp"],
  [".mp3", "audio/mpeg"],
  [".wav", "audio/wav"],
  [".txt", "text/plain; charset=utf-8"],
]);

const parseDotEnv = (raw) => {
  const values = {};

  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    let value = trimmed.slice(separatorIndex + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    values[key] = value;
  }

  return values;
};

const getCloudflareToken = () => {
  if (process.env.CLOUDFLARE_API_TOKEN) {
    return process.env.CLOUDFLARE_API_TOKEN;
  }

  if (process.env.CLOUDFLARE_R2_TOKEN) {
    return process.env.CLOUDFLARE_R2_TOKEN;
  }

  const envLocalPath = path.resolve(projectRoot, ".env.local");
  if (!existsSync(envLocalPath)) {
    throw new Error(
      "Missing Cloudflare token. Set CLOUDFLARE_API_TOKEN or add CLOUDFLARE_R2_TOKEN to .env.local."
    );
  }

  const envValues = parseDotEnv(readFileSync(envLocalPath, "utf8"));
  const token = envValues.CLOUDFLARE_API_TOKEN ?? envValues.CLOUDFLARE_R2_TOKEN;
  if (!token) {
    throw new Error(
      "Cloudflare token not found. Expected CLOUDFLARE_API_TOKEN or CLOUDFLARE_R2_TOKEN."
    );
  }

  return token;
};

const cloudflareToken = getCloudflareToken();

const apiRequest = async (pathname, init = {}) => {
  const response = await fetch(`https://api.cloudflare.com/client/v4${pathname}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${cloudflareToken}`,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });

  const payload = await response.json();
  if (!response.ok || !payload.success) {
    throw new Error(
      `Cloudflare API request failed for ${pathname}: ${JSON.stringify(
        payload.errors ?? payload,
        null,
        2
      )}`
    );
  }

  return payload.result;
};

const createTempWranglerConfig = async () => {
  const tempDir = path.resolve(projectRoot, ".tmp", "cloudflare-assets");
  await mkdir(tempDir, { recursive: true });
  const configPath = path.resolve(tempDir, "wrangler.toml");
  const contents = [
    'name = "snow-road-web-assets"',
    'main = "noop.js"',
    'compatibility_date = "2026-03-28"',
    `account_id = "${infraConfig.accountId}"`,
    "",
  ].join("\n");

  await writeFile(configPath, contents, "utf8");
  return configPath;
};

const runWrangler = async (args) => {
  const configPath = await createTempWranglerConfig();
  const commandArgs = ["-y", "wrangler", ...args, "--config", configPath];

  return new Promise((resolve, reject) => {
    const child =
      process.platform === "win32"
        ? spawn(
            "cmd.exe",
            ["/d", "/s", "/c", "npx", ...commandArgs],
            {
              cwd: projectRoot,
              env: {
                ...process.env,
                CLOUDFLARE_API_TOKEN: cloudflareToken,
              },
              stdio: ["ignore", "pipe", "pipe"],
            }
          )
        : spawn("npx", commandArgs, {
            cwd: projectRoot,
            env: {
              ...process.env,
              CLOUDFLARE_API_TOKEN: cloudflareToken,
            },
            stdio: ["ignore", "pipe", "pipe"],
          });

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (chunk) => {
      stdout += String(chunk);
    });
    child.stderr.on("data", (chunk) => {
      stderr += String(chunk);
    });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) {
        resolve({ stdout, stderr });
        return;
      }

      reject(
        new Error(
          `Wrangler command failed (${args.join(" ")}):\n${stdout}\n${stderr}`
        )
      );
    });
  });
};

const listFilesRecursively = async (rootDir) => {
  const entries = await readdir(rootDir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(rootDir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await listFilesRecursively(fullPath)));
      continue;
    }

    files.push(fullPath);
  }

  return files.sort();
};

const computeAssetVersion = async () => {
  const hash = createHash("sha256");
  const assetFiles = await listFilesRecursively(runtimeAssetsDir);

  for (const filePath of assetFiles) {
    const relativePath = path
      .relative(runtimeAssetsDir, filePath)
      .split(path.sep)
      .join("/");
    hash.update(relativePath);
    hash.update("\n");
    hash.update(await readFile(filePath));
    hash.update("\n");
  }

  return hash.digest("hex").slice(0, 16);
};

const getContentType = (filePath) =>
  MIME_TYPES.get(path.extname(filePath).toLowerCase()) ??
  "application/octet-stream";

const updateRuntimeAssetConfig = async (assetVersion) => {
  const nextConfig = {
    baseUrl: infraConfig.publicBaseUrl,
    version: assetVersion,
  };
  const serialized = `${JSON.stringify(nextConfig, null, 2)}\n`;
  const previous = existsSync(runtimeAssetConfigPath)
    ? readFileSync(runtimeAssetConfigPath, "utf8")
    : null;

  if (previous !== serialized) {
    await writeFile(runtimeAssetConfigPath, serialized, "utf8");
  }
};

const ensureBucket = async () => {
  const result = await apiRequest(
    `/accounts/${infraConfig.accountId}/r2/buckets`
  );
  const bucketExists = result.buckets.some(
    (bucket) => bucket.name === infraConfig.bucketName
  );

  if (bucketExists) {
    return;
  }

  await apiRequest(`/accounts/${infraConfig.accountId}/r2/buckets`, {
    method: "POST",
    body: JSON.stringify({
      name: infraConfig.bucketName,
    }),
  });
};

const ensureCustomDomain = async () => {
  const result = await apiRequest(
    `/accounts/${infraConfig.accountId}/r2/buckets/${infraConfig.bucketName}/domains/custom`
  );
  const attached = result.domains.some(
    (domain) => domain.domain === infraConfig.publicDomain
  );

  if (attached) {
    return;
  }

  await runWrangler([
    "r2",
    "bucket",
    "domain",
    "add",
    infraConfig.bucketName,
    "--domain",
    infraConfig.publicDomain,
    "--zone-id",
    infraConfig.zoneId,
    "--min-tls",
    "1.2",
    "--force",
  ]);
};

const ensureCorsPolicy = async () => {
  const corsRules = {
    rules: [
      {
        allowed: {
          origins: allowedOrigins,
          methods: ["GET", "HEAD"],
          headers: ["*"],
        },
        exposeHeaders: [
          "Accept-Ranges",
          "Content-Length",
          "Content-Range",
          "Content-Type",
          "ETag",
        ],
        maxAgeSeconds: 86400,
      },
    ],
  };

  await apiRequest(
    `/accounts/${infraConfig.accountId}/r2/buckets/${infraConfig.bucketName}/cors`,
    {
      method: "PUT",
      body: JSON.stringify(corsRules),
    }
  );
};

const uploadAssetFile = async (filePath) => {
  const relativePath = path
    .relative(runtimeAssetsDir, filePath)
    .split(path.sep)
    .join("/");

  const args = [
    "r2",
    "object",
    "put",
    `${infraConfig.bucketName}/${relativePath}`,
    "--file",
    filePath,
    "--remote",
    "--content-type",
    getContentType(filePath),
    "--cache-control",
    "public, max-age=31536000, immutable",
  ];

  await runWrangler(args);
  return relativePath;
};

const uploadAllAssets = async () => {
  const assetFiles = await listFilesRecursively(runtimeAssetsDir);
  const concurrency = 6;
  let index = 0;
  let completed = 0;

  const worker = async () => {
    while (index < assetFiles.length) {
      const fileIndex = index++;
      const filePath = assetFiles[fileIndex];
      const relativePath = await uploadAssetFile(filePath);
      completed++;
      console.log(
        `[upload ${completed}/${assetFiles.length}] ${relativePath}`
      );
    }
  };

  await Promise.all(
    Array.from({ length: Math.min(concurrency, assetFiles.length) }, worker)
  );
};

const verifyPublishedAssetWithCurl = async (assetUrl) =>
  new Promise((resolve, reject) => {
    const verifyOrigin = allowedOrigins[0];
    const child = spawn(
      process.platform === "win32" ? "curl.exe" : "curl",
      [
        "--head",
        "--fail",
        "--silent",
        "--show-error",
        "--location",
        "--max-time",
        "30",
        "--header",
        `Origin: ${verifyOrigin}`,
        assetUrl,
      ],
      {
        cwd: projectRoot,
        env: process.env,
        stdio: ["ignore", "pipe", "pipe"],
      }
    );

    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => {
      stdout += String(chunk);
    });
    child.stderr.on("data", (chunk) => {
      stderr += String(chunk);
    });
    child.on("error", reject);
    child.on("close", (code) => {
      const corsHeaderMatch = stdout.match(
        /^access-control-allow-origin:\s*(.+)$/im
      );
      const accessControlAllowOrigin = corsHeaderMatch?.[1]?.trim() ?? null;

      if (code === 0) {
        if (accessControlAllowOrigin !== verifyOrigin) {
          reject(
            new Error(
              `Published asset verification failed with curl: expected access-control-allow-origin=${verifyOrigin}, received ${accessControlAllowOrigin ?? "null"}`
            )
          );
          return;
        }

        resolve();
        return;
      }

      reject(
        new Error(
          `Published asset verification failed with curl: ${stderr || `exit code ${code}`}`
        )
      );
    });
  });

const verifyPublishedAsset = async () => {
  const assetUrl = `${infraConfig.publicBaseUrl}/sprite/title.png`;
  const verifyOrigin = allowedOrigins[0];
  try {
    const response = await fetch(assetUrl, {
      headers: {
        Origin: verifyOrigin,
      },
    });

    if (!response.ok) {
      throw new Error(
        `Published asset verification failed: ${response.status} ${response.statusText}`
      );
    }

    const accessControlAllowOrigin = response.headers.get("access-control-allow-origin");
    if (accessControlAllowOrigin !== verifyOrigin) {
      throw new Error(
        `Published asset verification failed: expected access-control-allow-origin=${verifyOrigin}, received ${accessControlAllowOrigin ?? "null"}`
      );
    }
  } catch (error) {
    if (process.platform !== "win32") {
      throw error;
    }

    await verifyPublishedAssetWithCurl(assetUrl);
  }
};

const verifyDnsRecord = async () => {
  const result = await apiRequest(
    `/zones/${infraConfig.zoneId}/dns_records?type=CNAME&name=${encodeURIComponent(
      infraConfig.publicDomain
    )}`
  );

  if (result.length === 0) {
    throw new Error(
      `DNS record for ${infraConfig.publicDomain} was not found after custom domain setup.`
    );
  }
};

const main = async () => {
  console.log(`Using bucket ${infraConfig.bucketName}`);
  console.log(`Using public asset domain ${infraConfig.publicDomain}`);

  await ensureBucket();
  await ensureCustomDomain();
  await ensureCorsPolicy();

  const assetVersion = await computeAssetVersion();
  console.log(`Computed asset version ${assetVersion}`);
  await updateRuntimeAssetConfig(assetVersion);

  await uploadAllAssets();
  await verifyDnsRecord();
  await verifyPublishedAsset();

  console.log("Asset publish completed successfully.");
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

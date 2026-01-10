import fs from "fs";
import path from "path";
import * as yaml from "js-yaml";

type SupabaseConfig = {
  url: string;
  anon_key: string;
};

type AppConfig = {
  supabase: SupabaseConfig;
};

type RootConfig = {
  config: AppConfig;
};

function findUp(fileName: string, startDir = process.cwd()): string | null {
  let dir = startDir;
  while (true) {
    const candidate = path.join(dir, fileName);
    if (fs.existsSync(candidate)) return candidate;
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return null;
}

const CONFIG_PATH =
  findUp("config.yaml") || path.resolve(process.cwd(), "config.yaml");

function loadConfig(filePath: string): RootConfig {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Config file not found at ${filePath}`);
  }
  const content = fs.readFileSync(filePath, "utf8");
  const parsed = yaml.load(content) as unknown;
  if (
    !parsed ||
    typeof parsed !== "object" ||
    !("config" in (parsed as any)) ||
    !(parsed as any).config?.supabase
  ) {
    throw new Error(
      "Invalid config structure. Expected: config.supabase.{url,anon_key}"
    );
  }
  return parsed as RootConfig;
}

const rootConfig = loadConfig(CONFIG_PATH);

export const config: AppConfig = rootConfig.config;
export const supabase = config.supabase;

export default config;

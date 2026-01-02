import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

interface BuildConfig {
  mode: "auto" | "review";
  validationEnabled: boolean;
  maxRetries: number;
}

const DEFAULT_CONFIG: BuildConfig = {
  mode: "auto",
  validationEnabled: false,
  maxRetries: 3,
};

function getLandfallDir(): string {
  return path.join(
    process.env.LANDFALL_PROJECT_PATH || process.cwd(),
    "landfall"
  );
}

function getConfigPath(): string {
  return path.join(getLandfallDir(), "prompts", ".build-config.json");
}

export async function GET() {
  try {
    const configPath = getConfigPath();

    let config: BuildConfig = { ...DEFAULT_CONFIG };
    try {
      const content = await fs.readFile(configPath, "utf-8");
      config = { ...DEFAULT_CONFIG, ...JSON.parse(content) };
    } catch {
      // Use defaults if file doesn't exist
    }

    return NextResponse.json(config);
  } catch (error) {
    console.error("Error reading build config:", error);
    return NextResponse.json(
      { error: "Failed to read build config" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const configPath = getConfigPath();
    const body = await request.json();

    // Load existing config and merge with updates
    let existingConfig: BuildConfig = { ...DEFAULT_CONFIG };
    try {
      const content = await fs.readFile(configPath, "utf-8");
      existingConfig = { ...DEFAULT_CONFIG, ...JSON.parse(content) };
    } catch {
      // Use defaults if file doesn't exist
    }

    // Validate and apply updates
    const updatedConfig: BuildConfig = { ...existingConfig };

    if (body.mode !== undefined) {
      if (body.mode !== "auto" && body.mode !== "review") {
        return NextResponse.json(
          { error: "mode must be 'auto' or 'review'" },
          { status: 400 }
        );
      }
      updatedConfig.mode = body.mode;
    }

    if (body.validationEnabled !== undefined) {
      if (typeof body.validationEnabled !== "boolean") {
        return NextResponse.json(
          { error: "validationEnabled must be a boolean" },
          { status: 400 }
        );
      }
      updatedConfig.validationEnabled = body.validationEnabled;
    }

    if (body.maxRetries !== undefined) {
      if (typeof body.maxRetries !== "number" || body.maxRetries < 0) {
        return NextResponse.json(
          { error: "maxRetries must be a non-negative number" },
          { status: 400 }
        );
      }
      updatedConfig.maxRetries = body.maxRetries;
    }

    // Ensure the prompts directory exists
    const promptsDir = path.dirname(configPath);
    await fs.mkdir(promptsDir, { recursive: true });

    // Save the updated config
    await fs.writeFile(
      configPath,
      JSON.stringify(updatedConfig, null, 2),
      "utf-8"
    );

    return NextResponse.json(updatedConfig);
  } catch (error) {
    console.error("Error updating build config:", error);
    return NextResponse.json(
      { error: "Failed to update build config" },
      { status: 500 }
    );
  }
}

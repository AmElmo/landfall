import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

function getLandfallDir(): string {
  // In development, use the LANDFALL_PROJECT_PATH env var set by the CLI
  // Fall back to a test directory for development
  const projectPath = process.env.LANDFALL_PROJECT_PATH || process.cwd();
  return path.join(projectPath, "landfall");
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params;
    const landfallDir = getLandfallDir();
    const filePath = path.join(landfallDir, `${filename}.json`);

    const content = await fs.readFile(filePath, "utf-8");
    return NextResponse.json(JSON.parse(content));
  } catch (error) {
    console.error("Error reading config file:", error);
    return NextResponse.json(
      { error: "Failed to read config file" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params;
    const landfallDir = getLandfallDir();
    const filePath = path.join(landfallDir, `${filename}.json`);
    const data = await request.json();

    await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error writing config file:", error);
    return NextResponse.json(
      { error: "Failed to write config file" },
      { status: 500 }
    );
  }
}

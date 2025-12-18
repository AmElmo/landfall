import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

function getLandfallDir(): string {
  const projectPath = process.env.LANDFALL_PROJECT_PATH || process.cwd();
  return path.join(projectPath, "landfall");
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sectionType: string }> }
) {
  try {
    const { sectionType } = await params;
    const landfallDir = getLandfallDir();
    const filePath = path.join(landfallDir, "wireframe-templates", `${sectionType}.json`);

    const content = await fs.readFile(filePath, "utf-8");
    return NextResponse.json(JSON.parse(content));
  } catch {
    // Return empty templates array for section types without templates
    // This is expected for section types that don't have wireframe templates yet
    return NextResponse.json({ sectionType: params, templates: [] });
  }
}

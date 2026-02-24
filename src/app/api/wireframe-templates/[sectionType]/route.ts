import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

function getWireframeTemplatesDir(): string {
  return path.join(process.cwd(), "src", "data", "wireframe-templates");
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sectionType: string }> }
) {
  try {
    const { sectionType } = await params;
    const templatesDir = getWireframeTemplatesDir();
    const filePath = path.join(templatesDir, `${sectionType}.json`);

    const content = await fs.readFile(filePath, "utf-8");
    return NextResponse.json(JSON.parse(content));
  } catch {
    // Return empty templates array for section types without templates
    // This is expected for section types that don't have wireframe templates yet
    return NextResponse.json({ sectionType: params, templates: [] });
  }
}

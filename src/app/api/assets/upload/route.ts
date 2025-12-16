import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

function getLandfallDir(): string {
  const projectPath = process.env.LANDFALL_PROJECT_PATH || process.cwd();
  return path.join(projectPath, "landfall");
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const category = formData.get("category") as string || "style-inspirations";

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    const landfallDir = getLandfallDir();
    const assetsDir = path.join(landfallDir, "assets", category);

    // Ensure directory exists
    await fs.mkdir(assetsDir, { recursive: true });

    // Generate unique filename
    const ext = path.extname(file.name);
    const baseName = path.basename(file.name, ext).replace(/[^a-zA-Z0-9-_]/g, "-");
    const uniqueName = `${baseName}-${randomUUID().slice(0, 8)}${ext}`;
    const filePath = path.join(assetsDir, uniqueName);

    // Write file
    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(filePath, buffer);

    // Return relative path from landfall directory
    const relativePath = `assets/${category}/${uniqueName}`;

    return NextResponse.json({
      success: true,
      path: relativePath,
      filename: uniqueName,
    });
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}

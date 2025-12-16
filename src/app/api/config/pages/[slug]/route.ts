import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

function getLandfallDir(): string {
  const projectPath = process.env.LANDFALL_PROJECT_PATH || process.cwd();
  return path.join(projectPath, "landfall");
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const landfallDir = getLandfallDir();
    const filePath = path.join(landfallDir, "pages", `${slug}.json`);

    const content = await fs.readFile(filePath, "utf-8");
    return NextResponse.json(JSON.parse(content));
  } catch (error) {
    console.error("Error reading page file:", error);
    return NextResponse.json(
      { error: "Failed to read page file" },
      { status: 404 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const landfallDir = getLandfallDir();
    const filePath = path.join(landfallDir, "pages", `${slug}.json`);
    const data = await request.json();

    await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error writing page file:", error);
    return NextResponse.json(
      { error: "Failed to write page file" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const landfallDir = getLandfallDir();
    const filePath = path.join(landfallDir, "pages", `${slug}.json`);
    const data = await request.json();

    // Check if file already exists
    try {
      await fs.access(filePath);
      return NextResponse.json(
        { error: "Page already exists" },
        { status: 409 }
      );
    } catch {
      // File doesn't exist, create it
      await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
      return NextResponse.json({ success: true }, { status: 201 });
    }
  } catch (error) {
    console.error("Error creating page file:", error);
    return NextResponse.json(
      { error: "Failed to create page file" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const landfallDir = getLandfallDir();
    const filePath = path.join(landfallDir, "pages", `${slug}.json`);

    await fs.unlink(filePath);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting page file:", error);
    return NextResponse.json(
      { error: "Failed to delete page file" },
      { status: 500 }
    );
  }
}

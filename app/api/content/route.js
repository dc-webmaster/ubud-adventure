import { NextResponse } from 'next/server';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const contentFile = join(process.cwd(), 'data', 'content.json');

const readContentFile = () => {
  try {
    const file = readFileSync(contentFile, 'utf8');
    return JSON.parse(file);
  } catch (error) {
    return null;
  }
};

const writeContentFile = (content) => {
  writeFileSync(contentFile, JSON.stringify(content, null, 2), 'utf8');
};

export async function GET() {
  const existing = readContentFile();
  if (!existing) {
    return new NextResponse('Content not found', { status: 404 });
  }

  return NextResponse.json(existing);
}

export async function PUT(request) {
  try {
    const data = await request.json();
    const existing = readContentFile();
    if (!existing) {
      return new NextResponse('Content not found', { status: 404 });
    }

    const updated = {
      ...existing,
      ...data,
      prices: {
        ...existing.prices,
        ...(data.prices || {})
      }
    };

    writeContentFile(updated);
    return NextResponse.json(updated);
  } catch (error) {
    return new NextResponse('Bad request', { status: 400 });
  }
}

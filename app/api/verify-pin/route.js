import { NextResponse } from 'next/server';

const ADMIN_PIN = process.env.ADMIN_PIN || '1234';

export async function POST(request) {
  try {
    const { pin } = await request.json();

    if (typeof pin !== 'string') {
      return new NextResponse('Invalid request body', { status: 400 });
    }

    return pin === ADMIN_PIN
      ? NextResponse.json({ success: true })
      : new NextResponse('Unauthorized', { status: 401 });
  } catch (error) {
    return new NextResponse('Bad request', { status: 400 });
  }
}

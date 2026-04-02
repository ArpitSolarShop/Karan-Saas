import { NextResponse } from 'next/server';

const API_BASE = 'http://localhost:3001/deals';

export async function GET() {
  try {
    const res = await fetch(API_BASE, { cache: 'no-store' });
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch deals from NestJS backend' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const res = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create deal' }, { status: 500 });
  }
}

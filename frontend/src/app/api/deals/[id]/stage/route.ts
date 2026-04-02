import { NextResponse } from 'next/server';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const body = await req.json();
    const res = await fetch(\`http://localhost:3001/deals/\${id}/stage\`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update deal stage in NestJS backend' }, { status: 500 });
  }
}

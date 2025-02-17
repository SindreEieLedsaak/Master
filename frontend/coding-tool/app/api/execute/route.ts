import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { code } = await request.json();
  // Simulated output:
  const simulatedOutput = "Same car";
  return NextResponse.json({ output: simulatedOutput });
}

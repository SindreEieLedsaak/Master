// /app/api/call-fastapi/route.ts
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  // Parse the incoming JSON body from the client
  const { code } = await request.json();

  // Call your local FastAPI endpoint running on localhost:8000/analyze-code
  const fastApiResponse = await fetch('http://localhost:8000/analyze-code', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code })
  });

  // Optionally, check if the request was successful
  if (!fastApiResponse.ok) {
    // You can forward the error status and message, or handle it differently
    return NextResponse.json(
      { error: 'Failed to analyze code' },
      { status: fastApiResponse.status }
    );
  }

  // Parse the JSON response from FastAPI
  const result = await fastApiResponse.json();

  // Return the FastAPI result as the response to the client
  return NextResponse.json(result);
}

import { NextRequest, NextResponse } from 'next/server'

const counts = { eventsScheduled: 0, draftsCreated: 0, invitesSent: 0 }

export async function GET() {
  return NextResponse.json(counts)
}

export async function POST(req: NextRequest) {
  const { event } = await req.json()
  if (event === 'event_scheduled') counts.eventsScheduled++
  if (event === 'draft_created') counts.draftsCreated++
  if (event === 'invite_sent') counts.invitesSent++
  return NextResponse.json({ ok: true })
}

import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { password } = await req.json()
    if (!password || password !== process.env.MISSION_CONTROL_PASSWORD) {
      return NextResponse.json({ ok: false }, { status: 401 })
    }

    const response = NextResponse.json({ ok: true })
    response.cookies.set('mc-auth', 'authenticated', {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/'
    })
    return response
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 })
  }
}

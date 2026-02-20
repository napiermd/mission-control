import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const { password } = await request.json()
  
  if (password === process.env.MISSION_CONTROL_PASSWORD) {
    const response = NextResponse.json({ success: true })
    response.cookies.set('mc-auth', 'authenticated', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/'
    })
    return response
  }
  
  return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
}

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { auth } from './lib/auth'
import { headers } from 'next/headers'


export async function proxy(request: NextRequest) {
 
  if (
    request.nextUrl.pathname === "/studios/about-us" ||
    request.nextUrl.pathname === "/studios" ||
    request.nextUrl.pathname.startsWith("/studios/")
  ) {
    return NextResponse.next()
  }

  const session = await auth.api.getSession({
    headers: await headers()
  })
  const user = session?.user
  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}



export const config = {
  matcher: ['/add-studio','/my-listings','/my-bookings','/profile'],
}
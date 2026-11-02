import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { auth } from './lib/auth'
import { headers } from 'next/headers'


export async function proxy(request: NextRequest) {
  // The About page is public marketing content, unlike the studio routes below.
  if (request.nextUrl.pathname === "/studios/about-us") {
    return NextResponse.next()
  }

  const session = await auth.api.getSession({
    headers: await headers()
  })
  const user = session?.user
  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
}



export const config = {
  matcher: ['/add-studio','/studios/:path','/my-listings','/my-bookings','/profile'],
}
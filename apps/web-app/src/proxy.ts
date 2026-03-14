import { NextResponse } from 'next/server';

import { auth } from '@/lib/auth/auth';

export default auth((request) => {
  const requestId = request.headers.get('x-request-id') ?? crypto.randomUUID();

  const response = NextResponse.next();
  response.headers.set('x-request-id', requestId);

  return response;
});

export const config = {
  matcher: ['/((?!auth|api/auth|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|ico|webp)$).*)'],
};

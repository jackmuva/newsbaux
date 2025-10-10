import { NextRequest, NextResponse } from 'next/server';
import authConfig from '../auth.config';
import NextAuth from 'next-auth';

const { auth } = NextAuth(authConfig)
export default auth(async function middleware(request: NextRequest) {
	const requestHeaders = new Headers(request.headers);
	requestHeaders.set('x-url', request.url);

	return NextResponse.next({
		request: {
			headers: requestHeaders,
		}
	});
});

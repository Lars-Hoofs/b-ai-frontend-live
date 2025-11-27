import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxyRequest(request, path);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxyRequest(request, path);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxyRequest(request, path);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxyRequest(request, path);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxyRequest(request, path);
}

async function proxyRequest(request: NextRequest, pathArray: string[]) {
  const path = pathArray.join('/');
  const url = `${BACKEND_URL}/api/${path}`;
  
  // Get search params
  const searchParams = request.nextUrl.searchParams.toString();
  const fullUrl = searchParams ? `${url}?${searchParams}` : url;

  console.log('[Proxy]', request.method, fullUrl);
  console.log('[Proxy] Request cookies:', request.headers.get('cookie'));

  // Forward headers including cookies
  const headers = new Headers();
  request.headers.forEach((value, key) => {
    // Skip host header
    if (key.toLowerCase() !== 'host') {
      headers.set(key, value);
    }
  });

  // Get body for non-GET requests
  let body = undefined;
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    try {
      body = await request.text();
    } catch (e) {
      // No body
    }
  }

  // Make request to backend
  try {
    const response = await fetch(fullUrl, {
      method: request.method,
      headers,
      body,
      credentials: 'include',
    });

    // Get response body
    const responseBody = await response.text();

    console.log('[Proxy] Response status:', response.status);
    console.log('[Proxy] Response Set-Cookie:', response.headers.get('set-cookie'));
    // console.log('[Proxy] Response body:', responseBody.substring(0, 200));

    // Create response with same status and headers
    const nextResponse = new NextResponse(responseBody, {
      status: response.status,
      statusText: response.statusText,
    });

    // Forward all response headers
    response.headers.forEach((value, key) => {
      // Skip set-cookie header, we'll handle it separately
      if (key.toLowerCase() !== 'set-cookie') {
        nextResponse.headers.set(key, value);
      }
    });

    // Handle Set-Cookie headers specially to ensure proper cookie forwarding
    // Better Auth may set multiple cookies, so we need to get all of them
    const setCookieHeaders: string[] = [];
    
    // Fetch API doesn't support multiple headers with the same name well,
    // so we need to work around this
    response.headers.forEach((value, key) => {
      if (key.toLowerCase() === 'set-cookie') {
        setCookieHeaders.push(value);
      }
    });

    if (setCookieHeaders.length > 0) {
      setCookieHeaders.forEach(cookie => {
        // In development, modify SameSite to Lax for cross-origin cookie support
        const modifiedCookie = cookie
          .split(';')
          .map(part => {
            const trimmed = part.trim();
            // Replace Strict with Lax in dev mode for better compatibility
            if (trimmed.toLowerCase().startsWith('samesite=')) {
              return 'SameSite=Lax';
            }
            // Remove Secure in development (localhost)
            if (trimmed.toLowerCase() === 'secure') {
              return '';
            }
            return part;
          })
          .filter(Boolean)
          .join(';');
        
        nextResponse.headers.append('Set-Cookie', modifiedCookie);
        console.log('[Proxy] Modified Set-Cookie:', modifiedCookie);
      });
    }

    return nextResponse;
  } catch (error: any) {
    console.error('[Proxy] Error fetching from backend:', error);
    return NextResponse.json(
      { 
        error: 'Proxy Error', 
        message: error.message,
        details: 'Failed to connect to backend',
        backendUrl: BACKEND_URL,
        targetUrl: fullUrl
      },
      { status: 502 } // Bad Gateway
    );
  }
}

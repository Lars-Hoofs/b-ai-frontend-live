import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = 'https://api.bonsaimedia.nl';

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
    console.log('[Proxy] Response body:', responseBody.substring(0, 500)); // Log detailed error from backend

    // Create response with same status and headers
    const nextResponse = new NextResponse(responseBody, {
      status: response.status,
      statusText: response.statusText,
    });

    // Detect if we're in production (HTTPS) or development (HTTP)
    const isProduction = request.url.startsWith('https://');
    console.log('[Proxy] Environment:', isProduction ? 'PRODUCTION' : 'DEVELOPMENT');

    // Forward all response headers EXCEPT Set-Cookie and HSTS (in dev)
    response.headers.forEach((value, key) => {
      const lowerKey = key.toLowerCase();
      if (lowerKey === 'set-cookie') return;
      if (!isProduction && lowerKey === 'strict-transport-security') return;
      nextResponse.headers.set(key, value);
    });

    // Handle Set-Cookie headers specially using getSetCookie() (Node 18+/Next.js)
    let cookies: string[] = [];
    if (typeof response.headers.getSetCookie === 'function') {
      cookies = response.headers.getSetCookie();
    } else {
      // Fallback
      const headerVal = response.headers.get('set-cookie');
      if (headerVal) cookies = [headerVal];
    }

    if (cookies.length > 0) {
      cookies.forEach(cookie => {
        let modifiedCookie = cookie;
        if (!isProduction) {
          // DEVELOPMENT: Modify cookies to work with localhost
          modifiedCookie = cookie
            .split(';')
            .map(part => {
              const trimmed = part.trim();
              const lowerPart = trimmed.toLowerCase();
              if (lowerPart.startsWith('samesite=')) return 'SameSite=Lax';
              if (lowerPart === 'secure') return '';
              if (lowerPart.startsWith('domain=')) return '';
              return part;
            })
            .filter(Boolean)
            .join(';');
          console.log('[Proxy] Modified cookie:', modifiedCookie);
        }
        nextResponse.headers.append('Set-Cookie', modifiedCookie);
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

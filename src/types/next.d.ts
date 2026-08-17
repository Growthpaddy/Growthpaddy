declare module 'next/server' {
  export interface CookieOptions {
    name?: string;
    value?: string;
    path?: string;
    domain?: string;
    maxAge?: number;
    expires?: Date;
    sameSite?: true | false | 'lax' | 'strict' | 'none';
    httpOnly?: boolean;
    secure?: boolean;
  }

  export interface RequestCookie {
    name: string;
    value: string;
  }

  export interface NextRequest {
    url: string;
    nextUrl: {
      pathname: string;
      searchParams: URLSearchParams;
    };
    cookies: {
      get(name: string): RequestCookie | undefined;
      getAll(): RequestCookie[];
      set(options: { name: string; value: string; [key: string]: any }): void;
      delete(name: string): void;
    };
    headers: Headers;
    json(): Promise<any>;
    text(): Promise<string>;
  }

  export class NextResponse extends Response {
    static next(options?: { request?: { headers?: Headers } }): NextResponse;
    static redirect(url: string | URL, status?: number): NextResponse;
    static json(body: any, init?: ResponseInit): NextResponse;
    cookies: {
      get(name: string): RequestCookie | undefined;
      set(options: { name: string; value: string; [key: string]: any }): void;
      delete(name: string): void;
    };
  }
}

declare module 'next/headers' {
  export interface CookieStore {
    get(name: string): { name: string; value: string } | undefined;
    getAll(): { name: string; value: string }[];
    set(options: { name: string; value: string; [key: string]: any }): void;
    delete(name: string): void;
  }

  export function cookies(): CookieStore;
  export function headers(): Headers;
}


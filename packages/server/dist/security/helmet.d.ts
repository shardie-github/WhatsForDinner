import type { Response, NextFunction } from 'express';
import type { NextResponse } from 'next/server';
import type { IncomingMessage } from 'http';
export declare function setCORSHeaders(res: NextResponse, origin: string | null): NextResponse;
export declare function securityHeadersMiddleware(): (_req: IncomingMessage, res: Response, next: NextFunction) => void;
export declare function addSecurityHeaders(res: NextResponse): NextResponse;
//# sourceMappingURL=helmet.d.ts.map
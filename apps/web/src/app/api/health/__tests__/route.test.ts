import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from '../route';
import { createClient } from '@supabase/supabase-js';

vi.mock('@supabase/supabase-js');

describe('/api/health GET', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should return healthy status when all checks pass', async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-key';
    process.env.NODE_ENV = 'test';
    process.env.npm_package_version = '1.0.0';

    const mockSupabase = {
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue({ data: [], error: null }),
        }),
      }),
    };

    vi.mocked(createClient).mockReturnValue(mockSupabase as any);

    const req = new NextRequest('http://localhost/api/health');
    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.status).toBe('healthy');
    expect(data.checks.database.status).toBe('healthy');
    expect(data.timestamp).toBeDefined();
    expect(data.responseTime).toBeDefined();
  });

  it('should return unhealthy status when database check fails', async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-key';

    const mockSupabase = {
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue({ 
            data: null, 
            error: { message: 'Database connection failed' } 
          }),
        }),
      }),
    };

    vi.mocked(createClient).mockReturnValue(mockSupabase as any);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(503);
    expect(data.status).toBe('unhealthy');
    expect(data.checks.database.status).toBe('error');
  });

  it('should handle missing database credentials gracefully', async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.status).toBe('healthy');
    expect(data.checks.database.status).toBe('unknown');
  });

  it('should include version and build information', async () => {
    process.env.npm_package_version = '2.0.0';
    process.env.VERCEL_GIT_COMMIT_SHA = 'abc123';

    const response = await GET();
    const data = await response.json();

    expect(data.version).toBe('2.0.0');
    expect(data.buildSha).toBe('abc123');
  });

  it('should set appropriate cache headers', async () => {
    const response = await GET();
    
    expect(response.headers.get('Cache-Control')).toBe('no-cache, no-store, must-revalidate');
    expect(response.headers.get('Pragma')).toBe('no-cache');
    expect(response.headers.get('Expires')).toBe('0');
  });

  it('should handle errors gracefully', async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-key';

    vi.mocked(createClient).mockImplementation(() => {
      throw new Error('Connection error');
    });

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(503);
    expect(data.status).toBe('unhealthy');
    expect(data.checks.database.error).toBeDefined();
  });
});

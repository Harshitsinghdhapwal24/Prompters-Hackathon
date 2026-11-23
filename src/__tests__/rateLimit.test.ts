import { checkRateLimit } from '@/lib/rateLimit';

describe('API Rate Limiter', () => {
  it('allows initial requests under the configured threshold', () => {
    const ip = '192.168.1.100';
    const result = checkRateLimit(ip, 5, 10000);
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(4);
  });

  it('correctly tracks request count per IP address', () => {
    const ip = '192.168.1.101';
    checkRateLimit(ip, 3, 10000);
    const second = checkRateLimit(ip, 3, 10000);
    expect(second.allowed).toBe(true);
    expect(second.remaining).toBe(1);
  });

  it('blocks requests once rate limit is exceeded', () => {
    const ip = '192.168.1.102';
    checkRateLimit(ip, 2, 10000);
    checkRateLimit(ip, 2, 10000);
    const blocked = checkRateLimit(ip, 2, 10000);
    expect(blocked.allowed).toBe(false);
    expect(blocked.remaining).toBe(0);
  });

  it('isolates counters between distinct client IPs', () => {
    const ipA = '10.0.0.1';
    const ipB = '10.0.0.2';
    checkRateLimit(ipA, 1, 10000);
    const blockedA = checkRateLimit(ipA, 1, 10000);
    const allowedB = checkRateLimit(ipB, 1, 10000);
    expect(blockedA.allowed).toBe(false);
    expect(allowedB.allowed).toBe(true);
  });
});

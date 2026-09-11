import { describe, it, expect } from 'vitest';
import { GET, POST } from '../route';
import { NextRequest } from 'next/server';

describe('GET /api/dictionary/lookup', () => {
  it('should return 400 when word is missing', async () => {
    const req = new NextRequest('http://localhost:3000/api/dictionary/lookup');
    const res = await GET(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe('Missing word parameter');
  });

  it('should return valid data structure when word is provided', async () => {
    const req = new NextRequest(
      'http://localhost:3000/api/dictionary/lookup?word=%E5%9C%9F',
    );
    const res = await GET(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.word).toBe('土');
    expect(Array.isArray(data.examples)).toBe(true);
    expect(Array.isArray(data.feedbacks)).toBe(true);
  });
});

describe('POST /api/dictionary/lookup', () => {
  it('should reject missing fields with 400', async () => {
    const req = new NextRequest('http://localhost:3000/api/dictionary/lookup', {
      method: 'POST',
      body: JSON.stringify({ word: '土' }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('should successfully save student contribution with nickname', async () => {
    const req = new NextRequest('http://localhost:3000/api/dictionary/lookup', {
      method: 'POST',
      body: JSON.stringify({
        word: '土',
        nickname: 'Học viên A',
        mean: 'Mẹo nhớ chữ Thổ: cây mọc trên mặt đất',
      }),
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.feedback.username).toBe('Học viên A');
    expect(data.feedback.mean).toBe('Mẹo nhớ chữ Thổ: cây mọc trên mặt đất');
    expect(data.feedback.isUserContribution).toBe(true);
  });
});

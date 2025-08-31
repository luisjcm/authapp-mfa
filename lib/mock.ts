// lib/mock.ts
export const TEST_CODE = '654321';

export async function mockVerify(code: string): Promise<void> {
  // Simula latencia de red
  await new Promise(r => setTimeout(r, 700));
  if (code !== TEST_CODE) {
    throw new Error('invalid_code');
  }
}

import { randomBytes } from 'crypto';

export function generateApiKey(): string {
  // สร้าง random 30 bytes แล้วแปลงเป็น base64url (ประมาณ 40 ตัวอักษร)
  return randomBytes(30).toString('base64url');
}

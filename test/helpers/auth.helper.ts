import { JwtService } from '@nestjs/jwt';

export function generateTestToken(
  userId: string,
  email: string = 'test@test.com',
): string {
  const jwtService = new JwtService({ secret: 'test-secret' });
  return jwtService.sign({ sub: userId, email });
}

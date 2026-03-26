import { BcryptHashingService } from './bcrypt-hashing.service';

describe('BcryptHashingService', () => {
  let service: BcryptHashingService;

  beforeEach(() => {
    service = new BcryptHashingService();
  });

  describe('hash', () => {
    it('should return a hashed string different from plain', async () => {
      const plain = 'my-secret-password';
      const hashed = await service.hash(plain);

      expect(hashed).toBeDefined();
      expect(typeof hashed).toBe('string');
      expect(hashed).not.toBe(plain);
    });

    it('should produce different hashes for the same input', async () => {
      const plain = 'my-secret-password';
      const hash1 = await service.hash(plain);
      const hash2 = await service.hash(plain);

      expect(hash1).not.toBe(hash2);
    });
  });

  describe('compare', () => {
    it('should return true for matching password and hash', async () => {
      const plain = 'my-secret-password';
      const hashed = await service.hash(plain);
      const result = await service.compare(plain, hashed);

      expect(result).toBe(true);
    });

    it('should return false for non-matching password and hash', async () => {
      const plain = 'my-secret-password';
      const hashed = await service.hash(plain);
      const result = await service.compare('wrong-password', hashed);

      expect(result).toBe(false);
    });
  });
});

export const HASHING_SERVICE = 'HASHING_SERVICE';

export interface IHashingService {
  hash(plain: string): Promise<string>;
  compare(plain: string, hashed: string): Promise<boolean>;
}

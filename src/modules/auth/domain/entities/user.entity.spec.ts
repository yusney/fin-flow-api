import { ValidationException } from '../../../../shared/domain/exceptions';
import { User } from './user.entity';

describe('User Entity', () => {
  const validProps = {
    name: 'John Doe',
    email: 'john@example.com',
    passwordHash: '$2b$10$hashedpassword',
  };

  describe('create', () => {
    it('should create a user with valid data', () => {
      const user = User.create(validProps);

      expect(user.name).toBe('John Doe');
      expect(user.email).toBe('john@example.com');
      expect(user.passwordHash).toBe('$2b$10$hashedpassword');
      expect(user.id).toBeDefined();
      expect(user.id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
      );
    });

    it('should use the provided id when given', () => {
      const user = User.create({ ...validProps, id: 'custom-id' });
      expect(user.id).toBe('custom-id');
    });

    it('should lowercase the email', () => {
      const user = User.create({ ...validProps, email: 'JOHN@EXAMPLE.COM' });
      expect(user.email).toBe('john@example.com');
    });

    it('should trim the name', () => {
      const user = User.create({ ...validProps, name: '  John Doe  ' });
      expect(user.name).toBe('John Doe');
    });

    it('should throw ValidationException for empty name', () => {
      expect(() => User.create({ ...validProps, name: '' })).toThrow(
        ValidationException,
      );
      expect(() => User.create({ ...validProps, name: '   ' })).toThrow(
        ValidationException,
      );
    });

    it('should throw ValidationException for invalid email format', () => {
      expect(() =>
        User.create({ ...validProps, email: 'not-an-email' }),
      ).toThrow(ValidationException);
      expect(() => User.create({ ...validProps, email: '' })).toThrow(
        ValidationException,
      );
      expect(() =>
        User.create({ ...validProps, email: 'missing@domain' }),
      ).toThrow(ValidationException);
    });
  });

  describe('updateName', () => {
    it('should update the name and set updatedAt', () => {
      const user = User.create(validProps);
      const beforeUpdate = user.updatedAt;

      user.updateName('Jane Doe');

      expect(user.name).toBe('Jane Doe');
      expect(user.updatedAt.getTime()).toBeGreaterThanOrEqual(
        beforeUpdate.getTime(),
      );
    });

    it('should trim the new name', () => {
      const user = User.create(validProps);
      user.updateName('  Jane Doe  ');
      expect(user.name).toBe('Jane Doe');
    });

    it('should throw ValidationException for empty name', () => {
      const user = User.create(validProps);
      expect(() => user.updateName('')).toThrow(ValidationException);
      expect(() => user.updateName('   ')).toThrow(ValidationException);
    });
  });

  describe('updatePassword', () => {
    it('should update the passwordHash and set updatedAt', () => {
      const user = User.create(validProps);
      const beforeUpdate = user.updatedAt;

      user.updatePassword('$2b$10$newhash');

      expect(user.passwordHash).toBe('$2b$10$newhash');
      expect(user.updatedAt.getTime()).toBeGreaterThanOrEqual(
        beforeUpdate.getTime(),
      );
    });
  });

  describe('toJSON', () => {
    it('should return profile without passwordHash', () => {
      const user = User.create(validProps);
      const json = user.toJSON();

      expect(json).toHaveProperty('id');
      expect(json).toHaveProperty('name', 'John Doe');
      expect(json).toHaveProperty('email', 'john@example.com');
      expect(json).toHaveProperty('createdAt');
      expect(json).toHaveProperty('updatedAt');
      expect(json).not.toHaveProperty('passwordHash');
    });
  });
});

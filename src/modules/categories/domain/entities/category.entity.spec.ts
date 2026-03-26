import { ValidationException } from '../../../../shared/domain/exceptions';
import { Category } from './category.entity';

describe('Category Entity', () => {
  const validProps = {
    name: 'Food',
    type: 'expense' as const,
    userId: 'user-uuid-123',
  };

  describe('create', () => {
    it('should create a category with valid data and generate an id', () => {
      const category = Category.create(validProps);

      expect(category.name).toBe('Food');
      expect(category.type).toBe('expense');
      expect(category.userId).toBe('user-uuid-123');
      expect(category.id).toBeDefined();
      expect(category.id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
      );
    });

    it('should create a category with type income', () => {
      const category = Category.create({ ...validProps, type: 'income' });
      expect(category.type).toBe('income');
    });

    it('should throw ValidationException when type is not income or expense', () => {
      expect(() =>
        Category.create({ ...validProps, type: 'invalid' as any }),
      ).toThrow(ValidationException);
    });

    it('should throw ValidationException when name is empty', () => {
      expect(() => Category.create({ ...validProps, name: '' })).toThrow(
        ValidationException,
      );
      expect(() => Category.create({ ...validProps, name: '   ' })).toThrow(
        ValidationException,
      );
    });

    it('should throw ValidationException when name exceeds 100 characters', () => {
      const longName = 'a'.repeat(101);
      expect(() => Category.create({ ...validProps, name: longName })).toThrow(
        ValidationException,
      );
    });

    it('should accept a name with exactly 100 characters', () => {
      const maxName = 'a'.repeat(100);
      const category = Category.create({ ...validProps, name: maxName });
      expect(category.name).toBe(maxName);
    });

    it('should trim the name', () => {
      const category = Category.create({ ...validProps, name: '  Food  ' });
      expect(category.name).toBe('Food');
    });
  });
});

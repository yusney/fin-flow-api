import { ValidationException } from '../../../../shared/domain/exceptions';
import { Transaction } from './transaction.entity';

describe('Transaction Entity', () => {
  const validProps = {
    amount: 150.5,
    description: 'Grocery shopping',
    date: new Date('2026-03-15'),
    categoryId: 'category-uuid-123',
    userId: 'user-uuid-123',
  };

  describe('create', () => {
    it('should create a transaction with valid data and generate an id', () => {
      const transaction = Transaction.create(validProps);

      expect(transaction.amount).toBe(150.5);
      expect(transaction.description).toBe('Grocery shopping');
      expect(transaction.date).toEqual(new Date('2026-03-15'));
      expect(transaction.categoryId).toBe('category-uuid-123');
      expect(transaction.userId).toBe('user-uuid-123');
      expect(transaction.id).toBeDefined();
      expect(transaction.id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
      );
    });

    it('should throw ValidationException when amount is zero', () => {
      expect(() => Transaction.create({ ...validProps, amount: 0 })).toThrow(
        ValidationException,
      );
    });

    it('should throw ValidationException when amount is negative', () => {
      expect(() => Transaction.create({ ...validProps, amount: -10 })).toThrow(
        ValidationException,
      );
    });

    it('should throw ValidationException when description is empty', () => {
      expect(() =>
        Transaction.create({ ...validProps, description: '' }),
      ).toThrow(ValidationException);
      expect(() =>
        Transaction.create({ ...validProps, description: '   ' }),
      ).toThrow(ValidationException);
    });

    it('should throw ValidationException when categoryId is not provided', () => {
      expect(() =>
        Transaction.create({ ...validProps, categoryId: '' }),
      ).toThrow(ValidationException);
      expect(() =>
        Transaction.create({ ...validProps, categoryId: undefined as any }),
      ).toThrow(ValidationException);
    });
  });
});

import { ValidationException } from '../../../../shared/domain/exceptions';
import { Budget } from './budget.entity';

describe('Budget Entity', () => {
  const validProps = {
    limitAmount: 5000,
    month: 3,
    year: 2026,
    categoryId: 'category-uuid-123',
    userId: 'user-uuid-123',
  };

  describe('create', () => {
    it('should create a budget with valid data and generate an id', () => {
      const budget = Budget.create(validProps);

      expect(budget.limitAmount).toBe(5000);
      expect(budget.month).toBe(3);
      expect(budget.year).toBe(2026);
      expect(budget.categoryId).toBe('category-uuid-123');
      expect(budget.userId).toBe('user-uuid-123');
      expect(budget.id).toBeDefined();
      expect(budget.id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
      );
    });

    it('should throw ValidationException when limitAmount is not positive', () => {
      expect(() =>
        Budget.create({ ...validProps, limitAmount: 0 }),
      ).toThrow(ValidationException);
      expect(() =>
        Budget.create({ ...validProps, limitAmount: -100 }),
      ).toThrow(ValidationException);
    });

    it('should throw ValidationException when month is not between 1 and 12', () => {
      expect(() =>
        Budget.create({ ...validProps, month: 0 }),
      ).toThrow(ValidationException);
      expect(() =>
        Budget.create({ ...validProps, month: 13 }),
      ).toThrow(ValidationException);
    });

    it('should throw ValidationException when year is less than 2000', () => {
      expect(() =>
        Budget.create({ ...validProps, year: 1999 }),
      ).toThrow(ValidationException);
    });

    it('should accept boundary values for month (1 and 12)', () => {
      const budgetJan = Budget.create({ ...validProps, month: 1 });
      expect(budgetJan.month).toBe(1);

      const budgetDec = Budget.create({ ...validProps, month: 12 });
      expect(budgetDec.month).toBe(12);
    });

    it('should accept year exactly 2000', () => {
      const budget = Budget.create({ ...validProps, year: 2000 });
      expect(budget.year).toBe(2000);
    });
  });
});

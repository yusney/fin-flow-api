import { Money } from './money.vo';

describe('Money Value Object', () => {
  describe('construction', () => {
    it('should create with amount and default USD currency', () => {
      const money = new Money(100);
      expect(money.amount).toBe(100);
      expect(money.currency).toBe('USD');
    });

    it('should create with amount and custom currency', () => {
      const money = new Money(50, 'EUR');
      expect(money.amount).toBe(50);
      expect(money.currency).toBe('EUR');
    });

    it('should be immutable', () => {
      const money = new Money(100);
      expect(() => {
        (money as any).amount = 200;
      }).toThrow();
      expect(() => {
        (money as any).currency = 'EUR';
      }).toThrow();
    });
  });

  describe('add', () => {
    it('should add two money values with same currency', () => {
      const a = new Money(100);
      const b = new Money(50);
      const result = a.add(b);
      expect(result.amount).toBe(150);
      expect(result.currency).toBe('USD');
    });

    it('should return a new Money instance', () => {
      const a = new Money(100);
      const b = new Money(50);
      const result = a.add(b);
      expect(result).not.toBe(a);
      expect(result).not.toBe(b);
    });

    it('should throw when adding different currencies', () => {
      const usd = new Money(100, 'USD');
      const eur = new Money(50, 'EUR');
      expect(() => usd.add(eur)).toThrow('Cannot operate on different currencies: USD vs EUR');
    });
  });

  describe('subtract', () => {
    it('should subtract two money values with same currency', () => {
      const a = new Money(100);
      const b = new Money(30);
      const result = a.subtract(b);
      expect(result.amount).toBe(70);
      expect(result.currency).toBe('USD');
    });

    it('should allow negative results', () => {
      const a = new Money(30);
      const b = new Money(100);
      const result = a.subtract(b);
      expect(result.amount).toBe(-70);
    });

    it('should throw when subtracting different currencies', () => {
      const usd = new Money(100, 'USD');
      const eur = new Money(50, 'EUR');
      expect(() => usd.subtract(eur)).toThrow('Cannot operate on different currencies: USD vs EUR');
    });
  });

  describe('isNegative', () => {
    it('should return true for negative amounts', () => {
      const money = new Money(-10);
      expect(money.isNegative()).toBe(true);
    });

    it('should return false for positive amounts', () => {
      const money = new Money(10);
      expect(money.isNegative()).toBe(false);
    });

    it('should return false for zero', () => {
      const money = new Money(0);
      expect(money.isNegative()).toBe(false);
    });
  });

  describe('equals', () => {
    it('should return true for same amount and currency', () => {
      const a = new Money(100, 'USD');
      const b = new Money(100, 'USD');
      expect(a.equals(b)).toBe(true);
    });

    it('should return false for different amounts', () => {
      const a = new Money(100, 'USD');
      const b = new Money(200, 'USD');
      expect(a.equals(b)).toBe(false);
    });

    it('should return false for different currencies', () => {
      const a = new Money(100, 'USD');
      const b = new Money(100, 'EUR');
      expect(a.equals(b)).toBe(false);
    });
  });
});

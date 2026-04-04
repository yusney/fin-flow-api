import { ValidationException } from '../../../../shared/domain/exceptions';
import { BillingFrequency } from '../enums/billing-frequency.enum';
import { SubscriptionType } from '../enums/subscription-type.enum';
import { Subscription } from './subscription.entity';

describe('Subscription Entity', () => {
  const validProps = {
    amount: 9.99,
    description: 'Netflix',
    billingDay: 15,
    categoryId: 'category-uuid-123',
    userId: 'user-uuid-123',
    startDate: new Date('2026-01-01'),
  };

  describe('create', () => {
    it('should create a subscription with valid data and generate an id', () => {
      const subscription = Subscription.create(validProps);

      expect(subscription.amount).toBe(9.99);
      expect(subscription.description).toBe('Netflix');
      expect(subscription.billingDay).toBe(15);
      expect(subscription.categoryId).toBe('category-uuid-123');
      expect(subscription.userId).toBe('user-uuid-123');
      expect(subscription.isActive).toBe(true);
      expect(subscription.id).toBeDefined();
      expect(subscription.id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
      );
    });

    it('should throw ValidationException when amount is zero', () => {
      expect(() => Subscription.create({ ...validProps, amount: 0 })).toThrow(
        ValidationException,
      );
    });

    it('should throw ValidationException when amount is negative', () => {
      expect(() => Subscription.create({ ...validProps, amount: -5 })).toThrow(
        ValidationException,
      );
    });

    it('should throw ValidationException when billingDay is less than 1', () => {
      expect(() =>
        Subscription.create({ ...validProps, billingDay: 0 }),
      ).toThrow(ValidationException);
    });

    it('should throw ValidationException when billingDay is greater than 31', () => {
      expect(() =>
        Subscription.create({ ...validProps, billingDay: 32 }),
      ).toThrow(ValidationException);
    });

    it('should throw ValidationException when description is empty', () => {
      expect(() =>
        Subscription.create({ ...validProps, description: '' }),
      ).toThrow(ValidationException);
      expect(() =>
        Subscription.create({ ...validProps, description: '   ' }),
      ).toThrow(ValidationException);
    });

    it('should create with all new fields', () => {
      const endDate = new Date('2026-12-31');
      const subscription = Subscription.create({
        ...validProps,
        endDate,
        frequency: BillingFrequency.ANNUAL,
        type: SubscriptionType.DIGITAL_SERVICE,
        serviceUrl: 'https://netflix.com',
      });

      expect(subscription.startDate).toEqual(new Date('2026-01-01'));
      expect(subscription.endDate).toEqual(endDate);
      expect(subscription.frequency).toBe(BillingFrequency.ANNUAL);
      expect(subscription.type).toBe(SubscriptionType.DIGITAL_SERVICE);
      expect(subscription.serviceUrl).toBe('https://netflix.com');
    });

    it('should create with defaults (only startDate) - frequency=MONTHLY, type=GENERAL, endDate=null, serviceUrl=null', () => {
      const subscription = Subscription.create(validProps);

      expect(subscription.startDate).toEqual(new Date('2026-01-01'));
      expect(subscription.endDate).toBeNull();
      expect(subscription.frequency).toBe(BillingFrequency.MONTHLY);
      expect(subscription.type).toBe(SubscriptionType.GENERAL);
      expect(subscription.serviceUrl).toBeNull();
    });

    it('should throw ValidationException when DIGITAL_SERVICE without serviceUrl', () => {
      expect(() =>
        Subscription.create({
          ...validProps,
          type: SubscriptionType.DIGITAL_SERVICE,
        }),
      ).toThrow(ValidationException);
      expect(() =>
        Subscription.create({
          ...validProps,
          type: SubscriptionType.DIGITAL_SERVICE,
        }),
      ).toThrow('Service URL is required for digital service subscriptions');
    });

    it('should throw ValidationException when GENERAL with serviceUrl', () => {
      expect(() =>
        Subscription.create({
          ...validProps,
          type: SubscriptionType.GENERAL,
          serviceUrl: 'https://example.com',
        }),
      ).toThrow(ValidationException);
      expect(() =>
        Subscription.create({
          ...validProps,
          type: SubscriptionType.GENERAL,
          serviceUrl: 'https://example.com',
        }),
      ).toThrow(
        'Service URL is only allowed for digital service subscriptions',
      );
    });

    it('should throw ValidationException when serviceUrl is invalid', () => {
      expect(() =>
        Subscription.create({
          ...validProps,
          type: SubscriptionType.DIGITAL_SERVICE,
          serviceUrl: 'ftp://invalid.com',
        }),
      ).toThrow(ValidationException);
      expect(() =>
        Subscription.create({
          ...validProps,
          type: SubscriptionType.DIGITAL_SERVICE,
          serviceUrl: 'ftp://invalid.com',
        }),
      ).toThrow('Service URL must be a valid URL');
    });

    it('should throw ValidationException when endDate is before startDate', () => {
      expect(() =>
        Subscription.create({
          ...validProps,
          startDate: new Date('2026-06-01'),
          endDate: new Date('2026-01-01'),
        }),
      ).toThrow(ValidationException);
      expect(() =>
        Subscription.create({
          ...validProps,
          startDate: new Date('2026-06-01'),
          endDate: new Date('2026-01-01'),
        }),
      ).toThrow('End date must be after start date');
    });

    it('should throw ValidationException when endDate equals startDate', () => {
      expect(() =>
        Subscription.create({
          ...validProps,
          startDate: new Date('2026-06-01'),
          endDate: new Date('2026-06-01'),
        }),
      ).toThrow(ValidationException);
      expect(() =>
        Subscription.create({
          ...validProps,
          startDate: new Date('2026-06-01'),
          endDate: new Date('2026-06-01'),
        }),
      ).toThrow('End date must be after start date');
    });
  });

  describe('clampBillingDay', () => {
    it('should clamp 31 to 28 for February non-leap year', () => {
      expect(Subscription.clampBillingDay(31, 2, 2027)).toBe(28);
    });

    it('should clamp 31 to 29 for February leap year', () => {
      expect(Subscription.clampBillingDay(31, 2, 2028)).toBe(29);
    });

    it('should clamp 31 to 30 for April', () => {
      expect(Subscription.clampBillingDay(31, 4, 2026)).toBe(30);
    });

    it('should not clamp when billingDay fits in the month', () => {
      expect(Subscription.clampBillingDay(15, 3, 2026)).toBe(15);
    });
  });

  describe('parentId', () => {
    it('should default parentId to null when not provided', () => {
      const subscription = Subscription.create(validProps);

      expect(subscription.parentId).toBeNull();
    });

    it('should preserve parentId when provided', () => {
      const subscription = Subscription.create({
        ...validProps,
        parentId: 'root-uuid-abc',
      });

      expect(subscription.parentId).toBe('root-uuid-abc');
    });

    it('should accept null explicitly as parentId', () => {
      const subscription = Subscription.create({
        ...validProps,
        parentId: null,
      });

      expect(subscription.parentId).toBeNull();
    });
  });

  describe('toggle', () => {
    it('should flip isActive from true to false', () => {
      const subscription = Subscription.create(validProps);
      expect(subscription.isActive).toBe(true);

      subscription.toggle();
      expect(subscription.isActive).toBe(false);
    });

    it('should flip isActive from false to true', () => {
      const subscription = Subscription.create(validProps);
      subscription.toggle();
      expect(subscription.isActive).toBe(false);

      subscription.toggle();
      expect(subscription.isActive).toBe(true);
    });
  });

  describe('closeVersion', () => {
    it('should set endDate and isActive=false', () => {
      const subscription = Subscription.create(validProps);
      expect(subscription.isActive).toBe(true);
      expect(subscription.endDate).toBeNull();

      const closeDate = new Date('2026-06-01');
      subscription.closeVersion(closeDate);

      expect(subscription.endDate).toEqual(closeDate);
      expect(subscription.isActive).toBe(false);
    });

    it('should not modify other fields when closing', () => {
      const subscription = Subscription.create({
        ...validProps,
        amount: 19.99,
        description: 'Netflix',
      });

      subscription.closeVersion(new Date('2026-06-01'));

      expect(subscription.amount).toBe(19.99);
      expect(subscription.description).toBe('Netflix');
    });
  });
});

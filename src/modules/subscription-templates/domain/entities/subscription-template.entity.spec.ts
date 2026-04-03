import { ValidationException } from '../../../../shared/domain/exceptions';
import { BillingFrequency } from '../../../subscriptions/domain/enums/billing-frequency.enum';
import { TemplateCategory } from '../enums/template-category.enum';
import { TemplateOwnership } from '../enums/template-ownership.enum';
import { SubscriptionTemplate } from './subscription-template.entity';

describe('SubscriptionTemplate Entity', () => {
  const validGlobalProps = {
    name: 'Netflix',
    description: 'Streaming service',
    iconUrl: 'https://example.com/icon.png',
    serviceUrl: 'https://netflix.com',
    defaultAmount: 15.99,
    defaultFrequency: BillingFrequency.MONTHLY,
    category: TemplateCategory.STREAMING,
    ownership: TemplateOwnership.GLOBAL,
    userId: null,
  };

  const validUserProps = {
    name: 'My Custom Sub',
    description: 'Personal subscription',
    iconUrl: null,
    serviceUrl: null,
    defaultAmount: 9.99,
    defaultFrequency: BillingFrequency.MONTHLY,
    category: TemplateCategory.OTHER,
    ownership: TemplateOwnership.USER,
    userId: 'user-uuid-123',
  };

  describe('create', () => {
    it('should create a valid GLOBAL template with userId=null and serviceUrl required', () => {
      const template = SubscriptionTemplate.create(validGlobalProps);

      expect(template.name).toBe('Netflix');
      expect(template.description).toBe('Streaming service');
      expect(template.iconUrl).toBe('https://example.com/icon.png');
      expect(template.serviceUrl).toBe('https://netflix.com');
      expect(template.defaultAmount).toBe(15.99);
      expect(template.defaultFrequency).toBe(BillingFrequency.MONTHLY);
      expect(template.category).toBe(TemplateCategory.STREAMING);
      expect(template.ownership).toBe(TemplateOwnership.GLOBAL);
      expect(template.userId).toBeNull();
      expect(template.id).toBeDefined();
      expect(template.id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
      );
    });

    it('should create a valid USER template with userId required and serviceUrl optional', () => {
      const template = SubscriptionTemplate.create(validUserProps);

      expect(template.name).toBe('My Custom Sub');
      expect(template.ownership).toBe(TemplateOwnership.USER);
      expect(template.userId).toBe('user-uuid-123');
      expect(template.serviceUrl).toBeNull();
    });

    it('should throw ValidationException when name is empty', () => {
      expect(() =>
        SubscriptionTemplate.create({ ...validGlobalProps, name: '' }),
      ).toThrow(ValidationException);
      expect(() =>
        SubscriptionTemplate.create({ ...validGlobalProps, name: '   ' }),
      ).toThrow(ValidationException);
    });

    it('should throw ValidationException when name exceeds 100 characters', () => {
      const longName = 'a'.repeat(101);
      expect(() =>
        SubscriptionTemplate.create({ ...validGlobalProps, name: longName }),
      ).toThrow(ValidationException);
    });

    it('should accept a name with exactly 100 characters', () => {
      const maxName = 'a'.repeat(100);
      const template = SubscriptionTemplate.create({
        ...validGlobalProps,
        name: maxName,
      });
      expect(template.name).toBe(maxName);
    });

    it('should trim the name whitespace', () => {
      const template = SubscriptionTemplate.create({
        ...validGlobalProps,
        name: '  Netflix  ',
      });
      expect(template.name).toBe('Netflix');
    });

    it('should throw ValidationException when defaultAmount is not positive', () => {
      expect(() =>
        SubscriptionTemplate.create({ ...validGlobalProps, defaultAmount: 0 }),
      ).toThrow(ValidationException);
      expect(() =>
        SubscriptionTemplate.create({ ...validGlobalProps, defaultAmount: -5 }),
      ).toThrow(ValidationException);
    });

    it('should throw ValidationException when GLOBAL template has non-null userId', () => {
      expect(() =>
        SubscriptionTemplate.create({
          ...validGlobalProps,
          ownership: TemplateOwnership.GLOBAL,
          userId: 'user-uuid-123',
        }),
      ).toThrow(ValidationException);
    });

    it('should throw ValidationException when USER template has null userId', () => {
      expect(() =>
        SubscriptionTemplate.create({
          ...validUserProps,
          ownership: TemplateOwnership.USER,
          userId: null,
        }),
      ).toThrow(ValidationException);
    });

    it('should throw ValidationException when GLOBAL template has null serviceUrl', () => {
      expect(() =>
        SubscriptionTemplate.create({
          ...validGlobalProps,
          ownership: TemplateOwnership.GLOBAL,
          serviceUrl: null,
        }),
      ).toThrow(ValidationException);
    });

    it('should accept USER template with null serviceUrl', () => {
      const template = SubscriptionTemplate.create({
        ...validUserProps,
        serviceUrl: null,
      });
      expect(template.serviceUrl).toBeNull();
    });

    it('should throw ValidationException for invalid category', () => {
      expect(() =>
        SubscriptionTemplate.create({
          ...validGlobalProps,
          category: 'INVALID' as any,
        }),
      ).toThrow(ValidationException);
    });

    it('should throw ValidationException for invalid billing frequency', () => {
      expect(() =>
        SubscriptionTemplate.create({
          ...validGlobalProps,
          defaultFrequency: 'WEEKLY' as any,
        }),
      ).toThrow(ValidationException);
    });
  });

  describe('update', () => {
    it('should update fields with partial props', () => {
      const template = SubscriptionTemplate.create(validGlobalProps);
      const originalUpdatedAt = template.updatedAt;

      template.update({
        name: 'Netflix Premium',
        defaultAmount: 22.99,
      });

      expect(template.name).toBe('Netflix Premium');
      expect(template.defaultAmount).toBe(22.99);
      expect(template.description).toBe('Streaming service');
      expect(template.updatedAt.getTime()).toBeGreaterThanOrEqual(
        originalUpdatedAt.getTime(),
      );
    });

    it('should validate name on update', () => {
      const template = SubscriptionTemplate.create(validGlobalProps);

      expect(() => template.update({ name: '' })).toThrow(ValidationException);
      expect(() => template.update({ name: 'a'.repeat(101) })).toThrow(
        ValidationException,
      );
    });

    it('should validate defaultAmount on update', () => {
      const template = SubscriptionTemplate.create(validGlobalProps);

      expect(() => template.update({ defaultAmount: -1 })).toThrow(
        ValidationException,
      );
      expect(() => template.update({ defaultAmount: 0 })).toThrow(
        ValidationException,
      );
    });

    it('should trim name on update', () => {
      const template = SubscriptionTemplate.create(validGlobalProps);
      template.update({ name: '  Updated Name  ' });
      expect(template.name).toBe('Updated Name');
    });
  });

  describe('isOwnedBy', () => {
    it('should return true when userId matches', () => {
      const template = SubscriptionTemplate.create(validUserProps);
      expect(template.isOwnedBy('user-uuid-123')).toBe(true);
    });

    it('should return false when userId does not match', () => {
      const template = SubscriptionTemplate.create(validUserProps);
      expect(template.isOwnedBy('other-user')).toBe(false);
    });

    it('should return false for GLOBAL templates', () => {
      const template = SubscriptionTemplate.create(validGlobalProps);
      expect(template.isOwnedBy('user-uuid-123')).toBe(false);
    });
  });

  describe('isGlobal', () => {
    it('should return true for GLOBAL templates', () => {
      const template = SubscriptionTemplate.create(validGlobalProps);
      expect(template.isGlobal()).toBe(true);
    });

    it('should return false for USER templates', () => {
      const template = SubscriptionTemplate.create(validUserProps);
      expect(template.isGlobal()).toBe(false);
    });
  });
});

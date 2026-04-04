import { ValidationException } from '../../../../shared/domain/exceptions';
import { BillingFrequency } from '../../../subscriptions/domain/enums/billing-frequency.enum';
import { TemplateCategory } from '../enums/template-category.enum';
import { SubscriptionTemplate } from './subscription-template.entity';

describe('SubscriptionTemplate Entity', () => {
  const validProps = {
    name: 'Netflix',
    description: 'Streaming service',
    iconUrl: 'https://example.com/icon.png',
    serviceUrl: 'https://netflix.com',
    defaultAmount: 15.99,
    defaultFrequency: BillingFrequency.MONTHLY,
    category: TemplateCategory.STREAMING,
  };

  describe('create', () => {
    it('should create a valid template', () => {
      const template = SubscriptionTemplate.create(validProps);

      expect(template.name).toBe('Netflix');
      expect(template.description).toBe('Streaming service');
      expect(template.iconUrl).toBe('https://example.com/icon.png');
      expect(template.serviceUrl).toBe('https://netflix.com');
      expect(template.defaultAmount).toBe(15.99);
      expect(template.defaultFrequency).toBe(BillingFrequency.MONTHLY);
      expect(template.category).toBe(TemplateCategory.STREAMING);
      expect(template.id).toBeDefined();
      expect(template.id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
      );
    });

    it('should create a template with null serviceUrl', () => {
      const template = SubscriptionTemplate.create({
        ...validProps,
        serviceUrl: null,
      });
      expect(template.serviceUrl).toBeNull();
    });

    it('should throw ValidationException when name is empty', () => {
      expect(() =>
        SubscriptionTemplate.create({ ...validProps, name: '' }),
      ).toThrow(ValidationException);
      expect(() =>
        SubscriptionTemplate.create({ ...validProps, name: '   ' }),
      ).toThrow(ValidationException);
    });

    it('should throw ValidationException when name exceeds 100 characters', () => {
      const longName = 'a'.repeat(101);
      expect(() =>
        SubscriptionTemplate.create({ ...validProps, name: longName }),
      ).toThrow(ValidationException);
    });

    it('should accept a name with exactly 100 characters', () => {
      const maxName = 'a'.repeat(100);
      const template = SubscriptionTemplate.create({
        ...validProps,
        name: maxName,
      });
      expect(template.name).toBe(maxName);
    });

    it('should trim the name whitespace', () => {
      const template = SubscriptionTemplate.create({
        ...validProps,
        name: '  Netflix  ',
      });
      expect(template.name).toBe('Netflix');
    });

    it('should throw ValidationException when defaultAmount is not positive', () => {
      expect(() =>
        SubscriptionTemplate.create({ ...validProps, defaultAmount: 0 }),
      ).toThrow(ValidationException);
      expect(() =>
        SubscriptionTemplate.create({ ...validProps, defaultAmount: -5 }),
      ).toThrow(ValidationException);
    });

    it('should throw ValidationException for invalid category', () => {
      expect(() =>
        SubscriptionTemplate.create({
          ...validProps,
          category: 'INVALID' as any,
        }),
      ).toThrow(ValidationException);
    });

    it('should throw ValidationException for invalid billing frequency', () => {
      expect(() =>
        SubscriptionTemplate.create({
          ...validProps,
          defaultFrequency: 'WEEKLY' as any,
        }),
      ).toThrow(ValidationException);
    });
  });

  describe('update', () => {
    it('should update fields with partial props', () => {
      const template = SubscriptionTemplate.create(validProps);
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
      const template = SubscriptionTemplate.create(validProps);

      expect(() => template.update({ name: '' })).toThrow(ValidationException);
      expect(() => template.update({ name: 'a'.repeat(101) })).toThrow(
        ValidationException,
      );
    });

    it('should validate defaultAmount on update', () => {
      const template = SubscriptionTemplate.create(validProps);

      expect(() => template.update({ defaultAmount: -1 })).toThrow(
        ValidationException,
      );
      expect(() => template.update({ defaultAmount: 0 })).toThrow(
        ValidationException,
      );
    });

    it('should trim name on update', () => {
      const template = SubscriptionTemplate.create(validProps);
      template.update({ name: '  Updated Name  ' });
      expect(template.name).toBe('Updated Name');
    });
  });

  describe('toJSON', () => {
    it('should not include ownership or userId', () => {
      const template = SubscriptionTemplate.create(validProps);
      const json = template.toJSON();

      expect(json).not.toHaveProperty('ownership');
      expect(json).not.toHaveProperty('userId');
      expect(json).toHaveProperty('id');
      expect(json).toHaveProperty('name');
      expect(json).toHaveProperty('category');
    });
  });
});

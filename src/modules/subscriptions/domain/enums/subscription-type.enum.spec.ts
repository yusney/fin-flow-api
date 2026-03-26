import { SubscriptionType } from './subscription-type.enum';

describe('SubscriptionType Enum', () => {
  it('should have GENERAL value', () => {
    expect(SubscriptionType.GENERAL).toBe('GENERAL');
  });

  it('should have DIGITAL_SERVICE value', () => {
    expect(SubscriptionType.DIGITAL_SERVICE).toBe('DIGITAL_SERVICE');
  });

  it('should only have 2 values', () => {
    const values = Object.values(SubscriptionType);
    expect(values).toHaveLength(2);
  });
});

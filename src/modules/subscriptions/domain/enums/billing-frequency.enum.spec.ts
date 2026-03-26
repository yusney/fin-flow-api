import { BillingFrequency } from './billing-frequency.enum';

describe('BillingFrequency Enum', () => {
  it('should have MONTHLY value', () => {
    expect(BillingFrequency.MONTHLY).toBe('MONTHLY');
  });

  it('should have ANNUAL value', () => {
    expect(BillingFrequency.ANNUAL).toBe('ANNUAL');
  });

  it('should only have 2 values', () => {
    const values = Object.values(BillingFrequency);
    expect(values).toHaveLength(2);
  });
});

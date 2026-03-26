import { BaseEntity } from './base.entity';

class TestEntity extends BaseEntity {
  constructor(id?: string) {
    super(id);
  }
}

describe('BaseEntity', () => {
  it('should generate a UUID id on construction', () => {
    const entity = new TestEntity();
    expect(entity.id).toBeDefined();
    expect(typeof entity.id).toBe('string');
    expect(entity.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
    );
  });

  it('should use the provided id when given', () => {
    const customId = 'custom-id-123';
    const entity = new TestEntity(customId);
    expect(entity.id).toBe(customId);
  });

  it('should set createdAt to current date', () => {
    const before = new Date();
    const entity = new TestEntity();
    const after = new Date();

    expect(entity.createdAt).toBeInstanceOf(Date);
    expect(entity.createdAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
    expect(entity.createdAt.getTime()).toBeLessThanOrEqual(after.getTime());
  });

  it('should set updatedAt to current date', () => {
    const before = new Date();
    const entity = new TestEntity();
    const after = new Date();

    expect(entity.updatedAt).toBeInstanceOf(Date);
    expect(entity.updatedAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
    expect(entity.updatedAt.getTime()).toBeLessThanOrEqual(after.getTime());
  });

  it('should generate unique ids for different instances', () => {
    const entity1 = new TestEntity();
    const entity2 = new TestEntity();
    expect(entity1.id).not.toBe(entity2.id);
  });
});

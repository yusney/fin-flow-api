import { MikroORM } from '@mikro-orm/sqlite';

export async function createTestingORM(entities: any[]) {
  const orm = await MikroORM.init({
    entities,
    dbName: ':memory:',
    allowGlobalContext: true,
  });
  await orm.schema.create();
  return orm;
}

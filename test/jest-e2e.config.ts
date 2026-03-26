import type { Config } from 'jest';

const config: Config = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '..',
  testEnvironment: 'node',
  testRegex: 'test/.*\\.e2e-spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': [
      '@swc/jest',
      {
        jsc: {
          parser: {
            syntax: 'typescript',
            decorators: true,
          },
          transform: {
            decoratorMetadata: true,
            legacyDecorator: true,
          },
          target: 'es2023',
        },
        module: {
          type: 'commonjs',
        },
      },
    ],
  },
  transformIgnorePatterns: [
    'node_modules/(?!(\\.pnpm|@mikro-orm|@nestjs/config)/)',
  ],
};

export default config;

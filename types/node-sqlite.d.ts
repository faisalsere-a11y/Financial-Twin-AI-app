declare module "node:sqlite" {
  export class StatementSync {
    get(...values: unknown[]): Record<string, unknown> | undefined;
    run(...values: unknown[]): unknown;
  }

  export class DatabaseSync {
    constructor(path: string);
    exec(sql: string): void;
    prepare(sql: string): StatementSync;
    close(): void;
  }
}

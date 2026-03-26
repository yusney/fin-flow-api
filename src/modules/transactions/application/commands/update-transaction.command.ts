export class UpdateTransactionCommand {
  constructor(
    public readonly id: string,
    public readonly amount: number | undefined,
    public readonly description: string | undefined,
    public readonly date: Date | undefined,
    public readonly categoryId: string | undefined,
    public readonly userId: string,
  ) {}
}

export class CreateTransactionCommand {
  constructor(
    public readonly amount: number,
    public readonly description: string,
    public readonly date: Date,
    public readonly categoryId: string,
    public readonly userId: string,
  ) {}
}

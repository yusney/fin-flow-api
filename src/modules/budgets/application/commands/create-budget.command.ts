export class CreateBudgetCommand {
  constructor(
    public readonly limitAmount: number,
    public readonly month: number,
    public readonly year: number,
    public readonly categoryId: string,
    public readonly userId: string,
  ) {}
}

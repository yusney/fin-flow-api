export class CreateCategoryCommand {
  constructor(
    public readonly name: string,
    public readonly type: string,
    public readonly userId: string,
  ) {}
}

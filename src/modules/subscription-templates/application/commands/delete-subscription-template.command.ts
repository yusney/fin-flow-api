export class DeleteSubscriptionTemplateCommand {
  constructor(
    public readonly id: string,
    public readonly userId: string,
  ) {}
}

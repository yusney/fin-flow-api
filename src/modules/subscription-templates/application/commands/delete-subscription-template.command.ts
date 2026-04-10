export class DeleteSubscriptionTemplateCommand {
  constructor(
    public readonly templateId: string,
    public readonly userId: string,
  ) {}
}

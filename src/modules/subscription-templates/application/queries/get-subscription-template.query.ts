export class GetSubscriptionTemplateQuery {
  constructor(
    public readonly userId: string,
    public readonly templateId: string,
  ) {}
}

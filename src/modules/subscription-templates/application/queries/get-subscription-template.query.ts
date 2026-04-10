export class GetSubscriptionTemplateQuery {
  constructor(
    public readonly templateId: string,
    public readonly userId: string,
  ) {}
}

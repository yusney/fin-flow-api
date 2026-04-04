export class GetSubscriptionHistoryQuery {
  constructor(
    public readonly subscriptionId: string,
    public readonly userId: string,
  ) {}
}

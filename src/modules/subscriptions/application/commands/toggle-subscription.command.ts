export class ToggleSubscriptionCommand {
  constructor(
    public readonly id: string,
    public readonly userId: string,
  ) {}
}

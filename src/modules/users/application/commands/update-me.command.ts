export class UpdateMeCommand {
  constructor(
    public readonly userId: string,
    public readonly name?: string,
    public readonly currentPassword?: string,
    public readonly newPassword?: string,
  ) {}
}

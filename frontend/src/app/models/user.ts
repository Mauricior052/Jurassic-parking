export class User {
  constructor(
    public nombre: string,
    public email: string,
    public password: string,
    public google: boolean,
    public role: string,
    public id: string
  ) {}
}

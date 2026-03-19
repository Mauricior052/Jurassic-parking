export class User {
  constructor(
    public nombre: string,
    public email: string,
    public password: string,
    public google: boolean,
    public rol: string,
    public id: string
  ) {}
}

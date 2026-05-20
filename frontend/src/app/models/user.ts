export interface User {
  id?: string;
  name: string;
  email: string;
  password?: string;
  google: boolean;
  role: string;
  number?: string;
  titular?: string;
  expiry?: string;
  cvv?: string;
}
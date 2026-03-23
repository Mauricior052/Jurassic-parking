export interface User {
  id?: string;
  name: string;
  email: string;
  password?: string;
  google: boolean;
  role: string;
}
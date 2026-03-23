export interface User {
  id?: string;
  nombre: string;
  email: string;
  password?: string;
  google: boolean;
  rol: string;
}
export interface User {
  _id?: string;
  email: string;
  rol: 'admin' | 'cliente';
  google: boolean;
  favoritos: string[];
  activo: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

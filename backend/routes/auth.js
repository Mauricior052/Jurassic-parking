// Ruta: /api/login
import { Router } from 'express';
import { check } from 'express-validator';

import { validateFields } from '../middlewares/validate-fields.js';
import { validateJWT } from '../middlewares/validate-jwt.js';
import { login, googleSignIn, renewToken } from '../controllers/auth.js';

const router = Router();

router.post('/', [
    check('email', 'Ingresa un email valido').isEmail(),
    check('password', 'La contraseña es obligatoria').not().isEmpty(),
    validateFields
], login);

router.post('/google', [
    check('token', 'El token de Google es obligatorio').not().isEmpty(),
    validateFields
], googleSignIn);

router.get('/renew', 
    validateJWT, 
    renewToken
);


export default router;

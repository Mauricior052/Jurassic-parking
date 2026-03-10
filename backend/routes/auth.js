// Ruta: /api/login
import { Router } from 'express';
import { check } from 'express-validator';
import { login, googleSignIn } from '../controllers/auth.js';
import { validateFields } from '../middlewares/validate-fields.js';

const router = Router();

router.post('/', [
    check('email', 'El email es obligatorio').isEmail(),
    check('password', 'La contraseña es obligatoria').not().isEmpty(),
    validateFields
], login);

router.post('/google', [
    check('token', 'El token de Google es obligatorio').not().isEmpty(),
    validateFields
], googleSignIn);


export default router;

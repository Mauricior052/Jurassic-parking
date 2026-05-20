import { Router } from 'express';
import { check } from 'express-validator';

import { validateFields } from '../middlewares/validate-fields.js';
import { validateJWT, validateAdmin } from '../middlewares/validate-jwt.js';
import { getUsers, createUser, updateUser, deleteUser, updateCard, getUserById } from '../controllers/users.js';


const router = Router();

router.get("/", validateJWT, getUsers);
router.get("/:id", validateJWT, getUserById);

router.post("/", [
    check('name', 'El nombre es obligatorio').not().isEmpty(), 
    check('email', 'El email no es valido').isEmail(),
    check('password', 'La contraseña es obligatoria').not().isEmpty(),
    validateFields
], createUser);

router.put("/card", [
    validateJWT, 
    check('number', 'El número de la tarjeta es obligatorio').not().isEmpty(),
    check('titular', 'El nombre es obligatorio').not().isEmpty(),
    check('expiry', 'La fecha de vencimiento es obligatoria').not().isEmpty(),
    validateFields
], updateCard);

router.put("/:id", [
    validateJWT, 
    check('name', 'El nombre es obligatorio').not().isEmpty(), 
    check('email', 'El email es obligatorio').isEmail(),
    validateFields
], updateUser);

router.delete("/:id", [ validateJWT, validateAdmin ], deleteUser);


export default router;

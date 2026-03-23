import { Router } from 'express';
import { check, param } from 'express-validator';

import { validateFields } from '../middlewares/validate-fields.js';
import { validateJWT, validateAdmin } from '../middlewares/validate-jwt.js';
import { active, calculate, cancel, entry, exit } from '../controllers/record.js';


const router = Router();

router.get("/active/:parking", validateJWT, active);

router.post("/entry", [
    validateJWT,
    check('plate', 'La placa es obligatoria').not().isEmpty(), 
    check('parking', 'El ID del estacionamiento es obligatorio').isMongoId(),
    validateFields
], entry);

router.put("/exit/:id", validateJWT, exit);

router.get("/calculate/:id", validateJWT, calculate);

router.delete("/cancel/:id", [ validateJWT, validateAdmin ], cancel);


export default router;

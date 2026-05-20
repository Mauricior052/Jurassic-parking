import { Router } from 'express';
import { body, check, param } from 'express-validator';

import { validateFields } from '../middlewares/validate-fields.js';
import { validateJWT, validateAdmin } from '../middlewares/validate-jwt.js';
import { create, getAll, getById, getSlotsWithStatus, mine, remove, update, updateLayout } from '../controllers/parking.js';

const router = Router();

router.get("/", validateJWT, getAll);

router.get("/mine", validateJWT, mine);

router.get("/:id/slots", [
  validateJWT,
  param('id', 'No es un ID válido').isMongoId(),
  validateFields
], getSlotsWithStatus);

router.get("/:id", [
  validateJWT,
  param('id', 'No es un ID válido').isMongoId(),
  validateFields
], getById);

router.post("/", [
  validateJWT,
  check('name', 'El nombre es obligatorio').not().isEmpty(),
  check('address', 'La dirección es obligatoria').not().isEmpty(),
  check('location.coordinates', 'Coordenadas obligatorias').isArray({ min: 2 }),
  check('price', 'El precio es obligatorio').isNumeric(),
  check('totalSpaces', 'Total de espacios obligatorio').isInt({ min: 1 }),
  validateFields
], create);

router.put("/:id", [
  validateJWT,
  param('id', 'No es un ID válido').isMongoId(),
  validateFields
], update);

router.patch("/:id/layout", [
  validateJWT,
  param('id', 'No es un ID válido').isMongoId(),
  body('viewBox', 'ViewBox es obligatorio').notEmpty(),
  body('slots', 'Slots es obligatorio').isArray({ min: 1 }),
  validateFields
], updateLayout);

router.delete("/:id", [
  validateJWT,
  validateAdmin,
  param('id', 'No es un ID válido').isMongoId(),
  validateFields
], remove);


export default router;

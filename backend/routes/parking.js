import { Router } from 'express';
import { check, param } from 'express-validator';

import { validateFields } from '../middlewares/validate-fields.js';
import { validateJWT, validateAdmin } from '../middlewares/validate-jwt.js';
import { create, getAll, getById, mine, nearby, remove, update } from '../controllers/parking.js';

const router = Router();

router.get("/", validateJWT, getAll);

router.get("/mine", validateJWT, mine);

router.get("/nearby", [
  validateJWT,
  check('lng', 'Longitud requerida').not().isEmpty(),
  check('lat', 'Latitud requerida').not().isEmpty(),
  validateFields
], nearby);

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

router.delete("/:id", [
  validateJWT,
  validateAdmin,
  param('id', 'No es un ID válido').isMongoId(),
  validateFields
], remove);


export default router;

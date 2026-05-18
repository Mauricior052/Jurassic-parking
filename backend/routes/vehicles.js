import { Router } from 'express';
import { body, check, param } from 'express-validator';

import { validateFields } from '../middlewares/validate-fields.js';
import { validateJWT, validateAdmin } from '../middlewares/validate-jwt.js';
import { create, getAll, getById, getByUser, remove, update } from '../controllers/vehicles.js';

const router = Router();

router.get("/", validateJWT, getAll);

router.get("/user", validateJWT, getByUser);

router.get("/:id", [
  validateJWT,
  param('id', 'No es un ID válido').isMongoId(),
  validateFields
], getById);

router.post("/", [
  validateJWT,
  check('plate', 'La placa es obligatoria').not().isEmpty(),
  check('description', 'La descripción es obligatoria').not().isEmpty(),
  check('type', 'El tipo es obligatorio').not().isEmpty(),
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

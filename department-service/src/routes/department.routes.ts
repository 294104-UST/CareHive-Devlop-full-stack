import express from 'express';
import { DepartmentController} from '../controllers/department.controller';
import { allowRoles, verifyToken } from '../middleware/auth.middleware';

const router = express.Router();

router.post('/create-dept', verifyToken,allowRoles(['HOSPITAL_ADMIN']), DepartmentController.createDepartment);
router.get('/get-dept', verifyToken, DepartmentController.getAllDepartments);
router.put('/:id', verifyToken, DepartmentController.updateDepartment);
router.delete('/:id', verifyToken, DepartmentController.deleteDepartment);
router.get('/:id',DepartmentController.getDepartmentById); // GET /departments/:id
router.get('/hospital/:hospitalId', DepartmentController.getDepartmentsByHospitalIdParam);

export default router;

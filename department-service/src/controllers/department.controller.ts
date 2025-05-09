import { Request, Response } from 'express';
import { DepartmentService } from '../services/department.service';
import { Department } from '../models/department.model';

const departmentService = new DepartmentService();

export class DepartmentController {
  // Create Department
  static async createDepartment(req: Request, res: Response): Promise<void> {
    try {
      const { name } = req.body;
      const hospitalId = req.user?.hospitalId;

      if (!hospitalId) {
        res.status(400).json({ message: 'Hospital ID is missing in token' });
        return;
      }
      console.log("name is"+hospitalId);
      const newDepartment = await departmentService.createDepartment(name, hospitalId);
      res.status(201).json(newDepartment);  // No return needed
    } catch (error) {
      console.error('Error creating department:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  // Get All Departments
  static async getAllDepartments(req: Request, res: Response): Promise<void> {
    try {
      const hospitalId = req.user?.hospitalId;

      if (!hospitalId) {
        res.status(400).json({ message: 'Hospital ID is missing in token' });
        return;
      }
      console.log("Hi"+hospitalId+"##")
      const departments = await departmentService.getDepartmentsByHospitalId(hospitalId);
      res.status(200).json(departments);  // No return needed
    } catch (error) {
      console.error('Error fetching departments:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  static async getDepartmentsByHospitalIdParam(req: Request, res: Response): Promise<void> {
    try {
      const { hospitalId } = req.params;
      const departments = await departmentService.getDepartmentsByHospitalId(hospitalId);
  
      res.status(200).json(departments);
    } catch (error) {
      console.error('Error fetching departments by hospital ID param:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  // Update Department
  static async updateDepartment(req: Request, res: Response): Promise<void> {
    try {
      const { name } = req.body;
      const hospitalId = req.user?.hospitalId;

      if (!hospitalId) {
        res.status(400).json({ message: 'Hospital ID is missing in token' });
        return;
      }

      const updatedDepartment = await departmentService.updateDepartment(req.params.id, name, hospitalId);
      res.status(200).json(updatedDepartment);  // No return needed
    } catch (error) {
      console.error('Error updating department:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  // Delete Department
  static async deleteDepartment(req: Request, res: Response): Promise<void> {
    try {
      const hospitalId = req.user?.hospitalId;

      if (!hospitalId) {
        res.status(400).json({ message: 'Hospital ID is missing in token' });
        return;
      }

      await departmentService.deleteDepartment(req.params.id, hospitalId);
      res.status(204).json();  // No content to return
    } catch (error) {
      console.error('Error deleting department:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  static async getDepartmentById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
  
      const department = await Department.findById(id);
      if (!department) {
        res.status(404).json({ message: 'Department not found' });
        return ;
      }
  
      res.status(200).json(department);
      return ;
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Unexpected error while fetching department';
      console.error('Error in getDepartmentById:', errorMessage);
      res.status(500).json({ message: 'Internal server error' });
      return ;
    }
  }

}



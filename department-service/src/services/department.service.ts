import { Department, IDepartment } from '../models/department.model';

export class DepartmentService {
  async createDepartment(name: string, hospitalId: string): Promise<IDepartment> {
    const existing = await Department.findOne({ name, hospitalId });
    if (existing) throw new Error('Department already exists in this hospital');

    const department = new Department({ name, hospitalId });
    return await department.save();
  }

  async getDepartmentsByHospitalId(hospitalId: string) {
    return Department.find({ hospitalId });
  }

  async updateDepartment(id: string, name: string, hospitalId: string) {
    // First, verify the department belongs to the hospital
    const department = await Department.findOne({ _id: id, hospitalId });
  
    if (!department) {
      throw new Error("Department not found or does not belong to your hospital");
    }
  
    // If valid, proceed with the update
    return Department.findByIdAndUpdate(
      id,
      { name },
      { new: true } // Returns the updated document
    );
  }

  async deleteDepartment(id: string, hospitalId: string) {
    // First, find and verify the department belongs to the hospital
    const department = await Department.findOne({ _id: id, hospitalId });
    
    if (!department) {
      throw new Error("Department not found or does not belong to your hospital");
    }
  
    // If valid, proceed with deletion
    return Department.findByIdAndDelete(id);
  }
}

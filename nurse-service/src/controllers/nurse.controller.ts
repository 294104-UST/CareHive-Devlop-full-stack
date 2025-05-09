import { Request, Response } from 'express';
import { Nurse } from '../models/nurse.model';
import axios from 'axios';
import bcrypt from 'bcrypt';
import { Types } from 'mongoose';

export class NurseController {
  // Create nurse (Hospital Admin Only)
  static async createNurse(req: Request, res: Response): Promise<void> {
    try {
      const { name, email, departmentId, password } = req.body;
      const user = req.user as { id: string; role: string; hospitalId: string };

      // Validate required fields
      if (!name || !email || !departmentId || !password) {
        res.status(400).json({ message: 'All fields are required: name, email, departmentId, password' });
        return;
      }

      // Authorization check: Only Hospital Admin can create nurses
      if (user.role !== 'HOSPITAL_ADMIN') {
        res.status(403).json({ message: 'Only Hospital Admins can create nurses' });
        return;
      }

      if (!user.hospitalId) {
        res.status(400).json({ message: 'Missing hospital ID in token' });
        return;
      }

      // Validate department exists by making a request to the Department Service
      try {
        const response = await axios.get(`http://localhost:3000/api/dept/${departmentId}`, {
          headers: {
            Authorization: req.headers.authorization || ''
          }
        });

        if (!response.data || response.status !== 200) {
          res.status(404).json({ message: 'Department not found' });
          return;
        }
      } catch (err: any) {
        console.error('Department validation error:', err);
        res.status(502).json({
          message: 'Failed to validate department',
          error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
        return;
      }

      // Hash password for the nurse
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create nurse document
      const newNurse = new Nurse({
        name,
        email,
        departmentId,
        hospitalId: user.hospitalId,  // Extracted from token
        password: hashedPassword,
      });

      // Save nurse to the database
      await newNurse.save();

      const authServiceUrl = 'http://localhost:3000/api/auth/register';  // Replace with actual auth-service URL
      await axios.post(authServiceUrl, {
        name,
        email,
        password: hashedPassword,  // Send the hashed password to the auth-service
        role: 'NURSE',
        hospitalId: user.hospitalId,
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Service-Auth': process.env.SERVICE_AUTH_SECRET,  // Service authentication token
        }
      });
      // Omit password from response
      newNurse.password = " ";

      res.status(201).json({ message: 'Nurse created successfully', nurse: newNurse });
    } catch (error: any) {
      console.error('Error creating nurse:', error);

      // Handle duplicate email
      if (error.code === 11000 || error.message.includes('duplicate')) {
        res.status(409).json({ message: 'Email already exists' });
        return;
      }

      res.status(500).json({
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  static async getNursesByHospital(req: Request, res: Response): Promise<void> {
    try {
      // Extract user details from the token
      const user = req.user as { role: string; hospitalId: string };

      // Authorization check: Only Hospital Admin can access this route
      if (user.role !== 'HOSPITAL_ADMIN') {
        res.status(403).json({ message: 'Only Hospital Admins can access this' });
        return;
      }

      // Fetch all nurses associated with the hospitalId
      const nurses = await Nurse.find({ hospitalId: user.hospitalId });

      if (!nurses || nurses.length === 0) {
        res.status(404).json({ message: 'No nurses found for this hospital' });
        return;
      }

      // Return the list of nurses
      res.status(200).json(nurses);
    } catch (error) {
      console.error('Error fetching nurses:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  /** ─── GET NURSES BY DEPARTMENT ───────────────────────────────────────────── */
  static async getNursesByDepartment(req: Request, res: Response): Promise<void> {
    try {
      const { departmentId } = req.params;  // Extract departmentId from URL parameter
      const user = req.user as { role: string; hospitalId: string };

      // Authorization check: Only Hospital Admin can access this route
      if (user.role !== 'HOSPITAL_ADMIN') {
        res.status(403).json({ message: 'Only Hospital Admins can access this' });
        return;
      }

      if (!departmentId || !user.hospitalId) {
        res.status(400).json({ message: 'Department ID and Hospital ID are required' });
        return;
      }

      // Query nurses who belong to the department and hospital
      const nurses = await Nurse.find({
        departmentId,
        hospitalId: user.hospitalId
      });

      if (!nurses || nurses.length === 0) {
        res.status(404).json({ message: 'No nurses found for this department' });
        return;
      }

      // Return the list of nurses
      res.status(200).json(nurses);
    } catch (error) {
      console.error('Error fetching nurses by department:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

   /** ─── GET AVAILABLE NURSES FOR SCHEDULING ───────────────────────────────── */
  static async getAvailableNursesForScheduling(req: Request, res: Response): Promise<void> {
    try {
      const { date } = req.query;  // Extract the date from the query string
      const user = req.user as { role: string; hospitalId: string };

      // Authorization check: Only Hospital Admin can access this route
      if (user.role !== 'HOSPITAL_ADMIN') {
        res.status(403).json({ message: 'Only Hospital Admins can access this' });
        return;
      }

      // Validate the date query parameter
      if (!date) {
        res.status(400).json({ message: 'Date is required' });
        return;
      }

      // Ensure the date is a string and parse it
      const scheduledDate = new Date(date as string);  // Convert to Date object
      if (isNaN(scheduledDate.getTime())) {
        res.status(400).json({ message: 'Invalid date format' });
        return;
      }

      // Query nurses who are available and not on leave for the given date
      const availableNurses = await Nurse.find({
        hospitalId: user.hospitalId,
        available: true,
        leaveDates: { $ne: scheduledDate } // Ensure nurse is not on leave on this date
      });

      if (!availableNurses || availableNurses.length === 0) {
        res.status(404).json({ message: 'No available nurses for this date' });
        return;
      }

      // Return the list of available nurses
      res.status(200).json(availableNurses);
    } catch (error) {
      console.error('Error fetching available nurses for scheduling:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  static async getNurseByEmail(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.params;  // Extract email from URL parameter

      // Query nurse by email
      const nurse = await Nurse.findOne({ email });

      if (!nurse) {
        res.status(404).json({ message: 'Nurse not found' });
        return;
      }

      // Return the nurse's data
      res.status(200).json(nurse);
    } catch (error) {
      console.error('Error fetching nurse by email:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

   /** ─── VIEW OWN PROFILE (NURSE ROLE) ────────────────────────────────────── */
   static async getOwnProfile(req: Request, res: Response): Promise<void> {
    try {
      const user = req.user as { id: string; role: string };

      // Authorization check: Only Nurses can access this route
      if (user.role !== 'NURSE') {
        res.status(403).json({ message: 'Only nurses can access this route' });
        return;
      }

      // Fetch nurse by their id (extracted from the JWT token)
      const nurse = await Nurse.findById(user.id);

      if (!nurse) {
        res.status(404).json({ message: 'Nurse not found' });
        return;
      }

      // Omit password from the response for security
      nurse.password = "";

      // Return the nurse's profile
      res.status(200).json(nurse);
    } catch (error) {
      console.error('Error fetching nurse profile:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
  /** ─── GET SCHEDULED DATES (NURSE ROLE) ─────────────────────────────────── */
  static async getScheduledDates(req: Request, res: Response): Promise<void> {
    try {
      // 1) Verify the user is a nurse and fetch their profile
      const user = req.user as { id: string; role: string };
     

      const nurse = await Nurse.findById(user.id);
      if (!nurse) {
        res.status(404).json({ message: 'Nurse not found' });
        return;
      }

      // 2) Grab the incoming JWT and forward it
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        res.status(401).json({ message: 'Missing auth token' });
        return;
      }

      // 3) Fetch the full schedule objects from the scheduling service
      const scheduleRes = await axios.get(
        `http://localhost:3000/api/scheduling/user/${nurse._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // 4) Respond with the array of schedule entries
      res.status(200).json(scheduleRes.data);
    } catch (error: any) {
      console.error('Error fetching nurse scheduled dates:', error.message || error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
  

   /** ─── GET NURSE BY ID ──────────────────────────────────────────────────── */
   static async getNurseById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;  // Extract nurse id from the URL parameter

      // Query nurse by id
      const nurse = await Nurse.findById(id);

      if (!nurse) {
        res.status(404).json({ message: 'Nurse not found' });
        return;
      }

      // Return the nurse's profile
      res.status(200).json(nurse);
    } catch (error) {
      console.error('Error fetching nurse by ID:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  /** ─── UPDATE NURSE ─────────────────────────────────────────────────────── */
  static async updateNurse(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;  // Extract nurse id from the URL parameter
      const { name, email, departmentId, available, leaveDates } = req.body; // Extract the fields to update

      // Validate the provided fields
      if (!name || !email || !departmentId || available === undefined || leaveDates === undefined) {
        res.status(400).json({ message: 'All fields (name, email, departmentId, available, leaveDates) are required' });
        return;
      }

      // Query nurse by id
      const nurse = await Nurse.findById(id);

      if (!nurse) {
        res.status(404).json({ message: 'Nurse not found' });
        return;
      }

      // Update the nurse’s profile
      nurse.name = name;
      nurse.email = email;
      nurse.departmentId = departmentId;
      nurse.available = available;
      nurse.leaveDates = leaveDates;

      // Save the updated nurse data
      const updatedNurse = await nurse.save();

      // Return the updated nurse's profile
      res.status(200).json(updatedNurse);
    } catch (error) {
      console.error('Error updating nurse:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  /** ─── TOGGLE AVAILABILITY STATUS (NURSE ROLE) ───────────────────────────── */
  static async updateAvailability(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;  // Extract nurse id from the URL parameter
      const { available } = req.body; // Extract the 'available' status from the request body

      // Ensure 'available' is a boolean value
      if (typeof available !== 'boolean') {
        res.status(400).json({ message: "'available' must be a boolean value" });
        return;
      }

      // Query nurse by id
      const nurse = await Nurse.findById(id);

      if (!nurse) {
        res.status(404).json({ message: 'Nurse not found' });
        return;
      }

      // Update the nurse's availability status
      nurse.available = available;

      // Save the updated nurse data
      const updatedNurse = await nurse.save();

      // Return the updated nurse's profile
      res.status(200).json(updatedNurse);
    } catch (error) {
      console.error('Error updating nurse availability:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
  /** ─── ADD LEAVE DATE (NURSE ROLE) ─────────────────────────────────────── */
  static async addLeaveDate(req: Request, res: Response): Promise<void> {
    try {
      const user = req.user as { id: string; role: string };

      // Authorization check: Only Nurses can access this route
      if (user.role !== 'NURSE') {
        res.status(403).json({ message: 'Only nurses can access this route' });
        return;
      }

      // Extract leaveDate from the request body
      const { leaveDate } = req.body;

      // Validate the leaveDate
      if (!leaveDate) {
        res.status(400).json({ message: 'Leave date is required' });
        return;
      }

      // Convert leaveDate to a JavaScript Date object
      const parsedLeaveDate = new Date(leaveDate);
      if (isNaN(parsedLeaveDate.getTime())) {
        res.status(400).json({ message: 'Invalid leave date format' });
        return;
      }

      // Query the nurse by their id (extracted from the JWT token)
      const nurse = await Nurse.findById(user.id);

      if (!nurse) {
        res.status(404).json({ message: 'Nurse not found' });
        return;
      }

      // Add the leaveDate to the nurse's leaveDates array
      nurse.leaveDates.push(parsedLeaveDate);

      // Save the updated nurse
      const updatedNurse = await nurse.save();

      // Return the updated nurse's profile
      res.status(200).json(updatedNurse);
    } catch (error) {
      console.error('Error adding leave date:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  /** ─── REMOVE LEAVE DATE (NURSE ROLE) ──────────────────────────────────── */
  /** ─── REMOVE LEAVE DATE (NURSE ROLE) ──────────────────────────────────── */
  static async removeLeaveDate(req: Request, res: Response): Promise<void> {
    try {
      const user = req.user as { id: string; role: string };

      // Authorization check: Only Nurses can access this route
      if (user.role !== 'NURSE') {
        res.status(403).json({ message: 'Only nurses can access this route' });
        return;
      }

      const { leaveDate } = req.body;
      
      if (!leaveDate) {
        res.status(400).json({ message: 'Leave date is required' });
        return;
      }

      // Convert leaveDate to a JavaScript Date object
      const parsedLeaveDate = new Date(leaveDate);
      if (isNaN(parsedLeaveDate.getTime())) {
        res.status(400).json({ message: 'Invalid leave date format' });
        return;
      }

      // Call the removeLeaveDate function to update the nurse's leaveDates array
      const updatedNurse = await NurseController.removeLeaveDateFromDB(user.id, parsedLeaveDate);

      if (!updatedNurse) {
        res.status(404).json({ message: 'Nurse not found or leave date not present' });
        return;
      }

      // Return the updated nurse's profile
      res.status(200).json(updatedNurse);
    } catch (error) {
      console.error('Error removing leave date:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  // Helper method to handle the database operation using the $pull operator
  static async removeLeaveDateFromDB(nurseId: string, leaveDate: Date) {
    return Nurse.findByIdAndUpdate(
      nurseId,
      { $pull: { leaveDates: leaveDate } },  // Pull the leaveDate from the leaveDates array
      { new: true }  // Return the updated document
    );
  }

  /** ─── ADD SCHEDULE TO NURSE (HOSPITAL_ADMIN OR NURSE ROLE) ───────────────── */
  static async addScheduleToNurse(req: Request, res: Response): Promise<void> {
    try {
      const { nurseId } = req.params;  // Extract nurseId from URL parameter
      const { scheduleId } = req.body;  // Extract scheduleId from the request body

      // Validate that scheduleId is provided
      if (!scheduleId) {
        res.status(400).json({ message: 'Schedule ID is required' });
        return;
      }

      // Query the nurse by their ID
      const nurse = await Nurse.findById(nurseId);
      if (!nurse) {
        res.status(404).json({ message: 'Nurse not found' });
        return;
      }

      // Ensure scheduleDates is an array
      if (!Array.isArray(nurse.scheduledDates)) {
        nurse.scheduledDates = [];
      }

      const oid = new Types.ObjectId(scheduleId);

      // Check for duplicate schedule
      const alreadyScheduled = nurse.scheduledDates.some(existingId =>
        existingId.equals(oid)
      );

      if (!alreadyScheduled) {
        // Add the scheduleId to the nurse's scheduledDates array
        nurse.scheduledDates.push(oid);
        const updatedNurse = await nurse.save();
        res.status(200).json(updatedNurse);
        return ;
      }

      // If the schedule is already assigned, return the nurse unchanged
      res.status(400).json({ message: 'Schedule already assigned to this nurse' });
    } catch (error) {
      console.error('Error adding schedule to nurse:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  /** ─── DELETE NURSE ──────────────────────────────────────────────────────── */
  static async deleteNurse(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;  // Extract nurseId from URL parameter

      // Find the nurse by ID
      const nurse = await Nurse.findByIdAndDelete(id);

      // If nurse is not found, return a 404 error
      if (!nurse) {
        res.status(404).json({ message: 'Nurse not found' });
        return;
      }

      // If nurse is successfully deleted, return a success message
      res.status(200).json({ message: 'Nurse deleted successfully' });
    } catch (error) {
      console.error('Error deleting nurse:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}

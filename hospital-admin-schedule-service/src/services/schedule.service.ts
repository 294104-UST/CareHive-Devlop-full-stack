import { Schedule } from '../models/schedule.model';
import axios from 'axios';

interface ScheduleInput {
  hospitalId: string;
  assignedTo: string;
  role: string;
  date: string;
  timeSlot: string;
}
interface StaffProfile {
  _id: string;
  name: string;
  email: string;
  departmentId: string;
  hospitalId: string;
  available: boolean;
  leaveDates: string[];       // ISO strings like "2025-05-06"
  scheduledDates: string[];   // Optional future use
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export class ScheduleService {
  static async assignSchedule(input: ScheduleInput) {
    const { assignedTo, date, timeSlot, hospitalId } = input;

    // 1. Check if a schedule already exists for this person on this date & timeSlot
    const existingSchedule = await Schedule.findOne({
      assignedTo,
      date: new Date(date),
      timeSlot,
      hospitalId
    });

    if (existingSchedule) {
      throw new Error('Schedule already exists for this person on the selected date and time slot.');
    }

    // 2. No duplicates — proceed to save
    const schedule = new Schedule(input);
    return await schedule.save();
  }

  static async checkIfOnLeave(assignedTo: string, role: string, date: Date) {
    const baseUrls: Record<string, string> = {
      DOCTOR: 'http://localhost:3000/api/doctor',
      NURSE: 'http://localhost:3000/api/nurse',
    };
  
    const profileUrl = `${baseUrls[role]}/${assignedTo}`;
    const response = await axios.get<StaffProfile>(profileUrl);
    const profile = response.data;
  
    const leaveDates = profile.leaveDates.map((d) => new Date(d).toDateString());
    const inputDateStr = date.toDateString();
  
    const isOnLeave = leaveDates.includes(inputDateStr);
  
    // Suggest available dates for the next 14 days
    const today = new Date();
    const availableDates: string[] = [];
  
    for (let i = 0; i < 14; i++) {
      const futureDate = new Date(today);
      futureDate.setDate(today.getDate() + i);
      const dateStr = futureDate.toDateString();
  
      if (!leaveDates.includes(dateStr)) {
        availableDates.push(futureDate.toISOString().split('T')[0]);
      }
    }
  
    return {
      isOnLeave,
      availableDates, // formatted as 'YYYY-MM-DD'
    };
  }
  

  // Get schedules for a specific hospital
  static async getSchedulesByHospital(hospitalId: string) {
    return Schedule.find({ hospitalId }).sort({ date: 1 });
  }

  // Get schedules for a specific user (doctor/nurse/staff)
  static async getSchedulesForUser(assignedTo: string) {
    return Schedule.find({ assignedTo }).sort({ date: 1 });
  }
}

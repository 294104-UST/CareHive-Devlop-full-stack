import axios from 'axios';

const APPOINTMENT_SERVICE_URL = process.env.APPOINTMENT_SERVICE_URL || 'http://localhost:3000/api/appointment';

export class AppointmentService {
  static async bookAppointment(data: any, token: string) {
    const res = await axios.post(`${APPOINTMENT_SERVICE_URL}/book`, data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  }

  static async getMyAppointments(patientId: string, token: string) {
    const res = await axios.get(`${APPOINTMENT_SERVICE_URL}/patient/${patientId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  }
}

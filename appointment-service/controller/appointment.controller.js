const Appointment = require('../model/appointment.model');
const hospitalService = require('../services/hospitalService');
const departmentService = require('../services/departmentService');
const doctorService = require('../services/doctorService');

// Book an appointment
exports.bookAppointment = async (req, res) => {
  const { doctorId, departmentId, hospitalId, appointmentDate } = req.body;
  const patientId = req.user?.id;

  console.log("Booking attempt by patient:", patientId);

  if (!patientId) {
    return res.status(401).json({ message: 'Unauthorized - patient ID missing' });
  }

  try {
    // 🔍 Check for duplicate appointment
    const existing = await Appointment.findOne({
      patientId,
      doctorId,
      appointmentDate
    });

    if (existing) {
      return res.status(409).json({
        message: 'Duplicate appointment: already booked with this doctor at the same time'
      });
    }

    // ✅ Proceed with booking
    const newAppointment = new Appointment({
      patientId,
      doctorId,
      departmentId,
      hospitalId,
      appointmentDate,
      status: 'SCHEDULED'
    });

    await newAppointment.save();
    res.status(201).json(newAppointment);
  } catch (error) {
    console.error('Error booking appointment:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get list of hospitals
exports.getHospitals = async (req, res) => {
  try {
    const hospitals = await hospitalService.getHospitals();
    res.status(200).json(hospitals);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching hospitals', error });
  }
};

// Get available departments for a hospital
exports.getAvailableDepartments = async (req, res) => {
  try {
    // Verify token is present (optional, if you want extra validation)
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Authorization token required' });
    }
    console.log("getavilablemethod token is "+token);

    // Forward the request to department service
    const departments = await departmentService.getDepartmentsByHospital(token);
    res.status(200).json(departments);
    
  } catch (error) {
    console.error('Error fetching departments:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching departments',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
//newly added
//get all depts
exports.getAllDepts = async (req, res) => {

  try {
    const departments = await departmentService.find();
    res.status(200).json(departments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching departments', error });
  }
};

//get all doctors
exports.getAllDoctors = async (req, res) => {
  
  try {
    const doctors = await doctorService.find();
    res.status(200).json(doctors);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching doctors', error });
  }
};

// Get available doctors for a department
exports.getDoctorsByDepartment = async (req, res) => {
  try {
    const { departmentId } = req.params;
    const { hospitalId } = req.query;
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authorization token required'
      });
    }

    if (!hospitalId) {
      return res.status(400).json({
        success: false,
        message: 'Hospital ID is required in query params'
      });
    }

    // Forward the token + hospitalId explicitly
    const doctors = await doctorService.getDoctorsByDepartmentAndHospital(departmentId, hospitalId, token);

    return res.status(200).json({
      success: true,
      data: doctors,
      count: doctors.length
    });

  } catch (error) {
    console.error('Error in getDoctorsByDepartment:', error);
    const statusCode = error.message.includes('Failed to fetch') ? 502 : 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message.includes('Failed to fetch') 
        ? 'Doctor service unavailable' 
        : 'Internal server error'
    });
  }
};


// Get all appointments
exports.getAllAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find();
    res.status(200).json(appointments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching appointments', error });
  }
};

// Get appointment by ID
exports.getAppointmentById = async (req, res) => {
  console.log("hello");
  const { id } = req.params;

  try {
    const appointment = await Appointment.findById(id);
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
    res.status(200).json(appointment);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching appointment', error });
  }
};


exports.getAppointmentsByPatientId = async (req, res) => {
  const { patientId } = req.params;

  try {
    const appointments = await Appointment.find({ patientId });

    if (!appointments || appointments.length === 0) {
      return res.status(404).json({ message: 'No appointments found for this patient' });
    }

    res.status(200).json(appointments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching appointments', error });
  }
};


// Update appointment
exports.updateAppointment = async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  try {
    const updated = await Appointment.findByIdAndUpdate(id, updateData, { new: true });
    if (!updated) return res.status(404).json({ message: 'Appointment not found' });
    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Error updating appointment', error });
  }
};

// Delete appointment
exports.deleteAppointment = async (req, res) => {
  const { id } = req.params;

  try {
    const deleted = await Appointment.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: 'Appointment not found' });
    res.status(200).json({ message: 'Appointment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting appointment', error });
  }
};

// GET /appointments/doctor/:doctorId
exports.getAppointmentsByDoctor = async (req, res) => {
  const { doctorId } = req.params;
  try {
    const appointments = await Appointment.find({ doctorId });
    res.status(200).json(appointments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching appointments for doctor', error });
  }
};



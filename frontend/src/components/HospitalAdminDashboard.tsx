import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import axios, { AxiosError } from 'axios';
import './HospitalAdminDashboard.css';

interface ErrorResponse {
  message: string;
}

interface Doctor {
  _id: string;
  name: string;
  email: string;
  specialization?: string;
  departmentId: string;
  department?: string;
  hospitalId: string;
  available: boolean;
  leaveDates: string[];
  scheduledDates: string[];
}

interface Nurse {
  _id: string;
  name: string;
  email: string;
  departmentId: string;
  department?: {
    name: string;
  };
  hospitalId: string;
}

interface Department {
  _id: string;
  name: string;
  description: string;
  hospitalId: string;
}

interface Hospital {
  _id: string;
  name: string;
}

interface BaseNewItem {
  name: string;
  email: string;
  password: string;
  departmentId: string;
}

interface DoctorNewItem extends BaseNewItem {
  specialization: string;
}

interface DepartmentNewItem {
  name: string;
  description: string;
}

type NewItem = DoctorNewItem | DepartmentNewItem;

const HospitalAdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'doctors' | 'departments'>('doctors');
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [nurses, setNurses] = useState<Nurse[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [hospital, setHospital] = useState<Hospital | null>(null);
  const [adminName, setAdminName] = useState<string>('');
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [newItem, setNewItem] = useState<DoctorNewItem>({
    name: '',
    email: '',
    password: '',
    departmentId: '',
    specialization: ''
  });

  useEffect(() => {
    const userRole = localStorage.getItem('userRole');
    const hospitalId = localStorage.getItem('hospitalId');
    const name = localStorage.getItem('userName');
    const token = localStorage.getItem('token');
    
    console.log('Initial auth check:', {
      userRole,
      hospitalId,
      name,
      hasToken: !!token
    });
    
    if (userRole !== 'HOSPITAL_ADMIN' || !hospitalId || !token) {
      console.log('Auth check failed, redirecting to login');
      navigate('/login');
      return;
    }

    setAdminName(name || '');
    fetchHospitalDetails(hospitalId);
    fetchData();
  }, [navigate]);

  const fetchHospitalDetails = async (hospitalId: string): Promise<void> => {
    try {
      const response = await axios.get<Hospital>(`http://localhost:3000/api/auth/hospitals/${hospitalId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setHospital(response.data);
    } catch (err) {
      const error = err as AxiosError<ErrorResponse>;
      setError(error.response?.data?.message || 'Failed to fetch hospital details');
    }
  };

  const fetchData = async (): Promise<void> => {
    setLoading(true);
    setError('');
    try {
      const hospitalId = localStorage.getItem('hospitalId');
      const token = localStorage.getItem('token');

      if (!hospitalId || !token) {
        throw new Error('Missing hospital ID or token');
      }

      // Fetch doctors first
      console.log('Fetching doctors...');
      const doctorsResponse = await axios.get<Doctor[]>(`http://localhost:3000/api/doctor/hospital/${hospitalId}`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Doctors response:', doctorsResponse.data);
      if (doctorsResponse.data) {
        setDoctors(doctorsResponse.data);
        setError(''); // Clear any existing errors when data is successfully fetched
      }

      // Fetch departments
      console.log('Fetching departments...');
      const departmentsResponse = await axios.get<Department[]>(`http://localhost:3000/api/dept/hospital/${hospitalId}`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Departments response:', departmentsResponse.data);
      if (departmentsResponse.data) {
        setDepartments(departmentsResponse.data);
      }

      // Fetch nurses
      // console.log('Fetching nurses...');
      // const nursesResponse = await axios.get<Nurse[]>(`http://localhost:3000/api/nurse/hospital/${hospitalId}`, {
      //   headers: { 
      //     Authorization: `Bearer ${token}`,
      //     'Content-Type': 'application/json'
      //   }
      // });
      
      // console.log('Nurses response:', nursesResponse.data);
      // if (nursesResponse.data) {
      //   setNurses(nursesResponse.data);
      // }

    } catch (err) {
      const error = err as AxiosError<ErrorResponse>;
      console.error('Error fetching data:', error);
      console.error('Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        headers: error.response?.headers
      });
      
      if (error.response) {
        setError(error.response.data?.message || 'Failed to fetch data from server');
      } else if (error.request) {
        setError('No response received from server. Please check your connection.');
      } else {
        setError('Error setting up the request: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = (): void => {
    localStorage.clear();
    navigate('/login');
  };

  const handleAddDoctor = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const hospitalId = localStorage.getItem('hospitalId');
      const token = localStorage.getItem('token');

      if (!hospitalId || !token) {
        throw new Error('Missing hospital ID or token');
      }

      const response = await axios.post<Doctor>('http://localhost:3000/api/doctor/create-doctor', {
        ...newItem,
        hospitalId,
        role: 'DOCTOR'
      }, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data) {
        setDoctors(prev => [...prev, response.data]);
        setSuccess('Doctor added successfully');
        setNewItem({ 
          name: '', 
          email: '', 
          password: '', 
          departmentId: '', 
          specialization: '' 
        });
        setShowAddForm(false);
      }
    } catch (err) {
      const error = err as AxiosError<ErrorResponse>;
      console.error('Error adding doctor:', error);
      setError(error.response?.data?.message || 'Failed to add doctor');
    }
  };

  const handleAddDepartment = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const hospitalId = localStorage.getItem('hospitalId');
      const token = localStorage.getItem('token');

      if (!hospitalId || !token) {
        throw new Error('Missing hospital ID or token');
      }

      const departmentData: DepartmentNewItem = {
        name: newItem.name,
        description: newItem.specialization
      };

      const response = await axios.post<Department>('http://localhost:3000/api/dept/create-dept', {
        ...departmentData,
        hospitalId
      }, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data) {
        setDepartments(prev => [...prev, response.data]);
        setSuccess('Department added successfully');
        setNewItem({ 
          name: '', 
          email: '', 
          password: '', 
          departmentId: '', 
          specialization: '' 
        });
        setShowAddForm(false);
      }
    } catch (err) {
      const error = err as AxiosError<ErrorResponse>;
      console.error('Error adding department:', error);
      setError(error.response?.data?.message || 'Failed to add department');
    }
  };

  const handleDeleteDoctor = async (doctorId: string): Promise<void> => {
    if (!window.confirm('Are you sure you want to delete this doctor?')) return;

    try {
      await axios.delete(`http://localhost:3000/api/doctor/${doctorId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setDoctors(prev => prev.filter(d => d._id !== doctorId));
      setSuccess('Doctor deleted successfully');
    } catch (err) {
      const error = err as AxiosError<ErrorResponse>;
      setError(error.response?.data?.message || 'Failed to delete doctor');
    }
  };

  const handleDeleteDepartment = async (departmentId: string): Promise<void> => {
    if (!window.confirm('Are you sure you want to delete this department?')) return;

    try {
      await axios.delete(`http://localhost:3000/api/dept/${departmentId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setDepartments(prev => prev.filter(d => d._id !== departmentId));
      setSuccess('Department deleted successfully');
    } catch (err) {
      const error = err as AxiosError<ErrorResponse>;
      setError(error.response?.data?.message || 'Failed to delete department');
    }
  };

  const handleEditDoctor = async (doctorId: string): Promise<void> => {
    // TODO: Implement edit functionality
    console.log('Edit doctor:', doctorId);
  };

  const handleEditDepartment = async (departmentId: string): Promise<void> => {
    // TODO: Implement edit functionality
    console.log('Edit department:', departmentId);
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>): void => {
    const { name, value } = e.target;
    setNewItem(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const renderDoctorsList = () => {
    console.log('Rendering doctors list. Current state:', {
      loading,
      error,
      doctorsCount: doctors.length,
      doctors
    });

    if (loading) {
      return <div className="loading-spinner">Loading...</div>;
    }

    if (error) {
      return <div className="error-message">{error}</div>;
    }

    if (!doctors || doctors.length === 0) {
      return <div className="no-data-message">No doctors found</div>;
    }

    return (
      <div className="doctors-grid">
        {doctors.map(doctor => (
          <div key={doctor._id} className="doctor-card">
            <div className="doctor-header">
              <h3>{doctor.name}</h3>
              <span className={`status-badge ${doctor.available ? 'available' : 'unavailable'}`}>
                {doctor.available ? 'Available' : 'Unavailable'}
              </span>
            </div>
            <div className="doctor-info">
              <p><strong>Email:</strong> {doctor.email}</p>
              <p><strong>Department:</strong> {doctor.department || 'Not assigned'}</p>
              <p><strong>Specialization:</strong> {doctor.specialization || 'Not specified'}</p>
            </div>
            <div className="doctor-actions">
              <button 
                className="edit-btn"
                onClick={() => handleEditDoctor(doctor._id)}
              >
                Edit
              </button>
              <button 
                className="delete-btn"
                onClick={() => handleDeleteDoctor(doctor._id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>Hospital Admin Dashboard</h1>
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-icon">👨‍⚕️</div>
          <div className="stat-info">
            <h3>Total Doctors</h3>
            <p>{doctors.length}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🏥</div>
          <div className="stat-info">
            <h3>Departments</h3>
            <p>{departments.length}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📅</div>
          <div className="stat-info">
            <h3>Appointments</h3>
            <p>0</p>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="tab-navigation">
          <button 
            className={`tab-btn ${activeTab === 'doctors' ? 'active' : ''}`}
            onClick={() => setActiveTab('doctors')}
          >
            Doctors
          </button>
          <button 
            className={`tab-btn ${activeTab === 'departments' ? 'active' : ''}`}
            onClick={() => setActiveTab('departments')}
          >
            Departments
          </button>
        </div>

        <div className="tab-content">
          {activeTab === 'doctors' && (
            <div className="doctors-section">
              <div className="section-header">
                <h2>Manage Doctors</h2>
                <button 
                  className="add-btn"
                  onClick={() => setShowAddForm(!showAddForm)}
                >
                  {showAddForm ? 'Cancel' : 'Add Doctor'}
                </button>
              </div>

              {showAddForm && (
                <div className="add-form-container">
                  <form onSubmit={handleAddDoctor} className="add-form">
                    <div className="form-group">
                      <input
                        type="text"
                        placeholder="Name"
                        name="name"
                        value={newItem.name}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <input
                        type="email"
                        placeholder="Email"
                        name="email"
                        value={newItem.email}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <input
                        type="password"
                        placeholder="Password"
                        name="password"
                        value={newItem.password}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <input
                        type="text"
                        placeholder="Specialization"
                        name="specialization"
                        value={newItem.specialization}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <select
                        name="departmentId"
                        value={newItem.departmentId}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Select Department</option>
                        {departments.map(dept => (
                          <option key={dept._id} value={dept._id}>
                            {dept.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <button type="submit" className="submit-btn">Add Doctor</button>
                  </form>
                </div>
              )}

              {renderDoctorsList()}
            </div>
          )}

          {activeTab === 'departments' && (
            <div className="departments-section">
              <div className="section-header">
                <h2>Manage Departments</h2>
                <button 
                  className="add-btn"
                  onClick={() => setShowAddForm(!showAddForm)}
                >
                  {showAddForm ? 'Cancel' : 'Add Department'}
                </button>
              </div>

              {showAddForm && (
                <div className="add-form-container">
                  <form onSubmit={handleAddDepartment} className="add-form">
                    <div className="form-group">
                      <input
                        type="text"
                        placeholder="Department Name"
                        name="name"
                        value={newItem.name}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <textarea
                        placeholder="Description"
                        name="specialization"
                        value={newItem.specialization}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <button type="submit" className="submit-btn">Add Department</button>
                  </form>
                </div>
              )}

              {loading ? (
                <div className="loading-spinner">Loading...</div>
              ) : error ? (
                <div className="error-message">{error}</div>
              ) : (
                <div className="departments-grid">
                  {departments.map(dept => (
                    <div key={dept._id} className="department-card">
                      <div className="department-header">
                        <h3>{dept.name}</h3>
                      </div>
                      <div className="department-info">
                        <p>{dept.description}</p>
                      </div>
                      <div className="department-actions">
                        <button 
                          className="edit-btn"
                          onClick={() => handleEditDepartment(dept._id)}
                        >
                          Edit
                        </button>
                        <button 
                          className="delete-btn"
                          onClick={() => handleDeleteDepartment(dept._id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {success && (
        <div className="success-message">
          {success}
          <button onClick={() => setSuccess('')}>×</button>
        </div>
      )}
    </div>
  );
};

export default HospitalAdminDashboard; 
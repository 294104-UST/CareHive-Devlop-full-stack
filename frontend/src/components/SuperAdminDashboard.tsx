import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './SuperAdminDashboard.css';

interface Hospital {
  _id: string;
  name: string;
  location: string;
  description: string;
}

interface HospitalAdmin {
  _id: string;
  name: string;
  email: string;
  role: string;
  hospitalId: string;
  hospitalName?: string;
}

const SuperAdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [admins, setAdmins] = useState<HospitalAdmin[]>([]);
  const [newHospital, setNewHospital] = useState({
    name: '',
    location: '',
    description: '',
  });
  const [editingHospital, setEditingHospital] = useState<Hospital | null>(null);
  const [newAdmin, setNewAdmin] = useState({
    name: '',
    email: '',
    password: '',
    hospitalId: '',
  });
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'hospitals' | 'admins'>('hospitals');
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingAdmins, setLoadingAdmins] = useState<boolean>(true);

  useEffect(() => {
    const userRole = localStorage.getItem('userRole');
    if (userRole !== 'SUPER_ADMIN') {
      navigate('/login');
      return;
    }
    fetchHospitals();
  }, [navigate]);

  useEffect(() => {
    if (hospitals.length > 0) {
      fetchAdmins();
    }
  }, [hospitals]);

  const fetchHospitals = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get('http://localhost:3000/api/auth/hospitals', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        }
      });
      setHospitals(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch hospitals');
    } finally {
      setLoading(false);
    }
  };

  const fetchAdmins = async () => {
    setLoadingAdmins(true);
    setError('');
    try {
      const response = await axios.get<HospitalAdmin[]>('http://localhost:3000/api/auth/admins', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        }
      });
      
      const adminsWithHospitalNames = response.data.map((admin: HospitalAdmin) => {
        const hospital = hospitals.find(h => h._id === admin.hospitalId);
        return {
          ...admin,
          hospitalName: hospital ? hospital.name : 'Not assigned'
        };
      });
      
      setAdmins(adminsWithHospitalNames);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch hospital admins');
    } finally {
      setLoadingAdmins(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const handleAddHospital = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const response = await axios.post('http://localhost:3000/api/auth/hospitals', newHospital, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        }
      });
      setHospitals([...hospitals, response.data]);
      setNewHospital({ name: '', location: '', description: '' });
      setSuccess('Hospital added successfully');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add hospital');
    }
  };

  const handleEditHospital = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingHospital) return;

    setError('');
    setSuccess('');

    try {
      const response = await axios.put(
        `http://localhost:3000/api/auth/hospitals/${editingHospital._id}`,
        editingHospital,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          }
        }
      );
      setHospitals(hospitals.map(hospital => 
        hospital._id === editingHospital._id ? response.data : hospital
      ));
      setEditingHospital(null);
      setSuccess('Hospital updated successfully');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update hospital');
    }
  };

  const handleDeleteHospital = async (hospitalId: string) => {
    if (!window.confirm('Are you sure you want to delete this hospital?')) return;

    setError('');
    setSuccess('');

    try {
      await axios.delete(`http://localhost:3000/api/auth/hospitals/${hospitalId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        }
      });
      setHospitals(hospitals.filter(h => h._id !== hospitalId));
      setSuccess('Hospital deleted successfully');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete hospital');
    }
  };

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const response = await axios.post('http://localhost:3000/api/auth/create-admin', {
        ...newAdmin,
        role: 'HOSPITAL_ADMIN',
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        }
      });

      // Add the new admin to the list with hospital name
      const hospital = hospitals.find(h => h._id === newAdmin.hospitalId);
      const newAdminWithHospital = {
        ...response.data,
        hospitalName: hospital ? hospital.name : 'Not assigned'
      };
      
      setAdmins(prevAdmins => [...prevAdmins, newAdminWithHospital]);
      setSuccess('Hospital admin created successfully');
      setNewAdmin({ name: '', email: '', password: '', hospitalId: '' });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create hospital admin');
    }
  };

  const handleDeleteAdmin = async (adminId: string) => {
    if (!window.confirm('Are you sure you want to delete this admin?')) return;

    setError('');
    setSuccess('');

    try {
      await axios.delete(`http://localhost:3000/api/auth/admins/${adminId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        }
      });
      setAdmins(admins.filter(admin => admin._id !== adminId));
      setSuccess('Hospital admin deleted successfully');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete hospital admin');
    }
  };

  // Separate input handler for hospital form
  const handleHospitalInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (editingHospital) {
      setEditingHospital(prev => prev ? { ...prev, [name]: value } : null);
    } else {
      setNewHospital(prev => ({ ...prev, [name]: value }));
    }
  };

  // Separate input handler for admin form
  const handleAdminInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewAdmin(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="super-admin-dashboard">
      <header className="dashboard-header">
        <h1>Super Admin Dashboard</h1>
        <button onClick={handleLogout} className="logout-button">Logout</button>
      </header>

      <main className="dashboard-content">
        <div className="tabs">
          <button 
            className={`tab-button ${activeTab === 'hospitals' ? 'active' : ''}`}
            onClick={() => setActiveTab('hospitals')}
          >
            Manage Hospitals
          </button>
          <button 
            className={`tab-button ${activeTab === 'admins' ? 'active' : ''}`}
            onClick={() => setActiveTab('admins')}
          >
            Manage Hospital Admins
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        {activeTab === 'hospitals' ? (
          <>
            <section className="add-hospital-section">
              <h2>{editingHospital ? 'Edit Hospital' : 'Add New Hospital'}</h2>
              <form onSubmit={editingHospital ? handleEditHospital : handleAddHospital} className="add-hospital-form">
                <div className="form-group">
                  <label htmlFor="name">Hospital Name:</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={editingHospital ? editingHospital.name : newHospital.name}
                    onChange={handleHospitalInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="location">Location:</label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={editingHospital ? editingHospital.location : newHospital.location}
                    onChange={handleHospitalInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="description">Description:</label>
                  <textarea
                    id="description"
                    name="description"
                    value={editingHospital ? editingHospital.description : newHospital.description}
                    onChange={handleHospitalInputChange}
                    required
                  />
                </div>
                <div className="form-actions">
                  <button type="submit" className="add-button">
                    {editingHospital ? 'Update Hospital' : 'Add Hospital'}
                  </button>
                  {editingHospital && (
                    <button 
                      type="button" 
                      className="cancel-button"
                      onClick={() => setEditingHospital(null)}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </section>

            <section className="hospitals-list-section">
              <h2>Registered Hospitals</h2>
              {loading ? (
                <div className="loading-message">Loading hospitals...</div>
              ) : hospitals.length === 0 ? (
                <div className="no-hospitals-message">No hospitals registered yet.</div>
              ) : (
                <div className="hospitals-list">
                  {hospitals.map(hospital => (
                    <div key={hospital._id} className="hospital-card">
                      <h3>{hospital.name}</h3>
                      <p><strong>Location:</strong> {hospital.location}</p>
                      <p><strong>Description:</strong> {hospital.description}</p>
                      <div className="hospital-actions">
                        <button 
                          className="edit-button"
                          onClick={() => setEditingHospital(hospital)}
                        >
                          Edit
                        </button>
                        <button 
                          className="delete-button"
                          onClick={() => handleDeleteHospital(hospital._id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        ) : (
          <>
            <section className="add-admin-section">
              <h2>Create Hospital Admin</h2>
              <form onSubmit={handleAddAdmin} className="add-admin-form">
                <div className="form-group">
                  <label htmlFor="adminName">Admin Name:</label>
                  <input
                    type="text"
                    id="adminName"
                    name="name"
                    value={newAdmin.name}
                    onChange={handleAdminInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="adminEmail">Email:</label>
                  <input
                    type="email"
                    id="adminEmail"
                    name="email"
                    value={newAdmin.email}
                    onChange={handleAdminInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="adminPassword">Password:</label>
                  <input
                    type="password"
                    id="adminPassword"
                    name="password"
                    value={newAdmin.password}
                    onChange={handleAdminInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="hospitalId">Select Hospital:</label>
                  <select
                    id="hospitalId"
                    name="hospitalId"
                    value={newAdmin.hospitalId}
                    onChange={handleAdminInputChange}
                    required
                  >
                    <option value="">Select a hospital</option>
                    {hospitals.map(hospital => (
                      <option key={hospital._id} value={hospital._id}>
                        {hospital.name}
                      </option>
                    ))}
                  </select>
                </div>
                <button type="submit" className="add-button">Create Admin</button>
              </form>
            </section>

            <section className="admins-list-section">
              <h2>Hospital Admins</h2>
              {loadingAdmins ? (
                <div className="loading-message">Loading admins...</div>
              ) : admins.length === 0 ? (
                <div className="no-hospitals-message">No hospital admins registered yet.</div>
              ) : (
                <div className="admins-list">
                  {admins.map(admin => (
                    <div key={admin._id} className="admin-card">
                      <h3>{admin.name}</h3>
                      <p><strong>Email:</strong> {admin.email}</p>
                      <p><strong>Hospital:</strong> {admin.hospitalName}</p>
                      <div className="admin-actions">
                        <button 
                          className="delete-button"
                          onClick={() => handleDeleteAdmin(admin._id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
};

export default SuperAdminDashboard;

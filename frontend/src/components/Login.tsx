import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Login.css';

interface LoginFormData {
  email: string;
  password: string;
  role: string;
}

interface DecodedToken {
  id: string;
  role: string;
  hospitalId?: string;
  iat: number;
  exp: number;
}

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
    role: 'patient'
  });
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const decodeToken = (token: string): DecodedToken => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Error decoding token:', error);
      throw new Error('Invalid token format');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let endpoint = '';
      // Determine the correct endpoint based on role
      if (formData.role === 'PATIENT') {
        endpoint = 'http://localhost:3000/api/patient/login';
      } else {
        endpoint = 'http://localhost:3000/api/auth/login';
      }

      console.log('Attempting login with:', { 
        email: formData.email,
        role: formData.role,
        endpoint 
      });

      // Send only email and password in the request body
      const response = await axios.post(endpoint, {
        email: formData.email,
        password: formData.password
      });

      console.log('Login response:', response.data);

      if (!response.data.token) {
        throw new Error('No token received from server');
      }

      // Decode the token to get user information
      const decodedToken = decodeToken(response.data.token);
      console.log('Decoded token:', decodedToken);

      // Store the token and user info
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('userRole', decodedToken.role);
      localStorage.setItem('userEmail', formData.email);
      localStorage.setItem('userId', decodedToken.id);
      if (decodedToken.hospitalId) {
        localStorage.setItem('hospitalId', decodedToken.hospitalId);
      }

      // Redirect based on role
      console.log('Redirecting based on role:', decodedToken.role);

      switch (decodedToken.role) {
        case 'SUPER_ADMIN':
          navigate('/super-admin-dashboard');
          break;
        case 'HOSPITAL_ADMIN':
          navigate('/hospital-admin-dashboard');
          break;
        case 'DOCTOR':
          navigate('/doctor-dashboard');
          break;
        case 'NURSE':
          navigate('/nurse-dashboard');
          break;
        case 'PATIENT':
          navigate('/patient-dashboard');
          break;
        default:
          console.error('Unknown role:', decodedToken.role);
          setError('Invalid role received from server');
          break;
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Hospital Management System</h2>
        <h3>Login</h3>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="role">Role:</label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
            >
              <option value="PATIENT">Patient</option>
              <option value="DOCTOR">Doctor</option>
              <option value="NURSE">Nurse</option>
              <option value="HOSPITAL_ADMIN">Hospital Admin</option>
              <option value="SUPER_ADMIN">Super Admin</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Enter your email"
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Enter your password"
            />
          </div>
          <button 
            type="submit" 
            className="login-button"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        
      </div>
    </div>
  );
};

export default Login; 
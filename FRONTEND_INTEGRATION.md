# MMS Backend - Frontend Integration Guide

## Table of Contents
1. [Overview](#overview)
2. [API Base Configuration](#api-base-configuration)
3. [Authentication Flow](#authentication-flow)
4. [API Service Setup](#api-service-setup)
5. [Module Integration](#module-integration)
6. [Error Handling](#error-handling)
7. [Role-Based Access](#role-based-access)
8. [Complete API Reference](#complete-api-reference)

---

## Overview

This guide explains how to integrate the MMS backend API with any frontend framework (React, Vue, Angular, Next.js, etc.).

**Backend URL:** `http://localhost:5000`  
**API Base:** `http://localhost:5000/api`

---

## API Base Configuration

### Environment Setup

```env
# .env or .env.local in your frontend project
REACT_APP_API_URL=http://localhost:5000/api
# OR for Vite
VITE_API_URL=http://localhost:5000/api
# OR for Next.js
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### Axios Configuration

```javascript
// src/services/api.js
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor - add token to all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle token expiry
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired - try refresh or redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

---

## Authentication Flow

### 1. Login

```javascript
// src/services/authService.js
import api from './api';

export const authService = {
  // Login
  async login(email, password) {
    const response = await api.post('/auth/login', { email, password });
    
    if (response.data.success) {
      const { token, refreshToken, user } = response.data.data;
      
      // Store tokens
      localStorage.setItem('token', token);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));
      
      return user;
    }
    throw new Error(response.data.message);
  },

  // Register
  async register(email, password, role = 'receptionist') {
    const response = await api.post('/auth/register', { email, password, role });
    return response.data;
  },

  // Logout
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  },

  // Get current user
  async getCurrentUser() {
    const response = await api.get('/auth/me');
    return response.data.data;
  },

  // Refresh token
  async refreshToken() {
    const refreshToken = localStorage.getItem('refreshToken');
    const response = await api.post('/auth/refresh-token', { refreshToken });
    
    if (response.data.success) {
      localStorage.setItem('token', response.data.data.token);
      return response.data.data.token;
    }
    throw new Error('Token refresh failed');
  },

  // Change password
  async changePassword(currentPassword, newPassword) {
    const response = await api.put('/auth/change-password', { currentPassword, newPassword });
    return response.data;
  },

  // Check if logged in
  isAuthenticated() {
    return !!localStorage.getItem('token');
  },

  // Get stored user
  getUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // Check user role
  hasRole(role) {
    const user = this.getUser();
    return user?.roles?.includes(role) || user?.role === role;
  }
};
```

### 2. React Auth Context Example

```jsx
// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = authService.getUser();
    if (storedUser) {
      setUser(storedUser);
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const user = await authService.login(email, password);
    setUser(user);
    return user;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const value = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
    hasRole: (role) => user?.roles?.includes(role) || user?.role === role
  };

  if (loading) return <div>Loading...</div>;

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
```

---

## API Service Setup

### Patient Service

```javascript
// src/services/patientService.js
import api from './api';

export const patientService = {
  // Get all patients with pagination
  async getAll(params = {}) {
    const response = await api.get('/patients', { params });
    return response.data;
  },

  // Get single patient
  async getById(id) {
    const response = await api.get(`/patients/${id}`);
    return response.data.data;
  },

  // Create patient
  async create(data) {
    const response = await api.post('/patients', data);
    return response.data.data;
  },

  // Update patient
  async update(id, data) {
    const response = await api.put(`/patients/${id}`, data);
    return response.data.data;
  },

  // Delete patient
  async delete(id) {
    const response = await api.delete(`/patients/${id}`);
    return response.data;
  },

  // Search patients
  async search(query) {
    const response = await api.get('/patients/search', { params: { q: query } });
    return response.data.data;
  },

  // Get patient history
  async getHistory(id) {
    const response = await api.get(`/patients/${id}/history`);
    return response.data.data;
  },

  // Get patient appointments
  async getAppointments(id, params = {}) {
    const response = await api.get(`/patients/${id}/appointments`, { params });
    return response.data;
  },

  // Get patient bills
  async getBills(id) {
    const response = await api.get(`/patients/${id}/bills`);
    return response.data.data;
  }
};
```

### Doctor Service

```javascript
// src/services/doctorService.js
import api from './api';

export const doctorService = {
  async getAll(params = {}) {
    const response = await api.get('/doctors', { params });
    return response.data;
  },

  async getById(id) {
    const response = await api.get(`/doctors/${id}`);
    return response.data.data;
  },

  async create(data) {
    const response = await api.post('/doctors', data);
    return response.data.data;
  },

  async update(id, data) {
    const response = await api.put(`/doctors/${id}`, data);
    return response.data.data;
  },

  async delete(id) {
    const response = await api.delete(`/doctors/${id}`);
    return response.data;
  },

  async getByDepartment(deptId) {
    const response = await api.get(`/doctors/department/${deptId}`);
    return response.data.data;
  },

  async getAvailable(date, departmentId = null) {
    const response = await api.get('/doctors/available', { 
      params: { date, department_id: departmentId } 
    });
    return response.data.data;
  },

  async getSchedule(id, date) {
    const response = await api.get(`/doctors/${id}/schedule`, { params: { date } });
    return response.data.data;
  },

  async updateAvailability(id, data) {
    const response = await api.put(`/doctors/${id}/availability`, data);
    return response.data.data;
  }
};
```

### Appointment Service

```javascript
// src/services/appointmentService.js
import api from './api';

export const appointmentService = {
  async getAll(params = {}) {
    const response = await api.get('/appointments', { params });
    return response.data;
  },

  async getById(id) {
    const response = await api.get(`/appointments/${id}`);
    return response.data.data;
  },

  async create(data) {
    const response = await api.post('/appointments', data);
    return response.data.data;
  },

  async update(id, data) {
    const response = await api.put(`/appointments/${id}`, data);
    return response.data.data;
  },

  async updateStatus(id, status) {
    const response = await api.put(`/appointments/${id}/status`, { status });
    return response.data.data;
  },

  async cancel(id) {
    const response = await api.delete(`/appointments/${id}`);
    return response.data;
  },

  async getToday() {
    const response = await api.get('/appointments/today');
    return response.data.data;
  },

  async getAvailableSlots(doctorId, date, duration = 30) {
    const response = await api.get('/appointments/available-slots', {
      params: { doctor_id: doctorId, date, duration }
    });
    return response.data.data;
  },

  async getByDate(date) {
    const response = await api.get(`/appointments/date/${date}`);
    return response.data.data;
  }
};
```

---

## Module Integration

### Billing Service

```javascript
// src/services/billingService.js
import api from './api';

export const billingService = {
  // Bills
  async getAllBills(params = {}) {
    const response = await api.get('/bills', { params });
    return response.data;
  },

  async getBillById(id) {
    const response = await api.get(`/bills/${id}`);
    return response.data.data;
  },

  async createBill(data) {
    const response = await api.post('/bills', data);
    return response.data.data;
  },

  async updateBill(id, data) {
    const response = await api.put(`/bills/${id}`, data);
    return response.data.data;
  },

  async addBillItem(billId, item) {
    const response = await api.post(`/bills/${billId}/items`, item);
    return response.data.data;
  },

  // Payments
  async recordPayment(data) {
    const response = await api.post('/bills/payments', data);
    return response.data.data;
  },

  async getPayments(params = {}) {
    const response = await api.get('/bills/payments', { params });
    return response.data.data;
  },

  // Billing Items (catalog)
  async getBillingItems() {
    const response = await api.get('/bills/billing-items');
    return response.data.data;
  }
};
```

### Pharmacy Service

```javascript
// src/services/pharmacyService.js
import api from './api';

export const pharmacyService = {
  async getAll(params = {}) {
    const response = await api.get('/pharmacy', { params });
    return response.data;
  },

  async getById(id) {
    const response = await api.get(`/pharmacy/${id}`);
    return response.data.data;
  },

  async create(data) {
    const response = await api.post('/pharmacy', data);
    return response.data.data;
  },

  async update(id, data) {
    const response = await api.put(`/pharmacy/${id}`, data);
    return response.data.data;
  },

  async updateStock(id, quantity, operation = 'add') {
    const response = await api.put(`/pharmacy/${id}/stock`, { quantity, operation });
    return response.data.data;
  },

  async dispense(data) {
    const response = await api.post('/pharmacy/dispense', data);
    return response.data.data;
  },

  async getLowStock() {
    const response = await api.get('/pharmacy/low-stock');
    return response.data.data;
  },

  async getExpiring(days = 30) {
    const response = await api.get('/pharmacy/expiring', { params: { days } });
    return response.data.data;
  },

  async getCategories() {
    const response = await api.get('/pharmacy/categories');
    return response.data.data;
  }
};
```

### Lab Test Service

```javascript
// src/services/labTestService.js
import api from './api';

export const labTestService = {
  async getAll(params = {}) {
    const response = await api.get('/lab-tests', { params });
    return response.data;
  },

  async getById(id) {
    const response = await api.get(`/lab-tests/${id}`);
    return response.data.data;
  },

  async create(data) {
    const response = await api.post('/lab-tests', data);
    return response.data.data;
  },

  async collectSample(id) {
    const response = await api.put(`/lab-tests/${id}/collect-sample`);
    return response.data.data;
  },

  async addResults(id, results, resultText = null) {
    const response = await api.put(`/lab-tests/${id}/results`, { results, result_text: resultText });
    return response.data.data;
  },

  async verify(id) {
    const response = await api.put(`/lab-tests/${id}/verify`);
    return response.data.data;
  },

  async getCatalog() {
    const response = await api.get('/lab-tests/catalog');
    return response.data.data;
  },

  async getPending() {
    const response = await api.get('/lab-tests/pending');
    return response.data.data;
  }
};
```

---

## Error Handling

### Standard Response Format

```typescript
// All API responses follow this format:
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  // For paginated responses:
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
```

### Error Handler Utility

```javascript
// src/utils/errorHandler.js
export const handleApiError = (error) => {
  if (error.response) {
    // Server responded with error
    const { status, data } = error.response;
    
    switch (status) {
      case 400:
        // Validation error - data may contain field errors
        if (data.data) {
          return data.data.map(e => `${e.field}: ${e.message}`).join(', ');
        }
        return data.message || 'Invalid request';
      
      case 401:
        return 'Please login to continue';
      
      case 403:
        return 'You do not have permission to perform this action';
      
      case 404:
        return data.message || 'Resource not found';
      
      case 409:
        return data.message || 'Conflict - resource already exists';
      
      case 500:
        return 'Server error. Please try again later.';
      
      default:
        return data.message || 'Something went wrong';
    }
  } else if (error.request) {
    return 'Network error. Please check your connection.';
  }
  return error.message || 'An error occurred';
};
```

---

## Role-Based Access

### Available Roles

| Role | Description |
|------|-------------|
| `admin` | Full system access |
| `doctor` | Patient care, appointments, prescriptions |
| `nurse` | Patient vitals, medication, assistance |
| `receptionist` | Appointments, billing, registration |
| `pharmacist` | Pharmacy management |
| `lab_technician` | Lab tests and results |
| `radiologist` | Radiology orders and reports |
| `accountant` | Billing and financial management |

### Protected Route Component (React)

```jsx
// src/components/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function ProtectedRoute({ children, allowedRoles = [] }) {
  const { isAuthenticated, hasRole } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.some(role => hasRole(role))) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}

// Usage:
// <ProtectedRoute allowedRoles={['admin', 'doctor']}>
//   <DoctorDashboard />
// </ProtectedRoute>
```

### Role-Based Menu

```javascript
// src/config/menuConfig.js
export const menuItems = [
  { 
    label: 'Dashboard', 
    path: '/dashboard', 
    roles: ['admin', 'doctor', 'nurse', 'receptionist'] 
  },
  { 
    label: 'Patients', 
    path: '/patients', 
    roles: ['admin', 'doctor', 'nurse', 'receptionist'] 
  },
  { 
    label: 'Appointments', 
    path: '/appointments', 
    roles: ['admin', 'doctor', 'receptionist'] 
  },
  { 
    label: 'OPD', 
    path: '/opd', 
    roles: ['admin', 'doctor', 'receptionist'] 
  },
  { 
    label: 'IPD', 
    path: '/ipd', 
    roles: ['admin', 'doctor', 'nurse'] 
  },
  { 
    label: 'Emergency', 
    path: '/emergency', 
    roles: ['admin', 'doctor', 'nurse'] 
  },
  { 
    label: 'Lab Tests', 
    path: '/lab-tests', 
    roles: ['admin', 'doctor', 'lab_technician'] 
  },
  { 
    label: 'Radiology', 
    path: '/radiology', 
    roles: ['admin', 'doctor', 'radiologist'] 
  },
  { 
    label: 'Pharmacy', 
    path: '/pharmacy', 
    roles: ['admin', 'pharmacist'] 
  },
  { 
    label: 'Billing', 
    path: '/billing', 
    roles: ['admin', 'accountant', 'receptionist'] 
  },
  { 
    label: 'Blood Bank', 
    path: '/blood-bank', 
    roles: ['admin', 'doctor', 'nurse'] 
  },
  { 
    label: 'Staff', 
    path: '/staff', 
    roles: ['admin'] 
  },
  { 
    label: 'Doctors', 
    path: '/doctors', 
    roles: ['admin'] 
  }
];

export const getMenuForRole = (userRoles) => {
  return menuItems.filter(item => 
    item.roles.some(role => userRoles.includes(role))
  );
};
```

---

## Complete API Reference

### Auth Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/logout` | Logout |
| POST | `/api/auth/refresh-token` | Refresh JWT |
| GET | `/api/auth/me` | Get current user |
| PUT | `/api/auth/change-password` | Change password |

### Patient Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/patients` | List patients (paginated) |
| GET | `/api/patients/search?q=` | Search patients |
| GET | `/api/patients/stats` | Patient statistics |
| GET | `/api/patients/:id` | Get patient details |
| POST | `/api/patients` | Create patient |
| PUT | `/api/patients/:id` | Update patient |
| DELETE | `/api/patients/:id` | Delete patient |
| GET | `/api/patients/:id/history` | Get medical history |
| GET | `/api/patients/:id/appointments` | Get appointments |
| GET | `/api/patients/:id/bills` | Get bills |

### Appointment Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/appointments` | List appointments |
| GET | `/api/appointments/today` | Today's appointments |
| GET | `/api/appointments/available-slots` | Get available slots |
| GET | `/api/appointments/date/:date` | Get by date |
| GET | `/api/appointments/:id` | Get appointment |
| POST | `/api/appointments` | Create appointment |
| PUT | `/api/appointments/:id` | Update appointment |
| PUT | `/api/appointments/:id/status` | Update status |
| DELETE | `/api/appointments/:id` | Cancel appointment |

### OPD Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/opd` | List OPD visits |
| GET | `/api/opd/today` | Today's visits |
| GET | `/api/opd/queue` | Doctor's queue |
| POST | `/api/opd` | Create visit |
| PUT | `/api/opd/:id` | Update visit |
| PUT | `/api/opd/:id/prescription` | Add prescription |

### IPD Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/ipd` | List admissions |
| GET | `/api/ipd/active` | Active admissions |
| GET | `/api/ipd/beds/available` | Available beds |
| POST | `/api/ipd` | Admit patient |
| PUT | `/api/ipd/:id` | Update admission |
| PUT | `/api/ipd/:id/bed-transfer` | Transfer bed |
| PUT | `/api/ipd/:id/discharge` | Discharge patient |

### Lab Test Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/lab-tests` | List tests |
| GET | `/api/lab-tests/catalog` | Test catalog |
| GET | `/api/lab-tests/pending` | Pending tests |
| POST | `/api/lab-tests` | Order test |
| PUT | `/api/lab-tests/:id/collect-sample` | Collect sample |
| PUT | `/api/lab-tests/:id/results` | Add results |
| PUT | `/api/lab-tests/:id/verify` | Verify results |

### Pharmacy Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/pharmacy` | List items |
| GET | `/api/pharmacy/categories` | Categories |
| GET | `/api/pharmacy/low-stock` | Low stock items |
| GET | `/api/pharmacy/expiring` | Expiring items |
| POST | `/api/pharmacy` | Create item |
| PUT | `/api/pharmacy/:id/stock` | Update stock |
| POST | `/api/pharmacy/dispense` | Dispense medication |

### Billing Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/bills` | List bills |
| GET | `/api/bills/billing-items` | Billing catalog |
| GET | `/api/bills/payments` | List payments |
| POST | `/api/bills` | Create bill |
| PUT | `/api/bills/:id` | Update bill |
| POST | `/api/bills/:id/items` | Add bill item |
| POST | `/api/bills/payments` | Record payment |

### Blood Bank Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/blood-bank/inventory` | Blood inventory |
| GET | `/api/blood-bank/donations` | Donations list |
| POST | `/api/blood-bank/donations` | Record donation |
| GET | `/api/blood-bank/requests` | Blood requests |
| POST | `/api/blood-bank/requests` | Create request |
| PUT | `/api/blood-bank/requests/:id/issue` | Issue blood |

---

## Quick Start Checklist

- [ ] Configure API base URL in frontend `.env`
- [ ] Set up Axios with interceptors
- [ ] Implement auth context/store
- [ ] Create protected route component
- [ ] Set up role-based menu filtering
- [ ] Import and use service modules
- [ ] Handle errors globally
- [ ] Test login/logout flow
- [ ] Verify token refresh works

---

**Backend API Base:** `http://localhost:5000/api`  
**Default Admin:** `admin@michutech.com` / `admin123`

import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataContext } from '../App';
import { TenantData } from '../types';
import { api } from '../api';

interface CreateTenantModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateTenantModal: React.FC<CreateTenantModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { tenants, addToast, setCurrentTenantId } = useContext(DataContext);
  const [companyName, setCompanyName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [tempPassword, setTempPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generatedPassword, setGeneratedPassword] = useState('');

  const generateUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let result = '';
    for (let i = 0; i < 12; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setTempPassword(result);
    setGeneratedPassword(result);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!companyName.trim()) {
      newErrors.companyName = 'Company name is required';
    }

    if (!ownerName.trim()) {
      newErrors.ownerName = 'Owner name is required';
    }

    if (!ownerEmail.trim()) {
      newErrors.ownerEmail = 'Owner email is required';
    } else if (!/\S+@\S+\.\S+/.test(ownerEmail)) {
      newErrors.ownerEmail = 'Please enter a valid email address';
    }

    if (!tempPassword) {
      newErrors.tempPassword = 'Temporary password is required';
    } else if (tempPassword.length < 8) {
      newErrors.tempPassword = 'Password must be at least 8 characters long';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const newTenant = {
        id: generateUUID(),
        name: companyName,
        ownerName: ownerName,
        ownerEmail: ownerEmail,
        ownerPassword: tempPassword
      };

      console.log('Creating tenant:', newTenant);
      const result = await api.createTenant(newTenant);
      console.log('Tenant created:', result);

      // Also create the owner user account
      const response = await fetch('http://localhost:3002/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: ownerEmail,
          password: tempPassword,
          name: ownerName,
          tenantId: newTenant.id,
          role: 'owner'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create owner account');
      }

      // Automatically log in the new owner
      const loginResponse = await fetch('http://localhost:3002/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: ownerEmail, password: tempPassword })
      });

      if (!loginResponse.ok) {
        throw new Error('Failed to log in owner');
      }

      const loginData = await loginResponse.json();

      // Store token and user info
      localStorage.setItem('token', loginData.token);
      localStorage.setItem('user', JSON.stringify(loginData.user));

      // Set tenant and navigate
      setCurrentTenantId(loginData.user.tenantId);
      navigate('/dashboard');

      addToast(`Tenant "${companyName}" created successfully! Owner logged in.`, 'success');
      alert(`Tenant created successfully!\n\nCompany: ${companyName}\nOwner: ${ownerName}\nEmail: ${ownerEmail}\nTemporary Password: ${tempPassword}\n\nYou are now logged in as the owner. Please save this password for future logins.`);

      handleClose();
    } catch (error: any) {
      console.error('Error creating tenant:', error);
      addToast(error.message || 'Failed to create tenant', 'error');
      alert('Error: ' + (error.message || 'Failed to create tenant. Check console for details.'));
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setCompanyName('');
    setOwnerName('');
    setOwnerEmail('');
    setTempPassword('');
    setGeneratedPassword('');
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-gradient-bg rounded-lg shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col transform transition-all duration-300 ease-in-out scale-95 animate-scale-in">
      <div className="flex justify-between items-center p-4 border-b border-gray-200/80">
        <h2 className="text-2xl font-semibold text-gray-800">Create New Tenant</h2>
        <button
          onClick={handleClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>

      <div className="p-6 text-center mb-4">
        <p className="text-gray-600">Set up a new company tenant and create the initial owner account</p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
        {/* Company Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Company Name *
          </label>
          <input
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-rose-pink focus:border-transparent ${
              errors.companyName ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter company name"
          />
          {errors.companyName && (
            <p className="text-red-500 text-xs mt-1">{errors.companyName}</p>
          )}
        </div>

        {/* Owner Full Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Owner Full Name *
          </label>
          <input
            type="text"
            value={ownerName}
            onChange={(e) => setOwnerName(e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-rose-pink focus:border-transparent ${
              errors.ownerName ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter owner's full name"
          />
          {errors.ownerName && (
            <p className="text-red-500 text-xs mt-1">{errors.ownerName}</p>
          )}
        </div>

        {/* Owner Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Owner Email *
          </label>
          <input
            type="email"
            value={ownerEmail}
            onChange={(e) => setOwnerEmail(e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-rose-pink focus:border-transparent ${
              errors.ownerEmail ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter owner's email address"
          />
          {errors.ownerEmail && (
            <p className="text-red-500 text-xs mt-1">{errors.ownerEmail}</p>
          )}
        </div>

        {/* Temporary Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Temporary Password *
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={tempPassword}
              onChange={(e) => setTempPassword(e.target.value)}
              className={`flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-rose-pink focus:border-transparent ${
                errors.tempPassword ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter or generate password"
            />
            <button
              type="button"
              onClick={generatePassword}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
            >
              Generate
            </button>
          </div>
          {errors.tempPassword && (
            <p className="text-red-500 text-xs mt-1">{errors.tempPassword}</p>
          )}
          <p className="text-gray-500 text-xs mt-1">This password will be shown once after creation. Make sure to save it.</p>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-gradient-to-r from-rose-pink to-lavender-purple text-white rounded-lg hover:from-rose-pink/90 hover:to-lavender-purple/90 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating...' : 'Create Tenant'}
          </button>
        </div>
      </form>

      <style>{`
        @keyframes scale-in {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-scale-in {
          animation: scale-in 0.2s ease-out forwards;
        }
        .modal-gradient-bg {
          background-color: #F7FAFC;
          background-image: radial-gradient(circle at 50% 50%, #e6f7ff, #f3e8ff, #fff2fb);
        }
      `}</style>
    </div>
  );
};

export default CreateTenantModal;
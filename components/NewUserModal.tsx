import React, { useState, useEffect, useContext } from 'react';
import { DataContext } from '../App';

interface NewUserModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface StaffMember {
  id: string;
  name: string;
  email: string;
}


const NewUserModal: React.FC<NewUserModalProps> = ({ isOpen, onClose }) => {
  const { currentTenant } = useContext(DataContext);
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen && currentTenant?.staff) {
      const activeStaff = currentTenant.staff.filter(staff => staff.isActive);
      setStaffMembers(activeStaff.map(staff => ({
        id: staff.id,
        name: staff.name,
        email: staff.email || ''
      })));
    }
  }, [isOpen, currentTenant]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!selectedEmployee) {
      newErrors.selectedEmployee = 'Please select an employee';
    }

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
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
      const response = await fetch('http://localhost:3002/api/auth/create-user-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          staffId: selectedEmployee,
          email: email,
          password: password,
          tenantId: currentTenant?.id
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create user account');
      }

      alert('User account created successfully!');
      handleClose();
    } catch (error: any) {
      console.error('Error creating user:', error);
      alert(error.message || 'Failed to create user account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedEmployee('');
    setEmail('');
    setPassword('');
    setShowPassword(false);
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-gradient-bg rounded-lg shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col transform transition-all duration-300 ease-in-out scale-95 animate-scale-in">
      <div className="flex justify-between items-center p-4 border-b border-gray-200/80">
        <h3 className="text-xl font-semibold text-gray-800">Add New User</h3>
        <button
          onClick={handleClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
        {/* Employee Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Employee *
          </label>
          <select
            value={selectedEmployee}
            onChange={(e) => {
              const employeeId = e.target.value;
              setSelectedEmployee(employeeId);
              // Auto-fill email when employee is selected
              if (employeeId) {
                const selectedStaff = staffMembers.find(emp => emp.id === employeeId);
                if (selectedStaff && selectedStaff.email) {
                  setEmail(selectedStaff.email);
                }
              } else {
                setEmail(''); // Clear email if no employee selected
              }
            }}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-rose-pink focus:border-transparent ${
              errors.selectedEmployee ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">Choose an employee...</option>
            {staffMembers.map(employee => (
              <option key={employee.id} value={employee.id}>
                {employee.name} - {employee.email || 'No email'}
              </option>
            ))}
          </select>
          {errors.selectedEmployee && (
            <p className="text-red-500 text-xs mt-1">{errors.selectedEmployee}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address *
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-rose-pink focus:border-transparent ${
              errors.email ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter email address"
          />
          {errors.email && (
            <p className="text-red-500 text-xs mt-1">{errors.email}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Password *
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-rose-pink focus:border-transparent ${
                errors.password ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showPassword ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
          {errors.password && (
            <p className="text-red-500 text-xs mt-1">{errors.password}</p>
          )}
          <p className="text-gray-500 text-xs mt-1">Password must be at least 8 characters long</p>
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
            {loading ? 'Creating...' : 'Create User'}
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

export default NewUserModal;
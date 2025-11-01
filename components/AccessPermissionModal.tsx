import React, { useState, useEffect } from 'react';

interface AccessPermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface StaffMember {
  id: string;
  name: string;
  email: string;
}

interface PermissionItem {
  name: string;
  type: 'parent' | 'child';
  parent?: string;
  children?: string[];
}

// Note: Supabase client should be imported from a shared config file
// For now, we'll use a placeholder - this should be replaced with actual Supabase client
const supabase = {
  from: (table: string) => ({
    select: (columns: string) => ({
      eq: (column: string, value: any) => ({
        data: null, // Placeholder
        error: null
      })
    }),
    insert: (data: any) => ({
      error: null
    }),
    delete: () => ({
      eq: (column: string, value: any) => ({
        error: null
      })
    })
  })
};

const navigationItems: PermissionItem[] = [
  { name: 'Dashboard', type: 'parent' },
  { name: 'Appointments', type: 'parent' },
  { name: 'Clients', type: 'parent' },
  { name: 'Staff', type: 'parent' },
  { name: 'Inventory', type: 'parent' },
  { name: 'Marketing', type: 'parent' },
  { name: 'Services', type: 'parent' },
  { name: 'Reports', type: 'parent' },
  { name: 'Settings', type: 'parent', children: [
    'Company Details',
    'Access Permission',
    'Change Password',
    'Add New User',
    'Create Tenant'
  ]},
];

const AccessPermissionModal: React.FC<AccessPermissionModalProps> = ({ isOpen, onClose }) => {
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [permissions, setPermissions] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchStaffMembers();
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedEmployee) {
      fetchEmployeePermissions();
    }
  }, [selectedEmployee]);

  const fetchStaffMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('staff')
        .select('id, name, email')
        .eq('is_active', true);

      if (error) throw error;
      setStaffMembers(data || []);
    } catch (error) {
      console.error('Error fetching staff:', error);
    }
  };

  const fetchEmployeePermissions = async () => {
    try {
      const { data, error } = await supabase
        .from('permissions')
        .select('item_name, has_access')
        .eq('employee_id', selectedEmployee);

      if (error) throw error;

      const perms: Record<string, boolean> = {};
      data?.forEach(perm => {
        perms[perm.item_name] = perm.has_access;
      });
      setPermissions(perms);
    } catch (error) {
      console.error('Error fetching permissions:', error);
    }
  };

  const handlePermissionChange = (itemName: string, hasAccess: boolean) => {
    setPermissions(prev => ({
      ...prev,
      [itemName]: hasAccess
    }));
  };

  const handleParentToggle = (parentItem: PermissionItem) => {
    const allChildrenSelected = parentItem.children?.every(child => permissions[child]) || false;
    const newPermissions = { ...permissions };

    if (allChildrenSelected) {
      // Deselect all children
      parentItem.children?.forEach(child => {
        newPermissions[child] = false;
      });
    } else {
      // Select all children
      parentItem.children?.forEach(child => {
        newPermissions[child] = true;
      });
    }

    setPermissions(newPermissions);
  };

  const savePermissions = async () => {
    if (!selectedEmployee) return;

    setLoading(true);
    try {
      // Delete existing permissions for this employee
      await supabase
        .from('permissions')
        .delete()
        .eq('employee_id', selectedEmployee);

      // Insert new permissions
      const permissionInserts = [];

      for (const item of navigationItems) {
        if (item.type === 'parent') {
          permissionInserts.push({
            employee_id: selectedEmployee,
            item_name: item.name,
            item_type: 'parent',
            has_access: permissions[item.name] || false
          });

          // Add children permissions
          item.children?.forEach(child => {
            permissionInserts.push({
              employee_id: selectedEmployee,
              item_name: child,
              item_type: 'child',
              parent_item: item.name,
              has_access: permissions[child] || false
            });
          });
        }
      }

      const { error } = await supabase
        .from('permissions')
        .insert(permissionInserts);

      if (error) throw error;

      alert('Permissions saved successfully!');
      onClose();
    } catch (error) {
      console.error('Error saving permissions:', error);
      alert('Error saving permissions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-gradient-bg rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col transform transition-all duration-300 ease-in-out scale-95 animate-scale-in">
      <div className="flex justify-between items-center p-4 border-b border-gray-200/80">
        <h3 className="text-xl font-semibold text-gray-800">Access Permission Management</h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>

      <div className="p-6 overflow-y-auto">
        <div className="space-y-6">
          {/* Employee Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Employee *
            </label>
            <select
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-pink focus:border-transparent"
            >
              <option value="">Choose an employee...</option>
              {staffMembers.map(employee => (
                <option key={employee.id} value={employee.id}>
                  {employee.name} - {employee.email}
                </option>
              ))}
            </select>
          </div>

          {selectedEmployee && (
            <>
              {/* Permissions List */}
              <div>
                <h4 className="text-lg font-medium text-gray-800 mb-4">Navigation Permissions</h4>
                <div className="space-y-4">
                  {navigationItems.map(item => (
                    <div key={item.name} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <span className="font-medium text-gray-700">{item.name}</span>
                          {item.children && item.children.length > 0 && (
                            <span className="text-sm text-gray-500">({item.children.length} sub-items)</span>
                          )}
                        </div>
                        {item.children && item.children.length > 0 && (
                          <button
                            onClick={() => handleParentToggle(item)}
                            className="text-sm px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                          >
                            {item.children.every(child => permissions[child]) ? 'Deselect All' : 'Select All'}
                          </button>
                        )}
                      </div>

                      {item.children && item.children.length > 0 && (
                        <div className="mt-3 ml-6 space-y-2">
                          {item.children.map(child => (
                            <label key={child} className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={permissions[child] || false}
                                onChange={(e) => handlePermissionChange(child, e.target.checked)}
                                className="w-4 h-4 text-rose-pink focus:ring-rose-pink"
                              />
                              <span className="text-sm text-gray-600">{child}</span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  onClick={savePermissions}
                  disabled={loading}
                  className="px-6 py-2 bg-gradient-to-r from-rose-pink to-lavender-purple text-white rounded-lg hover:from-rose-pink/90 hover:to-lavender-purple/90 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Saving...' : 'Save Permissions'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

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

export default AccessPermissionModal;
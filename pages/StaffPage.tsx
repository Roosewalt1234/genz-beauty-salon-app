import React, { useState, useContext, useMemo } from 'react';
import { DataContext } from '../App';
import Modal from '../components/Modal';
import { Staff, StaffRole, Appointment, StaffSchedule } from '../types';
import { STAFF_ROLES, SPECIALIZATIONS_LIST, DEFAULT_SCHEDULE } from '../constants';
import EnvelopeIcon from '../components/icons/EnvelopeIcon';
import PhoneIcon from '../components/icons/PhoneIcon';
import StarIcon from '../components/icons/StarIcon';
import CalendarDaysIcon from '../components/icons/CalendarDaysIcon';
import CurrencyDollarIcon from '../components/icons/CurrencyDollarIcon';
import PencilIcon from '../components/icons/PencilIcon';
import TrashIcon from '../components/icons/TrashIcon';
import ScheduleModal from '../components/ScheduleModal';

const FormSection: React.FC<{ title: string, children: React.ReactNode }> = ({ title, children }) => (
    <div className="mt-6 pt-4 border-t border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
        {children}
    </div>
);

const StaffForm: React.FC<{ staffMember?: Staff; onSave: (staffMember: Omit<Staff, 'id'> | Staff) => void; onCancel: () => void }> = ({ staffMember, onSave, onCancel }) => {
    const [formData, setFormData] = useState({
        name: staffMember?.name || '',
        email: staffMember?.email || '',
        phone: staffMember?.phone || '',
        role: staffMember?.role || '',
        yearsOfExperience: staffMember?.yearsOfExperience || '',
        commission: staffMember?.commission || '',
        profileImageUrl: staffMember?.profileImageUrl || '',
        bio: staffMember?.bio || '',
        specializations: staffMember?.specializations || [],
        isActive: staffMember?.isActive === undefined ? true : staffMember.isActive,
        identity: {
            emiratesId: staffMember?.identity?.emiratesId || '',
            emiratesIdExpiry: staffMember?.identity?.emiratesIdExpiry || '',
            passportNumber: staffMember?.identity?.passportNumber || '',
            passportExpiry: staffMember?.identity?.passportExpiry || '',
            ohcNumber: staffMember?.identity?.ohcNumber || '',
            ohcExpiry: staffMember?.identity?.ohcExpiry || '',
        },
        salary: {
            payrollType: staffMember?.salary?.payrollType || '',
            basicSalary: staffMember?.salary?.basicSalary || '',
            accommodationAllowance: staffMember?.salary?.accommodationAllowance || '',
            transportAllowance: staffMember?.salary?.transportAllowance || '',
            notes: staffMember?.salary?.notes || '',
        },
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.name) newErrors.name = 'Full Name is required';
        if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email is invalid';
        }
        if (!formData.phone) {
            newErrors.phone = 'Phone number is required';
        } else if (!/^\d{10}$/.test(formData.phone)) {
            newErrors.phone = 'Phone number must be exactly 10 digits.';
        }
        if (!formData.role) newErrors.role = 'Role is required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        if (name === 'phone') {
            const numericValue = value.replace(/\D/g, '');
            setFormData(prev => ({ ...prev, [name]: numericValue }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleNestedChange = (section: 'identity' | 'salary') => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [name]: value,
            },
        }));
    };
    
    const handleSpecializationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value, checked } = e.target;
        setFormData(prev => {
            const specializations = checked 
                ? [...prev.specializations, value]
                : prev.specializations.filter(s => s !== value);
            return { ...prev, specializations };
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validate()) {
            const dataToSave = {
                ...formData,
                role: formData.role as StaffRole,
                yearsOfExperience: formData.yearsOfExperience ? parseInt(String(formData.yearsOfExperience), 10) : undefined,
                commission: formData.commission ? parseFloat(String(formData.commission)) : undefined,
                salary: {
                    ...formData.salary,
                    payrollType: formData.salary.payrollType as ('Full Time' | 'Part Time' | 'Commission' | 'Temporary' | ''),
                    basicSalary: formData.salary.basicSalary ? parseFloat(String(formData.salary.basicSalary)) : undefined,
                    accommodationAllowance: formData.salary.accommodationAllowance ? parseFloat(String(formData.salary.accommodationAllowance)) : undefined,
                    transportAllowance: formData.salary.transportAllowance ? parseFloat(String(formData.salary.transportAllowance)) : undefined,
                }
            };

            if (staffMember) {
                onSave({ ...staffMember, ...dataToSave });
            } else {
                onSave(dataToSave as Omit<Staff, 'id'>);
            }
        }
    };
    
    const inputClass = (field: keyof typeof errors) => `mt-1 block w-full px-3 py-2 border ${errors[field] ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm bg-white focus:outline-none focus:ring-lavender-purple focus:border-lavender-purple text-gray-900`;

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Full Name *</label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} className={inputClass('name')} />
                    {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Email (Optional)</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} className={inputClass('email')} />
                    {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Phone *</label>
                    <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className={inputClass('phone')} maxLength={10} />
                    {errors.phone && <p className="text-sm text-red-500 mt-1">{errors.phone}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Role *</label>
                    <select name="role" value={formData.role} onChange={handleChange} className={inputClass('role')}>
                        <option value="">Select Role</option>
                        {STAFF_ROLES.map(role => <option key={role} value={role}>{role}</option>)}
                    </select>
                    {errors.role && <p className="text-sm text-red-500 mt-1">{errors.role}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Years of Experience</label>
                    <input type="number" name="yearsOfExperience" value={formData.yearsOfExperience} onChange={handleChange} className={inputClass('yearsOfExperience')} />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Commission (%)</label>
                    <input type="number" step="0.1" name="commission" value={formData.commission} onChange={handleChange} className={inputClass('commission')} />
                </div>
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Profile Image URL</label>
                    <input type="text" name="profileImageUrl" placeholder="https://example.com/image.jpg" value={formData.profileImageUrl} onChange={handleChange} className={inputClass('profileImageUrl')} />
                </div>
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Bio</label>
                    <textarea name="bio" value={formData.bio} onChange={handleChange} rows={3} className={inputClass('bio')} />
                </div>
            </div>

            <FormSection title="Specializations">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {SPECIALIZATIONS_LIST.map(spec => (
                        <label key={spec} className="flex items-center space-x-2 text-sm text-gray-700">
                            <input type="checkbox" value={spec} checked={formData.specializations.includes(spec)} onChange={handleSpecializationChange} className="rounded text-rose-pink focus:ring-rose-pink" />
                            <span>{spec}</span>
                        </label>
                    ))}
                </div>
            </FormSection>
             <div className="pt-2">
                <label className="flex items-center space-x-2 text-sm text-gray-700">
                    <input type="checkbox" name="isActive" checked={formData.isActive} onChange={e => setFormData(p => ({...p, isActive: e.target.checked}))} className="rounded text-rose-pink focus:ring-rose-pink" />
                    <span>Active Employee</span>
                </label>
            </div>
            
            <FormSection title="Identity Documents">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-4">
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Emirates ID Number</label>
                        <input type="text" name="emiratesId" placeholder="Emirates ID Number" value={formData.identity.emiratesId} onChange={handleNestedChange('identity')} className={inputClass('identity')} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Emirates ID Expiry</label>
                        <input type="date" name="emiratesIdExpiry" value={formData.identity.emiratesIdExpiry} onChange={handleNestedChange('identity')} className={inputClass('identity')} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Passport Number</label>
                        <input type="text" name="passportNumber" placeholder="Passport Number" value={formData.identity.passportNumber} onChange={handleNestedChange('identity')} className={inputClass('identity')} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Passport Expiry</label>
                        <input type="date" name="passportExpiry" value={formData.identity.passportExpiry} onChange={handleNestedChange('identity')} className={inputClass('identity')} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">OHC Number</label>
                        <input type="text" name="ohcNumber" placeholder="OHC Number" value={formData.identity.ohcNumber} onChange={handleNestedChange('identity')} className={inputClass('identity')} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">OHC Expiry</label>
                        <input type="date" name="ohcExpiry" value={formData.identity.ohcExpiry} onChange={handleNestedChange('identity')} className={inputClass('identity')} />
                    </div>
                </div>
            </FormSection>

            <FormSection title="Salary & Benefits">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3">
                    <select name="payrollType" value={formData.salary.payrollType} onChange={handleNestedChange('salary')} className={inputClass('salary')}>
                        <option value="">Select payroll type</option>
                        <option value="Full Time">Full Time</option>
                        <option value="Part Time">Part Time</option>
                        <option value="Commission">Commission</option>
                        <option value="Temporary">Temporary</option>
                    </select>
                    <input type="number" step="0.01" name="basicSalary" placeholder="Basic Salary (AED)" value={formData.salary.basicSalary} onChange={handleNestedChange('salary')} className={inputClass('salary')} />
                    <input type="number" step="0.01" name="accommodationAllowance" placeholder="Accommodation Allowance (AED)" value={formData.salary.accommodationAllowance} onChange={handleNestedChange('salary')} className={inputClass('salary')} />
                    <input type="number" step="0.01" name="transportAllowance" placeholder="Transport Allowance (AED)" value={formData.salary.transportAllowance} onChange={handleNestedChange('salary')} className={inputClass('salary')} />
                    <div className="md:col-span-2">
                        <textarea name="notes" placeholder="Notes (Certifications, Additional Info)" value={formData.salary.notes} onChange={handleNestedChange('salary')} rows={3} className={inputClass('salary')} />
                    </div>
                 </div>
            </FormSection>

            <div className="flex justify-end space-x-3 pt-4">
                <button type="button" onClick={onCancel} className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors">Cancel</button>
                <button type="submit" className="px-6 py-2 bg-gradient-to-r from-rose-pink to-lavender-purple text-white rounded-lg hover:opacity-90 transition-opacity shadow font-semibold">{staffMember ? 'Save Changes' : 'Add Staff Member'}</button>
            </div>
        </form>
    )
};

const StaffCard: React.FC<{ staff: Staff, onEdit: (staff: Staff) => void, onDelete: (staffId: string) => void, onSchedule: (staff: Staff) => void, appointments: Appointment[]}> = ({ staff, onEdit, onDelete, onSchedule, appointments }) => {
    const appointmentsCount = appointments.filter(a => a.staffId === staff.id).length;
    const revenue = appointments
        .filter(a => a.staffId === staff.id && a.payment)
        .reduce((sum, app) => sum + (app.payment?.amount || 0), 0);

    const formatRevenue = (num: number) => {
        if (num > 999) {
            return `$${(num / 1000).toFixed(0)}K`;
        }
        return `$${num}`;
    };

    const specializationsToShow = staff.specializations.slice(0, 3);
    const remainingSpecializations = staff.specializations.length - specializationsToShow.length;

    return (
        <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col overflow-hidden">
            {/* Header */}
            <div className="relative bg-gradient-to-r from-fuchsia-600 to-purple-600 p-4 text-white">
                <div className="flex justify-between items-center">
                    <button onClick={() => onSchedule(staff)} className="bg-lavender-purple text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-lavender-purple/90 transition-colors shadow-md">
                        <CalendarDaysIcon className="w-5 h-5" />
                        Schedule
                    </button>
                    <div className="flex gap-2">
                        <button onClick={() => onEdit(staff)} className="bg-white/20 p-2 rounded-full hover:bg-white/30 transition-colors">
                            <PencilIcon className="w-4 h-4" />
                        </button>
                        <button onClick={() => onDelete(staff.id)} className="bg-white/20 p-2 rounded-full hover:bg-white/30 transition-colors">
                            <TrashIcon className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
            
            {/* Body */}
            <div className="relative p-6 pt-16 flex-grow">
                {/* Profile Image */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <img 
                        src={staff.profileImageUrl || 'https://i.pravatar.cc/150'} 
                        alt={staff.name} 
                        className="w-24 h-24 rounded-full border-4 border-white object-cover shadow-lg"
                    />
                </div>

                <div className="text-center">
                    <div className="flex justify-center items-center gap-2">
                        <h3 className="text-xl font-bold text-gray-800">{staff.name}</h3>
                         <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${staff.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {staff.isActive ? 'Active' : 'Inactive'}
                        </span>
                    </div>
                    <p className="text-sm text-gray-500">{staff.role}</p>
                </div>
                
                <div className="mt-4 space-y-2 text-sm text-gray-600">
                    {staff.email && (
                        <div className="flex items-center gap-2">
                            <EnvelopeIcon className="w-4 h-4 text-gray-400" />
                            <span>{staff.email}</span>
                        </div>
                    )}
                    {staff.phone && (
                         <div className="flex items-center gap-2">
                            <PhoneIcon className="w-4 h-4 text-gray-400" />
                            <span>{staff.phone}</span>
                        </div>
                    )}
                </div>

                {staff.specializations && staff.specializations.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">Specializations:</h4>
                        <div className="flex flex-wrap gap-2">
                            {specializationsToShow.map(spec => (
                                <span key={spec} className="text-xs bg-pink-100 text-pink-800 px-2.5 py-1 rounded-full">{spec}</span>
                            ))}
                            {remainingSpecializations > 0 && (
                                <span className="text-xs bg-gray-200 text-gray-700 px-2.5 py-1 rounded-full">+{remainingSpecializations} more</span>
                            )}
                        </div>
                    </div>
                )}
            </div>
            
            {/* Footer Stats */}
            <div className="bg-gray-50 p-4 border-t border-gray-100 grid grid-cols-3 text-center">
                <div className="px-2">
                    <div className="flex items-center justify-center gap-1 text-gray-700 font-bold">
                        <StarIcon className="w-4 h-4 text-yellow-400" />
                        <span>{staff.rating?.toFixed(1) || 'N/A'}</span>
                    </div>
                    <p className="text-xs text-gray-500">Rating</p>
                </div>
                <div className="border-x px-2">
                    <div className="flex items-center justify-center gap-1 text-gray-700 font-bold">
                        <CalendarDaysIcon className="w-4 h-4 text-gray-400" />
                        <span>{appointmentsCount}</span>
                    </div>
                    <p className="text-xs text-gray-500">Appointments</p>
                </div>
                <div className="px-2">
                    <div className="flex items-center justify-center gap-1 text-gray-700 font-bold">
                        <CurrencyDollarIcon className="w-4 h-4 text-green-500" />
                        <span>{formatRevenue(revenue)}</span>
                    </div>
                    <p className="text-xs text-gray-500">Revenue</p>
                </div>
            </div>
        </div>
    );
};


const StaffPage: React.FC = () => {
    const { currentTenant, updateTenantData, addToast } = useContext(DataContext);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
    const [editingStaff, setEditingStaff] = useState<Staff | undefined>(undefined);
    const [schedulingStaff, setSchedulingStaff] = useState<Staff | undefined>(undefined);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');

    const handleSaveStaff = (staffData: Omit<Staff, 'id'> | Staff) => {
        if (!currentTenant) return;
        
        if ('id' in staffData) { // Editing
            const updatedStaff = currentTenant.staff.map(s => s.id === staffData.id ? staffData : s);
            updateTenantData(currentTenant.id, { staff: updatedStaff });
            addToast('Staff member updated successfully!', 'success');
        } else { // Adding
            const newStaff: Staff = {
                id: `st${Date.now()}`,
                schedule: DEFAULT_SCHEDULE,
                ...staffData,
            };
            updateTenantData(currentTenant.id, { staff: [...currentTenant.staff, newStaff] });
            addToast('Staff member added successfully!', 'success');
            addToast(`Onboarding invite sent to ${newStaff.phone} via WhatsApp.`, 'info');
        }
        setIsModalOpen(false);
        setEditingStaff(undefined);
    };

    const handleSaveSchedule = (schedule: StaffSchedule) => {
        if (!currentTenant || !schedulingStaff) return;
        
        const updatedStaffMember = { ...schedulingStaff, schedule };
        const updatedStaffList = currentTenant.staff.map(s => s.id === schedulingStaff.id ? updatedStaffMember : s);
        
        updateTenantData(currentTenant.id, { staff: updatedStaffList });
        addToast(`Schedule for ${schedulingStaff.name} updated successfully!`, 'success');
        setIsScheduleModalOpen(false);
    };


    const handleAddNew = () => {
        setEditingStaff(undefined);
        setIsModalOpen(true);
    };
    
    const handleEdit = (staff: Staff) => {
        setEditingStaff(staff);
        setIsModalOpen(true);
    };
    
    const handleSchedule = (staff: Staff) => {
        setSchedulingStaff(staff);
        setIsScheduleModalOpen(true);
    };

    const handleDelete = (staffId: string) => {
        if (!currentTenant) return;
        if (window.confirm('Are you sure you want to delete this staff member? This cannot be undone.')) {
            const updatedStaff = currentTenant.staff.filter(s => s.id !== staffId);
            updateTenantData(currentTenant.id, { staff: updatedStaff });
            addToast('Staff member deleted.', 'info');
        }
    };

    const filteredStaff = useMemo(() => {
        if (!currentTenant) return [];
        return currentTenant.staff.filter(staff => {
            const searchTermLower = searchTerm.toLowerCase();
            
            const searchMatch =
                staff.name.toLowerCase().includes(searchTermLower) ||
                staff.role.toLowerCase().includes(searchTermLower) ||
                staff.specializations.some(s => s.toLowerCase().includes(searchTermLower));
            
            const roleMatch = roleFilter === 'all' || staff.role === roleFilter;

            return searchMatch && roleMatch;
        });
    }, [currentTenant, searchTerm, roleFilter]);

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Staff Management</h1>
                <button onClick={handleAddNew} className="px-5 py-2.5 bg-lavender-purple text-white font-semibold rounded-lg shadow-md hover:bg-lavender-purple/90 transition-all duration-300 transform hover:scale-105 flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                    Onboard New Staff
                </button>
            </div>

            <div className="mb-6 bg-white p-4 rounded-lg shadow-md flex items-center gap-4 flex-wrap">
                 <input
                    type="text"
                    placeholder="Search by name, role, or specialization..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-grow min-w-[200px] max-w-sm px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-lavender-purple text-gray-900 bg-white"
                />
                <select
                    name="roleFilter"
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-lavender-purple text-gray-900 bg-white"
                >
                    <option value="all">All Roles</option>
                    {STAFF_ROLES.map(role => (
                        <option key={role} value={role}>{role}</option>
                    ))}
                </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredStaff.map(staff => (
                   <StaffCard 
                        key={staff.id}
                        staff={staff}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onSchedule={handleSchedule}
                        appointments={currentTenant?.appointments || []}
                   />
                ))}
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingStaff ? 'Edit Staff Member' : 'Onboard New Staff'} size="3xl">
                <StaffForm staffMember={editingStaff} onSave={handleSaveStaff} onCancel={() => setIsModalOpen(false)} />
            </Modal>
            
            {schedulingStaff && (
                <ScheduleModal 
                    isOpen={isScheduleModalOpen}
                    onClose={() => setIsScheduleModalOpen(false)}
                    staff={schedulingStaff}
                    onSave={handleSaveSchedule}
                />
            )}
        </div>
    );
};

export default StaffPage;
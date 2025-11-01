import React, { useState, useEffect } from 'react';

interface AddReceivableModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReceivableAdded?: () => void;
}

interface Customer {
  id: string;
  name: string;
  email: string;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  customerName: string;
  totalAmount: number;
}

const AddReceivableModal: React.FC<AddReceivableModalProps> = ({ isOpen, onClose, onReceivableAdded }) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(false);

  // Form fields
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [paymentDate, setPaymentDate] = useState('');
  const [status, setStatus] = useState<'outstanding' | 'paid' | 'overdue' | 'written_off'>('outstanding');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      fetchCustomers();
      fetchInvoices();
      // Set default due date to 30 days from now
      const defaultDueDate = new Date();
      defaultDueDate.setDate(defaultDueDate.getDate() + 30);
      setDueDate(defaultDueDate.toISOString().split('T')[0]);
    }
  }, [isOpen]);

  const fetchCustomers = async () => {
    try {
      // Here you would typically make an API call to fetch customers
      // For now, we'll simulate the data
      const mockCustomers: Customer[] = [
        { id: '1', name: 'John Smith', email: 'john@example.com' },
        { id: '2', name: 'Sarah Johnson', email: 'sarah@example.com' },
        { id: '3', name: 'Mike Davis', email: 'mike@example.com' }
      ];
      setCustomers(mockCustomers);
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  const fetchInvoices = async () => {
    try {
      // Here you would typically make an API call to fetch unpaid invoices
      // For now, we'll simulate the data
      const mockInvoices: Invoice[] = [
        { id: '1', invoiceNumber: 'INV-2024-001', customerName: 'John Smith', totalAmount: 172.50 },
        { id: '2', invoiceNumber: 'INV-2024-002', customerName: 'Sarah Johnson', totalAmount: 230.00 },
        { id: '3', invoiceNumber: 'INV-2024-003', customerName: 'Mike Davis', totalAmount: 86.25 }
      ];
      setInvoices(mockInvoices);
    } catch (error) {
      console.error('Error fetching invoices:', error);
    }
  };

  const handleInvoiceChange = (invoiceId: string) => {
    setSelectedInvoice(invoiceId);
    const invoice = invoices.find(inv => inv.id === invoiceId);
    if (invoice) {
      setAmount(invoice.totalAmount.toString());
      // Auto-select customer based on invoice
      const customer = customers.find(c => c.name === invoice.customerName);
      if (customer) {
        setSelectedCustomer(customer.id);
      }
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!selectedCustomer) {
      newErrors.selectedCustomer = 'Please select a customer';
    }

    if (!amount || parseFloat(amount) <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }

    if (!dueDate) {
      newErrors.dueDate = 'Due date is required';
    } else if (new Date(dueDate) < new Date()) {
      newErrors.dueDate = 'Due date cannot be in the past';
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
      // Here you would typically make an API call to create the receivable
      // For now, we'll simulate the process
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Simulate API call success
      alert('Accounts receivable entry added successfully!');
      handleClose();
      onReceivableAdded?.();
    } catch (error) {
      console.error('Error adding receivable:', error);
      alert('Failed to add receivable entry. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedCustomer('');
    setSelectedInvoice('');
    setAmount('');
    setDueDate('');
    setPaymentDate('');
    setStatus('outstanding');
    setNotes('');
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-gradient-bg rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col transform transition-all duration-300 ease-in-out scale-95 animate-scale-in">
      <div className="flex justify-between items-center p-4 border-b border-gray-200/80">
        <h3 className="text-xl font-semibold text-gray-800">Add New Accounts Receivable</h3>
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Customer Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Customer *
            </label>
            <select
              value={selectedCustomer}
              onChange={(e) => setSelectedCustomer(e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-rose-pink focus:border-transparent ${
                errors.selectedCustomer ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Select a customer...</option>
              {customers.map(customer => (
                <option key={customer.id} value={customer.id}>
                  {customer.name} - {customer.email}
                </option>
              ))}
            </select>
            {errors.selectedCustomer && (
              <p className="text-red-500 text-xs mt-1">{errors.selectedCustomer}</p>
            )}
          </div>

          {/* Invoice Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Related Invoice
            </label>
            <select
              value={selectedInvoice}
              onChange={(e) => handleInvoiceChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-pink focus:border-transparent"
            >
              <option value="">Select an invoice (optional)...</option>
              {invoices.map(invoice => (
                <option key={invoice.id} value={invoice.id}>
                  {invoice.invoiceNumber} - {invoice.customerName} (${invoice.totalAmount})
                </option>
              ))}
            </select>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount *
            </label>
            <input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-rose-pink focus:border-transparent ${
                errors.amount ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="0.00"
            />
            {errors.amount && (
              <p className="text-red-500 text-xs mt-1">{errors.amount}</p>
            )}
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Due Date *
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-rose-pink focus:border-transparent ${
                errors.dueDate ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.dueDate && (
              <p className="text-red-500 text-xs mt-1">{errors.dueDate}</p>
            )}
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as 'outstanding' | 'paid' | 'overdue' | 'written_off')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-pink focus:border-transparent"
            >
              <option value="outstanding">Outstanding</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
              <option value="written_off">Written Off</option>
            </select>
          </div>

          {/* Payment Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Date
            </label>
            <input
              type="date"
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-pink focus:border-transparent"
            />
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-pink focus:border-transparent"
            placeholder="Additional notes about this receivable..."
          />
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
            {loading ? 'Adding...' : 'Add Receivable'}
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

export default AddReceivableModal;
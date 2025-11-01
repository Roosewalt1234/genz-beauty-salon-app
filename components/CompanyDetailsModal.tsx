import React, { useState, useRef } from 'react';

interface CompanyDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CompanyDetailsModal: React.FC<CompanyDetailsModalProps> = ({ isOpen, onClose }) => {
  const [companyName, setCompanyName] = useState('');
  const [vatApplicable, setVatApplicable] = useState<'yes' | 'no'>('no');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [licenseExpiryDate, setLicenseExpiryDate] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleSave = () => {
    // Handle save logic here
    console.log('Saving company details:', {
      companyName,
      vatApplicable,
      licenseNumber,
      licenseExpiryDate,
      logoFile
    });
    onClose();
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-gradient-bg rounded-lg shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col transform transition-all duration-300 ease-in-out scale-95 animate-scale-in">
      <div className="flex justify-between items-center p-4 border-b border-gray-200/80">
        <h3 className="text-xl font-semibold text-gray-800">Company Details</h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
      </div>
      <div className="p-6 overflow-y-auto">
        <div className="space-y-6">
        {/* Company Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Company Name *
          </label>
          <input
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-pink focus:border-transparent"
            placeholder="Enter company name"
          />
        </div>

        {/* VAT Applicable */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            VAT Applicable *
          </label>
          <div className="flex gap-6">
            <label className="flex items-center">
              <input
                type="radio"
                name="vat"
                value="yes"
                checked={vatApplicable === 'yes'}
                onChange={(e) => setVatApplicable(e.target.value as 'yes' | 'no')}
                className="w-4 h-4 text-rose-pink focus:ring-rose-pink"
              />
              <span className="ml-2 text-sm text-gray-700">Yes</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="vat"
                value="no"
                checked={vatApplicable === 'no'}
                onChange={(e) => setVatApplicable(e.target.value as 'yes' | 'no')}
                className="w-4 h-4 text-rose-pink focus:ring-rose-pink"
              />
              <span className="ml-2 text-sm text-gray-700">No</span>
            </label>
          </div>
        </div>

        {/* License Number */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Company License Number *
          </label>
          <input
            type="text"
            value={licenseNumber}
            onChange={(e) => setLicenseNumber(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-pink focus:border-transparent"
            placeholder="Enter license number"
          />
        </div>

        {/* License Expiry Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            License Expiry Date *
          </label>
          <input
            type="date"
            value={licenseExpiryDate}
            onChange={(e) => setLicenseExpiryDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-pink focus:border-transparent"
          />
        </div>

        {/* Logo Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Company Logo
          </label>
          <div
            className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-rose-pink transition-colors cursor-pointer"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={handleUploadClick}
          >
            {logoPreview ? (
              <div className="space-y-4">
                <img
                  src={logoPreview}
                  alt="Logo preview"
                  className="max-w-32 max-h-32 mx-auto rounded-lg shadow-md"
                />
                <p className="text-sm text-gray-500">Click to change logo or drag and drop a new image</p>
              </div>
            ) : (
              <div className="space-y-4">
                <svg className="w-12 h-12 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <div>
                  <p className="text-sm text-gray-600">Drop your logo here, or click to browse</p>
                  <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 5MB</p>
                </div>
              </div>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-gradient-to-r from-rose-pink to-lavender-purple text-white rounded-lg hover:from-rose-pink/90 hover:to-lavender-purple/90 transition-all duration-200 transform hover:scale-105"
          >
            Save Details
          </button>
          </div>
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
          background-color: #F7FAFC; /* Fallback */
          background-image: radial-gradient(circle at 50% 50%, #e6f7ff, #f3e8ff, #fff2fb);
        }
      `}</style>
    </div>
  );
};

export default CompanyDetailsModal;
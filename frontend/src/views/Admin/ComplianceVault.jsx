import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ComplianceVault = () => {
  const token = localStorage.getItem('token');
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    targetType: 'VEHICLE',
    targetId: '',
    documentType: 'INSURANCE',
    expiryDate: ''
  });
  const [file, setFile] = useState(null);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:3000/api/admin/compliance/documents', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDocuments(res.data.documents || []);
    } catch (error) {
      console.error('Failed to fetch documents', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      alert("Please attach a document file.");
      return;
    }
    if (!form.expiryDate) {
      alert("Expiry date is mandatory.");
      return;
    }
    if (!form.targetId) {
      alert("Target ID is required.");
      return;
    }

    const formData = new FormData();
    formData.append('targetType', form.targetType);
    formData.append('targetId', form.targetId);
    formData.append('documentType', form.documentType);
    formData.append('expiryDate', form.expiryDate);
    formData.append('document', file);

    try {
      await axios.post('http://localhost:3000/api/admin/compliance/upload', formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      alert('Document uploaded successfully!');
      setForm({
        ...form,
        targetId: '',
        expiryDate: ''
      });
      setFile(null);
      fetchDocuments();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to upload document');
    }
  };

  const getStatusBadge = (expiryDate) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-bold rounded">EXPIRED</span>;
    } else if (diffDays <= 30) {
      return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-bold rounded">EXPIRING SOON</span>;
    } else {
      return <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-bold rounded">VALID</span>;
    }
  };

  return (
    <div className="space-y-8">
      <h2 className="text-xl font-bold text-slate-800">Compliance Document Vault</h2>

      {/* Upload Portal */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
        <h3 className="text-lg font-bold text-slate-800 mb-4">Upload New Document</h3>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Target Entity</label>
              <select 
                value={form.targetType} 
                onChange={(e) => setForm({...form, targetType: e.target.value})}
                className="w-full border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2 border bg-white"
              >
                <option value="VEHICLE">Vehicle Asset</option>
                <option value="DRIVER">Driver</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                {form.targetType === 'VEHICLE' ? 'Vehicle Registration Number' : 'Driver ID / Name'}
              </label>
              <input 
                type="text" 
                required 
                value={form.targetId}
                onChange={(e) => setForm({...form, targetId: e.target.value})}
                className="w-full border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2 border" 
                placeholder={form.targetType === 'VEHICLE' ? "e.g., MH 04 AB 1234" : "e.g., DRV-001"}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Document Category</label>
              <select 
                value={form.documentType} 
                onChange={(e) => setForm({...form, documentType: e.target.value})}
                className="w-full border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2 border bg-white"
              >
                <option value="INSURANCE">Insurance Policy</option>
                <option value="DL">Driving License</option>
                <option value="NATIONAL_PERMIT">National Permit</option>
                <option value="PUC">Pollution (PUC)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Expiry Date</label>
              <input 
                type="date" 
                required 
                value={form.expiryDate}
                onChange={(e) => setForm({...form, expiryDate: e.target.value})}
                className="w-full border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2 border" 
              />
            </div>
          </div>

          <div className="flex flex-col justify-center">
            <label className="block text-sm font-medium text-slate-700 mb-2">Attach Document (PDF, JPG, PNG)</label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-md hover:border-indigo-500 transition-colors bg-slate-50 relative">
              <div className="space-y-1 text-center">
                <svg className="mx-auto h-12 w-12 text-slate-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                  <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <div className="flex text-sm text-slate-600 justify-center">
                  <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none px-1">
                    <span>Upload a file</span>
                    <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept=".pdf,.png,.jpg,.jpeg" />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-slate-500">
                  {file ? file.name : 'PNG, JPG, PDF up to 10MB'}
                </p>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end">
              <button 
                type="submit" 
                className="bg-indigo-600 text-white py-2 px-6 rounded-md hover:bg-indigo-700 transition font-bold shadow-md"
                disabled={loading}
              >
                Secure & Upload Document
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Audit Matrix */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
          <h3 className="font-bold text-slate-800">Document Audit Matrix</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Target</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Document Type</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Expiry Date</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {documents.length > 0 ? (
                documents.map((doc) => (
                  <tr key={doc._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-slate-900">{doc.targetId}</div>
                      <div className="text-xs text-slate-500">{doc.targetType}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-900 font-medium">{doc.documentType.replace('_', ' ')}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-900">{new Date(doc.expiryDate).toLocaleDateString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(doc.expiryDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <a 
                        href={`http://localhost:3000${doc.fileUrl}`} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 px-3 py-1.5 rounded border border-indigo-100"
                      >
                        View Document
                      </a>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-sm text-slate-500">
                    No compliance documents found in the vault.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ComplianceVault;

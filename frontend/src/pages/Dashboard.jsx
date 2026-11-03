import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { Eye, Edit, EyeOff, CheckCircle, Trash2, Plus, LogOut, Loader2, AlertTriangle, X, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const [docs, setDocs] = useState([]);
  const [stats, setStats] = useState({ total: 0, active: 0, hidden: 0 });

  // Search state
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentEditId, setCurrentEditId] = useState(null);

  // Form states
  const [formData, setFormData] = useState({ org_name: '', national_num: '', member_num: '', doc_num: '', status: 'مصدقة' });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetchDocs = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/documents');
      if (res.data.success) {
        setDocs(res.data.data);
        setStats({ total: res.data.total, active: res.data.active, hidden: res.data.hidden });
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { fetchDocs(); }, []);

  // Filter records by org name, national no, member no, doc no and status
  const filteredDocs = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return docs;

    return docs.filter((doc) =>
      [doc.orgName, doc.nationalNum, doc.memberNum, doc.docNum, doc.status]
        .some((value) => String(value ?? '').toLowerCase().includes(term))
    );
  }, [docs, searchTerm]);

  // Handle Add Record
  const handleAdd = async (e) => {
    e.preventDefault();
    setLoading(true);
    const data = new FormData();
    Object.keys(formData).forEach(key => data.append(key, formData[key]));
    if (file) data.append('doc_file', file);

    try {
      await axios.post('http://localhost:5000/api/documents', data);
      setShowAddModal(false);
      setFormData({ org_name: '', national_num: '', member_num: '', doc_num: '', status: 'مصدقة' });
      setFile(null);
      fetchDocs();
    } catch (err) {
      alert('Error adding record');
    } finally {
      setLoading(false);
    }
  };

  // Open Edit Modal and fill existing data
  const openEditModal = (doc) => {
    setCurrentEditId(doc._id);
    setFormData({
      org_name: doc.orgName || '',
      national_num: doc.nationalNum || '',
      member_num: doc.memberNum || '',
      doc_num: doc.docNum || '',
      status: doc.status || 'مصدقة'
    });
    setFile(null);
    setShowEditModal(true);
  };

  // Handle Update Record
  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    const data = new FormData();
    Object.keys(formData).forEach(key => data.append(key, formData[key]));
    if (file) data.append('doc_file', file);

    try {
      await axios.put(`http://localhost:5000/api/documents/${currentEditId}`, data);
      setShowEditModal(false);
      setCurrentEditId(null);
      setFormData({ org_name: '', national_num: '', member_num: '', doc_num: '', status: 'مصدقة' });
      setFile(null);
      fetchDocs();
    } catch (err) {
      alert('Error updating record');
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (id) => {
    try {
      await axios.patch(`http://localhost:5000/api/documents/${id}/toggle`);
      fetchDocs();
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      try {
        await axios.delete(`http://localhost:5000/api/documents/${id}`);
        fetchDocs();
      } catch (err) { console.error(err); }
    }
  };

  const handleViewInNewTab = (id, isActive) => {
    if (!isActive) {
      alert('⚠️ This record is hidden! Data cannot be viewed.');
      return;
    }
    const url = `/document/${id}`;
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8 border-b border-[#27272a] pb-4">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="Logo" className="w-9 h-9 object-contain" onError={(e)=>{e.target.style.display='none'}} />
          <h1 className="text-lg font-semibold tracking-tight">Dashboard & Records</h1>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => {
              setFormData({ org_name: '', national_num: '', member_num: '', doc_num: '', status: 'مصدقة' });
              setFile(null);
              setShowAddModal(true);
            }} 
            className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-lg text-xs font-medium hover:bg-neutral-200 transition cursor-pointer">
            <Plus className="w-4 h-4" /> Add Record
          </button>
          <button 
            onClick={() => { localStorage.removeItem('token'); navigate('/login'); }} 
            className="text-neutral-400 hover:text-white transition cursor-pointer" 
            title="Logout">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-[#0a0a0a] border border-[#27272a] p-4 rounded-xl">
          <p className="text-xs text-neutral-400 mb-1">Total Records</p>
          <h3 className="text-2xl font-bold">{stats.total}</h3>
        </div>
        <div className="bg-[#0a0a0a] border border-[#27272a] p-4 rounded-xl">
          <p className="text-xs text-neutral-400 mb-1">Active Records</p>
          <h3 className="text-2xl font-bold text-emerald-400">{stats.active}</h3>
        </div>
        <div className="bg-[#0a0a0a] border border-[#27272a] p-4 rounded-xl">
          <p className="text-xs text-neutral-400 mb-1">Hidden Records</p>
          <h3 className="text-2xl font-bold text-red-400">{stats.hidden}</h3>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-4 flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-neutral-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            dir="rtl"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="ابحث بالاسم أو الرقم الموحد أو رقم العضوية أو رقم الوثيقة... / Search records"
            className="w-full bg-[#0a0a0a] border border-[#27272a] rounded-lg py-2.5 pr-10 pl-10 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-white transition"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              title="Clear search"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white transition cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <span className="text-xs text-neutral-400 whitespace-nowrap">
          {filteredDocs.length} / {docs.length}
        </span>
      </div>

      {/* Data Table */}
      <div className="bg-[#0a0a0a] border border-[#27272a] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="border-b border-[#27272a] text-xs text-neutral-400 bg-[#121212]">
                <th className="p-3">اسم المنشأة / Org Name</th>
                <th className="p-3">الرقم الموحد / National No</th>
                <th className="p-3">رقم العضوية / Member No</th>
                <th className="p-3">رقم الوثيقة / Doc No</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#27272a] text-sm">
              {filteredDocs.map((doc) => (
                <tr key={doc._id} className={`transition ${!doc.isActive ? 'bg-red-950/20' : 'hover:bg-[#121212]'}`}>
                  <td className="p-3 font-medium">
                    {doc.orgName}
                    {!doc.isActive && (
                      <span className="block text-[10px] text-red-400 mt-0.5 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> Hidden: Data restricted
                      </span>
                    )}
                  </td>
                  <td className="p-3 text-neutral-400">{doc.nationalNum}</td>
                  <td className="p-3 text-neutral-400">{doc.memberNum}</td>
                  <td className="p-3 text-neutral-400">{doc.docNum}</td>
                  <td className="p-3">
                    {doc.isActive ? (
                      <span className="px-2 py-1 bg-emerald-950 text-emerald-400 text-xs rounded-full border border-emerald-900">{doc.status}</span>
                    ) : (
                      <span className="px-2 py-1 bg-red-950 text-red-400 text-xs rounded-full border border-red-900">مخفي (Hidden)</span>
                    )}
                  </td>
                  <td className="p-3">
                    <div className="flex items-center justify-center gap-2">
                      {/* 1. View Button */}
                      <button 
                        onClick={() => handleViewInNewTab(doc._id, doc.isActive)} 
                        title={doc.isActive ? "View in New Tab" : "Hidden - Cannot View"}
                        className={`p-1.5 border rounded-lg transition cursor-pointer ${doc.isActive ? 'bg-[#1a1a1a] border-[#27272a] text-neutral-300 hover:border-white' : 'bg-red-950/40 border-red-900 text-red-400 opacity-50'}`}>
                        <Eye className="w-4 h-4" />
                      </button>
                      
                      {/* 2. Edit Button (Linked to Edit Modal & API) */}
                      <button 
                        onClick={() => openEditModal(doc)} 
                        title="Edit Record"
                        className="p-1.5 bg-[#1a1a1a] border border-[#27272a] rounded-lg hover:border-white transition text-neutral-300 cursor-pointer">
                        <Edit className="w-4 h-4" />
                      </button>

                      {/* 3. Active / Hidden Toggle Button */}
                      <button 
                        onClick={() => toggleStatus(doc._id)} 
                        title={doc.isActive ? "Hide Record" : "Activate Record"}
                        className={`p-1.5 border rounded-lg transition cursor-pointer ${doc.isActive ? 'bg-emerald-950/40 border-emerald-900 text-emerald-400' : 'bg-red-950/40 border-red-900 text-red-400'}`}>
                        {doc.isActive ? <CheckCircle className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </button>

                      {/* 4. Delete Button */}
                      <button 
                        onClick={() => handleDelete(doc._id)} 
                        title="Delete Record"
                        className="p-1.5 bg-red-950/30 border border-red-900/50 rounded-lg text-red-400 hover:bg-red-950 transition cursor-pointer">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredDocs.length === 0 && (
                <tr>
                  <td colSpan="6" className="p-6 text-center text-neutral-500 text-sm">
                    {searchTerm ? 'No matching records found.' : 'No records found.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-[#0a0a0a] border border-[#27272a] rounded-xl p-6 max-w-lg w-full">
            <h3 className="text-base font-semibold mb-4">إضافة سجل جديد | Add New Record</h3>
            <form onSubmit={handleAdd} className="space-y-3">
              <div>
                <label className="text-xs text-neutral-400">اسم المنشأة</label>
                <input type="text" value={formData.org_name} onChange={e=>setFormData({...formData, org_name: e.target.value})} className="w-full bg-[#121212] border border-[#27272a] rounded-lg p-2 text-sm text-white" required />
              </div>
              <div>
                <label className="text-xs text-neutral-400">الرقم الموحد</label>
                <input type="text" value={formData.national_num} onChange={e=>setFormData({...formData, national_num: e.target.value})} className="w-full bg-[#121212] border border-[#27272a] rounded-lg p-2 text-sm text-white" required />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-neutral-400">رقم العضوية</label>
                  <input type="text" value={formData.member_num} onChange={e=>setFormData({...formData, member_num: e.target.value})} className="w-full bg-[#121212] border border-[#27272a] rounded-lg p-2 text-sm text-white" required />
                </div>
                <div>
                  <label className="text-xs text-neutral-400">رقم الوثيقة</label>
                  <input type="text" value={formData.doc_num} onChange={e=>setFormData({...formData, doc_num: e.target.value})} className="w-full bg-[#121212] border border-[#27272a] rounded-lg p-2 text-sm text-white" required />
                </div>
              </div>
              <div>
                <label className="text-xs text-neutral-400">رفع الملف (Only JPG)</label>
                <input type="file" onChange={e=>setFile(e.target.files[0])} className="w-full bg-[#121212] border border-[#27272a] rounded-lg p-2 text-xs text-neutral-300 cursor-pointer" />
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button type="button" onClick={()=>setShowAddModal(false)} disabled={loading} className="px-4 py-2 bg-[#1a1a1a] text-xs rounded-lg text-neutral-300 cursor-pointer">Cancel</button>
                <button 
                  type="submit" 
                  disabled={loading} 
                  className="px-4 py-2 bg-white text-black text-xs font-medium rounded-lg flex items-center gap-2 hover:bg-neutral-200 transition disabled:opacity-50 cursor-pointer">
                  {loading && <Loader2 className="w-3 h-3 animate-spin" />}
                  {loading ? 'Uploading...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-[#0a0a0a] border border-[#27272a] rounded-xl p-6 max-w-lg w-full">
            <h3 className="text-base font-semibold mb-4">تعديل السجل | Edit Record</h3>
            <form onSubmit={handleUpdate} className="space-y-3">
              <div>
                <label className="text-xs text-neutral-400">اسم المنشأة</label>
                <input type="text" value={formData.org_name} onChange={e=>setFormData({...formData, org_name: e.target.value})} className="w-full bg-[#121212] border border-[#27272a] rounded-lg p-2 text-sm text-white" required />
              </div>
              <div>
                <label className="text-xs text-neutral-400">الرقم الموحد</label>
                <input type="text" value={formData.national_num} onChange={e=>setFormData({...formData, national_num: e.target.value})} className="w-full bg-[#121212] border border-[#27272a] rounded-lg p-2 text-sm text-white" required />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-neutral-400">رقم العضوية</label>
                  <input type="text" value={formData.member_num} onChange={e=>setFormData({...formData, member_num: e.target.value})} className="w-full bg-[#121212] border border-[#27272a] rounded-lg p-2 text-sm text-white" required />
                </div>
                <div>
                  <label className="text-xs text-neutral-400">رقم الوثيقة</label>
                  <input type="text" value={formData.doc_num} onChange={e=>setFormData({...formData, doc_num: e.target.value})} className="w-full bg-[#121212] border border-[#27272a] rounded-lg p-2 text-sm text-white" required />
                </div>
              </div>
              <div>
                <label className="text-xs text-neutral-400">تحديث الملف (اختياري / Optional PDF/JPG)</label>
                <input type="file" onChange={e=>setFile(e.target.files[0])} className="w-full bg-[#121212] border border-[#27272a] rounded-lg p-2 text-xs text-neutral-300 cursor-pointer" />
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button type="button" onClick={()=>setShowEditModal(false)} disabled={loading} className="px-4 py-2 bg-[#1a1a1a] text-xs rounded-lg text-neutral-300 cursor-pointer">Cancel</button>
                <button 
                  type="submit" 
                  disabled={loading} 
                  className="px-4 py-2 bg-white text-black text-xs font-medium rounded-lg flex items-center gap-2 hover:bg-neutral-200 transition disabled:opacity-50 cursor-pointer">
                  {loading && <Loader2 className="w-3 h-3 animate-spin" />}
                  {loading ? 'Updating...' : 'Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
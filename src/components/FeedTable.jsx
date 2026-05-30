import { useState, useMemo } from 'react';
import { Search, Plus, Edit2, Trash2, Upload, ArrowUpDown, X } from 'lucide-react';

const FeedTable = ({ 
  feeds, 
  onFeedsChange, 
  onImportError,
  onImportSuccess 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Tümü');
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [isDragging, setIsDragging] = useState(false);

  const categories = useMemo(() => {
    const cats = [...new Set(feeds.map(f => f.category))];
    return ['Tümü', ...cats.sort()];
  }, [feeds]);

  const filteredFeeds = useMemo(() => {
    return feeds.filter(feed => {
      const matchesSearch = feed.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === 'Tümü' || feed.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [feeds, searchTerm, categoryFilter]);

  const handleFileUpload = async (file) => {
    if (!file) return;
    
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel'
    ];
    
    if (!validTypes.includes(file.type) && !file.name.match(/\.(xlsx|xls)$/i)) {
      onImportError?.('Geçersiz dosya formatı. Lütfen .xlsx veya .xls dosyası yükleyin.');
      return;
    }

    try {
      const XLSX = await import('xlsx');
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      if (jsonData.length === 0) {
        onImportError?.('Dosya boş veya geçerli veri içermiyor.');
        return;
      }

      const mappedFeeds = jsonData.map((row, index) => {
        return {
          id: Date.now() + index,
          name: row['Yem Adı'] || '',
          category: row['Tip'] || 'Diğer',
          crudeProtein: parseFloat(row['Ham Protein (%)']) || 0,
          metabolizableEnergy: parseFloat(row['ME (MJ/kg)']) || 0,
          costPerKg: parseFloat(row['Fiyat (TL)']) || 0
        };
      }).filter(feed => feed.name && feed.metabolizableEnergy > 0);

      if (mappedFeeds.length === 0) {
        onImportError?.('Dosyada geçerli yem maddesi bulunamadı. Sütun isimlerini kontrol edin.');
        return;
      }

      const newFeeds = [...feeds, ...mappedFeeds];
      onFeedsChange(newFeeds);
      onImportSuccess?.(`Başarıyla ${mappedFeeds.length} yem maddesi içe aktarıldı.`);
    } catch (error) {
      console.error('Import error:', error);
      onImportError?.('Dosya içe aktarılırken hata oluştu. Lütfen dosya formatını kontrol edin.');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleFileInput = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileUpload(file);
    }
    e.target.value = '';
  };

  const handleEdit = (feed) => {
    setEditingId(feed.id);
    setEditData({ ...feed });
  };

  const handleEditSave = () => {
    const updatedFeeds = feeds.map(f => 
      f.id === editingId ? { ...editData } : f
    );
    onFeedsChange(updatedFeeds);
    setEditingId(null);
    setEditData({});
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditData({});
  };

  const handleDelete = (id) => {
    if (window.confirm('Bu yem maddesini silmek istediğinizden emin misiniz?')) {
      onFeedsChange(feeds.filter(f => f.id !== id));
    }
  };

  const handleAddNew = () => {
    const newFeed = {
      id: Date.now(),
      name: 'Yeni Yem Maddesi',
      category: 'Kesif',
      metabolizableEnergy: 10,
      crudeProtein: 15,
      costPerKg: 10
    };
    onFeedsChange([...feeds, newFeed]);
    handleEdit(newFeed);
  };

  return (
    <div className="glass-card p-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
              <Upload size={16} className="text-emerald-600" />
            </span>
            Yem Maddeleri Kütüphanesi
          </h3>
          <p className="text-slate-500 text-sm mt-1">
            {feeds.length} yem maddesi • Excel: Yem Adı, Tip, Ham Protein (%), ME (MJ/kg), Fiyat (TL)
          </p>
        </div>
        <button 
          onClick={handleAddNew}
          className="btn-primary flex items-center gap-2 text-sm"
        >
          <Plus size={18} />
          Yeni Yem Ekle
        </button>
      </div>

      {/* Drop Zone */}
      <div 
        className={`relative border-2 border-dashed rounded-xl p-8 mb-6 text-center transition-all duration-300 cursor-pointer
          ${isDragging 
            ? 'border-emerald-500 bg-emerald-50 drop-zone-active' 
            : 'border-slate-300 hover:border-emerald-400 hover:bg-slate-50'
          }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => document.getElementById('file-input')?.click()}
      >
        <input
          type="file"
          id="file-input"
          accept=".xlsx,.xls"
          onChange={handleFileInput}
          className="hidden"
        />
        <Upload size={32} className={`mx-auto mb-3 ${isDragging ? 'text-emerald-600' : 'text-slate-400'}`} />
        <p className="text-slate-600 font-medium">
          {isDragging ? 'Dosyayı bırakın...' : 'Excel dosyasını sürükleyin veya tıklayın'}
        </p>
        <p className="text-slate-400 text-sm mt-1">
          Desteklenen formatlar: .xlsx, .xls
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Yem maddesi ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition-all duration-200 text-slate-800"
        >
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="text-left py-3 px-4 text-slate-600 font-semibold text-sm">Yem Adı</th>
              <th className="text-left py-3 px-4 text-slate-600 font-semibold text-sm">Tip</th>
              <th className="text-right py-3 px-4 text-slate-600 font-semibold text-sm">Ham Protein (%)</th>
              <th className="text-right py-3 px-4 text-slate-600 font-semibold text-sm">ME (MJ/kg)</th>
              <th className="text-right py-3 px-4 text-slate-600 font-semibold text-sm">Maliyet (TL/kg)</th>
              <th className="text-right py-3 px-4 text-slate-600 font-semibold text-sm">İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {filteredFeeds.length === 0 ? (
              <tr>
                <td colSpan="5" className="py-8 text-center text-slate-500">
                  <div className="flex flex-col items-center">
                    <span className="text-4xl mb-2">🌾</span>
                    <p>Arama kriterlerine uygun yem maddesi bulunamadı.</p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredFeeds.map((feed) => (
                <tr 
                  key={feed.id} 
                  className="border-b border-slate-100 hover:bg-slate-50 transition-colors duration-150"
                >
                  {editingId === feed.id ? (
                    <>
                      <td className="py-3 px-4">
                        <input
                          type="text"
                          value={editData.name}
                          onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                          className="input-field text-sm py-1"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <select
                          value={editData.category}
                          onChange={(e) => setEditData({ ...editData, category: e.target.value })}
                          className="input-field text-sm py-1"
                        >
                          <option value="Kesif">Kesif</option>
                          <option value="Kaba">Kaba</option>
                          <option value="Katkı">Katkı</option>
                          <option value="Karma">Karma</option>
                          <option value="Diğer">Diğer</option>
                        </select>
                      </td>
                      <td className="py-3 px-4">
                        <input
                          type="number"
                          value={editData.crudeProtein}
                          onChange={(e) => setEditData({ ...editData, crudeProtein: parseFloat(e.target.value) || 0 })}
                          className="input-field text-sm py-1 w-24 text-right"
                          step="0.1"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <input
                          type="number"
                          value={editData.metabolizableEnergy}
                          onChange={(e) => setEditData({ ...editData, metabolizableEnergy: parseFloat(e.target.value) || 0 })}
                          className="input-field text-sm py-1 w-24 text-right"
                          step="0.1"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <input
                          type="number"
                          value={editData.costPerKg || 0}
                          onChange={(e) => setEditData({ ...editData, costPerKg: parseFloat(e.target.value) || 0 })}
                          className="input-field text-sm py-1 w-24 text-right"
                          step="0.01"
                        />
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={handleEditSave}
                            className="p-2 bg-emerald-100 text-emerald-600 rounded-lg hover:bg-emerald-200 transition-colors"
                            title="Kaydet"
                          >
                            <X size={16} />
                          </button>
                          <button
                            onClick={handleEditCancel}
                            className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
                            title="Ping"
                          >
                            <span>✕</span>
                          </button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="py-3 px-4 font-medium text-slate-800">{feed.name}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium
                          ${feed.category === 'Kesif' ? 'bg-blue-100 text-blue-700' :
                            feed.category === 'Kaba' ? 'bg-amber-100 text-amber-700' :
                            feed.category === 'Katkı' ? 'bg-purple-100 text-purple-700' :
                            feed.category === 'Karma' ? 'bg-green-100 text-green-700' :
                            'bg-slate-100 text-slate-700'
                          }`}>
                          {feed.category}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-slate-600">{feed.crudeProtein?.toFixed(1) || '0.0'}</td>
                      <td className="py-3 px-4 text-right font-mono text-slate-600">{feed.metabolizableEnergy?.toFixed(2) || '0.00'}</td>
                      <td className="py-3 px-4 text-right font-mono text-slate-600">{feed.costPerKg ? `${feed.costPerKg.toFixed(2)} TL` : '-'}</td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEdit(feed)}
                            className="p-2 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all duration-200"
                            title="Düzenle"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(feed.id)}
                            className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                            title="Sil"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination indicator */}
      <div className="mt-4 text-center text-slate-500 text-sm">
        {filteredFeeds.length} kayıttan {filteredFeeds.length} gösteriliyor
      </div>
    </div>
  );
};

export default FeedTable;

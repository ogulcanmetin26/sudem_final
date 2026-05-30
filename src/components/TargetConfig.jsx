import { useState, useEffect } from 'react';
import { Zap, Bean, RotateCcw, Check, Sparkles } from 'lucide-react';
import { getPresetsByAnimalType } from '../data/defaultData';

const TargetConfig = ({ animalType, targets, onTargetsChange }) => {
  const [localTargets, setLocalTargets] = useState(targets);
  const [activePreset, setActivePreset] = useState(null);
  const presets = getPresetsByAnimalType(animalType);

  useEffect(() => {
    setLocalTargets(targets);
  }, [targets]);

  const handleInputChange = (field, value) => {
    const newTargets = { ...localTargets, [field]: parseFloat(value) || 0 };
    setLocalTargets(newTargets);
    setActivePreset(null);
  };

  const handlePresetSelect = (presetKey) => {
    const preset = presets[presetKey];
    const newTargets = {
      energy: preset.energy,
      protein: preset.protein
    };
    setLocalTargets(newTargets);
    setActivePreset(presetKey);
    onTargetsChange(newTargets);
  };

  const handleSave = () => {
    onTargetsChange(localTargets);
  };

  const getAnimalTitle = () => {
    switch (animalType) {
      case 'beef': return 'Besi Sığırı';
      case 'dairy': return 'Süt Sığırı';
      case 'poultry': return 'Kanatlılar';
      default: return 'Hayvan';
    }
  };

  const getAnimalIcon = () => {
    switch (animalType) {
      case 'beef': return '🐂';
      case 'dairy': return '🐄';
      case 'poultry': return '🐔';
      default: return '🐾';
    }
  };

  return (
    <div className="glass-card p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
            <span className="text-xl">{getAnimalIcon()}</span>
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-lg">
              Kalori ve Protein İhtiyacı Belirleme
            </h3>
            <p className="text-slate-500 text-sm">
              {getAnimalTitle()} için Besi Hedefleri
            </p>
          </div>
        </div>
      </div>

      {/* Quick Presets */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles size={16} className="text-amber-500" />
          <span className="text-sm font-medium text-slate-600">Hızlı Hazır Ayar</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Object.entries(presets).map(([key, preset]) => (
            <button
              key={key}
              onClick={() => handlePresetSelect(key)}
              className={`p-3 rounded-xl border-2 text-left transition-all duration-300 group
                ${activePreset === key 
                  ? 'border-emerald-500 bg-emerald-50 shadow-lg shadow-emerald-500/20' 
                  : 'border-slate-200 hover:border-emerald-300 hover:bg-slate-50'
                }`}
            >
              <div className={`text-sm font-semibold mb-1
                ${activePreset === key ? 'text-emerald-700' : 'text-slate-700 group-hover:text-emerald-700'}`}>
                {preset.name}
              </div>
              <div className="text-xs text-slate-500 leading-relaxed">
                {preset.description}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Input Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Energy Input */}
        <div className="relative">
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-3">
            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
              <Zap size={16} className="text-amber-600" />
            </div>
            Enerji İhtiyacı (ME)
          </label>
          <div className="relative">
            <input
              type="number"
              value={localTargets.energy}
              onChange={(e) => handleInputChange('energy', e.target.value)}
              onBlur={handleSave}
              step="0.1"
              min="0"
              className="w-full pl-12 pr-4 py-4 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 
                       rounded-xl text-xl font-bold text-amber-800 focus:ring-2 focus:ring-amber-500/50 
                       focus:border-amber-500 outline-none transition-all duration-200"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-amber-600 font-semibold">
              MJ/kg
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-2 ml-1">
            Metabolik Enerji birim değeri
          </p>
        </div>

        {/* Protein Input */}
        <div className="relative">
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-3">
            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
              <Bean size={16} className="text-blue-600" />
            </div>
            Ham Protein İhtiyacı
          </label>
          <div className="relative">
            <input
              type="number"
              value={localTargets.protein}
              onChange={(e) => handleInputChange('protein', e.target.value)}
              onBlur={handleSave}
              step="0.1"
              min="0"
              className="w-full pl-12 pr-4 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 
                       rounded-xl text-xl font-bold text-blue-800 focus:ring-2 focus:ring-blue-500/50 
                       focus:border-blue-500 outline-none transition-all duration-200"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-600 font-semibold">
              %
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-2 ml-1">
            Kuru maddede ham protein yüzdesi
          </p>
        </div>
      </div>

      {/* Reset Button */}
      <div className="mt-6 flex justify-end">
        <button
          onClick={() => handlePresetSelect(activePreset || Object.keys(presets)[0])}
          className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-all duration-200"
        >
          <RotateCcw size={16} />
          <span className="text-sm font-medium">Sıfırla</span>
        </button>
      </div>
    </div>
  );
};

export default TargetConfig;

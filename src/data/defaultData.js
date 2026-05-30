// Embedded feed database from Excel (yem_veritabani.xlsx)
// Columns: Yem Adı, Tip, Ham Protein (%), ME (MJ/kg), Fiyat (TL)
import embeddedFeeds from '../data/embeddedFeeds.json';

export const defaultFeeds = embeddedFeeds;

// Production stage presets for Beef Cattle (Besi Sığırı)
// Energy values in MJ/kg format matching the embedded feed database
export const beefPresets = {
  starter: {
    name: 'Başlangıç Dönemi',
    energy: 10.5,
    protein: 16.0,
    description: '50-150 kg canlı ağırlık, günlük 0.8-1.0 kg artış'
  },
  grower: {
    name: 'Büyüme Dönemi',
    energy: 11.0,
    protein: 14.0,
    description: '150-350 kg canlı ağırlık, günlük 1.0-1.2 kg artış'
  },
  finisher: {
    name: 'Bitirme Dönemi',
    energy: 11.5,
    protein: 12.0,
    description: '350-600 kg canlı ağırlık, final dönemi'
  }
};

// Production stage presets for Dairy Cattle (Süt Sığırı)
export const dairyPresets = {
  earlyLactation: {
    name: 'Erken Laktasyon',
    energy: 11.5,
    protein: 17.0,
    description: 'Yeni doğum sonrası ilk 90 gün, yüksek enerji ihtiyacı'
  },
  midLactation: {
    name: 'Orta Laktasyon',
    energy: 11.0,
    protein: 16.0,
    description: '90-200 gün arası, optimum verim dönemi'
  },
  lateLactation: {
    name: 'Geç Laktasyon',
    energy: 10.5,
    protein: 14.0,
    description: '200+ gün, gebelik son dönemi'
  },
  dryPeriod: {
    name: 'Kuru Dönem',
    energy: 9.5,
    protein: 12.0,
    description: 'Gebelik sonu, doğuma hazırlık'
  }
};

// Production stage presets for Poultry (Kanatlılar)
// Higher energy values typical for poultry
export const poultryPresets = {
  chick: {
    name: 'Civciv (0-3 hafta)',
    energy: 12.0,
    protein: 21.0,
    description: 'Yem tüketimi: 40-60 g/gün'
  },
  grower: {
    name: 'Piliç (4-6 hafta)',
    energy: 12.5,
    protein: 19.0,
    description: 'Büyüme dönemi, yem tüketimi: 100-150 g/gün'
  },
  finisher: {
    name: 'Bitirme (7+ hafta)',
    energy: 13.0,
    protein: 17.0,
    description: 'Sonlandırma dönemi'
  },
  layer: {
    name: 'Yumurtacı',
    energy: 11.5,
    protein: 16.5,
    description: 'Verim dönemi, günlük 100-120 g yem'
  },
  breeder: {
    name: 'Ebeveyn Sürü',
    energy: 11.8,
    protein: 15.0,
    description: 'Damızlık hayvan besleme'
  }
};

export const getPresetsByAnimalType = (type) => {
  switch (type) {
    case 'beef':
      return beefPresets;
    case 'dairy':
      return dairyPresets;
    case 'poultry':
      return poultryPresets;
    default:
      return beefPresets;
  }
};

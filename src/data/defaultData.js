// Default feed ingredients library
export const defaultFeeds = [
  // Roughages (Kaba Yemler)
  {
    id: 1,
    name: 'Mısır Silajı',
    category: 'Kaba Yem',
    dryMatter: 35.0,
    metabolizableEnergy: 2.5,
    crudeProtein: 8.0,
    costPerKg: 2.50,
    unit: '% DM'
  },
  {
    id: 2,
    name: 'Yonca Kuru Otu',
    category: 'Kaba Yem',
    dryMatter: 88.0,
    metabolizableEnergy: 2.0,
    crudeProtein: 17.0,
    costPerKg: 4.00,
    unit: '% DM'
  },
  {
    id: 3,
    name: 'Buğday Samanı',
    category: 'Kaba Yem',
    dryMatter: 90.0,
    metabolizableEnergy: 1.3,
    crudeProtein: 4.0,
    costPerKg: 1.00,
    unit: '% DM'
  },
  {
    id: 4,
    name: 'Mısır Koçanı',
    category: 'Kaba Yem',
    dryMatter: 85.0,
    metabolizableEnergy: 1.8,
    crudeProtein: 3.5,
    costPerKg: 1.50,
    unit: '% DM'
  },
  
  // Concentrates (Kesif Yemler)
  {
    id: 5,
    name: 'Arpa',
    category: 'Kesif Yem',
    dryMatter: 88.0,
    metabolizableEnergy: 3.1,
    crudeProtein: 11.5,
    costPerKg: 5.00,
    unit: '% DM'
  },
  {
    id: 6,
    name: 'Buğday',
    category: 'Kesif Yem',
    dryMatter: 88.0,
    metabolizableEnergy: 3.2,
    crudeProtein: 12.0,
    costPerKg: 4.50,
    unit: '% DM'
  },
  {
    id: 7,
    name: 'Mısır Taneleri',
    category: 'Kesif Yem',
    dryMatter: 88.0,
    metabolizableEnergy: 3.4,
    crudeProtein: 8.5,
    costPerKg: 4.00,
    unit: '% DM'
  },
  {
    id: 8,
    name: 'Soya Küspesi',
    category: 'Kesif Yem',
    dryMatter: 89.0,
    metabolizableEnergy: 3.2,
    crudeProtein: 44.0,
    costPerKg: 12.00,
    unit: '% DM'
  },
  {
    id: 9,
    name: 'Ayçiçeği Küspesi',
    category: 'Kesif Yem',
    dryMatter: 90.0,
    metabolizableEnergy: 2.6,
    crudeProtein: 33.0,
    costPerKg: 8.00,
    unit: '% DM'
  },
  {
    id: 10,
    name: 'DDGS (Mısır DDGS)',
    category: 'Kesif Yem',
    dryMatter: 90.0,
    metabolizableEnergy: 3.0,
    crudeProtein: 27.0,
    costPerKg: 7.00,
    unit: '% DM'
  },
  {
    id: 11,
    name: 'Pamuk Tohumu Küspesi',
    category: 'Kesif Yem',
    dryMatter: 91.0,
    metabolizableEnergy: 2.7,
    crudeProtein: 38.0,
    costPerKg: 9.00,
    unit: '% DM'
  },
  {
    id: 12,
    name: 'Kepek',
    category: 'Kesif Yem',
    dryMatter: 89.0,
    metabolizableEnergy: 2.5,
    crudeProtein: 15.0,
    costPerKg: 3.50,
    unit: '% DM'
  },
  
  // Energy & Protein Supplements
  {
    id: 13,
    name: 'Bitkisel Yağ',
    category: 'Yağlı Yem',
    dryMatter: 99.5,
    metabolizableEnergy: 8.8,
    crudeProtein: 0,
    costPerKg: 25.00,
    unit: '% DM'
  },
  {
    id: 14,
    name: 'Balık Unu',
    category: 'Hayvansal Yem',
    dryMatter: 92.0,
    metabolizableEnergy: 3.5,
    crudeProtein: 62.0,
    costPerKg: 35.00,
    unit: '% DM'
  },
  {
    id: 15,
    name: 'Süt Tozu',
    category: 'Hayvansal Yem',
    dryMatter: 96.0,
    metabolizableEnergy: 4.0,
    crudeProtein: 34.0,
    costPerKg: 45.00,
    unit: '% DM'
  },
  {
    id: 16,
    name: 'Şeker Pancarı Peleti',
    category: 'Diğer',
    dryMatter: 91.0,
    metabolizableEnergy: 3.0,
    crudeProtein: 9.0,
    costPerKg: 4.50,
    unit: '% DM'
  },
  {
    id: 17,
    name: 'Tрез',
    category: 'Diğer',
    dryMatter: 90.0,
    metabolizableEnergy: 1.9,
    crudeProtein: 12.0,
    costPerKg: 2.00,
    unit: '% DM'
  },
  {
    id: 18,
    name: 'Yonca Unu',
    category: 'Kaba Yem',
    dryMatter: 92.0,
    metabolizableEnergy: 2.1,
    crudeProtein: 18.0,
    costPerKg: 5.00,
    unit: '% DM'
  }
];

// Production stage presets for Beef Cattle (Besi Sığırı)
export const beefPresets = {
  starter: {
    name: 'Başlangıç Dönemi',
    energy: 2.4,
    protein: 14.0,
    description: '50-150 kg canlı ağırlık, günlük 0.8-1.0 kg artış'
  },
  grower: {
    name: 'Büyüme Dönemi',
    energy: 2.6,
    protein: 12.5,
    description: '150-350 kg canlı ağırlık, günlük 1.0-1.2 kg artış'
  },
  finisher: {
    name: 'Bitirme Dönemi',
    energy: 2.8,
    protein: 11.0,
    description: '350-600 kg canlı ağırlık, final dönemi'
  }
};

// Production stage presets for Dairy Cattle (Süt Sığırı)
export const dairyPresets = {
  earlyLactation: {
    name: 'Erken Laktasyon',
    energy: 2.8,
    protein: 16.5,
    description: 'Yeni doğum sonrası ilk 90 gün, yüksek enerji ihtiyacı'
  },
  midLactation: {
    name: 'Orta Laktasyon',
    energy: 2.6,
    protein: 15.0,
    description: '90-200 gün arası, optimum verim dönemi'
  },
  lateLactation: {
    name: 'Geç Laktasyon',
    energy: 2.4,
    protein: 13.5,
    description: '200+ gün, gebelik son dönemi'
  },
  dryPeriod: {
    name: 'Kuru Dönem',
    energy: 2.0,
    protein: 12.0,
    description: 'Gebelik sonu, doğuma hazırlık'
  }
};

// Production stage presets for Poultry (Kanatlılar)
export const poultryPresets = {
  chick: {
    name: 'Civciv (0-3 hafta)',
    energy: 3.0,
    protein: 21.0,
    description: 'Yem tüketimi: 40-60 g/gün'
  },
  grower: {
    name: 'Piliç (4-6 hafta)',
    energy: 3.1,
    protein: 19.0,
    description: 'Büyüme dönemi, yem tüketimi: 100-150 g/gün'
  },
  finisher: {
    name: 'Bitirme (7+ hafta)',
    energy: 3.2,
    protein: 17.0,
    description: 'Sonlandırma dönemi'
  },
  layer: {
    name: 'Yumurtacı',
    energy: 2.8,
    protein: 16.5,
    description: 'Verim dönemi, günlük 100-120 g yem'
  },
  breeder: {
    name: 'Ebeveyn Sürü',
    energy: 2.9,
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

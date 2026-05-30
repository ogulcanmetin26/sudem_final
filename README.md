# Sudem Sevinç Final Ödevi - Hayvan Besleme ve Rasyon Yönetimi

Modern, profesyonel ve kullanıcı dostu bir Hayvan Besleme ve Rasyon Yönetimi Web Uygulaması. React (Vite) ve Tailwind CSS ile geliştirilmiştir.

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&style=flat-square)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&style=flat-square)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4-06B6D4?logo=tailwind-css&style=flat-square)

## 🌟 Özellikler

### Ana Modüller
- **Genel Bakış Dashboard** - Tüm uygulama istatistiklerini görüntüleyin
- **Besi Sığırı (Beef Cattle)** - Besi sığırları için rasyon hesaplama
- **Süt Sığırı (Dairy Cattle)** - Süt sığırları için laktasyon bazlı rasyon planlama
- **Kanatlılar (Poultry)** - Piliç ve yumurtacılar için büyüme ve verim dönemleri

### Fonksiyonellikler
- **Kalori ve Protein Ayarlama** - Hedef besin değerlerini belirleyin
- **Excel İçe Aktarma** - .xlsx dosyalarından yem maddeleri import edin
- **Rasyon Simülatörü** - Gerçek zamanlı besin hesaplaması
- **Görselleştirme** - Grafikler ile hedef vs mevcut karşılaştırması
- **Veri Kalıcılığı** - localStorage ile veri saklama

## 🚀 Kurulum

```bash
# Projeyi indirin
git clone https://github.com/ogulcanmetin26/sudem_final.git
cd sudem_final

# Bağımlılıkları yükleyin
npm install

# Geliştirme sunucusunu başlatın
npm run dev

# Production build oluşturun
npm run build

# Production preview
npm run preview
```

## 📁 Proje Yapısı

```
src/
├── components/
│   ├── AnimalTab.jsx        # Hayvan sekmesi konteyneri
│   ├── ChartView.jsx       # Recharts görselleştirme
│   ├── FeedTable.jsx       # Excel import & yem kütüphanesi
│   ├── Header.jsx          # Uygulama başlığı
│   ├── OverviewDashboard.jsx  # Dashboard genel bakış
│   ├── RationCalculator.jsx   # Rasyon hesaplayıcı
│   ├── Sidebar.jsx         # Yan navigasyon
│   └── TargetConfig.jsx    # Besin hedef ayarlama
├── data/
│   └── defaultData.js      # Varsayılan yem verileri
├── utils/
│   └── storage.js          # LocalStorage yardımcıları
├── App.jsx                 # Ana uygulama
├── main.jsx               # Giriş noktası
└── index.css              # Tailwind stilleri
```

## 🎨 Teknolojiler

- **React 18** - UI kütüphanesi
- **Vite 8** - Build aracı
- **Tailwind CSS v4** - CSS framework
- **Lucide React** - İkonlar
- **XLSX** - Excel dosya işleme
- **Recharts** - Veri görselleştirme

## 📊 Besi Sığırı Aşamaları

| Aşama | Enerji (MJ/kg) | Protein (%) |
|-------|----------------|-------------|
| Başlangıç | 2.4 | 14.0 |
| Büyüme | 2.6 | 12.5 |
| Bitirme | 2.8 | 11.0 |

## 📊 Süt Sığırı Aşamaları

| Aşama | Enerji (MJ/kg) | Protein (%) |
|-------|----------------|-------------|
| Erken Laktasyon | 2.8 | 16.5 |
| Orta Laktasyon | 2.6 | 15.0 |
| Geç Laktasyon | 2.4 | 13.5 |
| Kuru Dönem | 2.0 | 12.0 |

## 📊 Kanatlı Aşamaları

| Aşama | Enerji (MJ/kg) | Protein (%) |
|-------|----------------|-------------|
| Civciv | 3.0 | 21.0 |
| Piliç | 3.1 | 19.0 |
| Bitirme | 3.2 | 17.0 |
| Yumurtacı | 2.8 | 16.5 |

## 📝 Lisans

Bu proje Sudem Sevinç Final Ödevi için geliştirilmiştir.

---

⭐️ Eğer bu proje faydalı olduys, GitHub'da yıldız vermeyi unutmayın!

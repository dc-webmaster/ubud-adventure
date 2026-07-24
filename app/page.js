'use client';

import React, { useState, useEffect } from 'react';

// Konten standar awal (Fallback)
const DEFAULT_CONTENT = {
  adminPin: '1234', // PIN Default Admin
  whatsappNumber: '6281353046942',
  announcement: 'Special Rates! Choose Standalone Activities or Save Big with Combo Packages!',
  heroTitle: 'Choose Single Activities or The Ultimate Combo Adventure!',
  heroSubtitle: 'Looking for wild river rafting or an exhilarating off-road quad bike track? Book individual activities or join both in a full-day adventure combo through Ubud\'s jungles, waterfalls, and caves.',
  prices: {
    'Ayung River Rafting Only': 400000,
    'Single ATV Ride Only': 650000,
    'Tandem ATV Ride Only': 950000,
    'Rafting + Single ATV Combo': 1100000,
    'Rafting + Tandem ATV Combo': 1800000
  }
};

export default function App() {
  // State manajemen konten web
  const [content, setContent] = useState(DEFAULT_CONTENT);
  const [isAdminVisible, setIsAdminVisible] = useState(false);
  
  // State Modal Booking
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState('Rafting + Single ATV Combo');
  const [bookingForm, setBookingForm] = useState({
    name: '',
    date: '',
    qty: 1,
    hotel: '',
    phone: ''
  });

  // State Modal Admin CMS
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [adminPin, setAdminPin] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinError, setPinError] = useState(false);
  const [editForm, setEditForm] = useState(DEFAULT_CONTENT);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Memuat data tersimpan dari localStorage saat halaman pertama kali dibuka
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedData = localStorage.getItem('bali_adventure_content');
        if (savedData) {
          const parsed = JSON.parse(savedData);
          setContent(parsed);
          setEditForm(parsed);
        }
      } catch (err) {
        console.error('Gagal memuat data tersimpan:', err);
      }
    }
  }, []);

  // Deteksi Tombol Admin Rahasia via URL (?admin=true) atau Shortcut Keyboard (Ctrl+Shift+A)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('admin') === 'true' || params.get('secret') === '1234') {
        setIsAdminVisible(true);
      }

      const handleKeyDown = (e) => {
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
          e.preventDefault();
          setIsAdminVisible(true);
          setIsAdminOpen(true);
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, []);

  // Format Angka ke IDR
  const formatIDR = (amount) => {
    return 'IDR ' + (amount || 0).toLocaleString('id-ID');
  };

  // Buka Modal Pemesanan
  const handleOpenBooking = (packageName) => {
    if (packageName) setSelectedPackage(packageName);
    setIsBookingOpen(true);
  };

  // Kirim Pemesanan ke WhatsApp
  const handleBookingSubmit = (e) => {
    e.preventDefault();
    const unitPrice = content.prices[selectedPackage] || 1100000;
    const totalPrice = (unitPrice * bookingForm.qty).toLocaleString('id-ID');

    const message = `Halo Bali Adventure! Saya ingin memesan paket:%0A%0A` +
      `*Paket:* ${selectedPackage}%0A` +
      `*Nama:* ${bookingForm.name}%0A` +
      `*Tanggal Tur:* ${bookingForm.date}%0A` +
      `*Jumlah:* ${bookingForm.qty}%0A` +
      `*Penjemputan Hotel:* ${bookingForm.hotel}%0A` +
      `*WhatsApp Tamu:* ${bookingForm.phone}%0A` +
      `*Total Estimasi:* IDR ${totalPrice}%0A%0A` +
      `Mohon konfirmasi ketersediaan. Terima kasih!`;

    window.open(`https://wa.me/${content.whatsappNumber}?text=${message}`, '_blank');
    setIsBookingOpen(false);
  };

  // Verifikasi PIN Akses Admin
  const handleVerifyPin = () => {
    const validPin = content.adminPin || '1234';
    if (adminPin === validPin) {
      setIsAuthenticated(true);
      setPinError(false);
      setEditForm(JSON.parse(JSON.stringify(content)));
    } else {
      setPinError(true);
    }
  };

  // Menyimpan Perubahan Konten secara Permanen (Local Storage)
  const handleSaveContent = (e) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      setContent(editForm);
      if (typeof window !== 'undefined') {
        localStorage.setItem('bali_adventure_content', JSON.stringify(editForm));
      }
      setIsSaving(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Gagal menyimpan perubahan:', error);
      setIsSaving(false);
    }
  };

  const waUrl = `https://wa.me/${content.whatsappNumber}?text=Halo%20Bali%20Adventure!%20Saya%20ingin%20bertanya%20mengenai%20paket%20tur.`;

  return (
    <div className="bg-slate-50 text-slate-800 antialiased font-sans selection:bg-emerald-500 selection:text-white min-h-screen">
      
      {/* BANNER PENGUMUMAN ATAS */}
      <div className="bg-emerald-600 text-white text-xs md:text-sm py-2 px-4 text-center font-medium flex items-center justify-center gap-2">
        <i className="fa-solid fa-fire text-yellow-300"></i> 
        <span>{content.announcement}</span>
      </div>

      {/* NAVBAR */}
      <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <a href="#" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-emerald-500/20">
              <i className="fa-solid fa-compass"></i>
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight text-slate-900 block leading-none">BALI ADVENTURE</span>
              <span className="text-[10px] uppercase font-bold text-emerald-600 tracking-widest">Rafting & ATV Tour</span>
            </div>
          </a>

          <div className="hidden md:flex items-center space-x-8 font-semibold text-sm text-slate-600">
            <a href="#overview" className="hover:text-emerald-600 transition-colors">Ringkasan</a>
            <a href="#highlights" className="hover:text-emerald-600 transition-colors">Keunggulan</a>
            <a href="#packages" className="hover:text-emerald-600 transition-colors">Paket & Harga</a>
            <a href="#itinerary" className="hover:text-emerald-600 transition-colors">Jadwal</a>
            <a href="#faq" className="hover:text-emerald-600 transition-colors">FAQ</a>
          </div>

          <div className="flex items-center gap-3">
            {isAdminVisible && (
              <button 
                onClick={() => setIsAdminOpen(true)}
                className="inline-flex items-center justify-center px-3 py-2 rounded-xl text-xs font-bold text-slate-700 bg-amber-100 hover:bg-amber-200 transition-all border border-amber-300"
              >
                <i className="fa-solid fa-gear mr-1.5 text-amber-700"></i> Admin CMS
              </button>
            )}
            <a href="#packages" className="hidden sm:inline-flex items-center justify-center px-5 py-2.5 rounded-full text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-all shadow-md hover:shadow-emerald-600/30">
              Pesan Sekarang
            </a>
            <a href={waUrl} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition-colors">
              <i className="fa-brands fa-whatsapp text-lg"></i>
            </a>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <header className="relative bg-slate-900 text-white py-24 md:py-36 px-4 sm:px-6 lg:px-8 overflow-hidden bg-cover bg-center" style={{ backgroundImage: "linear-gradient(rgba(15, 23, 42, 0.65), rgba(15, 23, 42, 0.75)), url('https://images.unsplash.com/photo-1544644181-1484b3fdfc62?q=80&w=1920&auto=format&fit=crop')" }}>
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-emerald-300 border border-white/20 text-xs md:text-sm font-semibold uppercase tracking-wider mb-6">
            <i className="fa-solid fa-star text-amber-400"></i> Operator Petualangan #1 di Ubud
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight mb-6">
            {content.heroTitle}
          </h1>
          <p className="text-lg md:text-xl text-slate-200 max-w-3xl mx-auto mb-10 leading-relaxed font-normal">
            {content.heroSubtitle}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="#packages" className="w-full sm:w-auto px-8 py-4 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-base transition-all transform hover:-translate-y-0.5 shadow-xl shadow-emerald-900/40 flex items-center justify-center gap-3">
              <i className="fa-solid fa-bolt"></i> Lihat Semua Paket
            </a>
            <a href="#overview" className="w-full sm:w-auto px-8 py-4 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold text-base backdrop-blur-md border border-white/20 transition-all flex items-center justify-center gap-2">
              <i className="fa-solid fa-play text-xs"></i> Ringkasan Tur
            </a>
          </div>

          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 text-left border-t border-white/15 pt-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-emerald-400">
                <i className="fa-solid fa-water"></i>
              </div>
              <div>
                <div className="text-sm font-bold">Sungai Ayung</div>
                <div className="text-xs text-slate-300">Tersedia Paket Rafting</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-emerald-400">
                <i className="fa-solid fa-motorcycle"></i>
              </div>
              <div>
                <div className="text-sm font-bold">ATV 250cc</div>
                <div className="text-xs text-slate-300">Tersedia Paket Quad Bike</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-emerald-400">
                <i className="fa-solid fa-utensils"></i>
              </div>
              <div>
                <div className="text-sm font-bold">Makan Siang Prasmanan</div>
                <div className="text-xs text-slate-300">Termasuk di Semua Paket</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-emerald-400">
                <i className="fa-solid fa-car"></i>
              </div>
              <div>
                <div className="text-sm font-bold">Antar Jemput Privat</div>
                <div className="text-xs text-slate-300">Langsung dari Hotel</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* OVERVIEW SECTION */}
      <section id="overview" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <span className="text-emerald-600 font-extrabold uppercase text-xs tracking-wider">Pilihan Tur Fleksibel</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-2 mb-6 leading-tight">
              Petualangan yang Disesuaikan untuk Setiap Wisatawan
            </h2>
            <p className="text-slate-600 mb-6 leading-relaxed">
              Apakah Anda memiliki waktu terbatas dan hanya ingin satu aktivitas atau ingin menikmati petualangan seharian penuh, kami menyediakan paket fleksibel yang dirancang sesuai jadwal dan anggaran Anda.
            </p>
            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0 mt-1 font-bold">
                  <i className="fa-solid fa-check text-sm"></i>
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">Aktivitas Tunggal atau Kombinasi Seharian</h3>
                  <p className="text-slate-600 text-sm">Pesan Rafting saja, ATV saja, atau gabungkan keduanya dalam satu hari seru.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0 mt-1 font-bold">
                  <i className="fa-solid fa-check text-sm"></i>
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">Pemandu Bersertifikat & Aman</h3>
                  <p className="text-slate-600 text-sm">Perlengkapan standar internasional, instruktur profesional, dan asuransi keselamatan penuh.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0 mt-1 font-bold">
                  <i className="fa-solid fa-check text-sm"></i>
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">Fasilitas Basecamp Lengkap</h3>
                  <p className="text-slate-600 text-sm">Kamar mandi bersih, ruang ganti, handuk, loker aman, dan makan siang sudah termasuk.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-4">
              <img src="https://images.unsplash.com/photo-1530866495561-507c9faab2ed?q=80&w=800&auto=format&fit=crop" alt="Rafting Sungai Ayung" className="rounded-2xl object-cover h-64 w-full shadow-lg" />
              <div className="bg-emerald-600 text-white p-6 rounded-2xl shadow-lg">
                <div className="text-3xl font-extrabold mb-1">10+ km</div>
                <div className="text-emerald-100 text-sm font-medium">Lintasan Sungai & Relief Tebing Indah</div>
              </div>
            </div>
            <div className="space-y-4 pt-8">
              <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-lg">
                <div className="text-3xl font-extrabold mb-1">2 Jam</div>
                <div className="text-slate-300 text-sm font-medium">Trek ATV Off-road dengan Gua & Lumpur</div>
              </div>
              <img src="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=800&auto=format&fit=crop" alt="Petualangan ATV Ubud" className="rounded-2xl object-cover h-64 w-full shadow-lg" />
            </div>
          </div>
        </div>
      </section>

      {/* PRICING & PACKAGES SECTION */}
      <section id="packages" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-emerald-600 font-extrabold uppercase text-xs tracking-wider">Harga Transparan</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-2">Pilihan Paket & Harga</h2>
          <p className="text-slate-600 mt-4">Pilih satu aktivitas atau gabungkan untuk hemat lebih banyak. Semua pilihan sudah termasuk makan siang dan penjemputan!</p>
        </div>

        {/* PAKET AKTIVITAS TUNGGAL */}
        <div className="mb-12">
          <h3 className="text-xl font-extrabold text-slate-900 mb-6 flex items-center gap-2">
            <i className="fa-solid fa-bullseye text-emerald-600"></i> Paket Aktivitas Tunggal
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            {/* Rafting Saja */}
            <div className="bg-white rounded-3xl p-6 border-2 border-slate-200 shadow-sm hover:border-emerald-500 transition-all flex flex-col justify-between">
              <div>
                <div className="inline-block px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold uppercase tracking-wider mb-3">Aktivitas Air</div>
                <h4 className="text-xl font-extrabold text-slate-900">Ayung River Rafting Only</h4>
                <p className="text-slate-500 text-xs mt-1 mb-4">2 Jam petualangan arung jeram di Sungai Ayung.</p>
                <div className="mb-6">
                  <span className="text-3xl font-black text-slate-900">{formatIDR(content.prices['Ayung River Rafting Only'])}</span>
                  <span className="text-slate-500 text-xs font-semibold">/ orang</span>
                </div>
              </div>
              <button onClick={() => handleOpenBooking('Ayung River Rafting Only')} className="w-full py-3 rounded-xl bg-slate-900 hover:bg-emerald-600 text-white font-bold text-sm transition-colors text-center shadow-md">
                Pesan Rafting Saja
              </button>
            </div>

            {/* Single ATV Saja */}
            <div className="bg-white rounded-3xl p-6 border-2 border-slate-200 shadow-sm hover:border-emerald-500 transition-all flex flex-col justify-between">
              <div>
                <div className="inline-block px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold uppercase tracking-wider mb-3">Off-Road Solo</div>
                <h4 className="text-xl font-extrabold text-slate-900">Single ATV Ride Only</h4>
                <p className="text-slate-500 text-xs mt-1 mb-4">1 Orang mengendarai 1 Quad Bike di trek hutan & gua.</p>
                <div className="mb-6">
                  <span className="text-3xl font-black text-slate-900">{formatIDR(content.prices['Single ATV Ride Only'])}</span>
                  <span className="text-slate-500 text-xs font-semibold">/ orang</span>
                </div>
              </div>
              <button onClick={() => handleOpenBooking('Single ATV Ride Only')} className="w-full py-3 rounded-xl bg-slate-900 hover:bg-emerald-600 text-white font-bold text-sm transition-colors text-center shadow-md">
                Pesan Single ATV Saja
              </button>
            </div>

            {/* Tandem ATV Saja */}
            <div className="bg-white rounded-3xl p-6 border-2 border-slate-200 shadow-sm hover:border-emerald-500 transition-all flex flex-col justify-between">
              <div>
                <div className="inline-block px-3 py-1 rounded-full bg-teal-100 text-teal-800 text-xs font-bold uppercase tracking-wider mb-3">Off-Road Berdua</div>
                <h4 className="text-xl font-extrabold text-slate-900">Tandem ATV Ride Only</h4>
                <p className="text-slate-500 text-xs mt-1 mb-4">2 Orang naik bersama dalam 1 Quad Bike.</p>
                <div className="mb-6">
                  <span className="text-3xl font-black text-slate-900">{formatIDR(content.prices['Tandem ATV Ride Only'])}</span>
                  <span className="text-slate-500 text-xs font-semibold">/ 2 orang</span>
                </div>
              </div>
              <button onClick={() => handleOpenBooking('Tandem ATV Ride Only')} className="w-full py-3 rounded-xl bg-slate-900 hover:bg-emerald-600 text-white font-bold text-sm transition-colors text-center shadow-md">
                Pesan Tandem ATV Saja
              </button>
            </div>
          </div>
        </div>

        {/* PAKET KOMBO */}
        <div>
          <h3 className="text-xl font-extrabold text-slate-900 mb-6 flex items-center gap-2">
            <i className="fa-solid fa-bolt text-amber-500"></i> Paket Kombinasi (Hemat Terbaik)
          </h3>
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <div className="bg-white rounded-3xl p-8 border-2 border-slate-200 shadow-md hover:border-emerald-500 transition-all flex flex-col justify-between">
              <div>
                <div className="inline-block px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-4">Paling Populer</div>
                <h3 className="text-2xl font-extrabold text-slate-900">Rafting + Single ATV Combo</h3>
                <p className="text-slate-500 text-sm mt-1 mb-6">Masing-masing mengendarai ATV sendiri + perahu rafting.</p>
                <div className="mb-8">
                  <span className="text-4xl font-black text-slate-900">{formatIDR(content.prices['Rafting + Single ATV Combo'])}</span>
                  <span className="text-slate-500 text-sm font-semibold">/ orang</span>
                </div>
              </div>
              <button onClick={() => handleOpenBooking('Rafting + Single ATV Combo')} className="w-full py-4 rounded-xl bg-slate-900 hover:bg-emerald-600 text-white font-extrabold transition-colors text-center shadow-lg">
                Pilih Kombo Single ATV
              </button>
            </div>

            <div className="bg-white rounded-3xl p-8 border-2 border-emerald-500 shadow-xl relative flex flex-col justify-between">
              <div className="absolute -top-4 right-8 bg-gradient-to-r from-emerald-600 to-teal-500 text-white px-4 py-1 rounded-full text-xs font-black uppercase tracking-wider shadow-md">Terbaik untuk Pasangan</div>
              <div>
                <div className="inline-block px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-4">Paket Berdua</div>
                <h3 className="text-2xl font-extrabold text-slate-900">Rafting + Tandem ATV Combo</h3>
                <p className="text-slate-500 text-sm mt-1 mb-6">2 Orang berbagi 1 ATV (Driver + Penumpang) + Rafting untuk berdua.</p>
                <div className="mb-8">
                  <span className="text-4xl font-black text-emerald-600">{formatIDR(content.prices['Rafting + Tandem ATV Combo'])}</span>
                  <span className="text-slate-500 text-sm font-semibold">/ 2 orang</span>
                </div>
              </div>
              <button onClick={() => handleOpenBooking('Rafting + Tandem ATV Combo')} className="w-full py-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold transition-colors text-center shadow-lg shadow-emerald-600/30">
                Pilih Kombo Tandem ATV
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-900 text-white border-t border-slate-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <h3 className="text-2xl font-extrabold mb-1">Siap untuk Petualangan Anda di Bali?</h3>
            <p className="text-slate-400 text-sm">Amankan tanggal pilihan Anda sekarang. Konfirmasi Langsung via WhatsApp!</p>
          </div>
          <div className="flex gap-4">
            {isAdminVisible && (
              <button onClick={() => setIsAdminOpen(true)} className="px-5 py-3 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-sm border border-slate-700 transition-all">
                <i className="fa-solid fa-sliders mr-2 text-amber-400"></i> Panel Admin
              </button>
            )}
            <a href="#packages" className="px-6 py-3 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm transition-all shadow-lg">
              Pesan Online Sekarang
            </a>
          </div>
        </div>
      </footer>

      {/* MODAL BOOKING */}
      {isBookingOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 relative shadow-2xl">
            <button onClick={() => setIsBookingOpen(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600">
              <i className="fa-solid fa-xmark text-xl"></i>
            </button>
            <h3 className="text-2xl font-extrabold text-slate-900 mb-1">Formulir Pemesanan</h3>
            <p className="text-slate-500 text-xs mb-6">Paket Terpilih: <span className="font-bold text-emerald-600">{selectedPackage}</span></p>

            <form onSubmit={handleBookingSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Pilihan Paket</label>
                <select 
                  value={selectedPackage} 
                  onChange={(e) => setSelectedPackage(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  {Object.keys(content.prices).map((pkg) => (
                    <option key={pkg} value={pkg}>{pkg}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Nama Lengkap</label>
                <input 
                  type="text" required placeholder="John Doe" 
                  value={bookingForm.name} 
                  onChange={(e) => setBookingForm({...bookingForm, name: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Tanggal Tur</label>
                  <input 
                    type="date" required 
                    value={bookingForm.date} 
                    onChange={(e) => setBookingForm({...bookingForm, date: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Jumlah Peserta/Unit</label>
                  <input 
                    type="number" min="1" required 
                    value={bookingForm.qty} 
                    onChange={(e) => setBookingForm({...bookingForm, qty: parseInt(e.target.value) || 1})}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Lokasi/Hotel Penjemputan</label>
                <input 
                  type="text" required placeholder="Nama Hotel atau Area" 
                  value={bookingForm.hotel} 
                  onChange={(e) => setBookingForm({...bookingForm, hotel: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Nomor WhatsApp</label>
                <input 
                  type="tel" required placeholder="+62 812 3456 7890" 
                  value={bookingForm.phone} 
                  onChange={(e) => setBookingForm({...bookingForm, phone: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex justify-between items-center font-bold text-sm">
                <span>Estimasi Total:</span>
                <span className="text-lg text-emerald-600">{formatIDR((content.prices[selectedPackage] || 1100000) * bookingForm.qty)}</span>
              </div>

              <button type="submit" className="w-full py-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-base transition-colors shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2">
                <i className="fa-brands fa-whatsapp text-lg"></i> Konfirmasi Pesanan via WhatsApp
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL ADMIN CMS */}
      {isAdminOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 relative shadow-2xl max-h-[90vh] overflow-y-auto">
            <button onClick={() => setIsAdminOpen(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600">
              <i className="fa-solid fa-xmark text-xl"></i>
            </button>

            {!isAuthenticated ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-2xl mx-auto mb-4">
                  <i className="fa-solid fa-lock"></i>
                </div>
                <h3 className="text-2xl font-extrabold text-slate-900 mb-2">Kelola Konten Web</h3>
                <p className="text-slate-500 text-sm mb-6">Masukkan PIN Admin untuk membuka panel</p>
                <div className="max-w-xs mx-auto space-y-4">
                  <input 
                    type="password" placeholder="Masukkan PIN" 
                    value={adminPin} 
                    onChange={(e) => setAdminPin(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 text-center text-lg font-bold tracking-widest focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                  <button onClick={handleVerifyPin} className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition-colors shadow-lg">
                    Buka Panel Konten
                  </button>
                  {pinError && <p className="text-red-500 text-xs font-bold">PIN Salah! Coba lagi.</p>}
                </div>
              </div>
            ) : (
              <form onSubmit={handleSaveContent} className="space-y-5">
                <div className="border-b border-slate-100 pb-4">
                  <span className="bg-emerald-100 text-emerald-700 text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full">Next.js CMS Active</span>
                  <h3 className="text-2xl font-extrabold text-slate-900 mt-1">Pengaturan Konten Website</h3>
                </div>

                {/* Pengaturan Keamanan PIN */}
                <div className="space-y-3">
                  <h4 className="font-bold text-slate-900 text-sm border-l-4 border-amber-500 pl-2">Keamanan Panel Admin</h4>
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-600 mb-1">PIN Admin Baru</label>
                    <input 
                      type="text" 
                      value={editForm.adminPin || ''} 
                      onChange={(e) => setEditForm({...editForm, adminPin: e.target.value})}
                      placeholder="Masukkan PIN Baru (misal: 5678)"
                      className="w-full px-4 py-2.5 rounded-xl border border-amber-300 bg-amber-50/50 text-sm font-bold tracking-widest focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                    <span className="text-[11px] text-slate-400">Gunakan angka/karakter rahasia yang mudah Anda ingat.</span>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <h4 className="font-bold text-slate-900 text-sm border-l-4 border-emerald-500 pl-2">Informasi Umum</h4>
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Nomor WhatsApp Penerima</label>
                    <input 
                      type="text" value={editForm.whatsappNumber} 
                      onChange={(e) => setEditForm({...editForm, whatsappNumber: e.target.value})}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Teks Pengumuman Atas</label>
                    <input 
                      type="text" value={editForm.announcement} 
                      onChange={(e) => setEditForm({...editForm, announcement: e.target.value})}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <h4 className="font-bold text-slate-900 text-sm border-l-4 border-emerald-500 pl-2">Teks Hero Banner</h4>
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Judul Hero</label>
                    <textarea 
                      rows="2" value={editForm.heroTitle} 
                      onChange={(e) => setEditForm({...editForm, heroTitle: e.target.value})}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Subjudul Hero</label>
                    <textarea 
                      rows="3" value={editForm.heroSubtitle} 
                      onChange={(e) => setEditForm({...editForm, heroSubtitle: e.target.value})}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <h4 className="font-bold text-slate-900 text-sm border-l-4 border-emerald-500 pl-2">Pengaturan Harga (IDR)</h4>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {Object.keys(editForm.prices).map((pkg) => (
                      <div key={pkg}>
                        <label className="block text-xs font-bold text-slate-600 mb-1">{pkg}</label>
                        <input 
                          type="number" value={editForm.prices[pkg]} 
                          onChange={(e) => setEditForm({
                            ...editForm, 
                            prices: { ...editForm.prices, [pkg]: parseInt(e.target.value) || 0 }
                          })}
                          className="w-full px-4 py-2 rounded-xl border border-slate-200 text-sm"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {saveSuccess && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold rounded-xl flex items-center gap-2">
                    <i className="fa-solid fa-circle-check"></i> Perubahan berhasil disimpan!
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => setIsAdminOpen(false)} className="w-1/2 py-3 rounded-xl bg-slate-100 text-slate-700 font-bold text-sm">
                    Batal
                  </button>
                  <button type="submit" disabled={isSaving} className="w-1/2 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-lg">
                    {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* FLOATING WHATSAPP BUTTON */}
      <a href={waUrl} target="_blank" rel="noreferrer" className="fixed bottom-6 right-6 z-40 bg-emerald-500 text-white p-4 rounded-full shadow-2xl hover:bg-emerald-600 hover:scale-110 transition-all flex items-center justify-center group">
        <i className="fa-brands fa-whatsapp text-3xl"></i>
      </a>

    </div>
  );
}
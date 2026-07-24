'use client';

import React, { useState, useEffect } from 'react';

// Default content configuration (Fallback)
const DEFAULT_CONTENT = {
  adminPin: '1234', // Default Admin PIN
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
  // Web content state management
  const [content, setContent] = useState(DEFAULT_CONTENT);
  const [isAdminVisible, setIsAdminVisible] = useState(false);
  
  // Booking Modal State
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState('Rafting + Single ATV Combo');
  const [bookingForm, setBookingForm] = useState({
    name: '',
    date: '',
    qty: 1,
    hotel: '',
    phone: ''
  });

  // Admin CMS Modal State
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [adminPin, setAdminPin] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinError, setPinError] = useState(false);
  const [editForm, setEditForm] = useState(DEFAULT_CONTENT);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Load saved content from localStorage on initial load
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
        console.error('Failed to load saved data:', err);
      }
    }
  }, []);

  // Secret Admin Trigger via URL parameter (?admin=true) or Keyboard Shortcut (Ctrl+Shift+A)
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

  // Format currency to IDR
  const formatIDR = (amount) => {
    return 'IDR ' + (amount || 0).toLocaleString('id-ID');
  };

  // Open Booking Modal
  const handleOpenBooking = (packageName) => {
    if (packageName) setSelectedPackage(packageName);
    setIsBookingOpen(true);
  };

  // Submit Booking to WhatsApp
  const handleBookingSubmit = (e) => {
    e.preventDefault();
    const unitPrice = content.prices[selectedPackage] || 1100000;
    const totalPrice = (unitPrice * bookingForm.qty).toLocaleString('id-ID');

    const message = `Hello Bali Adventure! I would like to book a package:%0A%0A` +
      `*Package:* ${selectedPackage}%0A` +
      `*Name:* ${bookingForm.name}%0A` +
      `*Tour Date:* ${bookingForm.date}%0A` +
      `*Quantity:* ${bookingForm.qty}%0A` +
      `*Hotel Pickup:* ${bookingForm.hotel}%0A` +
      `*Guest WhatsApp:* ${bookingForm.phone}%0A` +
      `*Estimated Total:* IDR ${totalPrice}%0A%0A` +
      `Please confirm availability. Thank you!`;

    window.open(`https://wa.me/${content.whatsappNumber}?text=${message}`, '_blank');
    setIsBookingOpen(false);
  };

  // Verify Admin PIN Access
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

  // Save Content Changes Permanently (localStorage)
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
      console.error('Failed to save changes:', error);
      setIsSaving(false);
    }
  };

  const waUrl = `https://wa.me/${content.whatsappNumber}?text=Hello%20Bali%20Adventure!%20I%20have%20an%20inquiry%20regarding%20your%20tour%20packages.`;

  return (
    <div className="bg-slate-50 text-slate-800 antialiased font-sans selection:bg-emerald-500 selection:text-white min-h-screen">
      
      {/* TOP ANNOUNCEMENT BANNER */}
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
            <a href="#overview" className="hover:text-emerald-600 transition-colors">Overview</a>
            <a href="#highlights" className="hover:text-emerald-600 transition-colors">Highlights</a>
            <a href="#packages" className="hover:text-emerald-600 transition-colors">Packages & Pricing</a>
            <a href="#itinerary" className="hover:text-emerald-600 transition-colors">Itinerary</a>
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
              Book Now
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
            <i className="fa-solid fa-star text-amber-400"></i> #1 Outdoor Adventure Operator in Ubud
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight mb-6">
            {content.heroTitle}
          </h1>
          <p className="text-lg md:text-xl text-slate-200 max-w-3xl mx-auto mb-10 leading-relaxed font-normal">
            {content.heroSubtitle}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="#packages" className="w-full sm:w-auto px-8 py-4 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-base transition-all transform hover:-translate-y-0.5 shadow-xl shadow-emerald-900/40 flex items-center justify-center gap-3">
              <i className="fa-solid fa-bolt"></i> View All Packages
            </a>
            <a href="#overview" className="w-full sm:w-auto px-8 py-4 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold text-base backdrop-blur-md border border-white/20 transition-all flex items-center justify-center gap-2">
              <i className="fa-solid fa-play text-xs"></i> Tour Overview
            </a>
          </div>

          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 text-left border-t border-white/15 pt-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-emerald-400">
                <i className="fa-solid fa-water"></i>
              </div>
              <div>
                <div className="text-sm font-bold">Ayung River</div>
                <div className="text-xs text-slate-300">Rafting Packages Available</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-emerald-400">
                <i className="fa-solid fa-motorcycle"></i>
              </div>
              <div>
                <div className="text-sm font-bold">250cc ATV Quad Bike</div>
                <div className="text-xs text-slate-300">Off-Road Tracks</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-emerald-400">
                <i className="fa-solid fa-utensils"></i>
              </div>
              <div>
                <div className="text-sm font-bold">Buffet Lunch</div>
                <div className="text-xs text-slate-300">Included in All Packages</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-emerald-400">
                <i className="fa-solid fa-car"></i>
              </div>
              <div>
                <div className="text-sm font-bold">Private Transfer</div>
                <div className="text-xs text-slate-300">Direct Hotel Pickup</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* OVERVIEW SECTION */}
      <section id="overview" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <span className="text-emerald-600 font-extrabold uppercase text-xs tracking-wider">Flexible Tour Options</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-2 mb-6 leading-tight">
              Tailored Adventures for Every Traveler
            </h2>
            <p className="text-slate-600 mb-6 leading-relaxed">
              Whether you have limited time and want a single activity or wish to experience a full day of excitement, we offer flexible packages designed to suit your schedule and budget.
            </p>
            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0 mt-1 font-bold">
                  <i className="fa-solid fa-check text-sm"></i>
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">Single Activity or Full-Day Combo</h3>
                  <p className="text-slate-600 text-sm">Book Rafting only, ATV only, or combine both for an action-packed day.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0 mt-1 font-bold">
                  <i className="fa-solid fa-check text-sm"></i>
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">Certified & Safety-First Guides</h3>
                  <p className="text-slate-600 text-sm">International standard safety gear, professional instructors, and full insurance coverage.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0 mt-1 font-bold">
                  <i className="fa-solid fa-check text-sm"></i>
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">Complete Basecamp Facilities</h3>
                  <p className="text-slate-600 text-sm">Clean showers, changing rooms, towels, secure lockers, and buffet lunch included.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-4">
              <img src="https://images.unsplash.com/photo-1530866495561-507c9faab2ed?q=80&w=800&auto=format&fit=crop" alt="Ayung River Rafting" className="rounded-2xl object-cover h-64 w-full shadow-lg" />
              <div className="bg-emerald-600 text-white p-6 rounded-2xl shadow-lg">
                <div className="text-3xl font-extrabold mb-1">10+ km</div>
                <div className="text-emerald-100 text-sm font-medium">River Trail & Scenic Cliff Carvings</div>
              </div>
            </div>
            <div className="space-y-4 pt-8">
              <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-lg">
                <div className="text-3xl font-extrabold mb-1">2 Hours</div>
                <div className="text-slate-300 text-sm font-medium">Off-Road ATV Track with Caves & Mud</div>
              </div>
              <img src="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=800&auto=format&fit=crop" alt="Ubud ATV Quad Biking" className="rounded-2xl object-cover h-64 w-full shadow-lg" />
            </div>
          </div>
        </div>
      </section>

      {/* PRICING & PACKAGES SECTION */}
      <section id="packages" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-emerald-600 font-extrabold uppercase text-xs tracking-wider">Transparent Pricing</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-2">Packages & Pricing Options</h2>
          <p className="text-slate-600 mt-4">Choose a single activity or combine them to save more. All options include lunch and hotel pickup!</p>
        </div>

        {/* SINGLE ACTIVITY PACKAGES */}
        <div className="mb-12">
          <h3 className="text-xl font-extrabold text-slate-900 mb-6 flex items-center gap-2">
            <i className="fa-solid fa-bullseye text-emerald-600"></i> Single Activity Packages
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            {/* Rafting Only */}
            <div className="bg-white rounded-3xl p-6 border-2 border-slate-200 shadow-sm hover:border-emerald-500 transition-all flex flex-col justify-between">
              <div>
                <div className="inline-block px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold uppercase tracking-wider mb-3">Water Activity</div>
                <h4 className="text-xl font-extrabold text-slate-900">Ayung River Rafting Only</h4>
                <p className="text-slate-500 text-xs mt-1 mb-4">2 Hours white water rafting adventure down the Ayung River.</p>
                <div className="mb-6">
                  <span className="text-3xl font-black text-slate-900">{formatIDR(content.prices['Ayung River Rafting Only'])}</span>
                  <span className="text-slate-500 text-xs font-semibold"> / person</span>
                </div>
              </div>
              <button onClick={() => handleOpenBooking('Ayung River Rafting Only')} className="w-full py-3 rounded-xl bg-slate-900 hover:bg-emerald-600 text-white font-bold text-sm transition-colors text-center shadow-md">
                Book Rafting Only
              </button>
            </div>

            {/* Single ATV Only */}
            <div className="bg-white rounded-3xl p-6 border-2 border-slate-200 shadow-sm hover:border-emerald-500 transition-all flex flex-col justify-between">
              <div>
                <div className="inline-block px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold uppercase tracking-wider mb-3">Solo Off-Road</div>
                <h4 className="text-xl font-extrabold text-slate-900">Single ATV Ride Only</h4>
                <p className="text-slate-500 text-xs mt-1 mb-4">1 Rider driving 1 Quad Bike through jungle tracks & caves.</p>
                <div className="mb-6">
                  <span className="text-3xl font-black text-slate-900">{formatIDR(content.prices['Single ATV Ride Only'])}</span>
                  <span className="text-slate-500 text-xs font-semibold"> / person</span>
                </div>
              </div>
              <button onClick={() => handleOpenBooking('Single ATV Ride Only')} className="w-full py-3 rounded-xl bg-slate-900 hover:bg-emerald-600 text-white font-bold text-sm transition-colors text-center shadow-md">
                Book Single ATV Only
              </button>
            </div>

            {/* Tandem ATV Only */}
            <div className="bg-white rounded-3xl p-6 border-2 border-slate-200 shadow-sm hover:border-emerald-500 transition-all flex flex-col justify-between">
              <div>
                <div className="inline-block px-3 py-1 rounded-full bg-teal-100 text-teal-800 text-xs font-bold uppercase tracking-wider mb-3">Tandem Off-Road</div>
                <h4 className="text-xl font-extrabold text-slate-900">Tandem ATV Ride Only</h4>
                <p className="text-slate-500 text-xs mt-1 mb-4">2 Guests riding together on 1 Quad Bike.</p>
                <div className="mb-6">
                  <span className="text-3xl font-black text-slate-900">{formatIDR(content.prices['Tandem ATV Ride Only'])}</span>
                  <span className="text-slate-500 text-xs font-semibold"> / 2 persons</span>
                </div>
              </div>
              <button onClick={() => handleOpenBooking('Tandem ATV Ride Only')} className="w-full py-3 rounded-xl bg-slate-900 hover:bg-emerald-600 text-white font-bold text-sm transition-colors text-center shadow-md">
                Book Tandem ATV Only
              </button>
            </div>
          </div>
        </div>

        {/* COMBO PACKAGES */}
        <div>
          <h3 className="text-xl font-extrabold text-slate-900 mb-6 flex items-center gap-2">
            <i className="fa-solid fa-bolt text-amber-500"></i> Combo Packages (Best Savings)
          </h3>
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <div className="bg-white rounded-3xl p-8 border-2 border-slate-200 shadow-md hover:border-emerald-500 transition-all flex flex-col justify-between">
              <div>
                <div className="inline-block px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-4">Most Popular</div>
                <h3 className="text-2xl font-extrabold text-slate-900">Rafting + Single ATV Combo</h3>
                <p className="text-slate-500 text-sm mt-1 mb-6">Each person drives their own ATV + shared rafting boat.</p>
                <div className="mb-8">
                  <span className="text-4xl font-black text-slate-900">{formatIDR(content.prices['Rafting + Single ATV Combo'])}</span>
                  <span className="text-slate-500 text-sm font-semibold"> / person</span>
                </div>
              </div>
              <button onClick={() => handleOpenBooking('Rafting + Single ATV Combo')} className="w-full py-4 rounded-xl bg-slate-900 hover:bg-emerald-600 text-white font-extrabold transition-colors text-center shadow-lg">
                Choose Single ATV Combo
              </button>
            </div>

            <div className="bg-white rounded-3xl p-8 border-2 border-emerald-500 shadow-xl relative flex flex-col justify-between">
              <div className="absolute -top-4 right-8 bg-gradient-to-r from-emerald-600 to-teal-500 text-white px-4 py-1 rounded-full text-xs font-black uppercase tracking-wider shadow-md">Best for Couples</div>
              <div>
                <div className="inline-block px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-4">Pair Package</div>
                <h3 className="text-2xl font-extrabold text-slate-900">Rafting + Tandem ATV Combo</h3>
                <p className="text-slate-500 text-sm mt-1 mb-6">2 Guests share 1 ATV (Driver + Passenger) + Rafting for both.</p>
                <div className="mb-8">
                  <span className="text-4xl font-black text-emerald-600">{formatIDR(content.prices['Rafting + Tandem ATV Combo'])}</span>
                  <span className="text-slate-500 text-sm font-semibold"> / 2 persons</span>
                </div>
              </div>
              <button onClick={() => handleOpenBooking('Rafting + Tandem ATV Combo')} className="w-full py-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold transition-colors text-center shadow-lg shadow-emerald-600/30">
                Choose Tandem ATV Combo
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-900 text-white border-t border-slate-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <h3 className="text-2xl font-extrabold mb-1">Ready for Your Bali Adventure?</h3>
            <p className="text-slate-400 text-sm">Secure your preferred date now. Instant confirmation via WhatsApp!</p>
          </div>
          <div className="flex gap-4">
            {isAdminVisible && (
              <button onClick={() => setIsAdminOpen(true)} className="px-5 py-3 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-sm border border-slate-700 transition-all">
                <i className="fa-solid fa-sliders mr-2 text-amber-400"></i> Admin Panel
              </button>
            )}
            <a href="#packages" className="px-6 py-3 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm transition-all shadow-lg">
              Book Online Now
            </a>
          </div>
        </div>
      </footer>

      {/* BOOKING MODAL */}
      {isBookingOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 relative shadow-2xl">
            <button onClick={() => setIsBookingOpen(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600">
              <i className="fa-solid fa-xmark text-xl"></i>
            </button>
            <h3 className="text-2xl font-extrabold text-slate-900 mb-1">Booking Form</h3>
            <p className="text-slate-500 text-xs mb-6">Selected Package: <span className="font-bold text-emerald-600">{selectedPackage}</span></p>

            <form onSubmit={handleBookingSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Package Choice</label>
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
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Full Name</label>
                <input 
                  type="text" required placeholder="John Doe" 
                  value={bookingForm.name} 
                  onChange={(e) => setBookingForm({...bookingForm, name: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Tour Date</label>
                  <input 
                    type="date" required 
                    value={bookingForm.date} 
                    onChange={(e) => setBookingForm({...bookingForm, date: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Guests / Units Qty</label>
                  <input 
                    type="number" min="1" required 
                    value={bookingForm.qty} 
                    onChange={(e) => setBookingForm({...bookingForm, qty: parseInt(e.target.value) || 1})}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Pickup Hotel / Location</label>
                <input 
                  type="text" required placeholder="Hotel Name or Pickup Area" 
                  value={bookingForm.hotel} 
                  onChange={(e) => setBookingForm({...bookingForm, hotel: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">WhatsApp Number</label>
                <input 
                  type="tel" required placeholder="+62 812 3456 7890" 
                  value={bookingForm.phone} 
                  onChange={(e) => setBookingForm({...bookingForm, phone: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex justify-between items-center font-bold text-sm">
                <span>Estimated Total:</span>
                <span className="text-lg text-emerald-600">{formatIDR((content.prices[selectedPackage] || 1100000) * bookingForm.qty)}</span>
              </div>

              <button type="submit" className="w-full py-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-base transition-colors shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2">
                <i className="fa-brands fa-whatsapp text-lg"></i> Confirm Booking via WhatsApp
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ADMIN CMS MODAL */}
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
                <h3 className="text-2xl font-extrabold text-slate-900 mb-2">Web Content Management</h3>
                <p className="text-slate-500 text-sm mb-6">Enter Admin PIN to unlock the panel</p>
                <div className="max-w-xs mx-auto space-y-4">
                  <input 
                    type="password" placeholder="Enter PIN" 
                    value={adminPin} 
                    onChange={(e) => setAdminPin(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 text-center text-lg font-bold tracking-widest focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                  <button onClick={handleVerifyPin} className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition-colors shadow-lg">
                    Unlock Content Panel
                  </button>
                  {pinError && <p className="text-red-500 text-xs font-bold">Incorrect PIN! Please try again.</p>}
                </div>
              </div>
            ) : (
              <form onSubmit={handleSaveContent} className="space-y-5">
                <div className="border-b border-slate-100 pb-4">
                  <span className="bg-emerald-100 text-emerald-700 text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full">Next.js CMS Active</span>
                  <h3 className="text-2xl font-extrabold text-slate-900 mt-1">Website Content Settings</h3>
                </div>

                {/* PIN Security Settings */}
                <div className="space-y-3">
                  <h4 className="font-bold text-slate-900 text-sm border-l-4 border-amber-500 pl-2">Admin Panel Security</h4>
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-600 mb-1">New Admin PIN</label>
                    <input 
                      type="text" 
                      value={editForm.adminPin || ''} 
                      onChange={(e) => setEditForm({...editForm, adminPin: e.target.value})}
                      placeholder="Enter new PIN (e.g., 5678)"
                      className="w-full px-4 py-2.5 rounded-xl border border-amber-300 bg-amber-50/50 text-sm font-bold tracking-widest focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                    <span className="text-[11px] text-slate-400">Set a secret code/PIN that you can easily remember.</span>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <h4 className="font-bold text-slate-900 text-sm border-l-4 border-emerald-500 pl-2">General Information</h4>
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Recipient WhatsApp Number</label>
                    <input 
                      type="text" value={editForm.whatsappNumber} 
                      onChange={(e) => setEditForm({...editForm, whatsappNumber: e.target.value})}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Top Announcement Banner Text</label>
                    <input 
                      type="text" value={editForm.announcement} 
                      onChange={(e) => setEditForm({...editForm, announcement: e.target.value})}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <h4 className="font-bold text-slate-900 text-sm border-l-4 border-emerald-500 pl-2">Hero Banner Text</h4>
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Hero Title</label>
                    <textarea 
                      rows="2" value={editForm.heroTitle} 
                      onChange={(e) => setEditForm({...editForm, heroTitle: e.target.value})}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Hero Subtitle</label>
                    <textarea 
                      rows="3" value={editForm.heroSubtitle} 
                      onChange={(e) => setEditForm({...editForm, heroSubtitle: e.target.value})}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <h4 className="font-bold text-slate-900 text-sm border-l-4 border-emerald-500 pl-2">Pricing Settings (IDR)</h4>
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
                    <i className="fa-solid fa-circle-check"></i> Changes saved successfully!
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => setIsAdminOpen(false)} className="w-1/2 py-3 rounded-xl bg-slate-100 text-slate-700 font-bold text-sm">
                    Cancel
                  </button>
                  <button type="submit" disabled={isSaving} className="w-1/2 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-lg">
                    {isSaving ? 'Saving...' : 'Save Changes'}
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
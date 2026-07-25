'use client';

import React, { useState, useEffect } from 'react';
import DEFAULT_CONTENT from './config/public-content';

export default function App() {
  // Web content state management
  const [content, setContent] = useState(DEFAULT_CONTENT);
  const [isAdminVisible, setIsAdminVisible] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);
  
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

  const sanitizeContentData = (data) => {
    const safeData = {
      ...DEFAULT_CONTENT,
      ...data,
      prices: {
        ...DEFAULT_CONTENT.prices,
        ...(data?.prices || {})
      }
    };

    if (safeData.adminPin) {
      delete safeData.adminPin;
    }

    return safeData;
  };

  // Load saved content from shared server storage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      fetch('/api/content')
        .then((res) => res.ok ? res.json() : null)
        .then((data) => {
          if (data) {
            const mergedContent = sanitizeContentData(data);
            setContent(mergedContent);
            setEditForm(mergedContent);
          }
        })
        .catch((err) => {
          console.error('Failed to load shared content:', err);
        });
    }
  }, []);

  // Secret Admin Trigger via URL parameter (?admin=true or ?secret=1234) or Keyboard Shortcut (Ctrl+Shift+A)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('admin') === 'true' || params.get('secret') === '1234') {
        setIsAdminVisible(true);
        setIsAdminOpen(true);
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

  // Smooth scroll helper function
  const scrollToSection = (e, id) => {
    e.preventDefault();
    if (typeof window !== 'undefined') {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

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
  const handleVerifyPin = async () => {
    try {
      const response = await fetch('/api/verify-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: adminPin })
      });

      if (response.ok) {
        setIsAuthenticated(true);
        setPinError(false);
        setEditForm(JSON.parse(JSON.stringify(content)));
        setAdminPin('');
      } else {
        setIsAuthenticated(false);
        setPinError(true);
      }
    } catch (error) {
      console.error('Admin PIN verification failed:', error);
      setIsAuthenticated(false);
      setPinError(true);
    }
  };

  // Save Content Changes Permanently to shared server storage
  const handleSaveContent = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const savePayload = {
        whatsappNumber: editForm.whatsappNumber,
        announcement: editForm.announcement,
        heroTitle: editForm.heroTitle,
        heroSubtitle: editForm.heroSubtitle,
        prices: editForm.prices
      };

      const response = await fetch('/api/content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(savePayload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Save shared content error:', response.status, errorText);
        throw new Error(`Failed to save shared content: ${errorText}`);
      }

      const updatedContent = await response.json();
      setContent(sanitizeContentData(updatedContent));
      setEditForm(sanitizeContentData(updatedContent));
      setIsSaving(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to save changes:', error);
      setIsSaving(false);
    }
  };

  const waUrl = `https://wa.me/${content.whatsappNumber}?text=Hello%20Bali%20Adventure!%20I%20have%20an%20inquiry%20regarding%20your%20tour%20packages.`;

  const faqItems = [
    {
      question: 'Can I book Rafting or ATV Biking as a single activity?',
      answer: 'Yes! You can choose to book only Ayung River Rafting or only ATV Quad Biking. Both standalone options still include private hotel transfer, equipment, guides, shower facilities, and buffet lunch.'
    },
    {
      question: 'Is this tour safe for beginners or children?',
      answer: 'Yes! Both Ayung River Rafting (Grade II-III) and the ATV Quad Bike track are beginner-friendly. Professional instructors lead each activity, and complete safety equipment is provided. Children aged 6 and above can participate (tandem ATV riding with adults).'
    },
    {
      question: 'Which hotel areas are covered for free pickup?',
      answer: 'We offer private air-conditioned hotel transport from Ubud, Kuta, Legian, Seminyak, Canggu, Sanur, Jimbaran, Nusa Dua, and Denpasar.'
    },
    {
      question: 'What is the difference between Single and Tandem ATV?',
      answer: (
        <span>
          <strong>Single ATV:</strong> 1 Quad bike driven by 1 person.<br />
          <strong>Tandem ATV:</strong> 1 Quad bike shared by 2 persons (1 rider + 1 passenger). Perfect for couples or parents riding with kids!
        </span>
      )
    },
    {
      question: 'How do I pay for my reservation?',
      answer: 'You can pay in cash (IDR or USD) directly to our driver on the day of the tour, or complete online payment via WhatsApp booking confirmation. No upfront cancellation penalty!'
    }
  ];

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
          <a href="#" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); setIsMobileMenuOpen(false); }} className="flex items-center gap-3 cursor-pointer">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-emerald-500/20">
              <i className="fa-solid fa-compass"></i>
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight text-slate-900 block leading-none">BALI ADVENTURE</span>
              <span className="text-[10px] uppercase font-bold text-emerald-600 tracking-widest">Rafting & ATV Tour</span>
            </div>
          </a>

          <div className="hidden md:flex items-center space-x-8 font-semibold text-sm text-slate-600">
            <a href="#overview" onClick={(e) => scrollToSection(e, 'overview')} className="hover:text-emerald-600 transition-colors cursor-pointer">Overview</a>
            <a href="#highlights" onClick={(e) => scrollToSection(e, 'highlights')} className="hover:text-emerald-600 transition-colors cursor-pointer">Highlights</a>
            <a href="#packages" onClick={(e) => scrollToSection(e, 'packages')} className="hover:text-emerald-600 transition-colors cursor-pointer">Packages & Pricing</a>
            <a href="#itinerary" onClick={(e) => scrollToSection(e, 'itinerary')} className="hover:text-emerald-600 transition-colors cursor-pointer">Itinerary</a>
            <a href="#faq" onClick={(e) => scrollToSection(e, 'faq')} className="hover:text-emerald-600 transition-colors cursor-pointer">FAQ</a>
          </div>

          <div className="flex items-center gap-3">
            {isAdminVisible && (
              <button 
                onClick={() => setIsAdminOpen(true)}
                className="hidden sm:inline-flex items-center justify-center px-3 py-2 rounded-xl text-xs font-bold text-slate-700 bg-amber-100 hover:bg-amber-200 transition-all border border-amber-300 cursor-pointer"
              >
                <i className="fa-solid fa-gear mr-1.5 text-amber-700"></i> Admin CMS
              </button>
            )}
            <a href="#packages" onClick={(e) => scrollToSection(e, 'packages')} className="hidden sm:inline-flex items-center justify-center px-5 py-2.5 rounded-full text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-all shadow-md hover:shadow-emerald-600/30 cursor-pointer">
              Book Now
            </a>
            <a href={waUrl} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition-colors cursor-pointer">
              <i className="fa-brands fa-whatsapp text-lg"></i>
            </a>
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm"
              aria-label="Toggle navigation menu"
            >
              <i className={`fa-solid ${isMobileMenuOpen ? 'fa-xmark' : 'fa-bars'} text-lg`}></i>
            </button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-slate-100 bg-white/95 backdrop-blur-md px-4 py-4 shadow-lg">
            <div className="max-w-7xl mx-auto flex flex-col gap-3 text-sm font-semibold text-slate-700">
              <a href="#overview" onClick={(e) => { scrollToSection(e, 'overview'); setIsMobileMenuOpen(false); }} className="rounded-xl px-3 py-2 hover:bg-emerald-50 hover:text-emerald-600 transition-colors">Overview</a>
              <a href="#highlights" onClick={(e) => { scrollToSection(e, 'highlights'); setIsMobileMenuOpen(false); }} className="rounded-xl px-3 py-2 hover:bg-emerald-50 hover:text-emerald-600 transition-colors">Highlights</a>
              <a href="#packages" onClick={(e) => { scrollToSection(e, 'packages'); setIsMobileMenuOpen(false); }} className="rounded-xl px-3 py-2 hover:bg-emerald-50 hover:text-emerald-600 transition-colors">Packages & Pricing</a>
              <a href="#itinerary" onClick={(e) => { scrollToSection(e, 'itinerary'); setIsMobileMenuOpen(false); }} className="rounded-xl px-3 py-2 hover:bg-emerald-50 hover:text-emerald-600 transition-colors">Itinerary</a>
              <a href="#faq" onClick={(e) => { scrollToSection(e, 'faq'); setIsMobileMenuOpen(false); }} className="rounded-xl px-3 py-2 hover:bg-emerald-50 hover:text-emerald-600 transition-colors">FAQ</a>
              {isAdminVisible && (
                <button
                  onClick={() => { setIsAdminOpen(true); setIsMobileMenuOpen(false); }}
                  className="rounded-xl px-3 py-2 text-left text-amber-700 bg-amber-50 border border-amber-200"
                >
                  Admin CMS
                </button>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* HERO SECTION */}
      <header className="hero-header relative isolate overflow-hidden bg-slate-900 text-white py-24 md:py-36 px-4 sm:px-6 lg:px-8">
        <div className="hero-slideshow absolute inset-0" aria-hidden="true">
          <div className="hero-slide hero-slide-1" />
          <div className="hero-slide hero-slide-3" />
        </div>
        <div className="absolute inset-0 bg-slate-900/70" />
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
            <a href="#packages" onClick={(e) => scrollToSection(e, 'packages')} className="w-full sm:w-auto px-8 py-4 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-base transition-all transform hover:-translate-y-0.5 shadow-xl shadow-emerald-900/40 flex items-center justify-center gap-3 cursor-pointer">
              <i className="fa-solid fa-bolt"></i> View All Packages
            </a>
            <a href="#overview" onClick={(e) => scrollToSection(e, 'overview')} className="w-full sm:w-auto px-8 py-4 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold text-base backdrop-blur-md border border-white/20 transition-all flex items-center justify-center gap-2 cursor-pointer">
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
              <img src="../images/rafting.jpg" alt="Ayung River Rafting" className="rounded-2xl object-cover h-64 w-full shadow-lg" />
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
              <img src="../images/atv.jpg" alt="Ubud ATV Quad Biking" className="rounded-2xl object-cover h-64 w-full shadow-lg" />
            </div>
          </div>
        </div>
      </section>

      {/* HIGHLIGHTS SECTION */}
      <section id="highlights" className="py-20 bg-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-emerald-600 font-extrabold uppercase text-xs tracking-wider">What You Will Experience</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-2">Highlights of Your Adventure</h2>
            <p className="text-slate-600 mt-4">Get ready for non-stop action across Bali's most beautiful natural landscapes.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200/80 hover:shadow-xl transition-all group">
              <div className="w-14 h-14 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center text-2xl font-bold mb-6 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <i className="fa-solid fa-water-waves"></i>
              </div>
              <h3 className="text-xl font-extrabold text-slate-900 mb-3">Ayung River White Water Rafting</h3>
              <p className="text-slate-600 text-sm leading-relaxed mb-4">
                Navigate 10 km of thrilling rapids surrounded by rainforests, natural waterfalls, and historic Ramayana stone reliefs hand-carved along the river cliffs.
              </p>
              <ul className="text-xs text-slate-500 space-y-2">
                <li className="flex items-center gap-2"><i className="fa-solid fa-check text-emerald-500"></i> Professional River Guide included</li>
                <li className="flex items-center gap-2"><i className="fa-solid fa-check text-emerald-500"></i> Life jackets & helmets provided</li>
              </ul>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200/80 hover:shadow-xl transition-all group">
              <div className="w-14 h-14 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center text-2xl font-bold mb-6 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <i className="fa-solid fa-hill-rockslide"></i>
              </div>
              <h3 className="text-xl font-extrabold text-slate-900 mb-3">Jungle & Muddy Quad Bike ATV</h3>
              <p className="text-slate-600 text-sm leading-relaxed mb-4">
                Ride powerful 250cc semi-automatic quad bikes across dense bamboo forests, river beds, rice paddies, mud tracks, and dark natural cave tunnels.
              </p>
              <ul className="text-xs text-slate-500 space-y-2">
                <li className="flex items-center gap-2"><i className="fa-solid fa-check text-emerald-500"></i> Choice of Solo or Tandem ride</li>
                <li className="flex items-center gap-2"><i className="fa-solid fa-check text-emerald-500"></i> Full safety briefing & practice loop</li>
              </ul>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200/80 hover:shadow-xl transition-all group">
              <div className="w-14 h-14 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center text-2xl font-bold mb-6 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <i className="fa-solid fa-utensils"></i>
              </div>
              <h3 className="text-xl font-extrabold text-slate-900 mb-3">Authentic Balinese Buffet Lunch</h3>
              <p className="text-slate-600 text-sm leading-relaxed mb-4">
                Refuel your energy after the activities with an all-you-can-eat buffet lunch served at our scenic open-air restaurant overlooking green rice field valleys.
              </p>
              <ul className="text-xs text-slate-500 space-y-2">
                <li className="flex items-center gap-2"><i className="fa-solid fa-check text-emerald-500"></i> Fresh local food & mineral water</li>
                <li className="flex items-center gap-2"><i className="fa-solid fa-check text-emerald-500"></i> Vegetarian options available</li>
              </ul>
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
              <button onClick={() => handleOpenBooking('Ayung River Rafting Only')} className="w-full py-3 rounded-xl bg-slate-900 hover:bg-emerald-600 text-white font-bold text-sm transition-colors text-center shadow-md cursor-pointer">
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
              <button onClick={() => handleOpenBooking('Single ATV Ride Only')} className="w-full py-3 rounded-xl bg-slate-900 hover:bg-emerald-600 text-white font-bold text-sm transition-colors text-center shadow-md cursor-pointer">
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
              <button onClick={() => handleOpenBooking('Tandem ATV Ride Only')} className="w-full py-3 rounded-xl bg-slate-900 hover:bg-emerald-600 text-white font-bold text-sm transition-colors text-center shadow-md cursor-pointer">
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
              <button onClick={() => handleOpenBooking('Rafting + Single ATV Combo')} className="w-full py-4 rounded-xl bg-slate-900 hover:bg-emerald-600 text-white font-extrabold transition-colors text-center shadow-lg cursor-pointer">
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
              <button onClick={() => handleOpenBooking('Rafting + Tandem ATV Combo')} className="w-full py-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold transition-colors text-center shadow-lg shadow-emerald-600/30 cursor-pointer">
                Choose Tandem ATV Combo
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ITINERARY & INCLUSIONS SECTION */}
      <section id="itinerary" className="py-20 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Tour Itinerary Timeline */}
            <div>
              <span className="text-emerald-400 font-extrabold uppercase text-xs tracking-wider">Daily Schedule</span>
              <h2 className="text-3xl font-extrabold mt-2 mb-8">Tour Itinerary Timeline</h2>

              <div className="space-y-6 relative border-l-2 border-slate-700 ml-4 pl-6">
                <div className="relative">
                  <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-emerald-500 ring-4 ring-slate-900"></div>
                  <span className="text-xs font-bold text-emerald-400">08:00 AM - 08:30 AM</span>
                  <h3 className="text-lg font-bold text-white mt-1">Hotel Pickup</h3>
                  <p className="text-slate-400 text-sm mt-1">Private driver picks you up from your hotel in an air-conditioned vehicle (Kuta, Seminyak, Canggu, Ubud, Sanur, Nusa Dua).</p>
                </div>
                <div className="relative">
                  <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-emerald-500 ring-4 ring-slate-900"></div>
                  <span className="text-xs font-bold text-emerald-400">09:30 AM</span>
                  <h3 className="text-lg font-bold text-white mt-1">Morning Activity (Rafting / ATV)</h3>
                  <p className="text-slate-400 text-sm mt-1">Welcome drink on arrival, gear setup, safety briefing, and start your morning activity.</p>
                </div>
                <div className="relative">
                  <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-emerald-500 ring-4 ring-slate-900"></div>
                  <span className="text-xs font-bold text-emerald-400">12:15 PM</span>
                  <h3 className="text-lg font-bold text-white mt-1">Shower & Indonesian Buffet Lunch</h3>
                  <p className="text-slate-400 text-sm mt-1">Clean up using shower facilities, and enjoy a delicious fresh Indonesian buffet lunch.</p>
                </div>
                <div className="relative">
                  <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-emerald-500 ring-4 ring-slate-900"></div>
                  <span className="text-xs font-bold text-emerald-400">01:30 PM</span>
                  <h3 className="text-lg font-bold text-white mt-1">Afternoon Activity (For Combo Guests)</h3>
                  <p className="text-slate-400 text-sm mt-1">Transfer to the ATV base camp or rafting point to complete your second adventure.</p>
                </div>
                <div className="relative">
                  <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-emerald-500 ring-4 ring-slate-900"></div>
                  <span className="text-xs font-bold text-emerald-400">04:00 PM - 05:00 PM</span>
                  <h3 className="text-lg font-bold text-white mt-1">Return Transfer to Hotel</h3>
                  <p className="text-slate-400 text-sm mt-1">Shower, change clothes, and relax as our private driver safely takes you back to your hotel.</p>
                </div>
              </div>
            </div>

            {/* Inclusions & What to Bring */}
            <div className="space-y-8">
              <div className="bg-slate-800/80 p-8 rounded-2xl border border-slate-700">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-3 text-emerald-400">
                  <i className="fa-solid fa-square-check"></i> What's Included in Package
                </h3>
                <div className="grid sm:grid-cols-2 gap-3 text-sm text-slate-300">
                  <div className="flex items-center gap-2"><i className="fa-solid fa-check text-emerald-400"></i> Private AC Hotel Transfer</div>
                  <div className="flex items-center gap-2"><i className="fa-solid fa-check text-emerald-400"></i> English Speaking Driver</div>
                  <div className="flex items-center gap-2"><i className="fa-solid fa-check text-emerald-400"></i> Rafting / ATV Activity</div>
                  <div className="flex items-center gap-2"><i className="fa-solid fa-check text-emerald-400"></i> Professional Instructors</div>
                  <div className="flex items-center gap-2"><i className="fa-solid fa-check text-emerald-400"></i> Safety Equipment & Boots</div>
                  <div className="flex items-center gap-2"><i className="fa-solid fa-check text-emerald-400"></i> Towels, Lockers & Showers</div>
                  <div className="flex items-center gap-2"><i className="fa-solid fa-check text-emerald-400"></i> Buffet Lunch & Water</div>
                  <div className="flex items-center gap-2"><i className="fa-solid fa-check text-emerald-400"></i> Full Emergency Insurance</div>
                </div>
              </div>

              <div className="bg-slate-800/80 p-8 rounded-2xl border border-slate-700">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-3 text-amber-400">
                  <i className="fa-solid fa-suitcase"></i> What You Should Bring
                </h3>
                <div className="grid sm:grid-cols-2 gap-3 text-sm text-slate-300">
                  <div className="flex items-center gap-2"><i className="fa-solid fa-angle-right text-amber-400"></i> Change of Dry Clothes</div>
                  <div className="flex items-center gap-2"><i className="fa-solid fa-angle-right text-amber-400"></i> Sunscreen & Sunglasses</div>
                  <div className="flex items-center gap-2"><i className="fa-solid fa-angle-right text-amber-400"></i> Waterproof Camera / GoPro</div>
                  <div className="flex items-center gap-2"><i className="fa-solid fa-angle-right text-amber-400"></i> Sandals or Water Shoes</div>
                  <div className="flex items-center gap-2"><i className="fa-solid fa-angle-right text-amber-400"></i> Extra Cash for Drinks/Photos</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS SECTION */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-emerald-600 font-extrabold uppercase text-xs tracking-wider">Guest Reviews</span>
            <h2 className="text-3xl font-extrabold text-slate-900 mt-2">What Adventure Seekers Say</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <div className="flex text-amber-400 mb-3 text-sm">
                <i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i>
              </div>
              <p className="text-slate-600 text-sm leading-relaxed mb-6 italic">
                "Unbelievable experience! The rafting on Ayung River was breathtaking with hidden waterfalls, and the ATV quad bike ride went through mud and a huge gorilla cave. Best day in Bali!"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-700">
                  JD
                </div>
                <div>
                  <div className="font-bold text-sm text-slate-900">John & Emma D.</div>
                  <div className="text-xs text-slate-500">Australia</div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <div className="flex text-amber-400 mb-3 text-sm">
                <i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i>
              </div>
              <p className="text-slate-600 text-sm leading-relaxed mb-6 italic">
                "Everything was smooth from the hotel pickup to the guides. Special thanks to our driver Wayan who was super friendly. The Indonesian lunch was delicious as well!"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-700">
                  MK
                </div>
                <div>
                  <div className="font-bold text-sm text-slate-900">Michael K.</div>
                  <div className="text-xs text-slate-500">Germany</div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <div className="flex text-amber-400 mb-3 text-sm">
                <i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i>
              </div>
              <p className="text-slate-600 text-sm leading-relaxed mb-6 italic">
                "Great value for money! Booking direct was cheaper than getting it through local street vendors. The quad biking was super fun and full of adrenaline."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-700">
                  SL
                </div>
                <div>
                  <div className="font-bold text-sm text-slate-900">Sarah L.</div>
                  <div className="text-xs text-slate-500">Singapore</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section id="faq" className="py-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="text-emerald-600 font-extrabold uppercase text-xs tracking-wider">Got Questions?</span>
          <h2 className="text-3xl font-extrabold text-slate-900 mt-2">Frequently Asked Questions</h2>
        </div>

        <div className="space-y-4">
          {faqItems.map((item, index) => {
            const isOpen = openFaq === index;

            return (
              <div key={item.question} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : index)}
                  className="w-full p-6 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50 transition-colors"
                  aria-expanded={isOpen}
                >
                  <span className="font-bold text-slate-900">{item.question}</span>
                  <span className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : 'rotate-0'}`}>
                    <i className="fa-solid fa-chevron-down text-emerald-600"></i>
                  </span>
                </button>
                <div className={`grid transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                  <div className="overflow-hidden">
                    <div className="px-6 pb-6 text-slate-600 text-sm leading-relaxed">
                      {item.answer}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
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
              <button onClick={() => setIsAdminOpen(true)} className="px-5 py-3 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-sm border border-slate-700 transition-all cursor-pointer">
                <i className="fa-solid fa-sliders mr-2 text-amber-400"></i> Admin Panel
              </button>
            )}
            <a href="#packages" onClick={(e) => scrollToSection(e, 'packages')} className="px-6 py-3 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm transition-all shadow-lg cursor-pointer">
              Book Online Now
            </a>
          </div>
        </div>
      </footer>

      {/* BOOKING MODAL */}
      {isBookingOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 relative shadow-2xl">
            <button onClick={() => setIsBookingOpen(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 cursor-pointer">
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
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer"
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
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer"
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

              <button type="submit" className="w-full py-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-base transition-colors shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 cursor-pointer">
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
            <button onClick={() => setIsAdminOpen(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 cursor-pointer">
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
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleVerifyPin();
                      }
                    }}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 text-center text-lg font-bold tracking-widest focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                  <button type="button" onClick={handleVerifyPin} className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition-colors shadow-lg cursor-pointer">
                    Unlock Content Panel
                  </button>
                  {pinError && <p className="text-red-500 text-xs font-bold">Incorrect PIN! Please try again.</p>}
                </div>
              </div>
            ) : (
              <form onSubmit={handleSaveContent} className="space-y-5">
                {/*
                <div className="border-b border-slate-100 pb-4">
                  <span className="bg-emerald-100 text-emerald-700 text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full">Next.js CMS Active</span>
                  <h3 className="text-2xl font-extrabold text-slate-900 mt-1">Website Content Settings</h3>
                </div>

                <div className="space-y-3">
                  <h4 className="font-bold text-slate-900 text-sm border-l-4 border-amber-500 pl-2">Admin Panel Security</h4>
                  <p className="text-sm text-slate-500">Admin PIN is verified on the server only and is not shipped to browser source or Inspect Element.</p>
                </div>
                */}

                <div className="border-b border-slate-100 pb-4">
                  <h3 className="text-2xl font-extrabold text-slate-900 mt-1">Website Content Settings</h3>
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
                  <button type="button" onClick={() => setIsAdminOpen(false)} className="w-1/2 py-3 rounded-xl bg-slate-100 text-slate-700 font-bold text-sm cursor-pointer">
                    Cancel
                  </button>
                  <button type="submit" disabled={isSaving} className="w-1/2 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-lg cursor-pointer">
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* FLOATING WHATSAPP BUTTON */}
      <a href={waUrl} target="_blank" rel="noreferrer" className="fixed bottom-6 right-6 z-40 bg-emerald-500 text-white p-4 rounded-full shadow-2xl hover:bg-emerald-600 hover:scale-110 transition-all flex items-center justify-center group cursor-pointer">
        <i className="fa-brands fa-whatsapp text-3xl"></i>
      </a>

    </div>
  );
}
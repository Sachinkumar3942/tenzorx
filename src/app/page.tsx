"use client";

import React, { useState } from "react";
import Image from "next/image";

export default function Page() {
  const [images, setImages] = useState<File[]>([]);
  const [video, setVideo] = useState<File | null>(null);
  const [lat, setLat] = useState<string>("");
  const [lon, setLon] = useState<string>("");
  const [shopSize, setShopSize] = useState<string>("150");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string>("");
  const [viewMode, setViewMode] = useState<'customer' | 'underwriter'>('customer');

  const handleViewSwitch = () => {
    if (viewMode === 'customer') {
      const pwd = window.prompt("Enter Credit Officer Password:");
      if (pwd === "3942") {
        setViewMode('underwriter');
      } else if (pwd !== null) {
        alert("Incorrect Password. Access Denied.");
      }
    } else {
      setViewMode('customer');
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setImages((prev) => [...prev, ...files].slice(0, 5)); // max 5
    }
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setVideo(e.target.files[0]);
    }
  };

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLat(position.coords.latitude.toString());
          setLon(position.coords.longitude.toString());
        },
        (error) => {
          setError("Error getting location: " + error.message);
        }
      );
    } else {
      setError("Geolocation is not supported by this browser.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (images.length < 3) {
      setError("Please upload at least 3 images.");
      return;
    }
    if (!lat || !lon) {
      setError("Please provide geo-coordinates.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const formData = new FormData();
      images.forEach((img) => formData.append("images", img));
      if (video) formData.append("video", video);
      formData.append("latitude", lat);
      formData.append("longitude", lon);
      formData.append("shop_size_sqft", shopSize);

      const res = await fetch("http://localhost:8000/predict", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "Something went wrong.");
      }

      const data = await res.json();
      setResult(data.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-800 font-sans overflow-x-hidden">
      {/* Top Navigation */}
      <nav className="bg-white sticky top-0 z-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center gap-3">
              <div className="flex flex-col items-center justify-center border-2 border-[#003B73] rounded p-1">
                <span className="text-[#003B73] text-2xl font-serif leading-none">P</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[#003B73] font-bold text-lg leading-tight uppercase tracking-wide">Poonawalla</span>
                <span className="text-[#003B73] font-bold text-lg leading-tight uppercase tracking-wide">Fincorp AI</span>
              </div>
            </div>

            {/* Desktop Menu - Center */}
            <div className="hidden md:flex space-x-8 items-center text-sm font-semibold text-[#003B73] tracking-wide">
              <a href="#" className="hover:text-blue-600 transition flex items-center gap-1">LOAN <span className="text-[10px]">▼</span></a>
              <a href="#" className="hover:text-blue-600 transition flex items-center gap-1">COMPANY <span className="text-[10px]">▼</span></a>
              <a href="#" className="hover:text-blue-600 transition">REFER & EARN</a>
            </div>

            {/* Desktop Menu - Right */}
            <div className="hidden md:flex space-x-6 items-center text-sm font-semibold text-[#003B73] tracking-wide">
              <button onClick={handleViewSwitch} className="hover:bg-blue-50 text-[#003B73] transition text-xs font-bold border border-blue-200 px-3 py-1.5 rounded-full flex items-center gap-1 shadow-sm">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                {viewMode === 'customer' ? 'Customer View' : 'Credit Officer View'}
              </button>
              <button className="hover:text-blue-600 transition">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              </button>
              <a href="#" className="hover:text-blue-600 transition flex items-center gap-1">QUICK PAY <span className="text-[10px]">▼</span></a>
              <a href="#" className="hover:text-blue-600 transition flex items-center gap-1">RESOURCES <span className="text-[10px]">▼</span></a>
              <a href="#" className="hover:text-blue-600 transition">LOGIN</a>
              <button className="bg-[#004b87] hover:bg-blue-800 text-white px-6 py-2 rounded font-bold transition">
                APPLY NOW
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative w-full h-[500px] md:h-[600px] bg-slate-900 overflow-hidden">
        <Image
          src="/hero-bg.png"
          alt="Business Professional"
          layout="fill"
          objectFit="cover"
          objectPosition="center top"
          className="opacity-70 mix-blend-overlay"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent"></div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-center">
          <div className="text-white mb-4 text-sm font-semibold tracking-wide flex gap-2">
            <span className="hover:underline cursor-pointer">HOME</span>
            <span className="text-gray-400">&gt;</span>
            <span>BUSINESS LOAN</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-white max-w-2xl leading-tight drop-shadow-lg">
            Upgrade Your Venture With A <br className="hidden md:block" /> Business Loan
          </h1>
        </div>

        {/* Info Bar at Bottom of Hero */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#000000cc] to-[#00000033] backdrop-blur-sm border-t border-white/10 text-white py-6 md:py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between divide-y md:divide-y-0 md:divide-x divide-white/20">

              <div className="flex-1 px-4 md:px-8 py-4 md:py-0">
                <p className="text-sm font-medium mb-1">Loan Amount</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold">Up to</span>
                  <span className="text-4xl font-bold">₹1</span>
                  <span className="text-2xl font-bold">Crore</span>
                </div>
              </div>

              <div className="flex-1 px-4 md:px-8 py-4 md:py-0">
                <p className="text-sm font-medium mb-1">Interest Rate</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold">Starting at</span>
                  <span className="text-4xl font-bold">15%*</span>
                  <span className="text-xl font-bold">p.a.</span>
                </div>
              </div>

              <div className="flex-1 px-4 md:px-8 py-4 md:py-0">
                <p className="text-sm font-medium mb-1">Loan Tenure</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold">upto</span>
                  <span className="text-4xl font-bold">60</span>
                  <span className="text-2xl font-bold">Months</span>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* Main Content Tabs & Application Form */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Tabs */}
        <div className="flex overflow-x-auto space-x-8 border-b-2 border-gray-200 mb-10 pb-2 text-sm font-bold uppercase tracking-wider text-[#003B73]">
          <button className="text-[#004b87] border-b-4 border-[#004b87] pb-2 px-1">OVERVIEW</button>
          <button className="text-gray-500 hover:text-[#003B73] px-1">FEATURES AND BENEFITS</button>
          <button className="text-gray-500 hover:text-[#003B73] px-1">ELIGIBILITY AND DOCUMENTS</button>
          <button className="text-gray-500 hover:text-[#003B73] px-1">INTEREST AND CHARGES</button>
          <button className="text-gray-500 hover:text-[#003B73] px-1">EMI CALCULATOR</button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

          {/* Left Column: Form Info & Form */}
          {(viewMode === 'customer') && (<div className="lg:col-span-6 space-y-8">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Apply for Business Loan Online</h2>
              <p className="text-gray-600 leading-relaxed text-sm md:text-base">
                Whether you aim to expand your operations or manage your working capital, having access to adequate funds is crucial. At Poonawalla Fincorp AI, we offer a comprehensive Business Loan that's collateral-free, quick, and entirely digital. This ensures you spend less time on paperwork and more time growing your business. Apply now!
              </p>
            </div>

            {/* Application Form */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-6 md:p-8">
              <h3 className="text-2xl font-semibold mb-6 text-[#004b87] border-b border-gray-100 pb-4">Store Details & Evaluation</h3>
              <form onSubmit={handleSubmit} className="space-y-6">

                {/* Images */}
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">
                    Store Photos (3 to 5 Required)
                  </label>
                  <div className="relative group border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#004b87] transition-colors bg-gray-50">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className="text-gray-400 mb-2">
                      <svg className="mx-auto h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <p className="text-sm text-gray-500">Drag & Drop or Click to Browse</p>
                    {images.length > 0 && (
                      <div className="mt-4 text-xs font-bold text-[#004b87] bg-blue-50 inline-block px-3 py-1 rounded border border-blue-200">
                        {images.length} image{images.length !== 1 ? 's' : ''} selected
                      </div>
                    )}
                  </div>
                </div>

                {/* Video */}
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">
                    Walkthrough Video (Optional)
                  </label>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleVideoUpload}
                    className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-[#004b87] hover:file:bg-blue-100 transition-all cursor-pointer border border-gray-200 rounded p-1"
                  />
                </div>

                {/* Geo */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 flex items-end gap-3">
                    <div className="flex-1">
                      <label className="block text-sm font-semibold mb-2 text-gray-700">Latitude</label>
                      <input type="text" value={lat} onChange={e => setLat(e.target.value)} className="w-full bg-white border border-gray-300 rounded px-4 py-3 text-sm focus:outline-none focus:border-[#004b87] focus:ring-1 focus:ring-[#004b87] transition-shadow" placeholder="e.g. 28.6139" required />
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-semibold mb-2 text-gray-700">Longitude</label>
                      <input type="text" value={lon} onChange={e => setLon(e.target.value)} className="w-full bg-white border border-gray-300 rounded px-4 py-3 text-sm focus:outline-none focus:border-[#004b87] focus:ring-1 focus:ring-[#004b87] transition-shadow" placeholder="e.g. 77.2090" required />
                    </div>
                    <button type="button" onClick={getLocation} className="px-4 py-3 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded text-gray-700 transition-all" title="Get current location">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    </button>
                  </div>
                </div>

                {/* Optional */}
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">
                    Estimated Shop Size (sq ft)
                  </label>
                  <input type="number" value={shopSize} onChange={e => setShopSize(e.target.value)} className="w-full bg-white border border-gray-300 rounded px-4 py-3 text-sm focus:outline-none focus:border-[#004b87] focus:ring-1 focus:ring-[#004b87] transition-shadow" />
                </div>

                {error && <p className="text-red-600 text-sm mt-2 font-medium bg-red-50 p-3 rounded border border-red-200">{error}</p>}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#004b87] hover:bg-[#003B73] text-white font-bold py-4 px-6 rounded transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                      Evaluating Underwriting Data...
                    </>
                  ) : "SUBMIT APPLICATION"}
                </button>
              </form>
            </div>
          </div>)}

          {/* Right Column: Results Dashboard */}
          <div className="lg:col-span-6">
            <div className="sticky top-28">
              {result ? (
                <div className="bg-white border border-gray-200 rounded-xl shadow-xl p-8 flex flex-col h-full relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-[#004b87]"></div>

                  <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100">
                    <h2 className="text-2xl font-bold text-[#003B73]">
                      {viewMode === 'customer' ? 'Loan Pre-Approval Status' : 'Comprehensive Evaluation Report'}
                    </h2>
                    {viewMode === 'underwriter' && (
                      <div className={`px-4 py-1.5 rounded font-bold text-xs tracking-wider uppercase ${result.recommendation === 'approve_tier_2' || result.recommendation.includes('approve')
                          ? 'bg-green-100 text-green-800 border border-green-200'
                          : result.recommendation === 'rejected'
                            ? 'bg-red-100 text-red-800 border border-red-200'
                            : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                        }`}>
                        {result.recommendation.replace(/_/g, ' ')}
                      </div>
                    )}
                  </div>

                  {/* Top Stats - Hidden for Customer */}
                  {viewMode === 'underwriter' && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                      <div className="bg-gray-50 rounded-lg p-4 border border-gray-100 text-center">
                        <p className="text-gray-500 text-xs font-semibold mb-1 uppercase tracking-wider">Total SKUs</p>
                        <p className="text-2xl font-bold text-gray-900">{result.extracted_features.avg_sku}</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4 border border-gray-100 text-center">
                        <p className="text-gray-500 text-xs font-semibold mb-1 uppercase tracking-wider">Shelf Density</p>
                        <p className="text-2xl font-bold text-gray-900">{Math.round(result.extracted_features.avg_density * 100)}%</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4 border border-gray-100 text-center">
                        <p className="text-gray-500 text-xs font-semibold mb-1 uppercase tracking-wider">Inventory Val</p>
                        <p className="text-xl font-bold text-[#004b87]">₹{(result.latent_variables.inventory_value_estimate_inr / 100000).toFixed(1)}L</p>
                      </div>
                      <div className="bg-blue-50 rounded-lg p-4 border border-blue-100 text-center">
                        <p className="text-blue-800 text-xs font-semibold mb-1 uppercase tracking-wider">Confidence</p>
                        <p className="text-2xl font-bold text-[#004b87]">{Math.round(result.confidence_score * 100)}%</p>
                      </div>
                    </div>
                  )}

                  {/* Financials */}
                  <div className="bg-[#f8fbff] rounded-xl p-6 border border-blue-100 mb-6">
                    <h3 className="text-sm font-bold text-[#004b87] uppercase tracking-wider mb-4 border-b border-blue-100 pb-2">Financial Projections</h3>
                    <div className="flex flex-col gap-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 font-medium">Monthly Revenue Range</span>
                        <span className="font-bold text-gray-900">₹{result.monthly_revenue_range[0].toLocaleString()} - ₹{result.monthly_revenue_range[1].toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 font-medium">Estimated Net Income</span>
                        <span className="font-bold text-gray-900">₹{result.monthly_income_range[0].toLocaleString()} - ₹{result.monthly_income_range[1].toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Loan Details */}
                  {result.loan_details && (
                    <div className="bg-[#004b87] rounded-xl p-6 shadow-lg text-white mb-6 relative overflow-hidden">
                      <div className="absolute top-0 right-0 bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                        {result.loan_details.market_percentile}
                      </div>
                      <h3 className="text-sm font-bold text-blue-200 uppercase tracking-wider mb-2">Pre-Approved Loan Limit</h3>
                      <div className="text-4xl font-bold mb-4">
                        ₹{result.loan_details.pre_approved_loan_amount_inr.toLocaleString()}
                      </div>
                      <div className="pt-4 border-t border-blue-800/50 flex justify-between items-center">
                        <span className="text-blue-200 text-sm">Suggested Max EMI</span>
                        <span className="font-bold text-lg">₹{result.loan_details.max_affordable_emi_inr.toLocaleString()} / mo</span>
                      </div>
                    </div>
                  )}

                  {/* Memo - Hidden for Customer */}
                  {viewMode === 'underwriter' && result.loan_details?.underwriter_memo && (
                    <div className="bg-gray-50 rounded-lg p-5 border-l-4 border-[#004b87] mb-6">
                      <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Executive Underwriter Memo</h3>
                      <p className="text-gray-700 text-sm leading-relaxed">
                        {result.loan_details.underwriter_memo}
                      </p>
                    </div>
                  )}

                  {/* Risks - Hidden for Customer */}
                  {viewMode === 'underwriter' && result.risk_flags && result.risk_flags[0] !== "none_detected" && (
                    <div className="mt-auto bg-red-50 border border-red-100 rounded-lg p-4">
                      <h3 className="font-bold text-red-800 text-sm mb-2 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                        Risk Flags
                      </h3>
                      <ul className="list-disc list-inside text-red-700 text-sm space-y-1">
                        {result.risk_flags.map((flag: string, idx: number) => (
                          <li key={idx} className="capitalize">{flag.replace(/_/g, ' ')}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {viewMode === 'underwriter' && (!result.risk_flags || result.risk_flags[0] === "none_detected") && (
                    <div className="mt-auto bg-green-50 border border-green-100 rounded-lg p-4 flex items-center gap-3">
                      <svg className="w-5 h-5 text-green-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      <p className="text-green-800 text-sm font-medium">No immediate risks detected. Clean profile.</p>
                    </div>
                  )}

                  {/* Customer Success Message */}
                  {viewMode === 'customer' && (
                    <div className="mt-auto bg-blue-50 border border-blue-100 rounded-lg p-5 flex items-start gap-4">
                      <svg className="w-6 h-6 text-[#004b87] shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      <div>
                        <h4 className="font-bold text-[#003B73] mb-1">Application Received</h4>
                        <p className="text-sm text-blue-800">Your store details have been successfully evaluated. Based on our AI analysis of your uploaded photos, you are pre-approved for the limit shown above! A representative will contact you shortly to complete the disbursement.</p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl h-full min-h-[400px] flex flex-col items-center justify-center p-12 text-center text-gray-400">
                  <div className="p-4 bg-white rounded-full mb-4 shadow-sm">
                    <svg className="w-12 h-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">Pending Evaluation</h3>
                  <p className="text-sm max-w-[250px]">Submit the application form to generate a comprehensive business loan evaluation report.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Business Loan EMI Calculator Section placeholder */}
        <div className="mt-16 border-t border-gray-200 pt-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Business Loan EMI Calculator</h2>
          <p className="text-gray-600 max-w-3xl mb-8">
            Our Business Loan EMI calculator helps you estimate your monthly instalment based on the loan amount, interest rate, and tenure you choose. Simply input your desired loan value and repayment period, and the calculator instantly shows your EMI, total interest, and overall repayment amount.
          </p>
          {/* We can leave the rest as it matches the general structure. */}
        </div>
      </div>
    </div>
  );
}

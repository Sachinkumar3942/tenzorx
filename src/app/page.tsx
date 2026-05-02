"use client";

import React, { useState } from "react";

export default function Page() {
  const [images, setImages] = useState<File[]>([]);
  const [video, setVideo] = useState<File | null>(null);
  const [lat, setLat] = useState<string>("");
  const [lon, setLon] = useState<string>("");
  const [shopSize, setShopSize] = useState<string>("150");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string>("");

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
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-indigo-500/30 overflow-x-hidden">
      {/* Background decorations */}
      <div className="fixed inset-0 pointer-events-none" style={{ backgroundImage: "url('data:image/svg+xml;utf8,<svg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22><filter id=%22noiseFilter%22><feTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/></filter><rect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/></svg>')", opacity: 0.05, mixBlendMode: 'overlay' }}></div>
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600 rounded-full blur-[120px] opacity-20 mix-blend-screen pointer-events-none"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-rose-600 rounded-full blur-[120px] opacity-20 mix-blend-screen pointer-events-none"></div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-12">
        <header className="mb-16 text-center">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-rose-400 drop-shadow-sm">
            TenZorX Underwriting
          </h1>
          <p className="text-xl text-slate-400 font-light max-w-2xl mx-auto">
            AI-powered shop evaluation. Upload evidence, get instant decisions.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5 space-y-6">
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 p-8 rounded-3xl shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-rose-500"></div>
              <h2 className="text-2xl font-semibold mb-6 text-indigo-300">Submit Application</h2>
              <form onSubmit={handleSubmit} className="space-y-6">

                {/* Images */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-slate-300">
                    Store Photos (3 to 5 Required)
                  </label>
                  <div className="relative group border-2 border-dashed border-indigo-500/30 rounded-2xl p-6 text-center hover:border-indigo-500/60 transition-colors bg-black/20">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className="text-indigo-400 mb-2">
                      <svg className="mx-auto h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <p className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors">Drag & Drop or Click to Browse</p>
                    {images.length > 0 && (
                      <div className="mt-4 text-xs font-medium text-emerald-400 bg-emerald-400/10 inline-block px-3 py-1 rounded-full border border-emerald-500/20">
                        {images.length} image{images.length !== 1 ? 's' : ''} selected
                      </div>
                    )}
                  </div>
                </div>

                {/* Video */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-slate-300">
                    Walkthrough Video (Optional)
                  </label>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleVideoUpload}
                    className="block w-full text-sm text-slate-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-500/20 file:text-indigo-300 hover:file:bg-indigo-500/30 transition-all cursor-pointer"
                  />
                </div>

                {/* Geo */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 flex items-end gap-3">
                    <div className="flex-1">
                      <label className="block text-sm font-medium mb-2 text-slate-300">Latitude</label>
                      <input type="text" value={lat} onChange={e => setLat(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow" placeholder="e.g. 28.6139" required />
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium mb-2 text-slate-300">Longitude</label>
                      <input type="text" value={lon} onChange={e => setLon(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow" placeholder="e.g. 77.2090" required />
                    </div>
                    <button type="button" onClick={getLocation} className="px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-slate-300 transition-all hover:scale-105 active:scale-95" title="Get current location">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    </button>
                  </div>
                </div>

                {/* Optional */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-slate-300">
                    Estimated Shop Size (sq ft)
                  </label>
                  <input type="number" value={shopSize} onChange={e => setShopSize(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow" />
                </div>

                {error && <p className="text-rose-400 text-sm mt-2 font-medium bg-rose-500/10 p-3 rounded-lg border border-rose-500/20">{error}</p>}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full relative group overflow-hidden rounded-xl font-bold text-white shadow-xl shadow-indigo-900/20 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-rose-500 transition-transform duration-500 ease-out group-hover:scale-105"></div>
                  <div className="relative px-6 py-4 flex items-center justify-center">
                    {loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        Evaluating Store...
                      </>
                    ) : "Evaluate Store"}
                  </div>
                </button>
              </form>
            </div>
          </div>

          <div className="lg:col-span-7">
            {result ? (
              <div className="backdrop-blur-xl bg-white/5 border border-white/10 p-8 rounded-3xl shadow-2xl h-full flex flex-col transition-all duration-500">
                <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/10">
                  <h2 className="text-2xl font-semibold text-rose-300 flex items-center gap-2">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    Evaluation Results
                  </h2>
                  <div className={`px-4 py-2 rounded-full font-bold text-sm tracking-wider uppercase shadow-lg ${result.recommendation === 'approve_tier_2'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-emerald-500/10'
                      : result.recommendation === 'rejected'
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30 shadow-rose-500/10'
                        : 'bg-amber-500/20 text-amber-400 border border-amber-500/30 shadow-amber-500/10'
                    }`}>
                    {result.recommendation.replace(/_/g, ' ')}
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                  <div className="bg-black/20 rounded-2xl p-6 border border-white/5 hover:bg-white/5 transition-colors">
                    <p className="text-slate-400 text-sm mb-1 uppercase tracking-wider">Total SKUs</p>
                    <p className="text-3xl font-bold text-indigo-300">{result.extracted_features.avg_sku}</p>
                  </div>
                  <div className="bg-black/20 rounded-2xl p-6 border border-white/5 hover:bg-white/5 transition-colors">
                    <p className="text-slate-400 text-sm mb-1 uppercase tracking-wider">Shelf Density</p>
                    <p className="text-3xl font-bold text-purple-300">{Math.round(result.extracted_features.avg_density * 100)}%</p>
                  </div>
                  <div className="bg-black/20 rounded-2xl p-6 border border-white/5 hover:bg-white/5 transition-colors">
                    <p className="text-slate-400 text-sm mb-1 uppercase tracking-wider">SKU Diversity</p>
                    <p className="text-3xl font-bold text-pink-300">{result.latent_variables.sku_diversity_score} <span className="text-sm font-normal text-slate-500">/10</span></p>
                  </div>
                  <div className="bg-black/20 rounded-2xl p-6 border border-white/5 hover:bg-white/5 transition-colors">
                    <p className="text-slate-400 text-sm mb-1 uppercase tracking-wider">Inventory Val</p>
                    <p className="text-3xl font-bold text-amber-300">₹{(result.latent_variables.inventory_value_estimate_inr || 0).toLocaleString()}</p>
                  </div>
                  <div className="bg-black/20 rounded-2xl p-6 border border-white/5 hover:bg-white/5 transition-colors">
                    <p className="text-slate-400 text-sm mb-1 uppercase tracking-wider">Footfall Idx</p>
                    <p className="text-3xl font-bold text-sky-300">{result.latent_variables.footfall_proxy_index} <span className="text-sm font-normal text-slate-500">/10</span></p>
                  </div>
                  <div className="bg-black/20 rounded-2xl p-6 border border-white/5 hover:bg-white/5 transition-colors shadow-[inset_0_0_20px_rgba(16,185,129,0.05)] border-emerald-500/20">
                    <p className="text-slate-400 text-sm mb-1 uppercase tracking-wider">Confidence</p>
                    <p className="text-3xl font-bold text-emerald-400">{Math.round(result.confidence_score * 100)}%</p>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-indigo-900/40 to-purple-900/40 rounded-2xl p-8 border border-indigo-500/20 mb-6 shadow-inner">
                  <h3 className="text-sm text-indigo-200 mb-4 uppercase tracking-wider font-semibold">Projected Monthly Revenue</h3>
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <span className="text-5xl font-black text-white">₹{result.monthly_revenue_range[0].toLocaleString()}</span>
                    <span className="text-2xl text-indigo-300 font-medium">to ₹{result.monthly_revenue_range[1].toLocaleString()}</span>
                  </div>
                  <div className="mt-4 pt-4 border-t border-indigo-500/20 flex justify-between items-center">
                    <span className="text-indigo-200/70 text-sm">Estimated Net Income</span>
                    <span className="text-indigo-300 font-semibold text-lg">₹{result.monthly_income_range[0].toLocaleString()} - ₹{result.monthly_income_range[1].toLocaleString()}</span>
                  </div>
                </div>

                {result.risk_flags && result.risk_flags[0] !== "none_detected" && (
                  <div className="mt-auto bg-rose-500/10 border border-rose-500/20 rounded-2xl p-5 shadow-[inset_0_0_20px_rgba(225,29,72,0.1)]">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-rose-500/20 rounded-full">
                        <svg className="w-5 h-5 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                      </div>
                      <h3 className="font-semibold text-rose-300">Risk Flags Detected</h3>
                    </div>
                    <ul className="list-disc list-inside text-rose-200/80 text-sm ml-2 space-y-1">
                      {result.risk_flags.map((flag: string, idx: number) => (
                        <li key={idx} className="capitalize font-medium">{flag.replace(/_/g, ' ')}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {(!result.risk_flags || result.risk_flags[0] === "none_detected") && (
                  <div className="mt-auto bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-5 flex items-center gap-3">
                    <div className="p-2 bg-emerald-500/20 rounded-full">
                      <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    </div>
                    <p className="text-emerald-300 font-medium">No immediate risks detected based on model parameters.</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full border-2 border-dashed border-white/10 rounded-3xl flex flex-col items-center justify-center p-12 text-center text-slate-500 bg-black/10 backdrop-blur-sm">
                <div className="p-6 bg-white/5 rounded-full mb-6">
                  <svg className="w-16 h-16 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                </div>
                <h3 className="text-xl font-medium text-slate-300 mb-2">Awaiting Input</h3>
                <p className="text-slate-400 max-w-sm">Submit the store details, photos, and location in the form to generate a comprehensive underwriting evaluation.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';

const OVERVIEW_STORYBOARD = [
  {
    time: '0:00 - 0:10',
    seconds: 0,
    title: 'The Manual Friction',
    action: 'Split-screen contrast: Messy paper consignment logs & Excel error tracebacks vs. TransitNode Control Tower dashboard.',
    vo: 'Logistics operators waste 40+ hours weekly chasing unverified odometer logs, lost PODs, and mismatched rate cards. TransitNode replaces the chaos with zero-friction automation.'
  },
  {
    time: '0:10 - 0:25',
    seconds: 10,
    title: 'Instant Multi-Tenant Provisioning',
    action: 'Landing Page RegisterModal → Subdomain Input ("acme.transitnode.prohitcoretech.com") → Cashfree Gateway → Auto Admin Setup.',
    vo: 'Provision isolated enterprise workspaces in seconds. Dedicated subdomains, role-based access, and instant payment integration.'
  },
  {
    time: '0:25 - 0:45',
    seconds: 25,
    title: 'Operator Dispatch & Daily Runsheet',
    action: 'AdminDashboard → DailyRunSheet tab → Vehicle Selection ("MH-12-PQ-9876"), Odometer Entry (14,250 km → 14,580 km), Driver Assignment.',
    vo: 'Real-time daily runsheet logging. Operators log verified odometers, dispatch YARD vehicles to ON_TRIP, and assign drivers seamlessly.'
  },
  {
    time: '0:45 - 1:05',
    seconds: 45,
    title: 'Dynamic Rate Card Matrix Engine',
    action: 'Management → Client/Vendor Rate Cards → Template A (O-D Fixed Kms) & Template B (Store/Zone Grid) rate calculation.',
    vo: 'Automate complex rate calculations across Origin-Destination matrices, store points, extra kilometers, and daily detention charges.'
  },
  {
    time: '1:05 - 1:25',
    seconds: 65,
    title: 'Accountant Audit & Export Vault',
    action: 'FinancialLedger & ShipmentTransactions → Filter Flipkart MIS / Dua Lima MIS → Export audited XLSX report via ExcelJS.',
    vo: 'Instant billing audits for accountants. Filter freight, toll, and DCM charges with one-click automated Excel exports.'
  },
  {
    time: '1:25 - 1:40',
    seconds: 85,
    title: 'Compliance Vault & Document Alerts',
    action: 'ComplianceVault → Vehicle RC, Insurance, Fitness & Driver License Expiry warning alerts with instant PDF preview.',
    vo: 'Never miss a legal deadline. Automated compliance vaults track RC, insurance, fitness, and driver license expiration dates in real time.'
  },
  {
    time: '1:40 - 2:00',
    seconds: 100,
    title: 'Master Admin Command Center',
    action: 'MasterAdminDashboard → Global Revenue Donut Chart, Active Fleet Telemetry counter, and Tenant Subscription Tiers.',
    vo: 'Complete command tower visibility. Monitor total platform revenue, fleet telemetry volume, and tenant health from a single pane of glass.'
  }
];

const OverviewModal = ({ showModal, setShowModal }) => {
  const [activeChapterIndex, setActiveChapterIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [videoSetting, setVideoSetting] = useState(null);
  const videoRef = useRef(null);

  // Fetch YouTube / dynamic video configuration from Master Admin API
  useEffect(() => {
    const fetchVideoConfig = async () => {
      try {
        const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3000';
        const res = await axios.get(`${apiUrl}/api/saas/overview-video`);
        if (res.data?.videoSetting) {
          setVideoSetting(res.data.videoSetting);
        }
      } catch (err) {
        console.error('Error fetching overview video config:', err);
      }
    };
    if (showModal) {
      fetchVideoConfig();
    }
  }, [showModal]);

  // Close modal on ESC key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setShowModal(false);
      }
    };
    if (showModal) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [showModal, setShowModal]);

  // Video time update listener
  useEffect(() => {
    if (!showModal) return;
    const interval = setInterval(() => {
      if (isPlaying) {
        setCurrentTime((prev) => {
          const next = prev + 1;
          if (next > 120) return 0;
          // Sync active chapter index based on time
          const chapterIdx = OVERVIEW_STORYBOARD.findIndex((ch, idx) => {
            const nextCh = OVERVIEW_STORYBOARD[idx + 1];
            return next >= ch.seconds && (!nextCh || next < nextCh.seconds);
          });
          if (chapterIdx !== -1) setActiveChapterIndex(chapterIdx);
          return next;
        });
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [showModal, isPlaying]);

  if (!showModal) return null;

  const currentChapter = OVERVIEW_STORYBOARD[activeChapterIndex] || OVERVIEW_STORYBOARD[0];

  const handleChapterClick = (index) => {
    setActiveChapterIndex(index);
    setCurrentTime(OVERVIEW_STORYBOARD[index].seconds);
  };

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 md:p-8 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-300"
      onClick={(e) => {
        if (e.target === e.currentTarget) setShowModal(false);
      }}
    >
      <div className="bg-slate-900 border border-slate-800 rounded-2xl sm:rounded-3xl w-full max-w-5xl overflow-hidden shadow-2xl relative text-white flex flex-col my-auto">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse"></div>
            <h3 className="font-extrabold text-sm sm:text-base tracking-tight text-white uppercase flex items-center">
              <span>TransitNode Overview</span>
              <span className="ml-2.5 text-[10px] bg-blue-600/30 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded-full font-mono">
                Interactive Storyboard
              </span>
            </h3>
          </div>
          
          <button 
            onClick={() => setShowModal(false)}
            className="text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 p-2 rounded-full transition-colors focus:outline-none"
            aria-label="Close Overview Modal"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Main Display Area */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
          
          {/* Left / Top: Player Display */}
          <div className="lg:col-span-8 bg-slate-950 relative flex flex-col justify-between overflow-hidden aspect-video group">
            
            {/* Embedded Video Presentation Player */}
            <div className="w-full h-full relative bg-slate-950 flex flex-col justify-center items-center text-center overflow-hidden">
              {videoSetting?.embedUrl && videoSetting?.isEnabled !== false ? (
                <iframe
                  src={videoSetting.embedUrl}
                  title={videoSetting.title || "TransitNode Platform Overview"}
                  className="w-full h-full border-0 absolute inset-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              ) : (
                <>
                  {/* Decorative Background Grid Pattern */}
                  <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-40"></div>
                  
                  <div className="relative z-10 max-w-md p-6 space-y-3">
                    <div className="inline-flex items-center space-x-2 bg-blue-950/80 border border-blue-500/40 text-blue-300 text-xs px-3 py-1 rounded-full font-mono">
                      <span>CHAPTER {activeChapterIndex + 1} / 7</span>
                      <span>•</span>
                      <span>{currentChapter.time}</span>
                    </div>
                    
                    <h4 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                      {currentChapter.title}
                    </h4>
                    
                    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 text-xs text-slate-300 font-mono text-left space-y-1.5 shadow-lg">
                      <div className="text-blue-400 font-bold uppercase text-[10px] tracking-wider">🖥️ UI Screen Action</div>
                      <div className="leading-relaxed text-slate-200">{currentChapter.action}</div>
                    </div>
                  </div>

                  {/* Simulation Progress Line */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-800">
                    <div 
                      className="h-full bg-blue-500 transition-all duration-300"
                      style={{ width: `${(currentTime / 120) * 100}%` }}
                    ></div>
                  </div>
                </>
              )}
            </div>

            {/* Controls Overlay Bar */}
            <div className="absolute bottom-3 left-3 right-3 bg-slate-900/90 backdrop-blur-md border border-slate-700/60 rounded-xl p-2.5 flex items-center justify-between text-xs z-20">
              <button 
                onClick={() => setIsPlaying(!isPlaying)}
                className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-3 py-1.5 rounded-lg flex items-center space-x-1.5 transition-colors"
              >
                <span>{isPlaying ? '⏸ Pause' : '▶ Play'}</span>
              </button>

              <div className="font-mono text-slate-300 text-[11px]">
                {Math.floor(currentTime / 60)}:{('0' + (currentTime % 60)).slice(-2)} / 2:00
              </div>

              <div className="flex space-x-1">
                <button 
                  onClick={() => handleChapterClick(Math.max(0, activeChapterIndex - 1))}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-2.5 py-1 rounded-md text-[11px]"
                >
                  Prev
                </button>
                <button 
                  onClick={() => handleChapterClick(Math.min(OVERVIEW_STORYBOARD.length - 1, activeChapterIndex + 1))}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-2.5 py-1 rounded-md text-[11px]"
                >
                  Next
                </button>
              </div>
            </div>

          </div>

          {/* Right / Bottom: Interactive Storyboard & Voiceover Stream */}
          <div className="lg:col-span-4 bg-slate-900 border-t lg:border-t-0 lg:border-l border-slate-800 p-4 sm:p-5 flex flex-col justify-between h-auto lg:h-[450px]">
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center justify-between">
                <span>Workflow Storyboard</span>
                <span className="text-blue-400 font-normal text-[10px]">Click chapter to jump</span>
              </h4>

              <div className="space-y-2 overflow-y-auto max-h-[300px] pr-1 scrollbar-thin scrollbar-thumb-slate-700">
                {OVERVIEW_STORYBOARD.map((item, index) => {
                  const isActive = index === activeChapterIndex;
                  return (
                    <div
                      key={index}
                      onClick={() => handleChapterClick(index)}
                      className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                        isActive
                          ? 'bg-blue-950/60 border-blue-500/80 text-white shadow-md'
                          : 'bg-slate-950/40 border-slate-800/80 text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className={`font-bold text-[11px] ${isActive ? 'text-blue-300' : 'text-slate-300'}`}>
                          {item.title}
                        </span>
                        <span className="font-mono text-[10px] text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                          {item.time}
                        </span>
                      </div>
                      <p className="text-[11px] leading-relaxed line-clamp-2 font-light text-slate-300">
                        {item.vo}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Active Voiceover Quote Callout */}
            <div className="mt-4 pt-3 border-t border-slate-800 bg-slate-950/50 p-3 rounded-xl border border-slate-800">
              <div className="text-[10px] uppercase font-bold text-blue-400 mb-1">🎙️ Voiceover Script</div>
              <p className="text-xs italic text-slate-200 leading-snug">
                "{currentChapter.vo}"
              </p>
            </div>

          </div>

        </div>

        {/* Footer Bar */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs text-slate-400">
          <span>🔒 End-to-End Enterprise Logistics Suite</span>
          <a 
            href="/login" 
            className="text-blue-400 hover:text-blue-300 font-semibold flex items-center space-x-1"
          >
            <span>Explore Dashboard Live</span>
            <span>→</span>
          </a>
        </div>

      </div>
    </div>
  );
};

export default OverviewModal;

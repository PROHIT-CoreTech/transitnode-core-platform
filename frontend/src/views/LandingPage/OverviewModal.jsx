import React, { useEffect, useState } from 'react';
import axios from 'axios';

const OverviewModal = ({ showModal, setShowModal }) => {
  const [videoSetting, setVideoSetting] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch YouTube / dynamic video configuration from Master Admin API
  useEffect(() => {
    const fetchVideoConfig = async () => {
      try {
        setLoading(true);
        const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3000';
        const res = await axios.get(`${apiUrl}/api/saas/overview-video`);
        if (res.data?.videoSetting) {
          setVideoSetting(res.data.videoSetting);
        }
      } catch (err) {
        console.error('Error fetching overview video config:', err);
      } finally {
        setLoading(false);
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

  if (!showModal) return null;

  // Use Master Admin YouTube embed URL if provided, otherwise default to active embed
  const embedUrl = videoSetting?.embedUrl || 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?autoplay=1';

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 md:p-8 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-300"
      onClick={(e) => {
        if (e.target === e.currentTarget) setShowModal(false);
      }}
    >
      <div className="bg-slate-900 border border-slate-800 rounded-2xl sm:rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl relative text-white flex flex-col my-auto">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse"></div>
            <h3 className="font-extrabold text-sm sm:text-base tracking-tight text-white uppercase flex items-center">
              <span>{videoSetting?.title || 'TransitNode Platform Overview'}</span>
            </h3>
          </div>
          
          <button 
            onClick={() => setShowModal(false)}
            className="text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 p-2 rounded-full transition-colors focus:outline-none cursor-pointer"
            aria-label="Close Overview Modal"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Pure Video Display Frame (No Sidebars or Overlays) */}
        <div className="w-full aspect-video bg-black relative overflow-hidden flex items-center justify-center">
          {loading ? (
            <div className="text-slate-400 text-sm font-mono flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <span>Loading video player...</span>
            </div>
          ) : (
            <iframe
              src={embedUrl}
              title={videoSetting?.title || "TransitNode Platform Overview"}
              className="w-full h-full border-0 absolute inset-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          )}
        </div>

        {/* Optional Subtitle / Description Footer Bar */}
        {videoSetting?.description && (
          <div className="px-5 py-3 bg-slate-950/90 border-t border-slate-800/80 text-xs text-slate-300 font-medium leading-relaxed">
            {videoSetting.description}
          </div>
        )}

      </div>
    </div>
  );
};

export default OverviewModal;

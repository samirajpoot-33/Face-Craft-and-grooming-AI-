import React, { useState, useEffect } from 'react';
import { 
  Share2, Facebook, Twitter, Link as LinkIcon, Download, 
  Check, MessageCircle, Linkedin, ExternalLink, X, 
  Send, Mail, Sparkles, Instagram, Image as ImageIcon
} from 'lucide-react';
import { logShareEvent } from '../utils/api';

export default function SocialShare({ 
  title, 
  text, 
  url, 
  imageUrl, 
  variant = "default", 
  onShare,
  resourceType = "general",
  resourceId = null
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [shareStatus, setShareStatus] = useState('');

  const shareUrl = url || window.location.href;
  const shareTitle = title || 'My FaceCraft AI Transformation';
  const shareText = text || 'Check out my new look on FaceCraft AI!';

  const handleLogShare = async (platform) => {
    try {
      await logShareEvent({
        platform,
        resource_type: resourceType,
        resource_id: resourceId,
        share_url: shareUrl,
        image_url: imageUrl
      });
    } catch (err) {
      console.warn('Share logging failed silently:', err);
    }
  };

  const socialLinks = [
    {
      name: 'WhatsApp',
      icon: <MessageCircle size={24} />,
      color: 'bg-[#25D366]',
      hover: 'hover:shadow-[#25D366]/40 hover:scale-110',
      link: `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`,
      platform: 'whatsapp'
    },
    {
      name: 'Facebook',
      icon: <Facebook size={24} />,
      color: 'bg-[#1877F2]',
      hover: 'hover:shadow-[#1877F2]/40 hover:scale-110',
      link: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      platform: 'facebook'
    },
    {
      name: 'X / Twitter',
      icon: <Twitter size={22} />,
      color: 'bg-black',
      hover: 'hover:shadow-white/10 hover:scale-110',
      link: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
      platform: 'twitter'
    },
    {
      name: 'LinkedIn',
      icon: <Linkedin size={24} />,
      color: 'bg-[#0A66C2]',
      hover: 'hover:shadow-[#0A66C2]/40 hover:scale-110',
      link: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
      platform: 'linkedin'
    },
    {
      name: 'Telegram',
      icon: <Send size={22} />,
      color: 'bg-[#0088cc]',
      hover: 'hover:shadow-[#0088cc]/40 hover:scale-110',
      link: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`,
      platform: 'telegram'
    },
    {
      name: 'Email',
      icon: <Mail size={22} />,
      color: 'bg-slate-700',
      hover: 'hover:shadow-slate-500/40 hover:scale-110',
      link: `mailto:?subject=${encodeURIComponent(shareTitle)}&body=${encodeURIComponent(shareText + '\n\n' + shareUrl)}`,
      platform: 'email'
    },
  ];

  const handleOpen = async () => {
    if (onShare) await onShare();
    setIsOpen(true);
    setTimeout(() => setIsAnimating(true), 10);
  };

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => setIsOpen(false), 300);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    handleLogShare('copy_link');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNativeShare = async () => {
    if (!navigator.share) {
      setShareStatus('Native sharing not supported on this browser.');
      return;
    }

    const shareData = {
      title: shareTitle,
      text: shareText,
      url: shareUrl,
    };

    if (imageUrl) {
      try {
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        const file = new File([blob], 'my-transformation.png', { type: 'image/png' });
        
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          shareData.files = [file];
        }
      } catch (err) {
        console.error('Error preparing image for share:', err);
      }
    }

    try {
      await navigator.share(shareData);
      handleLogShare('native');
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Error sharing:', err);
        setShareStatus('Sharing failed. Try copying the link instead.');
      }
    }
  };

  return (
    <>
      {/* Trigger Button */}
      {variant === "compact" ? (
        <button 
          onClick={handleOpen}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white transition-all group relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-sky-500/10 to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          <Share2 size={16} className="text-sky-400 group-hover:scale-110 transition-transform relative z-10" />
          <span className="text-xs font-bold uppercase tracking-wider relative z-10">Share</span>
        </button>
      ) : (
        <button 
          onClick={handleOpen}
          className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-slate-900 border border-white/10 text-white font-bold hover:border-sky-500/50 transition-all shadow-xl group relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-sky-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          <Share2 size={20} className="text-sky-400 group-hover:rotate-12 transition-transform relative z-10" />
          <span className="relative z-10">Share Results</span>
          <Sparkles size={16} className="text-sky-400/50 absolute top-2 right-4 animate-pulse" />
        </button>
      )}

      {/* Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop */}
          <div 
            className={`absolute inset-0 bg-slate-950/90 backdrop-blur-md transition-opacity duration-500 ${isAnimating ? 'opacity-100' : 'opacity-0'}`}
            onClick={handleClose}
          />

          {/* Modal Content */}
          <div 
            className={`relative w-full max-w-lg bg-slate-900 border border-white/10 rounded-[40px] shadow-[0_32px_128px_-16px_rgba(0,0,0,0.5)] overflow-hidden transition-all duration-500 transform ${isAnimating ? 'translate-y-0 scale-100 opacity-100' : 'translate-y-12 scale-95 opacity-0'}`}
          >
            {/* Glossy Gradient Overlay */}
            <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-sky-500/10 to-transparent pointer-events-none" />

            {/* Header */}
            <div className="px-10 pt-10 pb-8 relative z-10">
              <button 
                onClick={handleClose}
                className="absolute top-8 right-8 p-3 rounded-full bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all"
              >
                <X size={20} />
              </button>
              
              <div className="flex items-center gap-4 mb-2">
                <div className="p-3 rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-600 shadow-lg shadow-sky-500/20">
                  <Share2 size={24} className="text-white" />
                </div>
                <div>
                  <h3 className="text-3xl font-black text-white tracking-tight">
                    Share Style
                  </h3>
                  <div className="flex items-center gap-2 text-sky-400 text-[10px] font-black uppercase tracking-[0.2em]">
                    <Sparkles size={12} />
                    AI Transformation
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="px-10 pb-8 relative z-10">
              {imageUrl ? (
                <div className="mb-6 rounded-3xl overflow-hidden aspect-video bg-black border border-white/10 shadow-2xl group relative">
                  <img src={imageUrl} alt="Preview" className="w-full h-full object-contain" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-6">
                    <p className="text-white text-sm font-bold flex items-center gap-2">
                      <Sparkles size={16} className="text-sky-400" /> 
                      Your Unique Result
                    </p>
                  </div>
                </div>
              ) : (
                <div className="mb-6 p-8 rounded-3xl bg-white/5 border border-dashed border-white/20 flex flex-col items-center justify-center text-center">
                  <ImageIcon size={24} className="text-sky-400/50 mb-2" />
                  <p className="text-slate-400 text-sm italic">Sharing your style with the world...</p>
                </div>
              )}

              {/* Native Image Share Button (Priority) */}
              {navigator.share && (
                <button
                  onClick={handleNativeShare}
                  className="w-full mb-8 py-4 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-600 text-white font-black uppercase tracking-[0.2em] shadow-xl shadow-sky-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 border border-white/10"
                >
                  <Share2 size={20} />
                  Share Image Directly
                </button>
              )}

              {/* Social Grid (Fallback / Link Sharing) */}
              <div className="mb-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] text-center">Or Share Link To</div>
              <div className="grid grid-cols-3 gap-6 mb-10">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.link}
                    onClick={() => handleLogShare(social.platform)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center gap-3 group/item"
                  >
                    <div className={`${social.color} w-16 h-16 rounded-[24px] flex items-center justify-center text-white shadow-xl transition-all duration-300 ${social.hover} group-active/item:scale-95`}>
                      {social.icon}
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest group-hover/item:text-white transition-colors">
                      {social.name}
                    </span>
                  </a>
                ))}
              </div>


              {shareStatus && <p className="text-[10px] text-amber-500 mt-3 text-center font-bold uppercase">{shareStatus}</p>}
            </div>

            {/* Footer Information */}
            <div className="px-10 py-8 bg-black/40 border-t border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em]">AI Synthesis Verified</span>
              </div>
              {imageUrl && (
                <a 
                  href={imageUrl} 
                  download="facecraft-transformation.png"
                  className="px-4 py-2 rounded-xl bg-white/5 text-[10px] font-black uppercase tracking-widest text-slate-300 hover:text-white hover:bg-white/10 transition-all flex items-center gap-2 border border-white/5"
                >
                  <Download size={12} />
                  Save Locally
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

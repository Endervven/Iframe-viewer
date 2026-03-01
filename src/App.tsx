/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { Maximize2, Minimize2, Globe, ArrowRight, X, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [url, setUrl] = useState('');
  const [activeUrl, setActiveUrl] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleLoad = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    
    let formattedUrl = url.trim();
    if (!/^https?:\/\//i.test(formattedUrl)) {
      formattedUrl = `https://${formattedUrl}`;
    }
    setActiveUrl(formattedUrl);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const clearUrl = () => {
    setActiveUrl(null);
    setUrl('');
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-emerald-500/30">
      <AnimatePresence mode="wait">
        {!activeUrl ? (
          <motion.div 
            key="setup"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex flex-col items-center justify-center min-h-screen p-6"
          >
            <div className="w-full max-w-md space-y-8">
              <div className="text-center space-y-2">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 mb-4">
                  <Globe className="w-8 h-8 text-emerald-400" />
                </div>
                <h1 className="text-4xl font-bold tracking-tight text-white">Iframe Viewer</h1>
                <p className="text-zinc-400">Enter a URL to view it in a clean, fullscreen environment.</p>
              </div>

              <form onSubmit={handleLoad} className="space-y-4">
                <div className="relative group">
                  <input
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="example.com"
                    className="w-full px-5 py-4 bg-zinc-900 border border-zinc-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all text-lg placeholder:text-zinc-600"
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="absolute right-2 top-2 bottom-2 px-4 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 rounded-xl font-semibold transition-colors flex items-center gap-2"
                  >
                    Load <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs text-center text-zinc-500">
                  Note: Some websites may block iframe embedding via security headers (X-Frame-Options).
                </p>
              </form>

              <div className="grid grid-cols-2 gap-3 pt-4">
                {[
                  { name: 'Google', url: 'https://www.google.com/search?igu=1' },
                  { name: 'Wikipedia', url: 'https://en.m.wikipedia.org' },
                  { name: 'Bing', url: 'https://www.bing.com' },
                  { name: 'DuckDuckGo', url: 'https://duckduckgo.com' },
                ].map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => {
                      setUrl(preset.url);
                      setActiveUrl(preset.url);
                    }}
                    className="px-4 py-3 bg-zinc-900/50 border border-zinc-800 rounded-xl text-sm font-medium hover:bg-zinc-800 hover:border-zinc-700 transition-all text-zinc-300 flex items-center justify-between group"
                  >
                    {preset.name}
                    <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="viewer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            ref={containerRef}
            className="fixed inset-0 bg-black flex flex-col"
          >
            {/* Toolbar */}
            <div className={`flex items-center justify-between px-4 py-2 bg-zinc-900/80 backdrop-blur-md border-b border-zinc-800 z-50 transition-transform duration-300 ${isFullscreen ? '-translate-y-full hover:translate-y-0' : ''}`}>
              <div className="flex items-center gap-3 overflow-hidden">
                <button 
                  onClick={clearUrl}
                  className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors"
                  title="Close"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-2 px-3 py-1 bg-zinc-950 border border-zinc-800 rounded-md text-xs text-zinc-400 truncate max-w-md">
                  <Globe className="w-3 h-3 flex-shrink-0" />
                  <span className="truncate">{activeUrl}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={toggleFullscreen}
                  className="flex items-center gap-2 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm font-medium transition-colors"
                >
                  {isFullscreen ? (
                    <><Minimize2 className="w-4 h-4" /> Exit Fullscreen</>
                  ) : (
                    <><Maximize2 className="w-4 h-4" /> Go Fullscreen</>
                  )}
                </button>
              </div>
            </div>

            {/* Iframe Container */}
            <div className="flex-1 relative overflow-hidden">
              <iframe
                src={activeUrl}
                className="w-full h-full border-none"
                title="Content Viewer"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                sandbox="allow-forms allow-modals allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

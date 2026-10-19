import React, { useState } from 'react';
import { Monitor, Tablet, Smartphone, ExternalLink, RefreshCw } from 'lucide-react';

interface WebsitePreviewViewProps {
  onOpenPublicSite: () => void;
}

export const WebsitePreviewView: React.FC<WebsitePreviewViewProps> = ({ onOpenPublicSite }) => {
  const [device, setDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [iframeKey, setIframeKey] = useState(1);

  const getWidth = () => {
    switch (device) {
      case 'mobile': return 'max-w-[390px] h-[780px]';
      case 'tablet': return 'max-w-[768px] h-[820px]';
      default: return 'w-full h-[850px]';
    }
  };

  return (
    <div className="space-y-6 max-w-6xl animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-slate-800 bg-slate-900/60 sticky top-20 z-20 backdrop-blur-md">
        <div>
          <h3 className="text-sm font-bold text-white tracking-tight">Interactive Website Preview</h3>
          <p className="text-xs text-slate-400">Preview live rendering across device viewports</p>
        </div>

        <div className="flex items-center gap-2">
          {/* Viewport switchers */}
          <div className="flex items-center gap-1 p-1 bg-slate-950 border border-slate-800 rounded-lg">
            <button
              onClick={() => setDevice('desktop')}
              className={`p-1.5 rounded transition-colors ${
                device === 'desktop' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
              title="Desktop View"
            >
              <Monitor className="w-4 h-4" />
            </button>
            <button
              onClick={() => setDevice('tablet')}
              className={`p-1.5 rounded transition-colors ${
                device === 'tablet' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
              title="Tablet View"
            >
              <Tablet className="w-4 h-4" />
            </button>
            <button
              onClick={() => setDevice('mobile')}
              className={`p-1.5 rounded transition-colors ${
                device === 'mobile' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
              title="Mobile View"
            >
              <Smartphone className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => setIframeKey((k) => k + 1)}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
            title="Reload Frame"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenPublicSite}
            className="px-3.5 py-1.5 text-xs font-semibold text-slate-950 bg-white hover:bg-slate-200 rounded-lg flex items-center gap-1.5 cursor-pointer shadow"
          >
            <span>Open Full Window</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Frame Container */}
      <div className="flex justify-center p-6 rounded-2xl border border-slate-800 bg-[#0a0c10] overflow-hidden">
        <div className={`transition-all duration-300 w-full ${getWidth()} rounded-xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-950`}>
          <iframe
            key={iframeKey}
            src="/?preview=live_admin_view"
            title="Portfolio Website Preview"
            className="w-full h-full border-0 bg-[#0b0c10]"
          />
        </div>
      </div>
    </div>
  );
};

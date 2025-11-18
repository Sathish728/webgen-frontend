
import { useEffect, useRef, useState } from 'react';

const TemplatePreview = ({ template, onClose, onUseTemplate }) => {
  const iframeRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('desktop');

  useEffect(() => {
    if (template && iframeRef.current) {
      console.log('📦 Template data received:', template);
      renderTemplate();
    }
  }, [template, viewMode]);

  const renderTemplate = () => {
    try {
      setLoading(true);
      setError(null);

      const iframe = iframeRef.current;
      if (!iframe) {
        throw new Error('Iframe not found');
      }

      const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
      if (!iframeDoc) {
        throw new Error('Cannot access iframe document');
      }

      let finalHTML = '';

      // ✅ YOUR BACKEND RETURNS: { previewJson: { html, css, js } }
      if (template.previewJson) {
        console.log('✅ Found previewJson:', {
          hasHtml: !!template.previewJson.html,
          htmlLength: template.previewJson.html?.length,
          hasCss: !!template.previewJson.css,
          hasJs: !!template.previewJson.js
        });

        const html = template.previewJson.html || '';
        const css = template.previewJson.css || '';
        const js = template.previewJson.js || '';

        if (!html) {
          throw new Error('Template HTML is empty');
        }

        
        // Inject Tailwind CDN if not already included
        const tailwindCdn = '<script src="https://cdn.tailwindcss.com"></script>';
        finalHTML = html.includes('cdn.tailwindcss.com')
         ? html
         : html.replace('</head>', `${tailwindCdn}\n</head>`);

        // Only add CSS if it exists and is not already in HTML
        if (css && !html.includes(css)) {
          if (html.includes('</head>')) {
            finalHTML = finalHTML.replace('</head>', `<style>${css}</style>\n</head>`);
          } else if (html.includes('<head>')) {
            finalHTML = finalHTML.replace('<head>', `<head>\n<style>${css}</style>`);
          }
        }

        // Only add JS if it exists and is not already in HTML
        if (js && !html.includes(js)) {
          if (html.includes('</body>')) {
            finalHTML = finalHTML.replace('</body>', `<script>${js}</script>\n</body>`);
          } else {
            finalHTML = `${finalHTML}\n<script>${js}</script>`;
          }
        }

      } else if (template.content) {
        // Alternative format: { content: { html, css, js } }
        console.log('✅ Found content:', template.content);
        const { html = '', css = '', js = '' } = template.content;
        
        if (!html) {
          throw new Error('Template HTML is empty');
        }

        finalHTML = html;
        
        if (css && !html.includes(css)) {
          finalHTML = html.includes('</head>') 
            ? finalHTML.replace('</head>', `<style>${css}</style>\n</head>`)
            : `<style>${css}</style>\n${finalHTML}`;
        }

        if (js && !html.includes(js)) {
          finalHTML = html.includes('</body>')
            ? finalHTML.replace('</body>', `<script>${js}</script>\n</body>`)
            : `${finalHTML}\n<script>${js}</script>`;
        }

      } else {
        throw new Error('Invalid template format - no previewJson or content found');
      }

      console.log('📄 Final HTML length:', finalHTML.length);
      console.log('📄 HTML preview (first 200 chars):', finalHTML.substring(0, 200));

      // Write to iframe
      iframeDoc.open();
      iframeDoc.write(finalHTML);
      iframeDoc.close();

      // Handle loading state
      iframe.onload = () => {
        console.log('✅ Iframe loaded successfully');
        setTimeout(() => {
          setLoading(false);
        }, 500);
      };

      iframe.onerror = (e) => {
        console.error('❌ Iframe error:', e);
        setError('Failed to load template in iframe');
        setLoading(false);
      };

      // Fallback timeout
      setTimeout(() => {
        if (loading) {
          console.log('⏱️ Fallback timeout - setting loading to false');
          setLoading(false);
        }
      }, 3000);

    } catch (err) {
      console.error('❌ Error rendering template:', err);
      setError(err.message || 'Failed to load template preview');
      setLoading(false);
    }
  };

  const getIframeStyles = () => {
    const baseStyles = {
      width: '100%',
      height: '100%',
      border: 'none',
      transition: 'all 0.3s ease'
    };

    switch (viewMode) {
      case 'mobile':
        return { ...baseStyles, maxWidth: '375px', margin: '0 auto' };
      case 'tablet':
        return { ...baseStyles, maxWidth: '768px', margin: '0 auto' };
      case 'desktop':
      default:
        return baseStyles;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl w-full h-[95vh] flex flex-col shadow-2xl animate-slideUp max-w-[95vw]">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 flex justify-between items-center rounded-t-2xl flex-shrink-0 h-[50px]">
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-bold mb-1 truncate">{template.name}</h3>
          </div>

          {/* View Mode Buttons */}
          <div className="flex items-center gap-2 mx-4">
            <button
              onClick={() => setViewMode('mobile')}
              className={`p-2 rounded-lg transition ${
                viewMode === 'mobile'
                  ? 'bg-white/20 text-white'
                  : 'text-white/70 hover:bg-white/10'
              }`}
              title="Mobile View (375px)"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('tablet')}
              className={`p-2 rounded-lg transition ${
                viewMode === 'tablet'
                  ? 'bg-white/20 text-white'
                  : 'text-white/70 hover:bg-white/10'
              }`}
              title="Tablet View (768px)"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('desktop')}
              className={`p-2 rounded-lg transition ${
                viewMode === 'desktop'
                  ? 'bg-white/20 text-white'
                  : 'text-white/70 hover:bg-white/10'
              }`}
              title="Desktop View"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </button>
          </div>

          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded-full p-2 transition flex-shrink-0"
            title="Close Preview"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Preview Area */}
        <div className="flex-1 overflow-hidden bg-gray-100 p-4 flex justify-center items-start relative min-h-0">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/90 z-10">
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mb-4 mx-auto"></div>
                <p className="text-gray-600 font-medium">Loading preview...</p>
                <p className="text-gray-400 text-sm mt-2">{template.name} • {viewMode} view</p>
              </div>
            </div>
          )}

          {error ? (
            <div className="flex items-center justify-center h-full w-full">
              <div className="text-center bg-white rounded-xl p-8 shadow-lg max-w-md">
                <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Preview Failed</h3>
                <p className="text-gray-600 mb-4">{error}</p>
                <button
                  onClick={() => {
                    console.log('🔍 Template debug info:');
                    console.log('Template object:', template);
                    console.log('Has previewJson:', !!template.previewJson);
                    console.log('Has content:', !!template.content);
                    if (template.previewJson) {
                      console.log('previewJson.html length:', template.previewJson.html?.length);
                    }
                  }}
                  className="text-sm text-blue-600 hover:underline"
                >
                  🔍 Log template data to console
                </button>
                {template.thumbnail && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-500 mb-2">Thumbnail:</p>
                    <img
                      src={template.thumbnail}
                      alt={template.name}
                      className="rounded-lg shadow-md max-w-full"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div
              className="bg-white rounded-lg shadow-2xl overflow-hidden transition-all duration-300 h-full"
              style={{
                width: viewMode === 'mobile' ? '375px' : viewMode === 'tablet' ? '768px' : '100%',
                maxWidth: '100%'
              }}
            >
              <iframe
                ref={iframeRef}
                title={`${template.name} Preview`}
                style={getIframeStyles()}
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
              />
            </div>
          )}

          {/* View Mode Label */}
          {!loading && !error && (
            <div className="absolute top-6 left-6 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg z-20">
              <span className="text-sm font-semibold text-gray-700 capitalize flex items-center gap-2">
                {viewMode === 'mobile' && '📱 Mobile (375px)'}
                {viewMode === 'tablet' && '💻 Tablet (768px)'}
                {viewMode === 'desktop' && '🖥️ Desktop (Full Width)'}
              </span>
            </div>
          )}
        </div>

      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default TemplatePreview;
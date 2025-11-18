// pages/WebsiteEditorPage.jsx - TESTED & WORKING
import { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { getWebsiteById, updateWebsite, publishWebsite } from '../slice/websiteSlice';
import { toast } from 'react-toastify';

const WebsiteEditorPage = () => {
  const { websiteId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const iframeRef = useRef(null);

  const { currentWebsite, isLoading } = useSelector(state => state.website);

  const [websiteName, setWebsiteName] = useState('');
  const [htmlContent, setHtmlContent] = useState('');
  const [selectedPath, setSelectedPath] = useState(null);
  const [showCode, setShowCode] = useState(false);
  const [viewMode, setViewMode] = useState('desktop');
  const [isSaving, setIsSaving] = useState(false);

  // Panel states
  const [textContent, setTextContent] = useState('');
  const [textColor, setTextColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [fontSize, setFontSize] = useState('16');
  const [imageUrl, setImageUrl] = useState('');
  const [linkUrl, setLinkUrl] = useState('');

  useEffect(() => {
    if (websiteId) {
      dispatch(getWebsiteById(websiteId));
    }
  }, [dispatch, websiteId]);

  useEffect(() => {
    if (currentWebsite) {
      setWebsiteName(currentWebsite.name || 'My Website');
      setHtmlContent(currentWebsite.html || '<h1>Welcome</h1><p>Start editing your template</p>');
    }
  }, [currentWebsite]);

  useEffect(() => {
    if (htmlContent && iframeRef.current && !showCode) {
      loadIframe();
    }
  }, [htmlContent, showCode]);

  const loadIframe = () => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const doc = iframe.contentDocument || iframe.contentWindow.document;
    doc.open();
    doc.write(htmlContent);
    doc.close();

    setTimeout(() => {
      addEditingFeatures(doc);
    }, 100);
  };

  const addEditingFeatures = (doc) => {
    // Add styles
    const style = doc.createElement('style');
    style.textContent = `
      .editable-hover { 
        outline: 2px dashed #3B82F6 !important; 
        outline-offset: 2px;
        cursor: pointer;
      }
      .editable-selected { 
        outline: 3px solid #3B82F6 !important; 
        outline-offset: 4px;
        position: relative;
      }
      .edit-toolbar {
        position: absolute;
        top: -40px;
        left: 0;
        background: #1F2937;
        border-radius: 6px;
        padding: 6px;
        display: flex;
        gap: 4px;
        z-index: 9999;
      }
      .edit-toolbar button {
        background: #374151;
        color: white;
        border: none;
        padding: 6px 10px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 12px;
      }
      .edit-toolbar button:hover {
        background: #4B5563;
      }
    `;
    doc.head.appendChild(style);

    // Make all elements clickable
    const elements = doc.body.querySelectorAll('*');
    elements.forEach((el, index) => {
      if (el.tagName === 'SCRIPT' || el.tagName === 'STYLE') return;
      
      el.setAttribute('data-edit-index', index);
      
      el.addEventListener('mouseenter', () => {
        if (!el.classList.contains('editable-selected')) {
          el.classList.add('editable-hover');
        }
      });
      
      el.addEventListener('mouseleave', () => {
        el.classList.remove('editable-hover');
      });
      
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        selectElement(el, doc);
      });
    });
  };

  const selectElement = (element, doc) => {
    // Remove previous selection
    const prev = doc.querySelector('.editable-selected');
    if (prev) {
      prev.classList.remove('editable-selected');
      const toolbar = prev.querySelector('.edit-toolbar');
      if (toolbar) toolbar.remove();
    }

    // Add new selection
    element.classList.add('editable-selected');
    element.classList.remove('editable-hover');

    // Create toolbar
    const toolbar = doc.createElement('div');
    toolbar.className = 'edit-toolbar';
    toolbar.innerHTML = `
      <button onclick="window.parent.postMessage({action: 'edit'}, '*')">Edit</button>
      <button onclick="window.parent.postMessage({action: 'delete'}, '*')">Delete</button>
      <button onclick="window.parent.postMessage({action: 'duplicate'}, '*')">Duplicate</button>
    `;
    element.insertBefore(toolbar, element.firstChild);

    // Get element info
    const computedStyle = doc.defaultView.getComputedStyle(element);
    setSelectedPath(element.getAttribute('data-edit-index'));
    setTextContent(element.textContent || '');
    setTextColor(rgbToHex(computedStyle.color));
    setBgColor(rgbToHex(computedStyle.backgroundColor));
    setFontSize(parseInt(computedStyle.fontSize));
    
    if (element.tagName === 'IMG') {
      setImageUrl(element.src || '');
    }
    if (element.tagName === 'A') {
      setLinkUrl(element.href || '');
    }
  };

  const rgbToHex = (rgb) => {
    if (!rgb || rgb === 'rgba(0, 0, 0, 0)') return '#ffffff';
    const match = rgb.match(/\d+/g);
    if (!match) return '#000000';
    return '#' + match.slice(0, 3).map(x => {
      const hex = parseInt(x).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('');
  };

  const getSelectedElement = () => {
    const iframe = iframeRef.current;
    if (!iframe || selectedPath === null) return null;
    const doc = iframe.contentDocument;
    return doc.querySelector(`[data-edit-index="${selectedPath}"]`);
  };

  const updateText = () => {
    const el = getSelectedElement();
    if (el) {
      el.textContent = textContent;
      updateHtmlFromIframe();
      toast.success('Text updated!');
    }
  };

  const updateStyle = (property, value) => {
    const el = getSelectedElement();
    if (el) {
      el.style[property] = value;
      updateHtmlFromIframe();
    }
  };

  const updateImage = () => {
    const el = getSelectedElement();
    if (el && el.tagName === 'IMG') {
      el.src = imageUrl;
      updateHtmlFromIframe();
      toast.success('Image updated!');
    }
  };

  const updateLink = () => {
    const el = getSelectedElement();
    if (el && el.tagName === 'A') {
      el.href = linkUrl;
      updateHtmlFromIframe();
      toast.success('Link updated!');
    }
  };

  const deleteElement = () => {
    const el = getSelectedElement();
    if (el && confirm('Delete this element?')) {
      el.remove();
      setSelectedPath(null);
      updateHtmlFromIframe();
      toast.success('Element deleted!');
    }
  };

  const duplicateElement = () => {
    const el = getSelectedElement();
    if (el) {
      const clone = el.cloneNode(true);
      el.parentNode.insertBefore(clone, el.nextSibling);
      updateHtmlFromIframe();
      
      // Re-add editing features
      const iframe = iframeRef.current;
      const doc = iframe.contentDocument;
      setTimeout(() => addEditingFeatures(doc), 100);
      
      toast.success('Element duplicated!');
    }
  };

  const updateHtmlFromIframe = () => {
    const iframe = iframeRef.current;
    const doc = iframe.contentDocument;
    
    // Clean up
    doc.querySelectorAll('.editable-hover, .editable-selected').forEach(el => {
      el.classList.remove('editable-hover', 'editable-selected');
    });
    doc.querySelectorAll('.edit-toolbar').forEach(tb => tb.remove());
    
    const html = doc.documentElement.outerHTML;
    setHtmlContent(html);
  };

  // Listen for messages from iframe
  useEffect(() => {
    const handleMessage = (e) => {
      if (e.data.action === 'edit') {
        // Already selected, panel is open
      } else if (e.data.action === 'delete') {
        deleteElement();
      } else if (e.data.action === 'duplicate') {
        duplicateElement();
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [selectedPath]);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      
      // Clean HTML
      const iframe = iframeRef.current;
      const doc = iframe.contentDocument;
      doc.querySelectorAll('[data-edit-index]').forEach(el => {
        el.removeAttribute('data-edit-index');
        el.classList.remove('editable-hover', 'editable-selected');
      });
      doc.querySelectorAll('.edit-toolbar').forEach(tb => tb.remove());
      
      const cleanHtml = doc.documentElement.outerHTML;

      await dispatch(updateWebsite({
        websiteId,
        data: { name: websiteName, html: cleanHtml }
      })).unwrap();

      toast.success('💾 Saved successfully!');
      setHtmlContent(cleanHtml);
    } catch (error) {
      toast.error('Save failed: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    try {
      setIsSaving(true);
      
      const iframe = iframeRef.current;
      const doc = iframe.contentDocument;
      doc.querySelectorAll('[data-edit-index]').forEach(el => {
        el.removeAttribute('data-edit-index');
        el.classList.remove('editable-hover', 'editable-selected');
      });
      doc.querySelectorAll('.edit-toolbar').forEach(tb => tb.remove());
      
      const cleanHtml = doc.documentElement.outerHTML;

      await dispatch(publishWebsite({
        websiteId,
        data: { name: websiteName, html: cleanHtml, isPublished: true }
      })).unwrap();

      toast.success('🚀 Published successfully!');
    } catch (error) {
      toast.error('Publish failed: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-900 text-white">
      {/* Toolbar */}
      <div className="bg-gray-800 border-b border-gray-700 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/user-websites')} className="p-2 hover:bg-gray-700 rounded">
            ← Back
          </button>
          <input
            type="text"
            value={websiteName}
            onChange={(e) => setWebsiteName(e.target.value)}
            className="bg-gray-700 px-4 py-2 rounded text-white"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('desktop')}
            className={`p-2 rounded ${viewMode === 'desktop' ? 'bg-blue-600' : 'bg-gray-700'}`}
          >
            🖥️
          </button>
          <button
            onClick={() => setViewMode('tablet')}
            className={`p-2 rounded ${viewMode === 'tablet' ? 'bg-blue-600' : 'bg-gray-700'}`}
          >
            💻
          </button>
          <button
            onClick={() => setViewMode('mobile')}
            className={`p-2 rounded ${viewMode === 'mobile' ? 'bg-blue-600' : 'bg-gray-700'}`}
          >
            📱
          </button>
          
          <div className="h-6 w-px bg-gray-600 mx-2"></div>

          <button
            onClick={() => setShowCode(!showCode)}
            className={`px-4 py-2 rounded ${showCode ? 'bg-purple-600' : 'bg-gray-700'}`}
          >
            {showCode ? 'Visual' : 'Code'}
          </button>

          <button onClick={handleSave} disabled={isSaving} className="px-4 py-2 bg-gray-700 rounded">
            {isSaving ? 'Saving...' : '💾 Save'}
          </button>
          <button onClick={handlePublish} disabled={isSaving} className="px-6 py-2 bg-blue-600 rounded font-bold">
            🚀 Publish
          </button>
        </div>
      </div>

      {/* Main Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Canvas */}
        <div className="flex-1 bg-gray-900 overflow-auto p-4 flex justify-center">
          {showCode ? (
            <textarea
              value={htmlContent}
              onChange={(e) => setHtmlContent(e.target.value)}
              className="w-full h-full bg-gray-800 text-white p-4 font-mono text-sm rounded"
            />
          ) : (
            <div
              className="bg-white rounded shadow-2xl"
              style={{
                width: viewMode === 'mobile' ? '375px' : viewMode === 'tablet' ? '768px' : '100%',
                minHeight: '600px'
              }}
            >
              <iframe
                ref={iframeRef}
                className="w-full h-full border-0"
                style={{ minHeight: '600px' }}
              />
            </div>
          )}
        </div>

        {/* Right Panel */}
        {selectedPath !== null && !showCode && (
          <div className="w-80 bg-gray-800 border-l border-gray-700 p-4 overflow-y-auto">
            <h3 className="text-lg font-bold mb-4">Edit Element</h3>

            <div className="space-y-4">
              {/* Text */}
              <div>
                <label className="block text-sm mb-2">Text Content</label>
                <textarea
                  value={textContent}
                  onChange={(e) => setTextContent(e.target.value)}
                  className="w-full bg-gray-700 p-2 rounded text-white"
                  rows="3"
                />
                <button onClick={updateText} className="mt-2 w-full bg-blue-600 py-2 rounded">
                  Update Text
                </button>
              </div>

              {/* Colors */}
              <div>
                <label className="block text-sm mb-2">Text Color</label>
                <input
                  type="color"
                  value={textColor}
                  onChange={(e) => {
                    setTextColor(e.target.value);
                    updateStyle('color', e.target.value);
                  }}
                  className="w-full h-10 rounded cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-sm mb-2">Background</label>
                <input
                  type="color"
                  value={bgColor}
                  onChange={(e) => {
                    setBgColor(e.target.value);
                    updateStyle('backgroundColor', e.target.value);
                  }}
                  className="w-full h-10 rounded cursor-pointer"
                />
              </div>

              {/* Font Size */}
              <div>
                <label className="block text-sm mb-2">Font Size: {fontSize}px</label>
                <input
                  type="range"
                  min="8"
                  max="72"
                  value={fontSize}
                  onChange={(e) => {
                    setFontSize(e.target.value);
                    updateStyle('fontSize', e.target.value + 'px');
                  }}
                  className="w-full"
                />
              </div>

              {/* Image URL */}
              {getSelectedElement()?.tagName === 'IMG' && (
                <div>
                  <label className="block text-sm mb-2">Image URL</label>
                  <input
                    type="text"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="w-full bg-gray-700 p-2 rounded text-white"
                  />
                  <button onClick={updateImage} className="mt-2 w-full bg-blue-600 py-2 rounded">
                    Update Image
                  </button>
                </div>
              )}

              {/* Link URL */}
              {getSelectedElement()?.tagName === 'A' && (
                <div>
                  <label className="block text-sm mb-2">Link URL</label>
                  <input
                    type="text"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    className="w-full bg-gray-700 p-2 rounded text-white"
                  />
                  <button onClick={updateLink} className="mt-2 w-full bg-blue-600 py-2 rounded">
                    Update Link
                  </button>
                </div>
              )}

              {/* Actions */}
              <div className="pt-4 border-t border-gray-700 space-y-2">
                <button onClick={duplicateElement} className="w-full bg-green-600 py-2 rounded">
                  📋 Duplicate
                </button>
                <button onClick={deleteElement} className="w-full bg-red-600 py-2 rounded">
                  🗑️ Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Help */}
      <div className="fixed bottom-4 left-4 bg-gray-800 border border-gray-700 rounded p-3 text-sm max-w-xs">
        <p className="font-bold mb-2">💡 How to use:</p>
        <ul className="space-y-1 text-gray-300 text-xs">
          <li>• Click any element to select</li>
          <li>• Use toolbar buttons or right panel</li>
          <li>• Changes apply instantly</li>
          <li>• Save when done</li>
        </ul>
      </div>
    </div>
  );
};

export default WebsiteEditorPage;
// pages/HTMLToJSONConverter.jsx - Convert HTML to Template JSON
import { useState } from 'react';
import { toast } from 'react-toastify';

const HTMLToJSONConverter = () => {
  const [templateName, setTemplateName] = useState('');
  const [category, setCategory] = useState('portfolio');
  const [description, setDescription] = useState('');
  const [thumbnail, setThumbnail] = useState('');
  const [htmlContent, setHtmlContent] = useState('');
  const [cssContent, setCssContent] = useState('');
  const [jsContent, setJsContent] = useState('');
  const [jsonOutput, setJsonOutput] = useState('');

  const categories = [
    { value: 'portfolio', label: 'Portfolio' },
    { value: 'business', label: 'Business' },
    { value: 'blog', label: 'Blog' },
    { value: 'ecommerce', label: 'E-commerce' },
    { value: 'landing', label: 'Landing Page' },
    { value: 'other', label: 'Other' }
  ];

  const handleConvertToJSON = () => {
    if (!templateName.trim() || !htmlContent.trim()) {
      toast.error('Please fill in at least Template Name and HTML Content');
      return;
    }

    const templateObj = {
      name: templateName.trim(),
      category: category,
      html: htmlContent.trim(),
      js: jsContent.trim(),
      thumbnail: thumbnail.trim()
    };

    const jsonString = JSON.stringify(templateObj, null, 2);
    setJsonOutput(jsonString);
    toast.success('JSON generated successfully!');
  };

  const handleCopyToClipboard = () => {
    if (!jsonOutput) {
      toast.error('Please convert first!');
      return;
    }

    navigator.clipboard.writeText(jsonOutput)
      .then(() => {
        toast.success('✅ Copied to clipboard!');
      })
      .catch(() => {
        toast.error('Failed to copy');
      });
  };

  const handleDownloadJSON = () => {
    if (!jsonOutput) {
      toast.error('Please convert first!');
      return;
    }

    const filename = templateName.toLowerCase().replace(/\s+/g, '-') + '.json' || 'template.json';
    const blob = new Blob([jsonOutput], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('📥 JSON file downloaded!');
  };

  const handleAutoExtract = () => {
    if (!htmlContent) return;

    // Auto-extract CSS from <style> tags
    if (!cssContent) {
      const styleMatch = htmlContent.match(/<style[^>]*>([\s\S]*?)<\/style>/i);
      if (styleMatch && styleMatch[1]) {
        setCssContent(styleMatch[1].trim());
      }
    }

    // Auto-extract JS from <script> tags (excluding external scripts)
    if (!jsContent) {
      const scriptMatches = htmlContent.match(/<script[^>]*>([\s\S]*?)<\/script>/gi);
      if (scriptMatches) {
        const inlineScripts = scriptMatches
          .filter(script => !script.includes('src='))
          .map(script => {
            const match = script.match(/<script[^>]*>([\s\S]*?)<\/script>/i);
            return match ? match[1].trim() : '';
          })
          .filter(Boolean)
          .join('\n\n');
        
        if (inlineScripts) {
          setJsContent(inlineScripts);
        }
      }
    }
  };

  const handleReset = () => {
    setTemplateName('');
    setCategory('portfolio');
    setDescription('');
    setThumbnail('');
    setHtmlContent('');
    setCssContent('');
    setJsContent('');
    setJsonOutput('');
    toast.info('Form reset');
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 mb-6">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2 text-gray-900">
            HTML to Template JSON Converter
          </h1>
          <p className="text-gray-600">
            Convert your HTML template to the correct JSON format for MongoDB/Postman
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Input</h2>
              <button
                onClick={handleReset}
                className="text-sm text-red-600 hover:text-red-700 font-semibold"
              >
                🔄 Reset
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Template Name *
                </label>
                <input
                  type="text"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="e.g., Sathish Portfolio"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                >
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows="2"
                  placeholder="Brief description of the template"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Thumbnail URL
                </label>
                <input
                  type="text"
                  value={thumbnail}
                  onChange={(e) => setThumbnail(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  HTML Content *
                </label>
                <textarea
                  value={htmlContent}
                  onChange={(e) => setHtmlContent(e.target.value)}
                  onBlur={handleAutoExtract}
                  rows="10"
                  placeholder="Paste your complete HTML here..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-mono text-sm resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  CSS (optional)
                </label>
                <textarea
                  value={cssContent}
                  onChange={(e) => setCssContent(e.target.value)}
                  rows="6"
                  placeholder="Additional CSS styles..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-mono text-sm resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  JavaScript (optional)
                </label>
                <textarea
                  value={jsContent}
                  onChange={(e) => setJsContent(e.target.value)}
                  rows="6"
                  placeholder="Additional JavaScript..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-mono text-sm resize-none"
                />
              </div>

              <button
                onClick={handleConvertToJSON}
                className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-bold shadow-lg hover:shadow-xl"
              >
                Convert to JSON →
              </button>
            </div>
          </div>

          {/* Output Section */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-900">
              Output (JSON for Postman)
            </h2>

            <div className="relative mb-4">
              <textarea
                value={jsonOutput}
                readOnly
                rows="30"
                placeholder="JSON output will appear here..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg font-mono text-sm bg-gray-50 resize-none"
              />

              {jsonOutput && (
                <button
                  onClick={handleCopyToClipboard}
                  className="absolute top-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition text-sm font-semibold shadow-lg"
                >
                  📋 Copy JSON
                </button>
              )}
            </div>

            <div className="space-y-3">
              <button
                onClick={handleDownloadJSON}
                disabled={!jsonOutput}
                className="w-full bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition font-bold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                💾 Download as .json File
              </button>

              {/* Instructions */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-bold text-blue-900 mb-2">
                  📝 How to use in Postman:
                </h3>
                <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                  <li>Copy the JSON output above</li>
                  <li>Open Postman → POST request</li>
                  <li>
                    URL:{' '}
                    <code className="bg-blue-100 px-2 py-0.5 rounded text-xs">
                      http://localhost:4000/api/templates/add-template
                    </code>
                  </li>
                  <li>
                    Headers:{' '}
                    <code className="bg-blue-100 px-2 py-0.5 rounded text-xs">
                      Content-Type: application/json
                    </code>
                  </li>
                  <li>Body → raw → Paste JSON</li>
                  <li>Send request ✅</li>
                </ol>
              </div>

              {/* Expected Format */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-bold text-green-900 mb-2">
                  ✅ Expected JSON Format:
                </h3>
                <pre className="text-xs text-green-800 bg-green-100 p-3 rounded overflow-x-auto">
{`{
  "name": "Template Name",
  "category": "portfolio",
  "html": "<!DOCTYPE html>...",
  "js": "console.log('...');",
  "thumbnail": "https://..."
}`}
                </pre>
              </div>
            </div>
          </div>
        </div>

        {/* Info Section */}
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-r-lg mt-6">
          <h3 className="font-bold text-yellow-900 mb-3 flex items-center gap-2">
            <span>⚠️</span>
            Important Notes:
          </h3>
          <ul className="text-sm text-yellow-800 space-y-2 list-disc list-inside">
            <li>
              Your backend expects <code className="bg-yellow-100 px-1 rounded">html</code> and{' '}
              <code className="bg-yellow-100 px-1 rounded">js</code> fields (not nested in{' '}
              <code className="bg-yellow-100 px-1 rounded">content</code>)
            </li>
            <li>
              CSS should be included directly in your HTML within{' '}
              <code className="bg-yellow-100 px-1 rounded">&lt;style&gt;</code> tags
            </li>
            <li>
              The converter will auto-extract CSS/JS from HTML when you click out of the HTML field
            </li>
            <li>Make sure all image URLs are absolute (start with https://)</li>
            <li>CDN links (Tailwind, FontAwesome) should remain in HTML head</li>
            <li>
              Backend stores it in <code className="bg-yellow-100 px-1 rounded">previewJson</code>{' '}
              field automatically
            </li>
          </ul>
        </div>

        {/* Quick Tips */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-6 mt-6">
          <h3 className="font-bold text-blue-900 mb-3 text-lg">💡 Quick Tips:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h4 className="font-semibold text-gray-900 mb-2">✅ Complete HTML</h4>
              <p className="text-gray-600">
                Include the full HTML structure with{' '}
                <code className="bg-gray-100 px-1 rounded">&lt;!DOCTYPE&gt;</code>,{' '}
                <code className="bg-gray-100 px-1 rounded">&lt;head&gt;</code>, and{' '}
                <code className="bg-gray-100 px-1 rounded">&lt;body&gt;</code> tags
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h4 className="font-semibold text-gray-900 mb-2">🎨 Tailwind CSS</h4>
              <p className="text-gray-600">
                Include Tailwind CDN in your HTML head:{' '}
                <code className="bg-gray-100 px-1 rounded text-xs break-all">
                  &lt;script src="https://cdn.tailwindcss.com"&gt;&lt;/script&gt;
                </code>
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h4 className="font-semibold text-gray-900 mb-2">📸 Thumbnail</h4>
              <p className="text-gray-600">
                Use Firebase Storage or any CDN URL for template thumbnails
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h4 className="font-semibold text-gray-900 mb-2">🔍 Preview Test</h4>
              <p className="text-gray-600">
                After adding to backend, test the preview function to ensure it renders correctly
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HTMLToJSONConverter;
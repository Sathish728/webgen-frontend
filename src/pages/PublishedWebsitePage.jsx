// pages/PublishedWebsitePage.jsx
import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getPublishedWebsite } from '../slice/websiteSlice';

const PublishedWebsitePage = () => {
  const { slug } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { publishedWebsite, isLoading, error } = useSelector(
    (state) => state.website
  );

  // Load published website (public route)
  useEffect(() => {
    if (slug) {
      dispatch(getPublishedWebsite(slug));
    }
  }, [slug, dispatch]);

  // Inject Tailwind/CSS/JS when site loads
  useEffect(() => {
    if (!publishedWebsite) return;

    // Tailwind CDN
    if (!document.getElementById('tailwind-cdn')) {
      const script = document.createElement('script');
      script.id = 'tailwind-cdn';
      script.src = 'https://cdn.tailwindcss.com';
      document.head.appendChild(script);
    }

    // Custom CSS
    if (publishedWebsite.css) {
      let styleTag = document.getElementById('published-website-styles');
      if (!styleTag) {
        styleTag = document.createElement('style');
        styleTag.id = 'published-website-styles';
        document.head.appendChild(styleTag);
      }
      styleTag.textContent = publishedWebsite.css;
    }

    // Custom JS (run carefully)
    if (publishedWebsite.js) {
      try {
        const runJs = new Function(publishedWebsite.js);
        runJs();
      } catch (err) {
        console.error('Error executing site JS:', err);
      }
    }

    return () => {
      const styleTag = document.getElementById('published-website-styles');
      if (styleTag) styleTag.remove();
    };
  }, [publishedWebsite]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-gray-700">Loading website...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
        <div className="text-center max-w-md w-full p-8 bg-white rounded-lg shadow-lg">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Website Not Found</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button onClick={() => navigate('/')} className="bg-blue-600 text-white px-6 py-3 rounded-lg">
            Go Home
          </button>
        </div>
      </div>
    );
  }

  if (!publishedWebsite) return null;

  // Use server-supplied flag (no client-side check)
  const isActive = !!publishedWebsite.hasActiveSubscription;

  if (!isActive) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <div className="p-8 bg-white rounded-xl shadow-md text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Subscription Required</h1>
          <p className="text-gray-600">Please renew your subscription to view this website.</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="published-website-content"
      dangerouslySetInnerHTML={{ __html: publishedWebsite.html || '' }}
    />
  );
};

export default PublishedWebsitePage;

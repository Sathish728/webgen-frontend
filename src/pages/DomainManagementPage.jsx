// pages/DomainManagementPage.jsx - Manage Custom Domain
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getWebsiteById,
  setCustomDomain,
  verifyCustomDomain,
  clearError,
  clearMessage,
  clearDomainVerification
} from '../slice/websiteSlice';
import { toast } from 'react-toastify';

const DomainManagementPage = () => {
  const { websiteId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { 
    currentWebsite, 
    domainVerification, 
    isLoading, 
    isVerifying, 
    error, 
    message 
  } = useSelector((state) => state.website);

  const [domain, setDomain] = useState('');
  const [showInstructions, setShowInstructions] = useState(false);

  useEffect(() => {
    if (websiteId) {
      dispatch(getWebsiteById(websiteId));
    }
  }, [dispatch, websiteId]);

  useEffect(() => {
    if (currentWebsite) {
      setDomain(currentWebsite.customDomain || '');
      if (currentWebsite.customDomain && !currentWebsite.isCustomDomainVerified) {
        setShowInstructions(true);
      }
    }
  }, [currentWebsite]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
    if (message) {
      toast.success(message);
      dispatch(clearMessage());
    }
  }, [error, message, dispatch]);

  const handleSetDomain = async (e) => {
    e.preventDefault();

    if (!domain) {
      toast.error('Please enter a domain');
      return;
    }

    // Validate domain format
    const domainRegex = /^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/;
    if (!domainRegex.test(domain.toLowerCase())) {
      toast.error('Invalid domain format. Example: yourdomain.com');
      return;
    }

    try {
      await dispatch(setCustomDomain({ websiteId, domain }));
      setShowInstructions(true);
      dispatch(getWebsiteById(websiteId));
    } catch (error) {
      toast.error('Failed to set custom domain');
    }
  };

  const handleVerifyDomain = async () => {
    if (!currentWebsite?.customDomain) {
      toast.error('No domain set');
      return;
    }

    try {
      await dispatch(verifyCustomDomain({
        domain: currentWebsite.customDomain,
        siteid: websiteId
      }));
      
      // Refresh website data
      setTimeout(() => {
        dispatch(getWebsiteById(websiteId));
      }, 2000);
    } catch (error) {
      toast.error('Domain verification failed');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!currentWebsite) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Website not found</p>
          <button
            onClick={() => navigate('/user-websites')}
            className="mt-4 text-blue-600 hover:underline"
          >
            Go back to websites
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-8">
          <button
            onClick={() => navigate('/user-websites')}
            className="text-blue-600 hover:underline mb-4 flex items-center"
          >
            ← Back to Websites
          </button>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Custom Domain Settings
          </h1>
          <p className="text-gray-600">
            Connect your own domain to {currentWebsite.name}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Current Status */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Current Status</h2>
          
          {currentWebsite.customDomain ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <div className="text-sm text-gray-600">Custom Domain</div>
                  <div className="text-lg font-semibold">{currentWebsite.customDomain}</div>
                </div>
                <div>
                  {currentWebsite.isCustomDomainVerified ? (
                    <span className="px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                      ✓ Verified
                    </span>
                  ) : (
                    <span className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                      ⚠ Pending Verification
                    </span>
                  )}
                </div>
              </div>

              {!currentWebsite.isCustomDomainVerified && (
                <button
                  onClick={handleVerifyDomain}
                  disabled={isVerifying}
                  className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {isVerifying ? 'Verifying...' : 'Verify Domain Now'}
                </button>
              )}

              {domainVerification && (
                <div className={`p-4 rounded-lg ${
                  domainVerification.verified 
                    ? 'bg-green-50 border border-green-200' 
                    : 'bg-red-50 border border-red-200'
                }`}>
                  <p className={domainVerification.verified ? 'text-green-800' : 'text-red-800'}>
                    {domainVerification.message || 
                      (domainVerification.verified ? 'Domain verified successfully!' : 'Domain verification failed')}
                  </p>
                  {!domainVerification.verified && domainVerification.txtVerified !== undefined && (
                    <p className="text-sm mt-2">
                      TXT Record: {domainVerification.txtVerified ? '✓' : '✗'}
                    </p>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <svg
                className="mx-auto h-12 w-12 text-gray-400 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                />
              </svg>
              <p className="text-gray-600">No custom domain set</p>
              <p className="text-sm text-gray-500 mt-2">
                Your website is currently accessible at: /{currentWebsite.slug}
              </p>
            </div>
          )}
        </div>

        {/* Set/Update Domain Form */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">
            {currentWebsite.customDomain ? 'Update' : 'Set'} Custom Domain
          </h2>
          
          <form onSubmit={handleSetDomain} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Domain Name
              </label>
              <input
                type="text"
                value={domain}
                onChange={(e) => setDomain(e.target.value.toLowerCase().trim())}
                placeholder="yourdomain.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-2">
                Enter your domain without http:// or www
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              {isLoading ? 'Saving...' : 'Save Domain'}
            </button>
          </form>
        </div>

        {/* DNS Instructions */}
        {showInstructions && currentWebsite.customDomain && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">DNS Configuration</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2">Step 1: Add TXT Record</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Add this TXT record to your domain's DNS settings:
                </p>
                <div className="bg-gray-50 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                  <div className="grid grid-cols-3 gap-4 mb-2 font-semibold">
                    <div>Type</div>
                    <div>Name</div>
                    <div>Value</div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>TXT</div>
                    <div>_verify.{currentWebsite.customDomain}</div>
                    <div>siteid-{websiteId}</div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Step 2: Point Domain to Our Server</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Add an A record or CNAME record:
                </p>
                <div className="bg-gray-50 p-4 rounded-lg font-mono text-sm">
                  <div className="mb-3">
                    <div className="font-semibold mb-1">Option A: A Record</div>
                    <div>Type: A</div>
                    <div>Name: @ (or your domain)</div>
                    <div>Value: Your_Server_IP</div>
                  </div>
                  <div>
                    <div className="font-semibold mb-1">Option B: CNAME Record</div>
                    <div>Type: CNAME</div>
                    <div>Name: www</div>
                    <div>Value: yourdomain.com</div>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">⏱ DNS Propagation</h4>
                <p className="text-sm text-blue-800">
                  DNS changes can take up to 24-48 hours to propagate worldwide. 
                  You can verify your domain once the DNS records are set up.
                </p>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-semibold text-yellow-900 mb-2">📝 Note</h4>
                <p className="text-sm text-yellow-800">
                  Make sure you have an active subscription before connecting your custom domain. 
                  The domain will only work with an active subscription.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DomainManagementPage;
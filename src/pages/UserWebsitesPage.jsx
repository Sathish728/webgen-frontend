// pages/UserWebsitesPage.jsx - Updated with Subscription Indicators
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  getUserWebsites,
  deleteWebsite,
  clearError,
  clearMessage
} from '../slice/websiteSlice';
import { toast } from 'react-toastify';

const UserWebsitesPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user } = useSelector((state) => state.auth);
  const { websites, isLoading, pagination, error, message } = useSelector((state) => state.website);

  const [currentPage, setCurrentPage] = useState(1);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    if (user) {
      dispatch(getUserWebsites({ userId: user._id, page: currentPage, limit: 20 }));
    }
  }, [dispatch, user, currentPage]);

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

  const handleEdit = (websiteId) => {
    navigate(`/editor/${websiteId}`);
  };

  const handleDelete = async (websiteId) => {
    try {
      await dispatch(deleteWebsite(websiteId)).unwrap();
      setDeleteConfirm(null);
      toast.success('Website deleted successfully');
      dispatch(getUserWebsites({ userId: user._id, page: currentPage, limit: 20 }));
    } catch (error) {
      toast.error('Failed to delete website');
    }
  };

  const handleViewWebsite = (website) => {
    if (website.isPublished) {
      if (website.customDomain && website.isCustomDomainVerified) {
        window.open(`https://${website.customDomain}`, '_blank');
      } else {
        window.open(`/site/${website.slug}`, '_blank');
      }
    } else {
      toast.info('Website is not published yet');
    }
  };

  const handleManageDomain = (websiteId, hasSubscription) => {
    if (!hasSubscription) {
      toast.warning('Active subscription required to manage custom domain');
      navigate(`/subscription/${websiteId}`);
    } else {
      navigate(`/domain/${websiteId}`);
    }
  };

  const handleManageSubscription = (websiteId) => {
    navigate(`/subscription/${websiteId}`);
  };

  const handlePublish = (websiteId, hasSubscription) => {
    if (!hasSubscription) {
      toast.warning('Active subscription required to publish website');
      navigate(`/subscription/${websiteId}`);
    } else {
      navigate(`/editor/${websiteId}?action=publish`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                My Websites
              </h1>
              <p className="text-gray-600">
                Manage your websites and domains
              </p>
            </div>
            <button
              onClick={() => navigate('/templates')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-medium"
            >
              + Create New Website
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
                <div className="h-48 bg-gray-200"></div>
                <div className="p-6 space-y-3">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : websites.length === 0 ? (
          <div className="text-center py-20">
            <svg
              className="mx-auto h-16 w-16 text-gray-400 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No websites yet
            </h3>
            <p className="text-gray-600 mb-6">
              Create your first website to get started
            </p>
            <button
              onClick={() => navigate('/templates')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-medium"
            >
              Browse Templates
            </button>
          </div>
        ) : (
          <>
            {/* Websites Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {websites.map((website) => (
                <div
                  key={website._id}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition"
                >
                  {/* Website Thumbnail */}
                  <div
                    className="relative h-48 bg-gray-200 cursor-pointer"
                    onClick={() => handleViewWebsite(website)}
                  >
                    {website.thumbnail ? (
                      <img
                        src={website.thumbnail}
                        alt={website.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
                        <span className="text-white text-4xl">🌐</span>
                      </div>
                    )}

                    {/* Status Badges */}
                    <div className="absolute top-4 right-4 flex flex-col gap-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          website.isPublished
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {website.isPublished ? '✓ Published' : '○ Draft'}
                      </span>
                      
                      {/* Subscription Badge */}
                      {website.hasActiveSubscription ? (
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          ⭐ Active
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          ⚠ No Sub
                        </span>
                      )}
                    </div>

                    {/* View Count */}
                    {website.viewCount > 0 && (
                      <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-xs">
                        👁 {website.viewCount} views
                      </div>
                    )}
                  </div>

                  {/* Website Info */}
                  <div className="p-6">
                    <h3 className="font-semibold text-gray-900 text-lg mb-2 truncate">
                      {website.name}
                    </h3>

                    {/* Domain Info */}
                    <div className="mb-4 space-y-1">
                      {website.customDomain ? (
                        <div className="flex items-center text-sm">
                          <span className="text-gray-600">Domain:</span>
                          <span className="ml-2 text-blue-600 truncate">
                            {website.customDomain}
                          </span>
                          {website.isCustomDomainVerified && (
                            <svg className="w-4 h-4 ml-1 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                      ) : (
                        <div className="text-sm text-gray-500">
                          Slug: /{website.slug}
                        </div>
                      )}
                      <div className="text-xs text-gray-400">
                        Updated {new Date(website.updatedAt).toLocaleDateString()}
                      </div>
                      
                      {/* Subscription Status */}
                      {website.subscription && (
                        <div className="text-xs text-gray-500">
                          Renews: {new Date(website.subscription.currentPeriodEnd).toLocaleDateString()}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => handleEdit(website._id)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleViewWebsite(website)}
                          disabled={!website.isPublished}
                          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          View
                        </button>
                      </div>

                      {/* Show publish button if not published and no subscription */}
                      {!website.isPublished && !website.hasActiveSubscription && (
                        <button
                          onClick={() => handlePublish(website._id, website.hasActiveSubscription)}
                          className="w-full px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition text-sm font-medium"
                        >
                          🔒 Publish (Requires Subscription)
                        </button>
                      )}

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => handleManageDomain(website._id, website.hasActiveSubscription)}
                          className={`px-4 py-2 rounded-lg transition text-sm font-medium ${
                            website.hasActiveSubscription
                              ? 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          }`}
                          title={!website.hasActiveSubscription ? 'Requires active subscription' : ''}
                        >
                          {website.hasActiveSubscription ? 'Domain' : '🔒 Domain'}
                        </button>
                        <button
                          onClick={() => handleManageSubscription(website._id)}
                          className={`px-4 py-2 rounded-lg transition text-sm font-medium ${
                            website.hasActiveSubscription
                              ? 'bg-green-100 text-green-700 hover:bg-green-200'
                              : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                          }`}
                        >
                          {website.hasActiveSubscription ? 'Manage' : 'Subscribe'}
                        </button>
                      </div>

                      <button
                        onClick={() => setDeleteConfirm(website)}
                        className="w-full px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition text-sm font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="mt-8 flex justify-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Previous
                </button>

                {[...Array(pagination.totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`px-4 py-2 rounded-lg border ${
                      currentPage === i + 1
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}

                <button
                  onClick={() => setCurrentPage(prev => Math.min(pagination.totalPages, prev + 1))}
                  disabled={currentPage === pagination.totalPages}
                  className="px-4 py-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4">Delete Website?</h3>
            <p className="text-gray-600 mb-2">
              Are you sure you want to delete "{deleteConfirm.name}"?
            </p>
            <p className="text-red-600 text-sm mb-6">
              ⚠️ This will also cancel any active subscriptions for this website. This action cannot be undone.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => handleDelete(deleteConfirm._id)}
                className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
              >
                Delete
              </button>
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserWebsitesPage;
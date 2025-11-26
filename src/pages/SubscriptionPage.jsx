import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { 
  checkSubscription, 
  createSubscription,
  cancelSubscription,
  reactivateSubscription 
} from '../slice/subscriptionSlice';

const SubscriptionPage = () => {
  const { websiteId } = useParams();
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { hasActiveSubscription, currentSubscription, loading, error } = useSelector(
    state => state.subscription
  );
  const [cancelLoading, setCancelLoading] = useState(false);

  useEffect(() => {
    if (user && websiteId) {
      dispatch(checkSubscription({ userId: user._id, websiteId }));
    }
  }, [dispatch, user, websiteId]);

  const handleSubscribe = async (priceId) => {
    try {
      const result = await dispatch(createSubscription({
        priceId: priceId,
        email: user.email,
        websiteId,
        userId: user._id
      })).unwrap();

      if (result?.data?.url) {
        window.location.href = result.data.url;
      }
    } catch (err) {
      alert('Failed to create subscription: ' + (err.message || 'Unknown error'));
    }
  };

  // const handleCancel = async (immediate = false) => {
  //   const message = immediate 
  //     ? 'Cancel subscription immediately? You will lose access right now and may be eligible for a refund.'
  //     : 'Cancel at period end? You can continue using the service until the end of your billing cycle.';
    
  //   if (!window.confirm(message)) return;

  //   setCancelLoading(true);
  //   try {
  //     const result = await dispatch(cancelSubscription({
  //       subscriptionId: currentSubscription.subscriptionId,
  //       userId: user._id,
  //       cancelImmediately: immediate
  //     })).unwrap();

  //     alert(result.message || 'Subscription canceled successfully');
      
  //     // Refresh subscription status
  //     dispatch(checkSubscription({ userId: user._id, websiteId }));
  //   } catch (err) {
  //     alert('Failed to cancel subscription: ' + (err.message || 'Unknown error'));
  //   } finally {
  //     setCancelLoading(false);
  //   }
  // };

  // SubscriptionPage.jsx - IMPROVED

const handleCancel = async (immediate = false) => {
  const message = immediate 
    ? 'Cancel subscription immediately? You will lose access right now.'
    : 'Cancel at period end? You can continue using until billing cycle ends.';
  
  if (!window.confirm(message)) return;

  setCancelLoading(true);
  
  try {
    console.log('Canceling subscription:', currentSubscription.subscriptionId);
    
    const result = await dispatch(cancelSubscription({
      subscriptionId: currentSubscription.subscriptionId,
      userId: user._id,
      cancelImmediately: immediate
    })).unwrap();

    console.log('Cancel result:', result);

    // Show success message
    alert(result.message || 'Subscription canceled successfully');
    
    // Refresh subscription status
    await dispatch(checkSubscription({ userId: user._id, websiteId }));
    
  } catch (err) {
    console.error('Cancel error:', err);
    alert('Failed to cancel subscription: ' + (err || 'Unknown error'));
  } finally {
    setCancelLoading(false);
  }
};
  const BASIC_PRICE_ID = "price_1Ru5oUSAuDC0KFi5PwnG4FX5";

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">
          Subscription Management
        </h1>

        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading subscription details...</p>
          </div>
        ) : hasActiveSubscription ? (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold mb-4">Active Subscription</h2>
            
            <div className="space-y-3 mb-6">
              <p className="text-lg">
                <span className="font-medium">Status:</span>{' '}
                <span className={`capitalize ${
                  currentSubscription?.status === 'active' ? 'text-green-600' : 'text-yellow-600'
                }`}>
                  {currentSubscription?.status}
                </span>
              </p>
              
              {currentSubscription?.cancelAtPeriodEnd && (
                <p className="text-yellow-600 font-medium">
                  ⚠️ Subscription will cancel on{' '}
                  {new Date(currentSubscription?.currentPeriodEnd).toLocaleDateString()}
                </p>
              )}
              
              {!currentSubscription?.cancelAtPeriodEnd && (
                <p className="text-gray-700">
                  Next billing date:{' '}
                  {new Date(currentSubscription?.currentPeriodEnd).toLocaleDateString()}
                </p>
              )}
            </div>

            {!currentSubscription?.cancelAtPeriodEnd && (
              <div className="flex gap-3">
                <button
                  onClick={() => handleCancel(false)}
                  disabled={cancelLoading}
                  className="bg-yellow-500 text-white px-6 py-2 rounded hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {cancelLoading ? 'Processing...' : 'Cancel at Period End'}
                </button>
                
                <button
                  onClick={() => handleCancel(true)}
                  disabled={cancelLoading}
                  className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {cancelLoading ? 'Processing...' : 'Cancel Immediately'}
                </button>
              </div>
            )}

            {currentSubscription?.cancelAtPeriodEnd && (
              <button
                onClick={() => dispatch(reactivateSubscription({
                  subscriptionId: currentSubscription.subscriptionId,
                  userId: user._id
                }))}
                className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
              >
                Reactivate Subscription
              </button>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold mb-6 text-center">Choose a Plan</h2>
            
            <div className="max-w-md mx-auto border-2 border-blue-200 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-2">Basic Plan</h3>
              <p className="text-3xl font-bold text-blue-600 mb-4">$9.99/month</p>
              
              <ul className="space-y-3 mb-6">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Custom Domain</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>SSL Certificate</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>24/7 Support</span>
                </li>
              </ul>
              
              <button
                onClick={() => handleSubscribe(BASIC_PRICE_ID)}
                className="w-full bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 font-semibold"
              >
                Subscribe Now
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubscriptionPage;
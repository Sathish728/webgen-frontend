import { LayoutTemplate, ShipWheelIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { forgotPassword, clearError, clearMessage } from '../slice/authSlice';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';

const ForgotPasswordPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');

  const { error, isLoading, message, isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }

    if (message) {
      toast.success(message);
      dispatch(clearMessage());
      // Navigate to reset password page after success
      setTimeout(() => {
        navigate('/reset-password', { state: { email } });
      }, 2000);
    }
  }, [error, message, dispatch, navigate, email]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Please enter your email');
      return;
    }

    dispatch(forgotPassword(email));
  };

  return (
    <div className='h-screen flex items-center justify-center p-4 md:p-6 sm:p-8 '>
      <div className='border border-primary/25 flex flex-col lg:flex-row w-full max-w-5xl mx-auto bg-base-100 rounded-xl shadow-lg overflow-hidden 
      scale-[0.75] origin-top transform '
      style={{ width: "118%", transformOrigin: "center" }}>
        
        {/* LEFT SIDE - Forgot Password Form */}
        <div className="w-full lg:w-1/2 p-4 sm:p-8 flex flex-col justify-center">
          
          {/* LOGO */}
          <div className="mb-4 flex items-center justify-start gap-2">
            <LayoutTemplate className="size-9 text-primary"/>
            <span className="text-3xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
              WEBGEN
            </span>
          </div>

          {/* Form */}
          <div className="w-full">
            <form onSubmit={handleSubmit}>
              <div className='space-y-6'>
                
                <div>
                  <h2 className='text-xl font-semibold'>Forgot Password?</h2>
                  <p className='text-sm opacity-70 mt-2'>
                    No worries! Enter your email address and we'll send you a code to reset your password.
                  </p>
                </div>

                {/* Email Input */}
                <div className='form-control w-full space-y-2'>
                  <label className='label'>
                    <span className='label-text'>Email Address</span>
                  </label>
                  <input 
                    type="email"
                    name='email'
                    placeholder='john@email.com'
                    className='input input-bordered w-full'
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                  <p className='text-xs opacity-70'>
                    Enter the email address associated with your account
                  </p>
                </div>

                <button 
                  type='submit'
                  className='btn btn-primary w-full'
                  disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <span className='loading loading-spinner loading-sm'></span>
                      Sending Code...
                    </>
                  ) : ('Send Reset Code')}
                </button>

                <div className='text-center mt-4 space-y-2'>
                  <p className='text-sm'>
                    Remember your password?{' '}
                    <Link to="/login" className='text-primary hover:underline'>
                      Sign In
                    </Link>
                  </p>
                  <p className='text-sm'>
                    Don't have an account?{' '}
                    <Link to="/signup" className='text-primary hover:underline'>
                      Create one
                    </Link>
                  </p>
                </div>

              </div>
            </form>
          </div>
        </div>

        {/* RIGHT SIDE - Illustration */}
        <div className="hidden lg:flex flex-row bg-base-200 w-1/2 p-4 sm:p-8 justify-center">
          <div className='max-w-md p-8 '>

            {/* Content */}
            <div className='text-center space-y-3 mt-6'>
              <h2 className='text-xl font-semibold'>
                Secure Password Recovery 🔒
              </h2>
              <p className='opacity-70'>
                We'll send you a secure 6-digit code to reset your password and get you back to learning.
              </p>
              <div className='mt-4 p-4 bg-base-100 rounded-lg'>
                <p className='text-sm opacity-70'>
                  💡 <strong>Tip:</strong> Check your spam folder if you don't see the email within a few minutes.
                </p>
              </div>
            </div>

             <div className='relative aspect-square max-w-sm mx-auto'>
              <img src="Assets/6.png" alt="language connection illustration" className='  w-full h-full z-0' />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ForgotPasswordPage;
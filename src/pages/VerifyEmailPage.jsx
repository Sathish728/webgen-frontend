import { LayoutTemplate, ShipWheelIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { verifyEmail, resendVerificationOTP, clearError, clearMessage } from '../slice/authSlice';
import { toast } from 'react-toastify';

const VerifyEmailPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const { error, isLoading, isAuthenticated, message, pendingVerificationEmail } = useSelector((state) => state.auth);
  
  // FIX: Ensure email is always a string
  const email = location.state?.email || pendingVerificationEmail || '';

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

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    // FIX: Check if email is a valid string
    if (!email || typeof email !== 'string' || email.trim() === '') {
      console.error('No valid email found, redirecting to signup');
      toast.error('Email not found. Please sign up again.');
      navigate('/signup', { replace: true });
    }
  }, [email, navigate]);

  // Resend timer
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [resendTimer]);

  const handleOtpChange = (index, value) => {
    if (isNaN(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`).focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`).focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    const newOtp = [...otp];
    
    for (let i = 0; i < pastedData.length; i++) {
      if (!isNaN(pastedData[i])) {
        newOtp[i] = pastedData[i];
      }
    }
    
    setOtp(newOtp);
    
    // Focus last filled input or next empty
    const lastFilledIndex = newOtp.findIndex(val => val === '');
    const focusIndex = lastFilledIndex === -1 ? 5 : lastFilledIndex;
    document.getElementById(`otp-${focusIndex}`)?.focus();
  };

  const handleVerify = (e) => {
    e.preventDefault();
    const otpCode = otp.join('');
    
    if (otpCode.length !== 6) {
      toast.error('Please enter complete OTP');
      return;
    }

    // FIX: Validate email before sending
    if (!email || typeof email !== 'string' || email.trim() === '') {
      toast.error('Invalid email. Please sign up again.');
      navigate('/signup', { replace: true });
      return;
    }

    console.log('Dispatching verifyEmail with:', { email, otp: otpCode });
    dispatch(verifyEmail({ email: email.trim(), otp: otpCode }));
  };

  const handleResend = () => {
    if (!canResend) return;
    
    // FIX: Validate email before resending
    if (!email || typeof email !== 'string' || email.trim() === '') {
      toast.error('Invalid email. Please sign up again.');
      navigate('/signup', { replace: true });
      return;
    }

    console.log('Resending OTP to:', email);
    dispatch(resendVerificationOTP(email.trim()));
    setResendTimer(60);
    setCanResend(false);
    setOtp(['', '', '', '', '', '']);
  };

  return (
    <div className='h-screen flex items-center justify-center p-4 md:p-6 sm:p-8'>
      <div className='border border-primary/25 flex flex-col lg:flex-row w-full max-w-5xl mx-auto bg-base-100 rounded-xl shadow-lg overflow-hidden scale-[0.85] origin-top transform 'style={{ width: "118%", transformOrigin: "center" }}>
        
        {/* LEFT SIDE - Verification Form */}
        <div className="w-full lg:w-1/2 p-4 sm:p-8 flex flex-col">
          
          {/* LOGO */}
          <div className="mb-4 flex items-center justify-start gap-2">
            <LayoutTemplate className="size-9 text-primary"/>
            <span className="text-3xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
              WEBGEB
            </span>
          </div>

          {/* Form */}
          <div className="w-full">
            <form onSubmit={handleVerify}>
              <div className='space-y-6'>
                
                <div>
                  <h2 className='text-xl font-semibold'>Verify Your Email</h2>
                  <p className='text-sm opacity-70 mt-2'>
                    We've sent a 6-digit verification code to
                  </p>
                  <p className='text-sm font-semibold text-primary mt-1'>
                    {email || 'your email'}
                  </p>
                </div>

                {/* OTP Input */}
                <div className='flex flex-col gap-3'>
                  <label className='label'>
                    <span className='label-text'>Enter Verification Code</span>
                  </label>
                  
                  <div className='flex gap-2 justify-center'>
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        id={`otp-${index}`}
                        type='text'
                        maxLength='1'
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        onPaste={handlePaste}
                        className='input input-bordered w-12 h-12 text-center text-lg font-bold'
                        disabled={isLoading}
                        autoFocus={index === 0}
                      />
                    ))}
                  </div>

                  <p className='text-xs opacity-70 text-center'>
                    Code expires in 10 minutes
                  </p>
                </div>

                <button 
                  type='submit'
                  className='btn btn-primary w-full'
                  disabled={isLoading || otp.some(digit => !digit)}>
                  {isLoading ? (
                    <>
                      <span className='loading loading-spinner loading-sm'></span>
                      Verifying...
                    </>
                  ) : ('Verify Email')}
                </button>

                {/* Resend OTP */}
                <div className='text-center'>
                  <p className='text-sm opacity-70'>
                    Didn't receive the code?
                  </p>
                  <button
                    type='button'
                    onClick={handleResend}
                    disabled={!canResend || isLoading}
                    className={`text-sm mt-2 ${canResend ? 'text-primary hover:underline' : 'opacity-50 cursor-not-allowed'}`}
                  >
                    {canResend ? 'Resend Code' : `Resend in ${resendTimer}s`}
                  </button>
                </div>

                <div className='text-center'>
                  <button
                    type='button'
                    onClick={() => navigate('/signup')}
                    className='text-sm text-primary hover:underline'
                  >
                    ← Back to Signup
                  </button>
                </div>

              </div>
            </form>
          </div>
        </div>

        {/* RIGHT SIDE - Illustration */}
        <div className="hidden lg:flex flex-row bg-base-200 w-1/2 p-4 sm:p-8">
          <div className='max-w-md p-8'>
    
            {/* Content */}
            <div className='text-center space-y-3 mt-6'>
              <h2 className='text-xl font-semibold'>
                Almost There! 🎉
              </h2>
              <p className='opacity-70'>
                Verify your email to unlock all features and start connecting with Websites worldwide.
              </p>
            </div>

            <div className='relative aspect-square max-w-sm mx-auto'>
                <img src="Assets/6.png" alt="language connection illustration" className='  w-full h-96 z-0' />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default VerifyEmailPage;
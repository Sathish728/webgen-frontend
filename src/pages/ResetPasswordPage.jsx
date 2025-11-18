// pages/ResetPasswordPage.jsx
import { LayoutTemplate, ShipWheelIcon } from 'lucide-react';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { resetPassword, verifyResetOTP, clearError, clearMessage } from '../slice/authSlice';
import { toast } from 'react-toastify';

const ResetPasswordPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [step, setStep] = useState(1); // Step 1: Verify OTP, Step 2: Reset Password
  const [verifiedOtp, setVerifiedOtp] = useState('');
  
  const [formData, setFormData] = useState({
    otp: ['', '', '', '', '', ''],
    newPassword: '',
    confirmPassword: ''
  });

  const { error, isLoading, message, isAuthenticated } = useSelector((state) => state.auth);
  const email = location.state?.email;

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }

  }, [error, message, dispatch, navigate]);

  // Redirect if no email provided
  useEffect(() => {
    if (!email) {
      toast.error('Please request a password reset first');
      navigate('/forgot-password', { replace: true });
    }
  }, [email, navigate]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleOtpChange = (index, value) => {
    if (isNaN(value)) return;

    const newOtp = [...formData.otp];
    newOtp[index] = value;
    setFormData({ ...formData, otp: newOtp });

    // Auto-focus next input
    if (value && index < 5) {
      document.getElementById(`reset-otp-${index + 1}`).focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !formData.otp[index] && index > 0) {
      document.getElementById(`reset-otp-${index - 1}`).focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    const newOtp = [...formData.otp];
    
    for (let i = 0; i < pastedData.length; i++) {
      if (!isNaN(pastedData[i])) {
        newOtp[i] = pastedData[i];
      }
    }
    
    setFormData({ ...formData, otp: newOtp });
    
    const lastFilledIndex = newOtp.findIndex(val => val === '');
    const focusIndex = lastFilledIndex === -1 ? 5 : lastFilledIndex;
    document.getElementById(`reset-otp-${focusIndex}`)?.focus();
  };


  
const handleVerifyOtp = async (e) => {
  e.preventDefault();
  const otpCode = formData.otp.join('');
  
  if (otpCode.length !== 6) {
    toast.error('Please enter complete OTP');
    return;
  }

  try {
    const result = await dispatch(verifyResetOTP({ email, otp: otpCode }));
    
    if (result.type === 'auth/verifyResetOTP/fulfilled') {
      setVerifiedOtp(otpCode);
      setStep(2);
      toast.success('OTP verified! Now enter your new password.');
    }
  } catch (error) {
    console.error('Error verifying OTP:', error);
  }
};

  // Reset password after OTP verification (Step 2)
  const handleResetPassword = (e) => {
    e.preventDefault();

    if (formData.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    // Password strength validation
    const hasUpperCase = /[A-Z]/.test(formData.newPassword);
    const hasLowerCase = /[a-z]/.test(formData.newPassword);
    const hasNumbers = /\d/.test(formData.newPassword);
    const hasSpecialChar = /\W/.test(formData.newPassword);

    if (!hasUpperCase || !hasLowerCase || !hasNumbers || !hasSpecialChar) {
      toast.error('Password must contain uppercase, lowercase, number, and special character');
      return;
    }

    dispatch(resetPassword({
      email,
      otp: verifiedOtp,
      newPassword: formData.newPassword
    }));
    navigate("/login")
  };

  const togglePasswordVisibility = (field) => {
    if (field === 'password') {
      setShowPassword(!showPassword);
    } else {
      setShowConfirmPassword(!showConfirmPassword);
    }
  };

  return (
    <div className='h-screen flex items-center justify-center p-4 md:p-6 sm:p-8'>
      <div className='border border-primary/25 flex flex-col lg:flex-row w-full max-w-5xl mx-auto bg-base-100 rounded-xl shadow-lg overflow-hidden scale-[0.85] origin-top transform justify-centerx' style={{ width: "118%", transformOrigin: "center" }}>
        
        {/* LEFT SIDE - Reset Password Form */}
        <div className="w-full lg:w-1/2 p-4 sm:p-8 flex flex-col">
          
          {/* LOGO */}
          <div className="mb-4 flex items-center justify-start gap-2">
            <LayoutTemplate className="size-9 text-primary"/>
            <span className="text-3xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
              WEBGEN
            </span>
          </div>

          {/* Progress Indicator */}
          <div className="mb-6 mt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-primary text-white' : 'bg-gray-200'}`}>
                  {step > 1 ? '✓' : '1'}
                </div>
                <span className={`text-sm ${step >= 1 ? 'font-semibold' : 'opacity-50'}`}>Verify OTP</span>
              </div>
              <div className={`flex-1 h-1 mx-4 ${step > 1 ? 'bg-primary' : 'bg-gray-200'}`}></div>
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-primary text-white' : 'bg-gray-200'}`}>
                  2
                </div>
                <span className={`text-sm ${step >= 2 ? 'font-semibold' : 'opacity-50'}`}>New Password</span>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="w-full">
            
            {/* STEP 1: Verify OTP */}
            {step === 1 && (
              <form onSubmit={handleVerifyOtp}>
                <div className='space-y-6'>
                  
                  <div>
                    <h2 className='text-xl font-semibold'>Verify Reset Code</h2>
                    <p className='text-sm opacity-70 mt-2'>
                      Enter the verification code sent to
                    </p>
                    <p className='text-sm font-semibold text-primary mt-1'>
                      {email}
                    </p>
                  </div>

                  {/* OTP Input */}
                  <div className='flex flex-col gap-3'>
                    <label className='label'>
                      <span className='label-text'>Verification Code</span>
                    </label>
                    
                    <div className='flex gap-2 justify-center'>
                      {formData.otp.map((digit, index) => (
                        <input
                          key={index}
                          id={`reset-otp-${index}`}
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
                    disabled={isLoading || formData.otp.some(digit => !digit)}>
                    {isLoading ? (
                      <>
                        <span className='loading loading-spinner loading-sm'></span>
                        Verifying...
                      </>
                    ) : ('Verify Code')}
                  </button>

                  <div className='text-center space-y-2'>
                    <button
                      type='button'
                      onClick={() => navigate('/forgot-password')}
                      className='text-sm text-primary hover:underline'
                    >
                      ← Back to Forgot Password
                    </button>
                  </div>

                </div>
              </form>
            )}

            {/* STEP 2: Reset Password */}
            {step === 2 && (
              <form onSubmit={handleResetPassword}>
                <div className='space-y-6'>
                  
                  <div>
                    <h2 className='text-xl font-semibold'>Create New Password</h2>
                    <p className='text-sm opacity-70 mt-2'>
                      Your code has been verified! Now create a strong password.
                    </p>
                  </div>

                  {/* New Password */}
                  <div className='form-control w-full space-y-2'>
                    <label className='label'>
                      <span className='label-text'>New Password</span>
                    </label>
                    <div className="relative">
                      <input 
                        type={showPassword ? 'text' : 'password'}
                        name='newPassword'
                        placeholder='Enter new password'
                        className='input input-bordered w-full'
                        value={formData.newPassword}
                        onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                        required
                        disabled={isLoading}
                        autoFocus
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => togglePasswordVisibility('password')}
                        disabled={isLoading}
                      >
                        {showPassword ? (
                          <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                        ) : (
                          <EyeIcon className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                        )}
                      </button>
                    </div>
                    <p className='text-xs opacity-70'>
                      Must be at least 8 characters with uppercase, lowercase, number, and special character
                    </p>
                  </div>

                  {/* Confirm Password */}
                  <div className='form-control w-full space-y-2'>
                    <label className='label'>
                      <span className='label-text'>Confirm New Password</span>
                    </label>
                    <div className="relative">
                      <input 
                        type={showConfirmPassword ? 'text' : 'password'}
                        name='confirmPassword'
                        placeholder='Confirm new password'
                        className='input input-bordered w-full'
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        required
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => togglePasswordVisibility('confirm')}
                        disabled={isLoading}
                      >
                        {showConfirmPassword ? (
                          <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                        ) : (
                          <EyeIcon className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                        )}
                      </button>
                    </div>
                  </div>

                  <button 
                    type='submit'
                    className='btn btn-primary w-full'
                    disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <span className='loading loading-spinner loading-sm'></span>
                        Resetting Password...
                      </>
                    ) : ('Reset Password')}
                  </button>

                  <div className='text-center'>
                    <p className='text-sm'>
                      Remember your password?{' '}
                      <button
                        type='button'
                        onClick={() => navigate('/login')}
                        className='text-primary hover:underline'
                      >
                        Sign In
                      </button>
                    </p>
                  </div>

                </div>
              </form>
            )}

          </div>
        </div>

        {/* RIGHT SIDE - Illustration */}
        <div className="hidden lg:flex flex-row bg-base-200 w-1/2 p-4 sm:p-8">
          <div className='max-w-md p-8'>

            {/* Content */}
            <div className='text-center space-y-3 mt-6'>
              {step === 1 ? (
                <>
                  <h2 className='text-xl font-semibold'>
                    Secure Verification 🔐
                  </h2>
                  <p className='opacity-70'>
                    Enter the 6-digit code sent to your email. Once verified, you can create a new password.
                  </p>
                </>
              ) : (
                <>
                  <h2 className='text-xl font-semibold text-start'>
                    Create a Strong Password 🔐
                  </h2>
                  <p className='opacity-70 text-start'>
                    Choose a strong, unique password to keep your account secure.
                  </p>
                </>
              )}
            </div>
            <div className='relative aspect-square max-w-sm mx-auto'>
              {step === 1 ? (
                <img src="Assets/6.png" alt="language connection illustration" className='  w-full h-96 z-0' />
              ) : (
                <div className='mt-4 p-4 bg-base-100 rounded-lg text-left'>
                    <p className='text-sm font-semibold mb-2'>Password Requirements:</p>
                    <ul className='text-xs opacity-70 space-y-1'>
                      <li>✓ At least 8 characters long</li>
                      <li>✓ One uppercase letter (A-Z)</li>
                      <li>✓ One lowercase letter (a-z)</li>
                      <li>✓ One number (0-9)</li>
                      <li>✓ One special character (!@#$%)</li>
                    </ul>
                  </div>
              )}
                
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ResetPasswordPage;
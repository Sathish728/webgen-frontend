import { Gem, LayoutTemplate, ShipWheelIcon } from "lucide-react";
import ThemeSelector from "../components/ThemeSelector"
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { clearError, clearMessage, signupUser } from '../slice/authSlice.js'
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { DotLottieReact } from '@lottiefiles/dotlottie-react'

const SignupPage = () => {
  const { theme } =useSelector((state) => state.theme)

  const [showPassword, setShowPassword] = useState(false)
  const [signupData, setSignupData] = useState({
    fullName: "",
    email: "",
    password: "",
  })

  const navigate = useNavigate()
  const dispatch = useDispatch()

  const { isLoading, error, message, user, isAuthenticated, pendingVerification, pendingVerificationEmail } = useSelector((state) => state.auth)

  useEffect(() => {
    if(error) {
      toast.error(error)
      dispatch(clearError())
    }

    if(message) {
      toast.success(message)
      dispatch(clearMessage())
    }
  },[error, message, dispatch])

  useEffect(() => {
    if(isAuthenticated) {
      navigate('/', {replace:true})
    }
  },[isAuthenticated, navigate])


  useEffect(() => {
    if(pendingVerification && pendingVerificationEmail) {
      navigate('/verify-email', {
        state: { email: pendingVerificationEmail },
        replace: true
      })
    }
  },[pendingVerification, pendingVerificationEmail, navigate])

  const onchange = (e) => {
      setSignupData((prevState) => ({
        ...prevState,
        [e.target.name]:e.target.value
      }))
  }

  
  const handleSignup = async(e) => {
    e.preventDefault()
    try {
      const { fullName, email, password } = signupData
      const userData = { fullName, email, password }

      dispatch(signupUser(userData))
    } catch (error) {
      console.error(error)
      toast.error(error)
    }
  }

  const togglePasswordVisibility = (field) => {
    if(field === "password"){
      return setShowPassword(!showPassword)
    }
  }
  return (
    <div className='h-screen flex flex-row gap-10 items-center justify-center p-4 sm:p-6 md:p-8 bg-no-repeat bg-cover ' style={{ backgroundImage: "url('/Assets/8.jpg')" }}>

      {/* bg-image and color-opacity */}
      <div className="absolute inset-0 z-0 opacity-50" data-theme={theme}></div>

       <div className="relative z-10 flex flex-col lg:flex-row w-full max-w-5xl mx-auto 
          bg-base-content/10 backdrop-blur-lg
          rounded-2xl overflow-hidden
          border border-base-content/50
          scale-[0.85] origin-top transform 
          bg-contain 
         "style={{ width: "118%", transformOrigin: "center" }}>

        {/* logo image */}
        {/* <div className="absolute bottom-0  w-full h-[600px] bg-no-repeat bg-right-bottom    bg-contain pointer-events-none opacity-80 translate-y-36  hidden lg:flex z-10 "
        style={{ backgroundImage: "url('/Assets/5.png')" }}
        ></div> */}




        {/* left side */}
        <div className='w-full  lg:w-1/2 p-4 sm:p-8 flex flex-col justify-center'>
          <div className="">
              <div className="w-full">
                <form onSubmit={handleSignup}>
                <div className="space-y-4 ">

                  <div>
                    <h2 className='text-xl font-semibold'>Create An Account</h2>
                      <p className='text-sm opacity-70'>
                        Join WenGen and Start Your Website Adventure!
                      </p>
                  </div>

                  {/* FULL NAME */}
                  <div className="space-y-1">
                    <div className="form-control w-fulll">
                      <label className="label">
                        <span className="label-text">Full Name</span>
                      </label>
                      <input 
                        type="text"
                        name="fullName"
                        placeholder="Roslin"
                        className="input input-bordered w-full placeholder-base-content/30 text-sm"
                        value={signupData.fullName}
                        onChange={onchange}
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  {/* Email */}
                    <div className="space-y-1">
                    <div className="form-control w-fulll">
                      <label className="label">
                        <span className="label-text">Email</span>
                      </label>
                      <input 
                        type="email "
                        name="email"
                        placeholder="Roslin@gmail.com"
                        className="input input-bordered w-full placeholder-base-content/30 text-sm"
                        value={signupData.email}
                        onChange={onchange}
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  {/* Password */}
                    <div className="space-y-1">
                    <div className="form-control w-fulll">
                      <label className="label">
                        <span className="label-text">Password</span>
                      </label>
                      <div className="mt-1 relative">
                      <input 
                        type={showPassword ? "text" : "password"}
                        name="password"
                        placeholder="******"
                        className="input input-bordered w-full placeholder-base-content/30 text-sm"
                        value={signupData.password}
                        onChange={onchange}
                        required
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => togglePasswordVisibility('password')}
                        disabled={isLoading}
                      >
                        {showPassword ? (
                          <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors"/>
                        ): (
                          <EyeIcon className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                        )}
                      </button>
                      </div>
                    </div>
                    <p className='text-xs opacity-70 mt-1'>
                      Password must be atleast 6 characters long
                    </p>
                  </div>

                  {/* check box */}
                  <div className="form-control">
                   <label className="label cursor-pointer justify-start gap-2">
                    <input type="checkbox" className="checkbox checkbox-sm" required/>
                    <span className="text-xs leading-tight ">agree to the {""}
                      <span className="text-primary hover:underline">terms of service</span>and{""}
                      <span className="text-primary hover:underline">privacy policy</span>
                    </span>
                   </label>
                  </div>

                  <button 
                   className={`btn h-3 w-full ${isLoading ? 'skeleton text-primary': 'btn-primary'}`}
                   type="submit"
                   disabled={isLoading}
                   >
                    {isLoading ? (
                      <>
                       <span className="loading loading-spinner loading-sm">
                       </span>
                       Creating Account...
                      </>
                    ) : ('create Account')}
                  </button>

                  <div className='text-center mt-4'>
                    <p className='text-sm'>
                      Already have an account?{" "}
                      <Link to="/login" className='text-primary hover:underline'>
                      Sign In
                      </Link>
                    </p>
                  </div>

                </div>
                </form>
              </div>
          </div>    
        </div>

         {/* right side */}
         <div className='hidden lg:flex flex-col w-1/2 p-4 sm:p-8  rounded-2xl'>

         <div className=" h-full sm:p-8  rounded-2xl  bg-base-100 backdrop-blur-2xl ]
              backdrop-saturate-200">
            <div className='mb-4 flex items-center justify-start gap-2'>
            <LayoutTemplate className='size-9 text-primary'/>
            <span className='text-3xl font-bold font-mono bg-clip-text text-transparent     bg-gradient-to-r from-primary to-secondary tracking-wider'>
              WEBGEN
            </span>
          </div>  
           <div className='text-left space-y-3 mt-6'>
           <h2 className='text-xl font-semibold'>Connect your ideas to the world</h2>
           <p className='opacity-100'>
            Your website deserves a home on the web — make it global with WebGen.
           </p>
        </div>

          <div className='relative aspect-square max-w-sm mx-auto'>
             <img src="Assets/6.png" alt="language connection illustration" className='  w-full h-96 z-0' />
          </div>
         </div>
          
          
      
         </div>

       </div>
    </div>
  )
}

export default SignupPage
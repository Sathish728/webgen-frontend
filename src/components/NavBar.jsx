import { Link, useNavigate } from "react-router-dom";
import { LoaderCircle, LogOutIcon, ShipWheelIcon } from "lucide-react";
import ThemeSelector from "./ThemeSelector";
import { logoutUser } from '../slice/authSlice';
import { useDispatch, useSelector } from "react-redux";


const NavBar = () => {
  const dispatch = useDispatch()
  const { user, isLoading,  } = useSelector((state)=> state.auth);
  const navigate = useNavigate()

    const handleLogout = async () => {
      try {
        await dispatch(logoutUser()).unwrap();
        navigate('/login', { replace: true });
      } catch (error) {
        navigate('/login', { replace: true });
      }
    };


  return (
    <nav className="bg-base-300  sticky top-0 z-30 h-16 flex items-center">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-end w-full gap-5">
          
          {/* TODO */}
          <ThemeSelector />

          <div className="avatar">
            <div className="w-9 rounded-full bg-gradient-to-br from-green-500 to-blue-500 flex items-center justify-center text-white font-semibold text-sm uppercase p-2">
              {user?.profilePic ? (
                <img src={user.profilePic} alt="User Avatar" rel="noreferrer" />
              ) : (
                <span>
                  {user?.fullName
                    ? user.fullName.slice(0, 2)
                    : "U"}
                </span>
              )}
            </div>
          </div>


          {/* Logout button */}
          <button  
            className="btn btn-ghost btn-circle overflow-hidden" 
            onClick={handleLogout}
            disabled={isLoading}> 
            {isLoading ? (
                <div className="flex flex-col items-center justify-center text-[6px]">
                <LoaderCircle className="animate-spin h-6 w-6"/>
                Logging out..
                </div>
            ):(
                <LogOutIcon className="h-6 w-6 text-base-content opacity-70"/>
            )}  
           
          </button>
        </div>
      </div>
    </nav>
  );
};
export default NavBar;

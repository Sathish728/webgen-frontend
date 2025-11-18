import { Link, useLocation } from "react-router-dom";
import { BellIcon, BookTemplate, HomeIcon, LayoutTemplate, UsersIcon } from "lucide-react";
import { useSelector } from "react-redux";

const Sidebar = () => {
  const { user } = useSelector((state)=> state.auth);
  const location = useLocation();
  const currentPath = location.pathname;
 

  return (
    <aside className="w-52 bg-base-300  hidden lg:flex flex-col h-screen sticky top-0 shadow-none">
      <div className="p-5 ">
        <Link to="/" className="flex items-center gap-2.5">
          <LayoutTemplate className="size-9 text-primary" />
          <span className="text-3xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary  tracking-wider">
            WEBGEN
          </span>
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        <Link
          to="/"
          className={`btn btn-ghost justify-start w-full gap-3 px-3 normal-case ${
            currentPath === "/" ? "btn-active" : ""
          }`}
        >
          <HomeIcon className="size-5 text-base-content opacity-70" />
          <span>Home</span>
        </Link>

        <Link
          to="/user-websites"
          className={`btn btn-ghost justify-start w-full gap-3 px-3 normal-case ${
            currentPath === "/user-websites" ? "btn-active" : ""
          }`}
        >
          <BookTemplate className="size-5 text-base-content opacity-70" />
          <span>My Templates</span>
        </Link>

        <Link
          to="/notifications"
          className={`btn btn-ghost justify-start w-full gap-3 px-3 normal-case ${
            currentPath === "/notifications" ? "btn-active" : ""
          }`}
        >
          <BellIcon className="size-5 text-base-content opacity-70" />
          <span>Notifications</span>
        </Link>
      </nav>
    </aside>
  );
};
export default Sidebar;

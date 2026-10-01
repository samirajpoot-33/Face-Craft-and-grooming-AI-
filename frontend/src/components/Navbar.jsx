import { Link, NavLink, useLocation } from "react-router-dom";
import { Menu, X, LogOut, User } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import NotificationBell from "./NotificationBell";
import CreditsDisplay from "./CreditsDisplay";
import { getBackendOrigin } from "../utils/api";

export default function Navbar() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [imgError, setImgError] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();

  // Reset image error state when user changes or profile picture updates
  useEffect(() => {
    setImgError(false);
  }, [user?.profile_picture]);
  const isHomePage = location.pathname === "/";
  const isTryOnPage =
    location.pathname === "/makeup-virtual-try" ||
    location.pathname === "/hair-virtual-try";
  const isTransparentAllowed = isHomePage || isTryOnPage;


  // Transparent when at top on home page only; solid when scrolled or on other pages
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close menu when changing route
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const showSolidNav = !isTransparentAllowed || scrolled;


  const navLinkClass = ({ isActive }) =>
    `text-[11px] 2xl:text-sm font-medium px-2 2xl:px-4 py-1.5 2xl:py-2 rounded-full transition-all duration-300 relative whitespace-nowrap
    ${
      isActive
        ? "bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-[0_0_12px_rgba(56,189,248,0.35)]"
        : "text-slate-300 hover:text-white hover:bg-white/10 hover:scale-105"
    }`;

  return (
    <header
      className={`
        fixed top-0 left-0 w-full z-40 overflow-x-hidden overflow-y-auto
        transition-all duration-300
        ${showSolidNav
          ? "bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/60 shadow-[0_4px_30px_rgba(0,0,0,0.4)]"
          : "bg-transparent border-b border-transparent shadow-none"}
      `}
    >
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-6 2xl:px-20 py-3 flex items-center justify-between">
      
        {/* LOGO */}
        <Link to="/" className="flex items-center gap-2 group shrink-0">
          <div
            className="
              size-9 rounded-2xl bg-linear-to-tr from-sky-500/60 via-cyan-400/60 to-emerald-400/60
              flex items-center justify-center
              shadow-[0_0_25px_rgba(56,189,248,0.6)]
              group-hover:scale-105 transition shrink-0
            "
          >
            <span className="text-slate-900 text-sm font-extrabold">FC</span>
          </div>

          <div className="leading-tight">
            <p className="text-xs lg:text-sm 2xl:text-base font-semibold text-slate-100 group-hover:text-white transition whitespace-nowrap">
              FaceCraft & Grooming <span className="text-sky-400">AI</span>
            </p>
            <p className="text-[9px] md:text-[10px] lg:text-[11px] text-slate-400 whitespace-nowrap">
              Facial Intelligence for Styling
            </p>
          </div>
        </Link>

        {/* DESKTOP NAV */}
        <nav className="hidden xl:flex items-center gap-1 2xl:gap-2">
          <NavLink to="/" className={navLinkClass} end>Home</NavLink>
          <NavLink to="/face-analyzer" className={navLinkClass}>Face Analyzer</NavLink>
          <NavLink to="/hair-virtual-try" className={navLinkClass}>Hairstyle & Beard</NavLink>
          <NavLink to="/makeup-virtual-try" className={navLinkClass}>Makeup Try-On</NavLink>
          <NavLink to="/solutions" className={navLinkClass}>Solutions</NavLink>
          <NavLink to="/about" className={navLinkClass}>About Us</NavLink>
          <NavLink to="/contact" className={navLinkClass}>Contact</NavLink>
        </nav>

        {/* RIGHT BUTTONS */}
        <div className="hidden xl:flex items-center gap-1.5 2xl:gap-4">
            {isAuthenticated ? (
            <>
              {/* Credits Display */}
              {user?.role !== 'admin' && <CreditsDisplay />}
              {/* Notification bell - for regular users only */}
              {user?.role !== 'admin' && <NotificationBell />}
              {/* Show profile for all users */}
              <Link
                to="/dashboard"
                title={user?.username || user?.email || "Dashboard"}
                className="group relative flex items-center justify-center p-0.5 rounded-full bg-slate-950 border border-slate-700/50 hover:border-sky-400/80 transition-all duration-300 shadow-[0_0_20px_rgba(0,0,0,0.4)] hover:shadow-[0_0_25px_rgba(56,189,248,0.3)] hover:scale-105 transform-gpu shrink-0"
              >
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-sky-500 to-cyan-400 opacity-20 group-hover:opacity-40 transition-opacity" />
                {user?.profile_picture && !imgError ? (
                  <img
                    src={user.profile_picture.startsWith('http') ? user.profile_picture : `${getBackendOrigin()}/${user.profile_picture.replace(/^src\//, '')}`}
                    alt="Profile"
                    className="w-10 h-10 rounded-full object-cover border-2 border-slate-900 group-hover:border-sky-400/80 transition-colors z-10 transform-gpu"
                    style={{
                      imageRendering: "-webkit-optimize-contrast",
                      WebkitBackfaceVisibility: "hidden",
                      backfaceVisibility: "hidden",
                      WebkitTransform: "translate3d(0, 0, 0)",
                      transform: "translate3d(0, 0, 0)"
                    }}
                    onError={() => setImgError(true)}
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-400 via-cyan-500 to-sky-600 flex items-center justify-center border-2 border-slate-900 z-10">
                    <User size={18} className="text-white drop-shadow-md" />
                  </div>
                )}
              </Link>
              {/* Admin button - only for admins */}
              {user?.role === 'admin' && (
                <Link
                  to="/admin"
                  className="px-2 2xl:px-4 py-1.5 2xl:py-2 rounded-full text-purple-300 border border-purple-500/50 hover:bg-purple-500/10 hover:border-purple-400 transition text-[11px] 2xl:text-sm font-semibold whitespace-nowrap shrink-0"
                >
                  Admin Dashboard
                </Link>
              )}
              <button
                onClick={logout}
                className="
                  px-2 2xl:px-4 py-1.5 2xl:py-2 rounded-full text-slate-200 border border-slate-700/70
                  hover:border-red-500/60 hover:text-red-300 hover:bg-red-500/10
                  transition-all flex items-center gap-1 2xl:gap-2 font-medium text-[11px] 2xl:text-sm whitespace-nowrap shrink-0
                "
              >
                <LogOut size={16} />
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="
                  px-3 2xl:px-6 py-1.5 2xl:py-2 rounded-full text-slate-200 border border-slate-700/70
                  hover:border-sky-500/60 hover:text-sky-300 hover:bg-white/10
                  transition-all font-medium text-[11px] 2xl:text-sm whitespace-nowrap shrink-0
                "
              >
                Login
              </Link>

              <Link
                to="/register"
                className="
                  px-2.5 2xl:px-4 py-1.5 2xl:py-2 rounded-full font-semibold text-slate-900
                  bg-linear-to-r from-sky-500 to-cyan-400
                  shadow-[0_0_20px_rgba(56,189,248,0.5)]
                  hover:shadow-[0_0_30px_rgba(56,189,248,0.7)]
                  hover:scale-[1.03] transition-all text-[11px] 2xl:text-sm whitespace-nowrap shrink-0
                "
              >
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* MOBILE ICONS & MENU BUTTON */}
        <div className="xl:hidden flex items-center gap-3">
{user && (
            <>
              <NotificationBell size="m" />
              <Link
                to="/dashboard"
                title={user?.username || user?.email || "Dashboard"}
                className="group relative flex items-center justify-center p-0.5 rounded-full bg-slate-950 border border-slate-700/50 hover:border-sky-400/80 transition-all duration-300 transform-gpu shrink-0"
              >
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-sky-500 to-cyan-400 opacity-20 transition-opacity" />
                {user?.profile_picture && !imgError ? (
                  <img
                    src={user.profile_picture.startsWith('http') ? user.profile_picture : `${getBackendOrigin()}/${user.profile_picture.replace(/^src\//, '')}`}
                    alt="Profile"
                    className="w-8 h-8 rounded-full object-cover border-2 border-slate-900 z-10 transform-gpu"
                    style={{
                      imageRendering: "-webkit-optimize-contrast",
                      WebkitBackfaceVisibility: "hidden",
                      backfaceVisibility: "hidden",
                      WebkitTransform: "translate3d(0, 0, 0)",
                      transform: "translate3d(0, 0, 0)"
                    }}
                    onError={() => setImgError(true)}
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-sky-400 via-cyan-500 to-sky-600 flex items-center justify-center border-2 border-slate-900 z-10">
                    <User size={14} className="text-white backdrop-blur-sm" />
                  </div>
                )}
              </Link>
            </>
          )}

          <button
            className="
              h-10 w-10 flex items-center justify-center
              rounded-xl bg-slate-900/90 border border-slate-700/80
              shadow-[0_0_18px_rgba(56,189,248,0.18)]
              text-slate-100 transition active:scale-95
            "
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* MOBILE DROPDOWN */}
      <div
        className={`
          xl:hidden w-full overflow-y-auto transition-all duration-500
          bg-slate-900/90 backdrop-blur-xl border-t border-white/10
          ${mobileOpen ? "max-h-screen opacity-100" : "max-h-0 opacity-0"}
        `}
      >
        <div className="px-6 py-5 flex flex-col space-y-4">

          {[
            { to: "/", label: "Home" },
            { to: "/face-analyzer", label: "Face Analyzer" },
            { to: "/makeup-virtual-try", label: "Makeup Virtual Try" },
            { to: "/hair-virtual-try", label: "Hairstyle & Beard Try-On" },
            { to: "/solutions", label: "Solutions" },

            { to: "/faceshapesteps", label: "How it works" },
            { to: "/about", label: "About Us" },
            { to: "/contact", label: "Contact" },
          ].map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className="text-slate-200 text-sm font-medium py-2 rounded-lg hover:bg-white/10 hover:text-white"
              onClick={() => setMobileOpen(false)}
            >
              {item.label}
            </NavLink>
          ))}

          {isAuthenticated ? (
            <>
              {user?.role !== 'admin' && (
                <div 
                  className="flex justify-start py-1"
                  onClick={() => setMobileOpen(false)}
                >
                  <CreditsDisplay />
                </div>
              )}
              {/* Admin button - only for admins */}
              {user?.role === 'admin' && (
                <Link
                  to="/admin"
                  className="px-4 py-2 rounded-lg text-purple-300 border border-purple-500/50 hover:bg-purple-500/10 hover:border-purple-400 transition text-sm font-semibold"
                >
                  Admin Dashboard
                </Link>
              )}
              <button
                onClick={logout}
                className="
                  text-center py-2.5 rounded-xl text-slate-200 border border-red-500/50
                  hover:bg-red-500/10 hover:text-red-300
                  transition-all flex items-center justify-center gap-2
                "
              >
                <LogOut size={16} />
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-slate-300 text-sm py-2">Login</Link>

              <Link
                to="/register"
                className="
                  text-center py-2.5 rounded-xl font-semibold text-slate-900
                  bg-linear-to-r from-sky-500 to-cyan-400
                  shadow-[0_0_20px_rgba(56,189,248,0.8)]
                "
              >
                Create Account
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

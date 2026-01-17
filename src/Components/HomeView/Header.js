import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useParams, Link, useLocation } from "react-router-dom";
import { getUsername } from "../../App";

// Header component, can access all different pages from here
const Header = ({ authorized, setAuthorized }) => {
  const location = useLocation();
  const username = getUsername();
  const navigate = useNavigate();
  const { leagueName } = useParams();
  const [league, setLeague] = useState({});
  const [userID, setUserID] = useState(null);
  const [isCommissioner, setIsCommissioner] = useState(false);
  const apiUrl = process.env.REACT_APP_API_URL;

  // --- inactivity timer (useRef so it doesn't reset weirdly across renders)
  const inactivityTimeoutRef = useRef(null);

  const handleLogout = () => {
    // Clear localStorage FIRST
    localStorage.setItem("authorized", "false");
    localStorage.removeItem("username");

    // Then update state
    setAuthorized(false);

    // Navigate to login instead of landing page
    navigate("/login", { replace: true });
  };

  const resetInactivityTimer = () => {
    if (inactivityTimeoutRef.current) {
      clearTimeout(inactivityTimeoutRef.current);
    }
    inactivityTimeoutRef.current = setTimeout(handleLogout, 600000); // 10 minutes
  };

  useEffect(() => {
    const events = ["mousemove", "keydown", "scroll", "click"];
    events.forEach((event) => window.addEventListener(event, resetInactivityTimer));
    resetInactivityTimer();

    return () => {
      events.forEach((event) => window.removeEventListener(event, resetInactivityTimer));
      if (inactivityTimeoutRef.current) clearTimeout(inactivityTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Extract leagueName dynamically from the URL path
        const leagueNameFromPath = location.pathname.split("/")[2];

        if (!leagueNameFromPath || !username || !apiUrl) {
          return;
        }

        // Fetch league data
        const leagueResponse = await fetch(
          `${apiUrl}/get_league_by_name?leagueName=${leagueNameFromPath}`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          }
        );

        if (!leagueResponse.ok) return;

        const leagueData = await leagueResponse.json();
        setLeague(leagueData);
        setUserID(leagueData?.commissioner?.user_id ?? null);

        // Fetch user data and compare to check if they are the commissioner
        const userResponse = await fetch(
          `${apiUrl}/get_user_by_username?username=${encodeURIComponent(username)}`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          }
        );

        if (!userResponse.ok) return;

        const userData = await userResponse.json();

        if (leagueData?.commissioner?.user_id === userData?.id) {
          setIsCommissioner(true);
        } else {
          setIsCommissioner(false);
        }
      } catch (error) {
        console.error(error);
      }
    };

    const checkPageAndReset = () => {
      // If you changed /league-list -> /dashboard, include both to be safe
      if (location.pathname === "/league-list" || location.pathname === "/dashboard") {
        setIsCommissioner(false);
        setLeague({});
        setUserID(null);
      }
    };

    checkPageAndReset();
    fetchData();
  }, [location.pathname, username, apiUrl, navigate]);

  // inside a league page?
  const isInsideLeague = location.pathname.startsWith("/league-home/");
  const currentLeagueName = location.pathname.split("/")[2];

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-md bg-zinc-950/80 border-b border-white/5">
      <div className="max-w-screen-2xl mx-auto px-6 py-4">
        {/* Desktop layout */}
        <div className="hidden md:grid md:grid-cols-3 items-center gap-6">
          {/* Left: Logo */}
          <div className="justify-self-start">
            <Link
              to={authorized ? "/dashboard" : "/"}
              className="text-white text-xl font-semibold hover:opacity-90 transition whitespace-nowrap"
            >
              Playoff Pick&apos;ems
            </Link>
          </div>

          {/* Center: League nav (only inside league) */}
          <div className="justify-self-center">
            {isInsideLeague && (
              <div className="flex items-center gap-2">
                <Link
                  to={`/league-home/${currentLeagueName}`}
                  className="text-gray-300 hover:text-white transition-colors px-4 py-2 rounded-full hover:bg-white/5"
                >
                  Home
                </Link>
                <Link
                  to={`/league-home/${currentLeagueName}/viewGames`}
                  className="text-gray-300 hover:text-white transition-colors px-4 py-2 rounded-full hover:bg-white/5"
                >
                  Games
                </Link>
                {isCommissioner && (
                  <Link
                    to={`/league-home/${currentLeagueName}/league_manager_tools`}
                    className="text-gray-300 hover:text-white transition-colors px-4 py-2 rounded-full hover:bg-white/5"
                  >
                    LM Tools
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* Right: Actions */}
          <div className="justify-self-end flex items-center gap-3">
            {authorized && (
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-400 text-white px-5 py-2 rounded-full transition-all hover:shadow-lg hover:shadow-red-500/30"
              >
                Logout
              </button>
            )}
          </div>
        </div>

        {/* Mobile layout */}
        <div className="flex md:hidden flex-col gap-3">
          {/* Top row: Logo + Logout */}
          <div className="flex items-center justify-between">
            <Link
              to={authorized ? "/dashboard" : "/"}
              className="text-white text-xl font-semibold hover:opacity-90 transition whitespace-nowrap"
            >
              Playoff Pick&apos;ems
            </Link>
            {authorized && (
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-400 text-white px-4 py-2 rounded-full transition-all hover:shadow-lg hover:shadow-red-500/30 text-sm"
              >
                Logout
              </button>
            )}
          </div>

          {/* Bottom row: Scrollable league nav */}
          {isInsideLeague && (
            <div className="overflow-x-auto -mx-6 px-6">
              <div className="flex items-center gap-2 min-w-max">
                <Link
                  to={`/league-home/${currentLeagueName}`}
                  className="text-gray-300 hover:text-white transition-colors px-4 py-2 rounded-full hover:bg-white/5 text-sm whitespace-nowrap"
                >
                  Home
                </Link>
                <Link
                  to={`/league-home/${currentLeagueName}/viewGames`}
                  className="text-gray-300 hover:text-white transition-colors px-4 py-2 rounded-full hover:bg-white/5 text-sm whitespace-nowrap"
                >
                  Games
                </Link>
                {isCommissioner && (
                  <Link
                    to={`/league-home/${currentLeagueName}/league_manager_tools`}
                    className="text-gray-300 hover:text-white transition-colors px-4 py-2 rounded-full hover:bg-white/5 text-sm whitespace-nowrap"
                  >
                    LM Tools
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Header;

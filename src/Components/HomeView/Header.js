import React, { useEffect, useState } from "react";
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
    
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Extract leagueName dynamically from the URL path
        const leagueNameFromPath = location.pathname.split("/")[2];
        console.log(leagueNameFromPath);
        if (leagueNameFromPath == null || username == null) {
          return;
        }

        // Fetch league data
        const leagueResponse = await fetch(
          `http://127.0.0.1:5000/get_league_by_name?leagueName=${leagueNameFromPath}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!leagueResponse.ok) {
          throw new Error(`HTTP error! status: ${leagueResponse.status}`);
        }

        const leagueData = await leagueResponse.json();
        setLeague(leagueData);
        console.log(leagueData);
        setUserID(leagueData.commissioner.user_id);

        // Fetch user data and compare to check if they are the commissioner
        const userResponse = await fetch(
          `http://127.0.0.1:5000/get_user_by_username?username=${username}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!userResponse.ok) {
          throw new Error(`HTTP error! status: ${userResponse.status}`);
        }

        const userData = await userResponse.json();

        // Check if user is the commissioner
        if (leagueData.commissioner.user_id === userData.id) {
          setIsCommissioner(true);
        }
      } catch (error) {
        console.error(error); // Log the error
        alert("Something went wrong");
      }
    };

    const checkPageAndReset = () => {
      if (location.pathname === "/league-list") {
        setIsCommissioner(false);
        setLeague({});
        setUserID(null);
      }
    };
  
    checkPageAndReset(); // Check if on a reset-required page

    fetchData();
  }, [location.pathname, username, navigate]);

  const handleLogout = () => {
    setAuthorized(false); // Update state to unauthorized
    localStorage.setItem("authorized", "false"); // Save to local storage
    localStorage.removeItem("username");
  };

  // Function to handle logout or unauthorized state
  let inactivityTimeout;

  const resetInactivityTimer = () => {
    // Clear any existing timeout
    clearTimeout(inactivityTimeout);

    // Set a new timeout for 10 minutes (600,000 ms)
    inactivityTimeout = setTimeout(handleLogout, 600000); // 10 minutes in ms
  };

  useEffect(() => {
    // Listen for user activity events
    const events = ["mousemove", "keydown", "scroll", "click"];

    // Add event listeners to detect user activity
    events.forEach((event) => {
      window.addEventListener(event, resetInactivityTimer);
    });

    // Set the initial inactivity timeout
    resetInactivityTimer();

    // Cleanup event listeners on component unmount
    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, resetInactivityTimer);
      });
      clearTimeout(inactivityTimeout);
    };
  }, []);

  // Check if the user is inside a league page (e.g., "/league-home/leagueName")
  const isInsideLeague = location.pathname.startsWith("/league-home/");

  return (
    <div className="flex justify-between items-center h-20">
      <div>
        <Link to="/" className="text-3xl md:text-4xl font-bold">
          Playoff Pick'em
        </Link>
      </div>
      <ul className="flex">
        {isInsideLeague && (
          <>
            <Link
              to={`/league-home/${location.pathname.split("/")[2]}`} // Dynamic league home path
              className="navbar"
            >
              Home
            </Link>
            <Link
              to={`/league-home/${location.pathname.split("/")[2]}/viewGames`} // Dynamic games path
              className="navbar"
            >
              Games
            </Link>
            {isCommissioner && (
              <Link
                to={`/league-home/${
                  location.pathname.split("/")[2]
                }/league_manager_tools`}
                className="navbar"
              >
                LM Tools
              </Link>
            )}
          </>
        )}
        {authorized && (<button
          onClick={handleLogout}
          className="navbar text-white bg-red-600 hover:bg-red-700 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-4 py-2.5 dark:bg-red-500 dark:hover:bg-red-600 focus:outline-none dark:focus:ring-red-700"
        >
          Logout
        </button>)}
      </ul>
    </div>
  );
};

export default Header;

import React, { useEffect } from 'react'

// Header component, can access all different pages from here
const Header = ({ setAuthorized }) => {
  const handleLogout = () => {
    setAuthorized(false); // Update state to unauthorized
    localStorage.setItem('authorized', 'false'); // Save to local storage
    localStorage.removeItem('username');
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
    const events = ['mousemove', 'keydown', 'scroll', 'click'];

    // Add event listeners to detect user activity
    events.forEach(event => {
      window.addEventListener(event, resetInactivityTimer);
    });

    // Set the initial inactivity timeout
    resetInactivityTimer();

    // Cleanup event listeners on component unmount
    return () => {
      events.forEach(event => {
        window.removeEventListener(event, resetInactivityTimer);
      });
      clearTimeout(inactivityTimeout);
    };
  }, []);


  return (
    <div className='flex justify-between items-center h-20'>
        <div>
            <h1>Playoff Pick'em League</h1>
        </div>
        <ul className='flex'>
            <li>League Home</li>
            <button onClick={handleLogout}>
              Logout
            </button>
        </ul>
    </div>
  )
}

export default Header
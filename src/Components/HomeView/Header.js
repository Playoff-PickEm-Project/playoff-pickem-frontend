import React from 'react'

// Header component, can access all different pages from here
const Header = ({ setAuthorized }) => {

  // Function to handle logout or unauthorized state
  const handleLogout = () => {
    setAuthorized(false); // Update state to unauthorized
    localStorage.setItem('authorized', 'false'); // Save to local storage
  };


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
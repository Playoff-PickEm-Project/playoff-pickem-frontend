import React from 'react'

// Header component, can access all different pages from here
const Header = () => {
  return (
    <div className='flex justify-between items-center h-20'>
        <div>
            <h1>Playoff Pick'em League</h1>
        </div>
        <ul className='flex'>
            <li>League Home</li>
        </ul>
    </div>
  )
}

export default Header
import React from "react";

const Header = () => {
  return (
    <div className="header">
      <div className="text">Sign up</div>
      <div className="inputFields">
        <div className="input">
          <div className="text">username</div>
          <input type="text" />
        </div>
        <div className="input">
          <div className="text">password</div>
          <input type="text" />
        </div>
      </div>
    </div>
  );
};

export default Header;

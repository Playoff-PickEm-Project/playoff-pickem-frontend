import React from "react";

const StatCard = ({ label, value, icon }) => {
  return (
    <div className="flex flex-col gap-3 p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all">
      <div className="flex items-center gap-2 text-gray-400">
        {icon && <span className="text-emerald-400">{icon}</span>}
        <span className="text-sm">{label}</span>
      </div>
      <div className="text-3xl text-white">{value}</div>
    </div>
  );
};

export default StatCard;

import React from "react";

interface HeaderProps {
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  return (
    <header className="relative z-10 flex flex-shrink-0 h-16 bg-white shadow-sm">
      {/* Mobile menu button */}
      <button 
        className="px-4 border-r border-neutral-200 text-neutral-500 focus:outline-none focus:bg-neutral-100 focus:text-neutral-600 md:hidden"
        onClick={onMenuClick}
        aria-label="Open sidebar"
      >
        <span className="material-icons">menu</span>
      </button>
      
      <div className="flex justify-between flex-1 px-4">
        {/* Search */}
        <div className="flex flex-1">
          <div className="flex w-full md:ml-0">
            <div className="relative w-full max-w-2xl text-neutral-400 focus-within:text-neutral-600 flex items-center">
              <span className="material-icons absolute left-3">search</span>
              <input 
                className="block w-full h-full py-2 pl-10 pr-3 text-neutral-900 placeholder-neutral-500 bg-white border border-transparent focus:border-primary-light focus:ring-0 sm:text-sm rounded-md" 
                placeholder="Search dashboards..." 
              />
            </div>
          </div>
        </div>
        
        {/* Header actions */}
        <div className="flex items-center ml-4 md:ml-6 space-x-4">
          <button className="p-1 text-neutral-500 rounded-full hover:text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary">
            <span className="material-icons">help_outline</span>
          </button>
          <button className="p-1 text-neutral-500 rounded-full hover:text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary">
            <span className="material-icons">notifications_none</span>
          </button>
          <button className="p-1 text-neutral-500 rounded-full hover:text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary">
            <span className="material-icons">settings</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;

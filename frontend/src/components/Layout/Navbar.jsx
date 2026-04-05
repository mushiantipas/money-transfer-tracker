import { Bars3Icon, BellIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

const Navbar = ({ onMenuClick, title }) => {
  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-4">
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <Bars3Icon className="w-5 h-5 text-gray-600" />
      </button>

      <h1 className="text-lg font-semibold text-gray-800 flex-1">{title}</h1>

      <div className="hidden md:flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2 w-64">
        <MagnifyingGlassIcon className="w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search..."
          className="bg-transparent text-sm focus:outline-none flex-1"
        />
      </div>

      <button className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors">
        <BellIcon className="w-5 h-5 text-gray-600" />
        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
      </button>
    </header>
  );
};

export default Navbar;

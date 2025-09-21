import React, { useState, useRef, useEffect } from 'react';
import { IRAQI_GOVERNORATES } from '../constants';
import type { Governorate } from '../types';
import { LocationIcon, ChevronDownIcon } from './icons';

interface FilterSidebarProps {
  selectedGovernorate: Governorate | null;
  onSelectGovernorate: (governorate: Governorate | null) => void;
  searchTerm: string;
  onSearchTermChange: (term: string) => void;
}

const FilterSidebar: React.FC<FilterSidebarProps> = ({ selectedGovernorate, onSelectGovernorate, searchTerm, onSearchTermChange }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Handle clicks outside the dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);


  const handleSelect = (governorate: Governorate | null) => {
    onSelectGovernorate(governorate);
    setIsDropdownOpen(false);
  }

  return (
    <aside className="w-full md:w-64 lg:w-72 bg-white p-6 rounded-xl shadow-lg border border-slate-200 self-start">
      <h2 className="text-xl font-bold text-slate-800 mb-4 border-b pb-2">فلترة البحث</h2>
      
      <div className="space-y-4">
        <div>
          <label htmlFor="search-input" className="block text-sm font-bold text-slate-700 mb-1">
            البحث
          </label>
          <input
            id="search-input"
            type="text"
            placeholder="ابحث عن سيارة, منزل..."
            value={searchTerm}
            onChange={(e) => onSearchTermChange(e.target.value)}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-slate-50 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition"
          />
        </div>

        <div className="relative" ref={dropdownRef}>
            <label className="block text-sm font-bold text-slate-700 mb-1">
                المحافظة
            </label>
            <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full flex justify-between items-center text-right px-4 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition"
                aria-haspopup="listbox"
                aria-expanded={isDropdownOpen}
            >
                <span className="flex items-center gap-2 text-slate-800">
                    <LocationIcon className="w-5 h-5 text-slate-400"/>
                    {selectedGovernorate || 'كل المحافظات'}
                </span>
                <ChevronDownIcon className={`w-5 h-5 text-slate-400 transition-transform ${isDropdownOpen ? 'transform rotate-180' : ''}`} />
            </button>
            {isDropdownOpen && (
                <div className="absolute z-20 mt-1 w-full bg-white rounded-md shadow-lg border border-slate-200 max-h-80 overflow-y-auto">
                    <ul role="listbox">
                        <li>
                            <button
                              onClick={() => handleSelect(null)}
                              className={`w-full text-right px-4 py-2 transition-colors text-slate-700 ${!selectedGovernorate ? 'bg-teal-100 font-bold text-teal-800' : 'hover:bg-slate-100'}`}
                            >
                              كل المحافظات
                            </button>
                        </li>
                        {IRAQI_GOVERNORATES.map(gov => (
                            <li key={gov}>
                            <button
                                onClick={() => handleSelect(gov)}
                                className={`w-full text-right px-4 py-2 transition-colors text-slate-700 ${selectedGovernorate === gov ? 'bg-teal-100 font-bold text-teal-800' : 'hover:bg-slate-100'}`}
                            >
                                {gov}
                            </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
      </div>
    </aside>
  );
};

export default FilterSidebar;
import React, { useState, useEffect, useCallback } from 'react';
import { Ad, Governorate, AdSenseConfig } from '../types';
import { getAds } from '../services/adService';
import AdCard from './AdCard';
import FilterSidebar from './FilterSidebar';
import AdsensePlaceholder from './AdsensePlaceholder';
import Spinner from './Spinner';

interface HomePageProps {
    showAds: boolean;
    onSelectAd: (id: number) => void;
}

const HomePage: React.FC<HomePageProps> = ({ showAds, onSelectAd }) => {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGovernorate, setSelectedGovernorate] = useState<Governorate | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchAds = useCallback(() => {
    setLoading(true);
    getAds({ governorate: selectedGovernorate, searchTerm }).then(data => {
      setAds(data);
      setLoading(false);
    });
  }, [selectedGovernorate, searchTerm]);

  useEffect(() => {
    const handler = setTimeout(() => {
        fetchAds();
    }, 300); // Debounce search term
    
    return () => clearTimeout(handler);
  }, [fetchAds]);


  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        <FilterSidebar 
          selectedGovernorate={selectedGovernorate}
          onSelectGovernorate={setSelectedGovernorate}
          searchTerm={searchTerm}
          onSearchTermChange={setSearchTerm}
        />
        <main className="flex-1">
          {loading ? (
            <div className="flex justify-center items-center h-96">
                <Spinner />
            </div>
          ) : (
            <>
              {ads.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {ads.map((ad, index) => (
                    <React.Fragment key={ad.id}>
                      <AdCard ad={ad} onSelect={() => onSelectAd(ad.id)} />
                      {index === 2 && <div className="sm:col-span-2 lg:col-span-3"><AdsensePlaceholder show={showAds}/></div>}
                    </React.Fragment>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-white rounded-lg shadow-md">
                    <h2 className="text-2xl font-bold text-slate-700">لا توجد إعلانات تطابق بحثك</h2>
                    <p className="text-slate-500 mt-2">حاول تغيير كلمات البحث أو الفلاتر.</p>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default HomePage;
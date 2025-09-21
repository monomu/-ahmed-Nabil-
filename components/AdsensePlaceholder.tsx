import React from 'react';

interface AdsensePlaceholderProps {
  show: boolean;
}

const AdsensePlaceholder: React.FC<AdsensePlaceholderProps> = ({ show }) => {
  if (!show) {
    return null;
  }

  return (
    <div className="bg-slate-200 rounded-xl shadow-inner my-4 flex items-center justify-center h-48 border border-slate-300">
      <div className="text-center text-slate-500">
        <p className="font-bold">Google Ad Slot</p>
        <p className="text-sm">سيظهر إعلان Google AdSense هنا</p>
      </div>
    </div>
  );
};

export default AdsensePlaceholder;
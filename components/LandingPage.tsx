import React from 'react';
import { PlusIcon, LocationIcon, ChatBubbleIcon } from './icons';
import type { View } from '../types';

interface LandingPageProps {
  onSetView: (view: View) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onSetView }) => {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="relative isolate overflow-hidden bg-gradient-to-b from-teal-100/20 pt-14">
        <div
          className="absolute inset-y-0 right-1/2 -z-10 -mr-96 w-[200%] origin-top-right skew-x-[-30deg] bg-white shadow-xl shadow-teal-600/10 ring-1 ring-teal-50"
          aria-hidden="true"
        />
        <div className="mx-auto max-w-7xl px-6 py-32 sm:py-40 lg:px-8">
          <div className="mx-auto max-w-2xl lg:mx-0 lg:grid lg:max-w-none lg:grid-cols-2 lg:gap-x-16 lg:gap-y-6 xl:grid-cols-1 xl:grid-rows-1 xl:gap-x-8">
            <h1 className="max-w-2xl text-4xl font-bold tracking-tight text-slate-900 sm:text-6xl lg:col-span-2 xl:col-auto">
              أكبر سوق للإعلانات المبوبة في العراق
            </h1>
            <div className="mt-6 max-w-xl lg:mt-0 xl:col-end-1 xl:row-start-1">
              <p className="text-lg leading-8 text-slate-600">
                سوق هرج هو وجهتك الأولى لبيع وشراء كل شيء. من السيارات والعقارات إلى الإلكترونيات والخدمات، تواصل مع آلاف المشترين والبائعين في جميع أنحاء العراق بسهولة وأمان.
              </p>
              <div className="mt-10 flex items-center gap-x-6">
                <button
                  onClick={() => onSetView('signup')}
                  className="rounded-md bg-teal-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-teal-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600"
                >
                  ابدأ الآن
                </button>
                <button onClick={() => onSetView('login')} className="text-sm font-semibold leading-6 text-slate-900">
                  تسجيل الدخول <span aria-hidden="true">→</span>
                </button>
              </div>
            </div>
            <img
              src="https://picsum.photos/seed/market/1920/1080"
              alt=""
              className="mt-10 aspect-[6/5] w-full max-w-lg rounded-2xl object-cover sm:mt-16 lg:mt-0 lg:max-w-none xl:row-span-2 xl:row-end-2 xl:mt-36"
            />
          </div>
        </div>
        <div className="absolute inset-x-0 bottom-0 -z-10 h-24 bg-gradient-to-t from-white sm:h-32" />
      </div>

      {/* Feature Section */}
      <div className="mx-auto mt-16 max-w-7xl px-6 sm:mt-32 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base font-semibold leading-7 text-teal-600">كل شيء في مكان واحد</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            لماذا تختار سوق هرج؟
          </p>
          <p className="mt-6 text-lg leading-8 text-slate-600">
            نحن نوفر لك منصة متكاملة تجمع بين سهولة الاستخدام والميزات القوية لضمان أفضل تجربة بيع وشراء.
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-2 lg:gap-y-16">
            <div className="relative pl-16">
              <dt className="text-base font-semibold leading-7 text-slate-900">
                <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-teal-600">
                  <PlusIcon className="h-6 w-6 text-white" />
                </div>
                نشر إعلانات بكل سهولة
              </dt>
              <dd className="mt-2 text-base leading-7 text-slate-600">
                أضف إعلانك في دقائق معدودة مع الصور والتفاصيل الكاملة ليصل إلى آلاف المهتمين.
              </dd>
            </div>
            <div className="relative pl-16">
              <dt className="text-base font-semibold leading-7 text-slate-900">
                <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-teal-600">
                  <LocationIcon className="h-6 w-6 text-white" />
                </div>
                تصفح حسب المحافظة
              </dt>
              <dd className="mt-2 text-base leading-7 text-slate-600">
                ابحث عن ما تحتاجه في منطقتك. يمكنك فلترة الإعلانات حسب جميع المحافظات العراقية.
              </dd>
            </div>
            <div className="relative pl-16">
              <dt className="text-base font-semibold leading-7 text-slate-900">
                <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-teal-600">
                  <ChatBubbleIcon className="h-6 w-6 text-white" />
                </div>
                تواصل آمن ومباشر
              </dt>
              <dd className="mt-2 text-base leading-7 text-slate-600">
                تحدث مع البائعين والمشترين مباشرة عبر نظام الدردشة المدمج أو عبر واتساب بكل أمان وخصوصية.
              </dd>
            </div>
             <div className="relative pl-16">
              <dt className="text-base font-semibold leading-7 text-slate-900">
                <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-teal-600">
                   <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
                  </svg>
                </div>
                تغطية شاملة
              </dt>
              <dd className="mt-2 text-base leading-7 text-slate-600">
                من بغداد إلى البصرة، ومن أربيل إلى النجف، سوق هرج يغطي جميع أنحاء العراق.
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
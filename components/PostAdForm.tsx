import React, { useState, useEffect, useCallback } from 'react';
import { IRAQI_GOVERNORATES } from '../constants';
import { Governorate, Ad, User } from '../types';
import { addAd, getAdById, updateAd } from '../services/adService';
import { generateAdText } from '../services/geminiService';
import { SparklesIcon } from './icons';
import Spinner from './Spinner';

interface PostAdFormProps {
  onAdPosted: () => void;
  currentUser: User | null;
  editingAdId?: number | null;
  onSpendCredits: (amount: number) => void;
}

const PostAdForm: React.FC<PostAdFormProps> = ({ onAdPosted, currentUser, editingAdId, onSpendCredits }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [governorate, setGovernorate] = useState<Governorate>(IRAQI_GOVERNORATES[0]);
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [aiKeywords, setAiKeywords] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [initialLoading, setInitialLoading] = useState(true);

  const isEditing = editingAdId != null;
  const POST_COST = 1;

  useEffect(() => {
    if (isEditing) {
        getAdById(editingAdId).then(ad => {
            if (ad) {
                setTitle(ad.title);
                setDescription(ad.description);
                setPrice(ad.price.toString());
                setPhoneNumber(ad.phoneNumber);
                setGovernorate(ad.governorate);
                setImagePreviews(ad.images);
                // Note: We can't recreate File objects, so image editing is limited to replacing.
            } else {
                setError("لم يتم العثور على الإعلان المطلوب للتعديل.");
            }
            setInitialLoading(false);
        });
    } else {
        setInitialLoading(false);
    }
  }, [editingAdId, isEditing]);


  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files).slice(0, 5); // Limit to 5 images
      setImages(filesArray);
      const previews = filesArray.map(file => URL.createObjectURL(file));
      setImagePreviews(previews);
    }
  };
  
  const handleGenerateText = async () => {
    if (!aiKeywords) return;
    setIsGenerating(true);
    const { title: newTitle, description: newDescription } = await generateAdText(aiKeywords);
    setTitle(newTitle);
    setDescription(newDescription);
    setIsGenerating(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser) {
        setError("يجب تسجيل الدخول لنشر إعلان.");
        return;
    }
    
    if (!isEditing && (currentUser.credits === undefined || currentUser.credits < POST_COST)) {
        setError("ليس لديك رصيد كافي لنشر إعلان جديد. يرجى شحن رصيدك.");
        return;
    }

    if (!title || !description || !price || !phoneNumber || imagePreviews.length === 0) {
      setError('يرجى ملء جميع الحقول وإضافة صورة واحدة على الأقل.');
      return;
    }
    setError('');
    setSubmitting(true);
    
    try {
        if(isEditing) {
            const updatedAdData = {
                title,
                description,
                price: parseFloat(price),
                phoneNumber,
                governorate,
            };
            await updateAd(editingAdId, updatedAdData);
        } else {
            const newAdData: Omit<Ad, 'id' | 'postedAt' | 'author' | 'likes' | 'status' | 'isPromoted'> = {
              title,
              description,
              price: parseFloat(price),
              phoneNumber,
              governorate,
              images: imagePreviews, // In a real app, you would upload and get URLs
              userId: currentUser.id,
            };
            await addAd(newAdData);
            await onSpendCredits(POST_COST);
        }
        onAdPosted();
    } catch (err) {
        setError("حدث خطأ أثناء حفظ الإعلان. يرجى المحاولة مرة أخرى.");
    } finally {
        setSubmitting(false);
    }
  };
  
  if (initialLoading) {
      return <div className="flex justify-center items-center h-96"><Spinner /></div>
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-200">
        <h2 className="text-2xl sm:text-3xl font-bold text-teal-700 mb-2">{isEditing ? 'تعديل الإعلان' : 'أضف إعلان جديد'}</h2>
        <p className="text-slate-500 mb-8">{isEditing ? 'قم بتحديث تفاصيل إعلانك أدناه.' : 'املأ التفاصيل أدناه لنشر إعلانك في سوق هرج.'}</p>
        
        {!isEditing && (
            <div className="bg-teal-50 border-r-4 border-teal-500 p-4 rounded-lg mb-6">
                <h3 className="font-bold text-teal-800 flex items-center gap-2"><SparklesIcon className="w-5 h-5"/> اقتراح بالذكاء الاصطناعي</h3>
                <p className="text-sm text-teal-700 mt-1">لا تعرف ماذا تكتب؟ أدخل كلمات مفتاحية ودع الذكاء الاصطناعي يساعدك.</p>
                <div className="flex items-center gap-2 mt-3">
                    <input 
                        type="text" 
                        value={aiKeywords}
                        onChange={(e) => setAiKeywords(e.target.value)}
                        placeholder="مثال: سيارة كامري 2022 بيضاء"
                        className="flex-grow px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-teal-500"
                    />
                    <button 
                        onClick={handleGenerateText} 
                        disabled={isGenerating}
                        className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 disabled:bg-teal-300 flex items-center justify-center min-w-[100px]"
                    >
                        {isGenerating ? <Spinner/> : 'إنشاء'}
                    </button>
                </div>
            </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-bold text-slate-700 mb-1">عنوان الإعلان</label>
            <input type="text" id="title" value={title} onChange={e => setTitle(e.target.value)} required className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500" />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-bold text-slate-700 mb-1">وصف الإعلان</label>
            <textarea id="description" value={description} onChange={e => setDescription(e.target.value)} rows={6} required className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"></textarea>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="price" className="block text-sm font-bold text-slate-700 mb-1">السعر (دينار عراقي)</label>
              <input type="number" id="price" value={price} onChange={e => setPrice(e.target.value)} required className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500" />
            </div>
             <div>
              <label htmlFor="phone" className="block text-sm font-bold text-slate-700 mb-1">رقم الهاتف (واتساب)</label>
              <input type="tel" id="phone" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} placeholder="9647701234567" required className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500" />
            </div>
            <div>
              <label htmlFor="governorate" className="block text-sm font-bold text-slate-700 mb-1">المحافظة</label>
              <select id="governorate" value={governorate} onChange={e => setGovernorate(e.target.value as Governorate)} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 bg-white">
                {IRAQI_GOVERNORATES.map(gov => <option key={gov} value={gov}>{gov}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">صور الإعلان (5 كحد أقصى)</label>
            <p className="text-xs text-slate-500 mb-2">{isEditing ? 'ملاحظة: اختيار صور جديدة سيستبدل جميع الصور القديمة.' : ''}</p>
            <input type="file" multiple accept="image/*" onChange={handleImageChange} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"/>
            <div className="mt-4 grid grid-cols-3 md:grid-cols-5 gap-4">
              {imagePreviews.map((preview, index) => (
                <img key={index} src={preview} alt="Preview" className="w-full h-24 object-cover rounded-lg shadow-md" />
              ))}
            </div>
          </div>
          {error && <p className="text-red-500 text-sm bg-red-50 p-3 rounded-lg">{error}</p>}
          <button type="submit" disabled={submitting} className="w-full bg-amber-500 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:bg-amber-600 transition-transform transform hover:scale-105 disabled:bg-amber-300 flex justify-center items-center">
             {submitting ? <Spinner/> : (isEditing ? 'حفظ التعديلات' : `نشر الإعلان (يكلف ${POST_COST} رصيد)`)}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PostAdForm;
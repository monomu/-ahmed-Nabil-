
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

// FIX: Refactored Gemini service to align with @google/genai coding guidelines.
// This includes using process.env.API_KEY directly and adding explicit types for API responses.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

export const generateAdText = async (keywords: string): Promise<{ title: string; description: string }> => {
  try {
    const prompt = `
      أنت خبير تسويق متخصص في كتابة الإعلانات المبوبة باللهجة العراقية.
      مهمتك هي إنشاء عنوان جذاب ووصف مفصل لإعلان على موقع "سوق هرج" بناءً على الكلمات المفتاحية التالية: "${keywords}".

      يجب أن يكون العنوان قصيراً ومباشراً ويثير الاهتمام.
      يجب أن يكون الوصف شاملاً، ويذكر الميزات الرئيسية، والحالة، وأي تفاصيل أخرى قد تهم المشتري.
      استخدم لغة واضحة ومقنعة.

      قم بتوليد العنوان والوصف. افصل بين العنوان والوصف بـ "|||".
      مثال للإجابة: عنوان جذاب جدا || وصف مفصل وشامل للمنتج مع كل التفاصيل المهمة.
    `;
    
    const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });

    const text = response.text;
    const parts = text.split('|||');

    if (parts.length === 2) {
      return {
        title: parts[0].trim(),
        description: parts[1].trim(),
      };
    } else {
      // Fallback if the model doesn't follow the format
      return {
        title: `إعلان عن: ${keywords}`,
        description: text.trim(),
      };
    }
  } catch (error) {
    console.error("Error generating ad text with Gemini:", error);
    return {
      title: "خطأ في إنشاء النص",
      description: "حدث خطأ أثناء الاتصال بخدمة الذكاء الاصطناعي. يرجى المحاولة مرة أخرى.",
    };
  }
};

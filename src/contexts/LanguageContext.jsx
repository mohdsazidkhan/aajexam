import React, { createContext, useContext, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  setLanguage,
  setTranslations,
  setIsTranslating,
  initializeLanguage,
} from "../store/languageSlice";

const LanguageContext = createContext();

const INDIAN_LANGUAGES = [
  { code: "hi", name: "Hindi" },
  { code: "mr", name: "Marathi" },
  { code: "gu", name: "Gujarati" },
  { code: "bn", name: "Bengali" },
  { code: "pa", name: "Punjabi" },
  { code: "ta", name: "Tamil" },
  { code: "te", name: "Telugu" },
  { code: "kn", name: "Kannada" },
  { code: "ml", name: "Malayalam" },
  { code: "or", name: "Odia" },
  { code: "ur", name: "Urdu" },
];

export const LanguageProvider = ({ children }) => {
  const dispatch = useDispatch();

  const currentLanguage = useSelector(
    (state) => state.language.currentLanguage
  );
  const translations = useSelector((state) => state.language.translations);
  const isTranslating = useSelector((state) => state.language.isTranslating);

  React.useEffect(() => {
    dispatch(initializeLanguage());
  }, [dispatch]);

  // ⛔ PURE translation API: translate an array of texts
  const translateTexts = useCallback(
    async (textsArray, targetLang) => {
      try {
        if (!textsArray || textsArray.length === 0) return {};

        dispatch(setIsTranslating(true));

        // Reset to English
        if (targetLang === "en") {
          dispatch(setTranslations({}));
          dispatch(setLanguage("en"));
          dispatch(setIsTranslating(false));
          return {};
        }

        const SEPARATOR = "|||__SEP__|||";
        const combinedText = textsArray.join(SEPARATOR);

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/translate`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: combinedText, target: targetLang }),
          }
        );

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Translation failed");

        const translatedList = data.translated.split(SEPARATOR);

        // Build { original → translated } map
        const resultMap = {};
        textsArray.forEach((orig, index) => {
          resultMap[orig] = translatedList[index] || orig;
        });

        // Save in Redux
        dispatch(setTranslations(resultMap));
        dispatch(setLanguage(targetLang));

        return resultMap;
      } catch (err) {
        console.error("Translation Error:", err);
        dispatch(setIsTranslating(false));
        return {};
      } finally {
        dispatch(setIsTranslating(false));
      }
    },
    [dispatch]
  );

  const changeLanguage = (lang) => {
    dispatch(setLanguage(lang));
  };

  const getTranslation = (text) => {
    if (currentLanguage === "en") return text;
    return translations[text] || text;
  };

  return (
    <LanguageContext.Provider
      value={{
        currentLanguage,
        translations,
        isTranslating,
        changeLanguage,
        getTranslation,
        translateTexts, // ⬅ MAIN TRANSLATION FUNCTION (simple & clean)
        languages: [{ code: "en", name: "English" }, ...INDIAN_LANGUAGES],
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
};

export { INDIAN_LANGUAGES };

import React, { useState, useEffect } from 'react';
import { FaArrowUp } from 'react-icons/fa';
import useTranslate from '../../hooks/useTranslate';

const ScrollToTopButton = () => {
  const { translate } = useTranslate();
  const [isVisible, setIsVisible] = useState(false);

  // Show button when page is scrolled down
  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  // Scroll to top smoothly
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <>
      {isVisible && (
        <button
          onClick={scrollToTop}
          className="bg-primary-600 w-[50px] h-[50px] p-2.5 flex items-center justify-center mx-auto my-5 rounded-lg"
          aria-label={translate('Scroll to top')}
          title={translate('Scroll to top')}
        >
          <FaArrowUp className="text-on-primary" />
        </button>
      )}
    </>
  );
};

export default ScrollToTopButton;


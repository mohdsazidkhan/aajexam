import React, { useState, useEffect } from 'react';
import { FaArrowUp } from 'react-icons/fa';
import useTranslate from '../hooks/useTranslate';

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
          className="scroll-to-top-btn"
          aria-label={translate('Scroll to top')}
          title={translate('Scroll to top')}
        >
          <FaArrowUp className="scroll-to-top-icon" />
        </button>
      )}
    </>
  );
};

export default ScrollToTopButton;


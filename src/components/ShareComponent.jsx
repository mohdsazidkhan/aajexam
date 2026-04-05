import {
  FaWhatsapp,
  FaTelegramPlane,
  FaInstagram,
  FaFacebook,
  FaShare,
  FaTwitter,
  FaLinkedin,
  FaReddit,
  FaPinterest,
  FaEnvelope,
  FaSms,
} from "react-icons/fa";

const ShareComponent = ({ url, text, imageUrl }) => {
  const encodedUrl = encodeURIComponent(url);
  const encodedText = encodeURIComponent(text);
  const telegramTextFirst = encodeURIComponent(`${text}\n\n${url}`);
  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: text, text: text, url: url });
      } catch (err) {
        console.error("Share failed:", err);
      }
    }
  };

  const handleInstagramShare = () => {
    navigator.clipboard
      .writeText(`${text}\n\n${url}`)
      .then(() => {
        alert("Referral message copied! Paste it into your Instagram post or story.");
        window.open("https://www.instagram.com/", "_blank");
      })
      .catch(() => {
        window.open("https://www.instagram.com/", "_blank");
      });
  };

  return (
    <div className="share-wrapper font-outfit">
      <div className="flex justify-center mt-4">
        <span className="text-[10px] font-black text-slate-600 dark:text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em]">
          Spread the knowledge
        </span>
      </div>

      <div className="flex justify-center gap-3 mt-4 flex-wrap">
        {isMobile && navigator.share ? (
          <button
            onClick={handleNativeShare}
            className="px-8 py-4 bg-primary-500 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-duo-primary flex items-center gap-3 active:translate-y-1 transition-all"
          >
            <FaShare className="text-sm" />
            Share With Friends
          </button>
        ) : (
          <>
            {[
              { href: `https://wa.me/?text=${encodedText}%0A${encodedUrl}`, icon: <FaWhatsapp />, color: "#25D366", label: "Whatsapp" },
              { href: `https://t.me/share/url?text=${telegramTextFirst}`, icon: <FaTelegramPlane />, color: "#0088cc", label: "Telegram" },
              { onClick: handleInstagramShare, icon: <FaInstagram />, color: "#E1306C", label: "Instagram" },
              { href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`, icon: <FaFacebook />, color: "#3b5998", label: "Facebook" },
              { href: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`, icon: <FaTwitter />, color: "#1DA1F2", label: "Twitter" },
            ].map((social, idx) => (
              social.href ? (
                <a
                  key={idx}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 flex items-center justify-center rounded-2xl border-2 border-slate-100 dark:border-slate-700 shadow-duo transition-all hover:-translate-y-1 active:translate-y-0.5 bg-white dark:bg-slate-800"
                  style={{ color: social.color }}
                  title={social.label}
                >
                  <span className="text-xl">{social.icon}</span>
                </a>
              ) : (
                <button
                  key={idx}
                  onClick={social.onClick}
                  className="w-12 h-12 flex items-center justify-center rounded-2xl border-2 border-slate-100 dark:border-slate-700 shadow-duo transition-all hover:-translate-y-1 active:translate-y-0.5 bg-white dark:bg-slate-800"
                  style={{ color: social.color }}
                  title={social.label}
                >
                  <span className="text-xl">{social.icon}</span>
                </button>
              )
            ))}
          </>
        )}
      </div>
    </div>
  );
};

export default ShareComponent;


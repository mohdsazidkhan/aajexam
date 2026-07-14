import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { ArrowLeft, Share2, Expand, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import API from '../../lib/api';
import Seo from '../../components/Seo';
import toast from 'react-hot-toast';

export default function FlashcardDeck() {
    const router = useRouter();
    const { id } = router.query;
    const [deck, setDeck] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (!id) return;
        setLoading(true);
        API.request(`/api/flashcards/${id}`)
            .then(res => {
                if (res?.success) setDeck(res.data);
                else toast.error('Flashcards not found');
            })
            .catch(() => toast.error('Failed to load flashcards'))
            .finally(() => setLoading(false));
    }, [id]);

    const handleNext = useCallback(() => {
        if (!deck || currentIndex >= deck.cards.length - 1) {
            toast.success("Deck completed! 🎉");
            setTimeout(() => router.back(), 1500);
            return;
        }
        setCurrentIndex(prev => prev + 1);
    }, [deck, currentIndex, router]);

    const handlePrev = useCallback(() => {
        if (currentIndex <= 0) return;
        setCurrentIndex(prev => prev - 1);
    }, [currentIndex]);

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'ArrowRight' || e.key === ' ') handleNext();
            if (e.key === 'ArrowLeft') handlePrev();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleNext, handlePrev]);

    if (loading) {
        return (
            <div className="fixed inset-0 bg-slate-900 flex items-center justify-center z-50">
                <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!deck || !deck.cards || deck.cards.length === 0) {
        return (
            <div className="fixed inset-0 bg-slate-900 flex flex-col items-center justify-center z-50 text-white">
                <p className="text-xl mb-4">No cards found in this deck.</p>
                <button onClick={() => router.back()} className="px-6 py-2 bg-slate-800 rounded-full font-bold">Go Back</button>
            </div>
        );
    }

    const currentCard = deck.cards[currentIndex];
    const bgClass = currentCard.backgroundColor || 'bg-gradient-to-br from-indigo-500 to-purple-600';

    return (
        <div className="fixed inset-0 bg-black z-50 flex items-center justify-center overflow-hidden font-outfit select-none">
            <Seo 
                title={`${deck.title} - Flashcards`} 
                description={deck.description || "Quick revision flashcards"} 
            />

            {/* Mobile/Story Container */}
            <div className="relative w-full h-full max-w-md bg-slate-900 shadow-2xl overflow-hidden sm:rounded-[2.5rem] sm:h-[85vh] sm:border-[8px] sm:border-slate-800">
                
                {/* Background Layer */}
                <div className={`absolute inset-0 ${bgClass} transition-colors duration-500`} />
                <div className="absolute inset-0 bg-black/20" />

                {/* Top UI / Progress Bar */}
                <div className="absolute top-0 left-0 right-0 z-20 p-4 pt-6 sm:pt-4 bg-gradient-to-b from-black/60 to-transparent">
                    {/* Segmented Progress */}
                    <div className="flex gap-1 mb-4">
                        {deck.cards.map((_, idx) => (
                            <div key={idx} className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden">
                                <div 
                                    className={`h-full bg-white transition-all duration-300 ${idx < currentIndex ? 'w-full' : idx === currentIndex ? 'w-full' : 'w-0'}`} 
                                    style={{ opacity: idx <= currentIndex ? 1 : 0 }}
                                />
                            </div>
                        ))}
                    </div>
                    
                    {/* Header */}
                    <div className="flex items-center justify-between text-white">
                        <div className="flex items-center gap-3">
                            <button onClick={() => router.back()} className="p-2 hover:bg-white/20 rounded-full transition">
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                            <div>
                                <h1 className="font-bold text-sm tracking-wide">{deck.title}</h1>
                                <p className="text-[10px] opacity-70 uppercase tracking-widest">{currentIndex + 1} / {deck.cards.length}</p>
                            </div>
                        </div>
                        <button onClick={() => {
                            navigator.share && navigator.share({ title: deck.title, url: window.location.href }).catch(() => {});
                        }} className="p-2 hover:bg-white/20 rounded-full transition">
                            <Share2 className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Tap Zones for Navigation */}
                <div className="absolute inset-0 z-10 flex">
                    <div className="w-1/3 h-full cursor-pointer" onClick={handlePrev} />
                    <div className="w-2/3 h-full cursor-pointer" onClick={handleNext} />
                </div>

                {/* Card Content Area */}
                <div className="absolute inset-0 z-0 flex items-center justify-center p-8">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentIndex}
                            initial={{ opacity: 0, scale: 0.95, x: 20 }}
                            animate={{ opacity: 1, scale: 1, x: 0 }}
                            exit={{ opacity: 0, scale: 1.05, x: -20 }}
                            transition={{ duration: 0.2 }}
                            className="w-full text-center"
                        >
                            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-8 rounded-3xl shadow-2xl">
                                {currentCard.image && (
                                    <img 
                                        src={currentCard.image} 
                                        alt="Flashcard content" 
                                        className="w-full h-auto max-h-48 object-contain mb-6 rounded-xl"
                                    />
                                )}
                                <div 
                                    className="prose prose-invert max-w-none text-white font-medium md:text-lg leading-relaxed flashcard-content"
                                    dangerouslySetInnerHTML={{ __html: currentCard.content }}
                                />
                            </div>
                            
                            <div className="mt-8 text-white/50 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                                <span className="w-8 h-[1px] bg-white/20" />
                                Tap right to next
                                <span className="w-8 h-[1px] bg-white/20" />
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>

            </div>
            
            {/* Global styles for embedded math/content formatting */}
            <style jsx global>{`
                .flashcard-content h1, .flashcard-content h2, .flashcard-content h3 {
                    margin-top: 0;
                    font-weight: 900;
                    text-transform: uppercase;
                    letter-spacing: -0.02em;
                }
                .flashcard-content p {
                    margin-bottom: 1rem;
                }
                .flashcard-content p:last-child {
                    margin-bottom: 0;
                }
                .flashcard-content strong {
                    color: #fff;
                    background: rgba(255,255,255,0.2);
                    padding: 0.1em 0.3em;
                    border-radius: 0.2em;
                }
            `}</style>
        </div>
    );
}

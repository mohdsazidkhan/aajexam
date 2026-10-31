// Rule-based (no AI) parser for pasted daily current-affairs text.
// Expected shape, one entry per bullet:
//   ➼ <Hindi sentence>
//   <English sentence>

export const CA_CATEGORIES = ['national', 'international', 'economy', 'science', 'sports', 'awards', 'appointments', 'defence', 'environment', 'other'];

const DEVANAGARI = /[ऀ-ॿ]/;
const BULLET = /[➼➤➢•●▪◆]/;
const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
const TITLE_MAX = 120;

// First matching rule wins, so the more specific categories come first.
const CATEGORY_RULES = [
    ['appointments', /\b(appointed|appoints|takes? charge|took charge|nominated|president-elect|new (ceo|md|chairman|chief|governor|ambassador)|named as (the )?(ceo|md|chairman|chief|head)|\bmd\b|\bceo\b)/i],
    ['awards', /\b(award|prize|honou?red|honou?rs|laureate|ballon|bharat ratna|padma|nobel|booker|felicitated)\b/i],
    ['defence', /\b(navy|naval|army|air force|defexpo|defence|military|missile|drdo|warship|exercise|brahmos|armed forces|coast guard|\bins\b|\biaf\b|weapons?)\b/i],
    ['sports', /\b(cricket|t20i?|odi|hockey|football|championships?|grand prix|formula one|olympics?|paralympics?|wrestling|wrestlers?|javelin|athletics|badminton|tennis|chess|kabaddi|weightlifting|judo|medals?|tournament|trophy|ipl|fifa|bcci)\b/i],
    ['environment', /\b(cyclon\w*|river|national park|sanctuary|biodiversity|climate|wildlife|forest|lake|glacier|glof|flood|pollution|emissions?|cop\d*|tiger|ramsar|wetland|species|conservation)\b/i],
    ['science', /\b(isro|satellite|gslv|pslv|launch pad|rocket|space|nasa|ai\b|artificial intelligence|technology|research|innovation|quantum|semiconductor|vaccine|propulsion|scientists?)\b/i],
    ['economy', /\b(rbi|sebi|msp|gdp|inflation|bank|crore|budget|trade|export|import|tax|gst|scheme|outlay|world bank|imf|ficci|cii|industry|economy|economic|stock|fiscal|loan|insurance|msme|poverty)\b/i],
    ['international', /\b(summit|united nations|\bun\b|unesco|who\b|brics|g20|g7|sco\b|asean|chogm|commonwealth|bilateral|forum|treaty|president of|prime minister of|foreign ministers?|embassy|nato|opec|wto)\b/i]
];

const TAG_STOP = new Set(['the', 'a', 'an', 'in', 'of', 'and', 'for', 'to', 'on', 'at', 'by', 'with', 'from', 'as', 'is', 'was', 'has', 'have', 'will', 'its', 'it', 'this', 'that', ...MONTHS]);

const cleanSentence = (s) => s.replace(/\s+/g, ' ').trim();

const toTitle = (en) => {
    const t = cleanSentence(en).replace(/\.(?=[”’"']?$)/, '').replace(/[.\s]+$/, '');
    if (t.length <= TITLE_MAX) return t;
    const cut = t.slice(0, TITLE_MAX);
    const lastSpace = cut.lastIndexOf(' ');
    return (lastSpace > 60 ? cut.slice(0, lastSpace) : cut).trim();
};

export const guessCategory = (text) => {
    for (const [cat, re] of CATEGORY_RULES) if (re.test(text)) return cat;
    return 'national';
};

export const guessTags = (en) => {
    const tags = [];
    const seqs = en.match(/[A-Z][A-Za-z0-9\-]*(?:\s+(?:(?:of|for)\s+)?[A-Z][A-Za-z0-9\-]*)*/g) || [];
    for (const seq of seqs) {
        const words = seq.split(/\s+/);
        while (words.length && TAG_STOP.has(words[0].toLowerCase())) words.shift();
        while (words.length && TAG_STOP.has(words[words.length - 1].toLowerCase())) words.pop();
        if (!words.length) continue;
        const tag = words.join('_').toLowerCase().replace(/[^a-z0-9_]+/g, '_').replace(/^_+|_+$/g, '');
        if (tag.length < 3 || /^\d+$/.test(tag) || tags.includes(tag)) continue;
        tags.push(tag);
        if (tags.length >= 4) break;
    }
    return tags;
};

// Finds a "27 October 2026" style date in the pasted header, returns YYYY-MM-DD or ''.
export const detectDate = (text) => {
    const m = String(text || '').slice(0, 300).match(new RegExp(`(\\d{1,2})\\s+(${MONTHS.join('|')})\\s+(\\d{4})`, 'i'));
    if (!m) return '';
    const mm = String(MONTHS.indexOf(m[2].toLowerCase()) + 1).padStart(2, '0');
    return `${m[3]}-${mm}-${m[1].padStart(2, '0')}`;
};

export const parseCurrentAffairs = (raw) => {
    const text = String(raw || '').replace(/\r/g, '').trim();
    if (!text) return [];

    let chunks;
    if (BULLET.test(text)) {
        chunks = text.split(new RegExp(BULLET.source)).slice(1); // first piece is the header / quote of the day
    } else {
        chunks = text.split(/\n\s*\n/);
    }

    const items = [];
    for (const chunk of chunks) {
        const lines = chunk.split('\n').map(cleanSentence).filter(Boolean);
        if (!lines.length) continue;
        const hi = lines.filter(l => DEVANAGARI.test(l)).join(' ');
        const en = lines.filter(l => !DEVANAGARI.test(l)).join(' ');
        const primary = en || hi;
        if (!primary) continue;
        items.push({
            category: guessCategory(en || hi),
            title: toTitle(primary),
            content: [en, hi].filter(Boolean).join('\n\n'),
            keyPoints: [],
            tags: en ? guessTags(en) : []
        });
    }
    return items;
};

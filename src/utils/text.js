export const stripHtml = (html) => {
    if (!html) return '';
    let text = html.replace(/<[^>]*>/g, '');
    text = text
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'");
    return text.replace(/\s+/g, ' ').trim();
};

export const generateExcerpt = (text, length = 160) => {
    if (!text) return '';
    const clean = stripHtml(text);
    return clean.length <= length ? clean : clean.substring(0, length).trim() + '...';
};

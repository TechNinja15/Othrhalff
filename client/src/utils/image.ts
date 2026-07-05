export const getOptimizedUrl = (url: string | undefined | null, width: number = 100) => {
<<<<<<< HEAD
    if (!url || !url.includes('supabase')) return url || ''; // Return original if not supabase or empty
=======
    if (!url) return '';
    if (url.startsWith('data:')) return url; // Return base64 data URLs as-is
    if (!url.includes('supabase')) return url; // Return original if not supabase or empty

    const isAvatar = url.includes('/images/') || url.toLowerCase().includes('avatar');
    const quality = isAvatar ? 100 : 70;
>>>>>>> c345bdeeec9320808b31a52a987c64dd3bc96059

    // Supabase Storage Transformation URL
    // If it already has query params, append using &
    const separator = url.includes('?') ? '&' : '?';
<<<<<<< HEAD
    return `${url}${separator}width=${width}&quality=60&resize=cover`;
=======
    return `${url}${separator}width=${width}&quality=${quality}&resize=cover`;
>>>>>>> c345bdeeec9320808b31a52a987c64dd3bc96059
};

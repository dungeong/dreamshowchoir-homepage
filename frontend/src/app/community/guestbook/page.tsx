'use client';

import { useEffect } from 'react';

export default function GuestbookPage() {
    useEffect(() => {
        // Use NEXT_PUBLIC_ prefix for client-side environment variables in Next.js
        const uid = process.env.NEXT_PUBLIC_LIVERE_UID;

        if (!uid) {
            console.error("LiveRe UID is missing! Please make sure 'NEXT_PUBLIC_LIVERE_UID' is set in your .env file.");
            // Don't return, let it try (or fail visible), but the log helps.
        }

        const scriptId = 'livere-script';

        // Cleanup function to remove script and clear container
        const cleanup = () => {
            const s = document.getElementById(scriptId);
            if (s) s.remove();

            const container = document.getElementById('lv-container');
            if (container) container.innerHTML = '';
        };

        // Debounce the script injection to handle React Strict Mode double-invocation
        const timer = setTimeout(() => {
            // Reset: remove old script and clear container to force clean slate
            cleanup();

            const script = document.createElement('script');
            script.id = scriptId;
            script.src = 'https://cdn-city.livere.com/js/embed.dist.js';
            script.async = true;
            document.body.appendChild(script);
        }, 100);


        return () => {
            clearTimeout(timer);
            cleanup();
        };
    }, []);


    // Use NEXT_PUBLIC_ prefix for client-side environment variables in Next.js
    const uid = process.env.NEXT_PUBLIC_LIVERE_UID;

    return (
        <div className="min-h-[500px]">
            {/* LiveRe Container */}
            <div id="lv-container" data-id="city" data-uid={uid}>
                <noscript>라이브리 댓글 작성을 위해 자바스크립트를 활성화 해주세요.</noscript>
            </div>
        </div>
    );
}


'use client';

import DOMPurify from 'dompurify';
import { useEffect, useState } from 'react';

interface SafeHtmlProps {
    html: string;
    className?: string;
}

export function SafeHtml({ html, className }: SafeHtmlProps) {
    const [sanitizedHtml, setSanitizedHtml] = useState('');
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        setSanitizedHtml(DOMPurify.sanitize(html));
    }, [html]);

    if (!isMounted) {
        return null; // or a loading skeleton, or render unsanitized if trusted (but unsafe)
    }

    return (
        <div
            className={className}
            dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
        />
    );
}

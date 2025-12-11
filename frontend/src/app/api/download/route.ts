import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const fileUrl = searchParams.get('url');
    const fileName = searchParams.get('filename');

    if (!fileUrl || !fileName) {
        return new NextResponse('Missing url or filename', { status: 400 });
    }

    try {
        const response = await fetch(fileUrl);
        if (!response.ok) throw new Error(`Failed to fetch file: ${response.statusText}`);

        const blob = await response.blob();
        const headers = new Headers();

        // Handle Korean filenames correctly
        const encodedFileName = encodeURIComponent(fileName);
        headers.set('Content-Disposition', `attachment; filename="${encodedFileName}"; filename*=UTF-8''${encodedFileName}`);
        headers.set('Content-Type', response.headers.get('Content-Type') || 'application/octet-stream');

        if (response.headers.get('Content-Length')) {
            headers.set('Content-Length', response.headers.get('Content-Length')!);
        }

        return new NextResponse(blob, { headers });
    } catch (error) {
        console.error('Download proxy error:', error);
        return new NextResponse('Failed to download file', { status: 500 });
    }
}

'use client';

import { useEffect, useRef, useState } from 'react';
import Script from 'next/script';
import { MapPin, Phone, Mail } from 'lucide-react';

declare global {
    interface Window {
        naver: any;
    }
}

export function Location() {
    const mapRef = useRef<HTMLDivElement>(null);
    const [mapLoaded, setMapLoaded] = useState(false);

    const initializeMapInstance = () => {
        if (!mapRef.current || !window.naver || !window.naver.maps) return;

        const location = new window.naver.maps.LatLng(35.5555633820959, 129.322141630112); // User provided coordinates

        const mapOptions = {
            center: location,
            zoom: 17,
            minZoom: 10,
            zoomControl: true,
            zoomControlOptions: {
                position: window.naver.maps.Position.TOP_RIGHT
            }
        };

        const map = new window.naver.maps.Map(mapRef.current, mapOptions);

        new window.naver.maps.Marker({
            position: location,
            map: map,
            title: "드림쇼콰이어"
        });
    };

    const initMap = () => {
        // Retry mechanism: Wait for window.naver to be available
        const checkInterval = setInterval(() => {
            if (window.naver && window.naver.maps) {
                clearInterval(checkInterval);
                initializeMapInstance();
            }
        }, 100); // Check every 100ms

        // Timeout after 5 seconds
        setTimeout(() => {
            clearInterval(checkInterval);
            if (!window.naver || !window.naver.maps) {
                console.error("Map initialization failed: window.naver not found after 5s");
            }
        }, 5000);
    };

    useEffect(() => {
        if (mapLoaded) {
            initMap();
        }
    }, [mapLoaded]);

    return (
        <div className="space-y-8">
            <Script
                src={`https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID}`}
                strategy="afterInteractive"
                onReady={() => {
                    setMapLoaded(true);
                }}
            />

            {/* Map Placeholder */}
            <div className="w-full aspect-video bg-gray-100 rounded-xl overflow-hidden shadow-inner border border-gray-200 relative">
                <div ref={mapRef} className="w-full h-full" />
                {!mapLoaded && (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-500 bg-gray-50">
                        <div className="text-center">
                            <MapPin className="w-12 h-12 mx-auto mb-2 opacity-50" />
                            <p>지도를 불러오는 중입니다...</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="flex items-center gap-3 mb-2 text-primary">
                        <MapPin className="w-5 h-5" />
                        <h3 className="font-bold">주소</h3>
                    </div>
                    <p className="text-gray-600 pl-8">
                        울산광역시 중구 학성로 101 4층<br />
                        (성남동, 시계탑사거리 인근)
                    </p>
                </div>

                <div className="p-6 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="flex items-center gap-3 mb-2 text-primary">
                        <Phone className="w-5 h-5" />
                        <h3 className="font-bold">연락처</h3>
                    </div>
                    <div className="text-gray-600 pl-8 space-y-1">
                        <p>전화: 010-5592-0970</p>
                        <p>이메일: dreamshowchoir0524@gmail.com</p>
                    </div>
                </div>
            </div>

            {/* Transportation Info (Optional) */}
            <div className="p-6 bg-white border border-gray-200 rounded-xl">
                <h3 className="font-bold text-lg mb-4">오시는 방법</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                    <li><span className="font-bold mr-2">버스</span> 성남동 정류장 하차 후 도보 5분</li>
                    <li><span className="font-bold mr-2">자차</span> 건물 내 주차장 없음 (인근 공영주차장 이용)</li>
                </ul>
            </div>
        </div>
    );
}

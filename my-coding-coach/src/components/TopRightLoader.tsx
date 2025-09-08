"use client";

import { Loader2 } from 'lucide-react';

export default function TopRightLoader({ visible, text }: { visible: boolean; text?: string }) {
    if (!visible) return null;
    return (
        <div className="fixed top-4 right-4 z-50">
            <div className="bg-white/95 border shadow-lg rounded-lg px-4 py-2 flex items-center space-x-2">
                <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
                {text ? <span className="text-sm text-gray-800">{text}</span> : null}
            </div>
        </div>
    );
} 
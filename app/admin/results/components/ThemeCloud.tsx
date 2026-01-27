// app/admin/results/components/ThemeCloud.tsx
import React from 'react';
import { AnalyticTheme } from '@/lib/analytics';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ThemeCloudProps {
    themes: AnalyticTheme[];
}

export const ThemeCloud: React.FC<ThemeCloudProps> = ({ themes }) => {
    if (themes.length === 0) {
        return <div className="text-sm text-muted-foreground italic">No specific themes detected yet.</div>;
    }

    return (
        <div className="flex flex-wrap gap-2">
            {themes.map((theme, idx) => {
                const isPositive = theme.sentiment === 'positive';
                const isConstructive = theme.sentiment === 'constructive';

                return (
                    <Badge
                        key={idx}
                        variant="outline"
                        className={cn(
                            "text-sm py-1 px-3 border-2",
                            isPositive ? "bg-green-50 text-green-700 border-green-100 hover:bg-green-100" :
                                isConstructive ? "bg-amber-50 text-amber-700 border-amber-100 hover:bg-amber-100" :
                                    "bg-gray-50 text-gray-600 border-gray-100"
                        )}
                    >
                        {theme.name}
                        <span className="ml-2 text-xs opacity-70 bg-black/5 rounded-full px-1.5">{theme.count}</span>
                    </Badge>
                );
            })}
        </div>
    );
};

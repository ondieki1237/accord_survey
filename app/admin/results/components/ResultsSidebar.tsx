// app/admin/results/components/ResultsSidebar.tsx
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';

interface ResultsSidebarProps {
    employees: any[];
    selectedId: string | null;
    onSelect: (id: string) => void;
    stats: any;
}

export const ResultsSidebar: React.FC<ResultsSidebarProps> = ({ employees, selectedId, onSelect, stats }) => {
    const [filter, setFilter] = React.useState('');

    const filtered = employees.filter(e => e.name.toLowerCase().includes(filter.toLowerCase()));

    return (
        <div className="w-80 border-r bg-white flex flex-col h-[calc(100vh-64px)]">
            <div className="p-4 border-b">
                <h3 className="font-semibold mb-2">Employees</h3>
                <Input
                    placeholder="Search employees..."
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="h-9"
                />
            </div>
            <ScrollArea className="flex-1">
                <div className="p-2">
                    {filtered.map(emp => {
                        const empStats = stats.byEmployee[emp._id];
                        const avg = empStats ? parseFloat(empStats.averageScore).toFixed(1) : '-';

                        return (
                            <button
                                key={emp._id}
                                onClick={() => onSelect(emp._id)}
                                className={cn(
                                    "w-full text-left p-3 rounded-md mb-1 transition-colors flex items-center justify-between group",
                                    selectedId === emp._id ? "bg-primary/10 text-primary font-medium" : "hover:bg-gray-100 text-gray-700"
                                )}
                            >
                                <div>
                                    <div className="truncate w-40">{emp.name}</div>
                                    <div className="text-xs text-muted-foreground truncate w-40">{emp.role}</div>
                                </div>
                                <div className={cn(
                                    "text-sm font-semibold px-2 py-0.5 rounded",
                                    selectedId === emp._id ? "bg-white/50" : "bg-gray-100 group-hover:bg-white"
                                )}>
                                    {avg}
                                </div>
                            </button>
                        );
                    })}
                </div>
            </ScrollArea>
        </div>
    );
};

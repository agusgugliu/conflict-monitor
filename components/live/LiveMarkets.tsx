'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MarketData {
    symbol: string;
    name: string;
    price: number;
    change: number;
    impactScale: 'high' | 'medium' | 'low';
}

const BASE_MARKETS: Record<string, MarketData[]> = {
    ukraine: [
        { symbol: 'WHEAT', name: 'Wheat Futures', price: 680.50, change: 24.5, impactScale: 'high' },
        { symbol: 'UKOIL', name: 'Brent Crude', price: 82.30, change: 1.2, impactScale: 'medium' },
        { symbol: 'NGAS', name: 'Natural Gas', price: 2.85, change: 0.45, impactScale: 'high' },
        { symbol: 'GOLD', name: 'Gold Index', price: 2341.20, change: -5.4, impactScale: 'low' },
    ],
    iran: [
        { symbol: 'USOIL', name: 'WTI Crude', price: 89.40, change: 6.8, impactScale: 'high' },
        { symbol: 'BRENT', name: 'Brent Crude', price: 92.10, change: 7.2, impactScale: 'high' },
        { symbol: 'GOLD', name: 'Gold / Safe Haven', price: 2450.00, change: 35.5, impactScale: 'high' },
        { symbol: 'SPX', name: 'S&P 500', price: 5120.50, change: -85.2, impactScale: 'medium' },
    ]
};

export default function LiveMarkets({ activeConflict }: { activeConflict: string }) {
    const [markets, setMarkets] = useState<MarketData[]>([]);

    useEffect(() => {
        // initialize base market data for active conflict
        setMarkets(BASE_MARKETS[activeConflict] || []);

        const intervalId = setInterval(() => {
            // randomly fluctuate prices
            setMarkets(prev => prev.map(m => {
                let volatility = 0;
                if (m.impactScale === 'high') volatility = 0.5;
                if (m.impactScale === 'medium') volatility = 0.2;
                if (m.impactScale === 'low') volatility = 0.05;

                // generate random fluctuation based on volatility (-1 to 1) 
                const fluc = (Math.random() * 2 - 1) * volatility;
                const newPrice = m.price + fluc;
                const newChange = m.change + fluc;

                return {
                    ...m,
                    price: Number(newPrice.toFixed(2)),
                    change: Number(newChange.toFixed(2))
                };
            }));
        }, 2500); // Update every 2.5 seconds

        return () => clearInterval(intervalId);
    }, [activeConflict]);

    return (
        <div className="flex flex-col gap-2">
            {markets.map((m) => {
                const isUp = m.change > 0;
                const isDown = m.change < 0;

                return (
                    <div key={m.symbol} className="flex flex-col p-2.5 rounded-lg border border-[#30363d] bg-[#161b22] hover:bg-[#21262d] transition-colors">
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-xs font-bold text-white">{m.name} <span className="text-[#8b949e] font-normal">({m.symbol})</span></span>
                            {m.impactScale === 'high' && <span className="text-[9px] text-[#e05252] font-semibold border border-[#e05252]/50 px-1 rounded uppercase tracking-widest bg-[#e05252]/10">High Impact</span>}
                        </div>
                        <div className="flex justify-between items-end">
                            <span className="text-sm font-bold text-white">${m.price.toFixed(2)}</span>
                            <div className={`flex items-center gap-1 text-xs font-medium ${isUp ? 'text-[#3fb950]' : isDown ? 'text-[#e05252]' : 'text-[#8b949e]'}`}>
                                {isUp ? <TrendingUp size={12} /> : isDown ? <TrendingDown size={12} /> : <Minus size={12} />}
                                {isUp ? '+' : ''}{m.change.toFixed(2)}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

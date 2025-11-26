'use client';

import { RiStarFill } from '@remixicon/react';

interface SatisfactionChartProps {
  data?: {
    ratings: Array<{ stars: number; count: number }>;
    averageRating: number;
  } | null;
}

export function SatisfactionChart({ data }: SatisfactionChartProps) {
  if (!data || !data.ratings || data.ratings.length === 0) {
    return (
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Customer Satisfaction</h3>
        <div className="h-64 flex items-center justify-center">
          <p className="text-muted-foreground">No data available</p>
        </div>
      </div>
    );
  }

  const maxCount = Math.max(...data.ratings.map((r) => r.count));
  const totalRatings = data.ratings.reduce((sum, r) => sum + r.count, 0);

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">Customer Satisfaction</h3>
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-foreground">{data.averageRating.toFixed(1)}</span>
          <RiStarFill size={20} className="text-yellow-500" />
        </div>
      </div>
      
      <div className="space-y-3">
        {data.ratings.sort((a, b) => b.stars - a.stars).map((rating) => {
          const percentage = maxCount > 0 ? (rating.count / maxCount) * 100 : 0;
          const ratingPercentage = totalRatings > 0 ? (rating.count / totalRatings) * 100 : 0;
          
          return (
            <div key={rating.stars} className="flex items-center gap-3">
              <div className="flex items-center gap-1 w-20">
                <span className="text-sm font-medium text-foreground">{rating.stars}</span>
                <RiStarFill size={14} className="text-yellow-500" />
              </div>
              
              <div className="flex-1 h-8 bg-muted rounded-lg overflow-hidden relative">
                <div
                  className="h-full bg-yellow-500 transition-all"
                  style={{ width: `${percentage}%` }}
                ></div>
                <div className="absolute inset-0 flex items-center px-3">
                  <span className="text-xs font-medium text-foreground">
                    {rating.count} ({ratingPercentage.toFixed(0)}%)
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="mt-4 pt-4 border-t border-border">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Total Ratings</span>
          <span className="font-medium text-foreground">{totalRatings}</span>
        </div>
      </div>
    </div>
  );
}

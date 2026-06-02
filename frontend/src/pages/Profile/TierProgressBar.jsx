import React from 'react';
import { ChevronRight, Award, Zap, Trophy } from 'lucide-react';

export default function TierProgressBar({ currentPoints, tiers, currentTier }) {
  // Sort tiers by minPoints to find the next one
  const sortedTiers = [...tiers].sort((a, b) => a.minPoints - b.minPoints);
  const currentTierIndex = sortedTiers.findIndex(t => t.id === currentTier?.id);
  const nextTier = sortedTiers[currentTierIndex + 1];

  if (!nextTier) {
    return (
      <div className="bg-gradient-to-br from-yellow-400 to-orange-600 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:scale-125 transition-transform duration-500">
          <Trophy className="w-32 h-32" />
        </div>
        <div className="relative z-10">
          <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-black uppercase tracking-widest">Cấp độ tối đa</span>
          <h2 className="text-4xl font-black mt-4 mb-2">Hạng {currentTier?.name}</h2>
          <p className="text-white/80 font-bold max-w-xs">Bạn đã đạt đến cấp độ cao nhất. Hãy tận hưởng mọi đặc quyền VIP nhất của chúng tôi!</p>
          <div className="mt-8 flex items-baseline gap-2">
            <span className="text-5xl font-black tabular-nums">{currentPoints.toLocaleString()}</span>
            <span className="text-xl font-bold opacity-60 uppercase">Điểm tích lũy</span>
          </div>
        </div>
      </div>
    );
  }

  const pointsToNext = nextTier.minPoints - currentPoints;
  const progressPercent = Math.min(100, (currentPoints / nextTier.minPoints) * 100);

  return (
    <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-50 rounded-xl">
              <Award className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-sm font-black text-blue-600 uppercase tracking-widest">Tiến trình hạng {nextTier.name}</span>
          </div>
          <h3 className="text-3xl font-black text-gray-900">
            Còn <span className="text-blue-600 tabular-nums">{pointsToNext.toLocaleString()}</span> điểm
          </h3>
          <p className="text-gray-500 font-bold mt-1 text-lg">để thăng hạng tiếp theo</p>
        </div>

        <div className="text-right">
          <span className="text-sm font-bold text-gray-400 uppercase block mb-1">Tổng điểm hiện tại</span>
          <span className="text-4xl font-black text-gray-900 tabular-nums">{currentPoints.toLocaleString()}</span>
        </div>
      </div>

      <div className="relative pt-1">
        <div className="flex mb-2 items-center justify-between">
          <div>
            <span className="text-xs font-black inline-block py-1 px-2 uppercase rounded-full text-blue-600 bg-blue-100">
              {Math.floor(progressPercent)}% Hoàn thành
            </span>
          </div>
          <div className="text-right">
            <span className="text-xs font-black inline-block text-gray-400 uppercase">
              Mục tiêu: {nextTier.minPoints.toLocaleString()}
            </span>
          </div>
        </div>
        <div className="overflow-hidden h-4 mb-4 text-xs flex rounded-full bg-gray-100 border border-gray-50 shadow-inner">
          <div 
            style={{ width: `${progressPercent}%` }}
            className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-blue-500 to-blue-700 transition-all duration-1000 ease-out relative"
          >
            <div className="absolute top-0 right-0 bottom-0 w-8 bg-white/20 skew-x-[-20deg] animate-pulse" />
          </div>
        </div>
      </div>

      <div className="mt-6 p-4 bg-gray-50 rounded-2xl flex items-start gap-4">
        <div className="p-2 bg-orange-100 rounded-lg">
          <Zap className="w-5 h-5 text-orange-600" />
        </div>
        <div>
          <p className="text-sm font-bold text-gray-900">Đặc quyền sắp nhận: {nextTier.name}</p>
          <ul className="mt-2 space-y-1">
            {nextTier.benefits.slice(0, 2).map((b, i) => (
              <li key={i} className="text-xs text-gray-500 font-medium flex items-center gap-2">
                <ChevronRight className="w-3 h-3 text-blue-400" />
                {b.benefitId?.name}: <b>{typeof b.value === 'boolean' ? (b.value ? 'Có' : 'Không') : b.value}</b>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

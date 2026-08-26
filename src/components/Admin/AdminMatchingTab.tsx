import React, { useState } from 'react';
import {
  ArrowRight,
  Search,
  CheckCircle2,
  Clock,
  Star,
  Sparkles,
  TrendingUp,
  Filter,
} from 'lucide-react';
import { SessionData, BeforeAfterPair } from '../../types';

interface AdminMatchingTabProps {
  session: SessionData;
  pairs: BeforeAfterPair[];
}

export const AdminMatchingTab: React.FC<AdminMatchingTabProps> = ({
  session,
  pairs,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<
    'all' | 'both' | 'before_only' | 'after_only'
  >('all');

  const sessionPairs = pairs.filter((p) => p.sessionId === session.id);

  const filteredPairs = sessionPairs.filter((pair) => {
    const matchesSearch = pair.studentName
      .toLowerCase()
      .includes(searchTerm.toLowerCase().trim());
    if (!matchesSearch) return false;
    if (statusFilter === 'both') return pair.hasBoth;
    if (statusFilter === 'before_only')
      return pair.beforeResponse && !pair.afterResponse;
    if (statusFilter === 'after_only')
      return !pair.beforeResponse && pair.afterResponse;
    return true;
  });

  const bothCount = sessionPairs.filter((p) => p.hasBoth).length;
  const beforeOnlyCount = sessionPairs.filter(
    (p) => p.beforeResponse && !p.afterResponse
  ).length;

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="bg-[#fcfcf9] p-5 sm:p-6 rounded-2xl border border-[#e2e2d8] shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base sm:text-lg font-extrabold text-[#2d2d26] flex items-center space-x-2">
            <span>🔄 1:1 비포 & 애프터(Before & After) 매칭 추적기</span>
          </h3>
          <p className="text-xs sm:text-sm text-[#7a7a6e] mt-1">
            개별 참여자별로 수업 전 느꼈던 감정과 수업 후 변화된 소감을 1:1로 비교 분석합니다.
          </p>
        </div>

        <div className="flex items-center space-x-3 text-xs font-semibold">
          <div className="px-3 py-1.5 rounded-lg bg-[#ebf0ea] text-[#3d5a3c] border border-[#c8d9c6]">
            완전 매칭 완료: {bothCount}명
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-[#f5eee6] text-[#7a5332] border border-[#e8d5c4]">
            사전만 완료: {beforeOnlyCount}명
          </div>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-[#8a8a7a] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="참여자 이름 검색..."
            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-[#fcfcf9] border border-[#e2e2d8] text-[#2d2d26] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5a5a40] shadow-2xs"
          />
        </div>

        <div className="flex items-center space-x-1.5 bg-[#eaeae2] p-1 rounded-xl w-full sm:w-auto">
          <button
            onClick={() => setStatusFilter('all')}
            className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              statusFilter === 'all'
                ? 'bg-white text-[#2d2d26] shadow-2xs'
                : 'text-[#5a5a4e] hover:text-[#2d2d26]'
            }`}
          >
            전체 ({sessionPairs.length})
          </button>
          <button
            onClick={() => setStatusFilter('both')}
            className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              statusFilter === 'both'
                ? 'bg-[#5a5a40] text-[#f5f5f0] shadow-2xs'
                : 'text-[#5a5a4e] hover:text-[#2d2d26]'
            }`}
          >
            전/후 완료 ({bothCount})
          </button>
          <button
            onClick={() => setStatusFilter('before_only')}
            className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              statusFilter === 'before_only'
                ? 'bg-[#7a5332] text-[#f5f5f0] shadow-2xs'
                : 'text-[#5a5a4e] hover:text-[#2d2d26]'
            }`}
          >
            사전만 ({beforeOnlyCount})
          </button>
        </div>
      </div>

      {/* Matched Cards List */}
      <div className="space-y-3 sm:space-y-4">
        {filteredPairs.length > 0 ? (
          filteredPairs.map((pair) => {
            const hasBefore = !!pair.beforeResponse;
            const hasAfter = !!pair.afterResponse;
            const isFullyMatched = hasBefore && hasAfter;

            return (
              <div
                key={pair.studentName}
                className={`bg-[#fcfcf9] rounded-2xl border transition-all p-5 shadow-2xs ${
                  isFullyMatched
                    ? 'border-[#c8d9c6] hover:border-[#a6c4a3]'
                    : 'border-[#e2e2d8] hover:border-[#cfcfc4]'
                }`}
              >
                {/* Card Header */}
                <div className="flex items-center justify-between pb-3 border-b border-[#eaeae0]">
                  <div className="flex items-center space-x-2.5">
                    <span className="font-extrabold text-[#2d2d26] text-base">
                      {pair.studentName}
                    </span>
                    {isFullyMatched ? (
                      <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-[#ebf0ea] text-[#3d5a3c] text-[11px] font-bold border border-[#c8d9c6]">
                        <CheckCircle2 className="w-3 h-3 text-[#3d5a3c]" />
                        <span>비포&애프터 매칭 완료</span>
                      </span>
                    ) : hasBefore ? (
                      <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-[#f5eee6] text-[#7a5332] text-[11px] font-bold border border-[#e8d5c4]">
                        <Clock className="w-3 h-3 text-[#7a5332]" />
                        <span>수업 후 소감 대기 중</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-[#eaf0f2] text-[#3d5863] text-[11px] font-bold border border-[#cadbe1]">
                        <span>수업 후만 기록됨</span>
                      </span>
                    )}
                  </div>

                  {pair.afterResponse?.rating && (
                    <div className="flex items-center space-x-1 text-xs font-bold text-[#c89240]">
                      <Star className="w-3.5 h-3.5 fill-[#c89240] text-[#c89240]" />
                      <span>{pair.afterResponse.rating}점</span>
                    </div>
                  )}
                </div>

                {/* Side-by-side comparison grid */}
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Before Box */}
                  <div className="p-3.5 rounded-xl bg-[#f8f8f4] border border-[#e2e2d8]">
                    <div className="flex items-center justify-between text-xs font-bold text-[#7a5332] mb-2">
                      <span>[수업 전 Before] 기분 & 기대평</span>
                      <span className="text-[10px] text-[#8a8a7a] font-normal">
                        {pair.beforeResponse?.timestamp || '-'}
                      </span>
                    </div>

                    {pair.beforeResponse ? (
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xl">
                            {pair.beforeResponse.categoryCode === 'A'
                              ? '✨'
                              : pair.beforeResponse.categoryCode === 'B'
                              ? '🌿'
                              : '🥱'}
                          </span>
                          <div>
                            <span className="text-xs font-extrabold text-[#2d2d26]">
                              &ldquo;{pair.beforeResponse.emotionWord}&rdquo;
                            </span>
                            <span className="text-[10px] text-[#7a7a6e] ml-1.5">
                              ({pair.beforeResponse.categoryName})
                            </span>
                          </div>
                        </div>

                        {pair.beforeResponse.comment && (
                          <div className="mt-2 text-xs text-[#4a4a40] bg-white p-2.5 rounded-lg border border-[#e2e2d8]">
                            <span className="font-semibold text-[#2d2d26] block mb-0.5">
                              💡 사전 기대/질문:
                            </span>
                            {pair.beforeResponse.comment}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-xs text-[#8a8a7a] py-3 italic">
                        수업 전 체크인 기록이 없습니다.
                      </div>
                    )}
                  </div>

                  {/* After Box */}
                  <div
                    className={`p-3.5 rounded-xl border ${
                      hasAfter
                        ? 'bg-[#eaf0f2]/60 border-[#cadbe1]'
                        : 'bg-[#f8f8f4] border-dashed border-[#e2e2d8]'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-bold text-[#3d5863] mb-2">
                      <span>[수업 후 After] 변화된 기분 & 소감</span>
                      <span className="text-[10px] text-[#8a8a7a] font-normal">
                        {pair.afterResponse?.timestamp || '-'}
                      </span>
                    </div>

                    {pair.afterResponse ? (
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xl">
                            {pair.afterResponse.categoryCode === 'A'
                              ? '🏆'
                              : pair.afterResponse.categoryCode === 'B'
                              ? '🌿'
                              : '💤'}
                          </span>
                          <div>
                            <span className="text-xs font-extrabold text-[#2d2d26]">
                              &ldquo;{pair.afterResponse.emotionWord}&rdquo;
                            </span>
                            <span className="text-[10px] text-[#3d5863] ml-1.5 font-semibold">
                              ({pair.afterResponse.categoryName})
                            </span>
                          </div>
                        </div>

                        {pair.afterResponse.comment && (
                          <div className="mt-2 text-xs text-[#4a4a40] bg-white p-2.5 rounded-lg border border-[#cadbe1]">
                            <span className="font-semibold text-[#2d2d26] block mb-0.5">
                              🏆 수업 후 소감:
                            </span>
                            {pair.afterResponse.comment}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-xs text-[#8a8a7a] py-3 italic">
                        수업 후 소감이 아직 기록되지 않았습니다.
                      </div>
                    )}
                  </div>
                </div>

                {/* Trajectory pill if both exist */}
                {isFullyMatched && (
                  <div className="mt-3 pt-3 border-t border-[#eaeae0] flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2 text-[#5a5a4e]">
                      <span className="font-semibold text-[#2d2d26]">
                        감정 변화 궤적:
                      </span>
                      <span className="font-bold text-[#7a5332]">
                        {pair.beforeResponse?.emotionWord}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#8a8a7a]" />
                      <span className="font-bold text-[#3d5a3c]">
                        {pair.afterResponse?.emotionWord}
                      </span>
                    </div>

                    <span className="text-[11px] text-[#3d5a3c] font-bold bg-[#ebf0ea] border border-[#c8d9c6] px-2 py-0.5 rounded">
                      {pair.beforeResponse?.categoryCode === 'C' &&
                      pair.afterResponse?.categoryCode === 'A'
                        ? '✨ 극적 긍정 전환'
                        : '긍정 피드백 기록됨'}
                    </span>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="bg-[#fcfcf9] rounded-2xl border border-[#e2e2d8] p-8 text-center text-[#8a8a7a] text-sm">
            검색 결과에 해당하는 매칭 데이터가 없습니다.
          </div>
        )}
      </div>
    </div>
  );
};

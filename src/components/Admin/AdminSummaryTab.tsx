import React, { useState } from 'react';
import {
  Users,
  Sun,
  Award,
  TrendingUp,
  ArrowRight,
  Filter,
  Download,
  Calendar,
  MessageSquare,
  Star,
  Sparkles,
} from 'lucide-react';
import { SessionData, EmotionResponse, BeforeAfterPair } from '../../types';
import { DEFAULT_CATEGORIES } from '../../data/defaultEmotions';

interface AdminSummaryTabProps {
  session: SessionData;
  responses: EmotionResponse[];
  pairs: BeforeAfterPair[];
  onDownloadCSV: () => void;
}

export const AdminSummaryTab: React.FC<AdminSummaryTabProps> = ({
  session,
  responses,
  pairs,
  onDownloadCSV,
}) => {
  const [feedFilter, setFeedFilter] = useState<'all' | 'before' | 'after'>('all');

  const beforeList = responses.filter(
    (r) => r.sessionId === session.id && r.type === 'before'
  );
  const afterList = responses.filter(
    (r) => r.sessionId === session.id && r.type === 'after'
  );
  const sessionPairs = pairs.filter((p) => p.sessionId === session.id);
  const completedBothCount = sessionPairs.filter((p) => p.hasBoth).length;
  const rosterCount = session.roster?.length || 0;

  // Category counts for Before
  const beforeCatCounts = {
    A: beforeList.filter((r) => r.categoryCode === 'A').length,
    B: beforeList.filter((r) => r.categoryCode === 'B').length,
    C: beforeList.filter((r) => r.categoryCode === 'C').length,
  };

  // Category counts for After
  const afterCatCounts = {
    A: afterList.filter((r) => r.categoryCode === 'A').length,
    B: afterList.filter((r) => r.categoryCode === 'B').length,
    C: afterList.filter((r) => r.categoryCode === 'C').length,
  };

  const beforeTotal = beforeList.length || 1;
  const afterTotal = afterList.length || 1;

  // Positive shift rate calculation: participants who moved from B or C to A, or maintained A
  const positiveShiftCount = sessionPairs.filter((p) => {
    if (!p.beforeResponse || !p.afterResponse) return false;
    return p.afterResponse.categoryCode === 'A';
  }).length;
  const positiveShiftRate = completedBothCount > 0
    ? Math.round((positiveShiftCount / completedBothCount) * 100)
    : afterList.length > 0
    ? Math.round((afterCatCounts.A / afterList.length) * 100)
    : 0;

  // Top words
  const getTopWords = (list: EmotionResponse[]) => {
    const counts: Record<string, number> = {};
    list.forEach((r) => {
      counts[r.emotionWord] = (counts[r.emotionWord] || 0) + 1;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);
  };

  const topBeforeWords = getTopWords(beforeList);
  const topAfterWords = getTopWords(afterList);

  // Filtered response feed
  const sessionResponses = responses.filter((r) => r.sessionId === session.id);
  const filteredFeed =
    feedFilter === 'all'
      ? sessionResponses
      : sessionResponses.filter((r) => r.type === feedFilter);

  return (
    <div className="space-y-6">
      {/* Top Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-[#fcfcf9] p-4 sm:p-5 rounded-2xl border border-[#e2e2d8] shadow-2xs">
          <div className="flex items-center justify-between text-[#7a7a6e] text-xs font-semibold">
            <span>전체 등록 명단</span>
            <Users className="w-4 h-4 text-[#8a8a7a]" />
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-black text-[#2d2d26]">
            {rosterCount}
            <span className="text-xs font-normal text-[#7a7a6e] ml-1">명</span>
          </div>
          <div className="mt-1 text-xs text-[#7a7a6e]">수업 참여 대상자</div>
        </div>

        <div className="bg-[#fcfcf9] p-4 sm:p-5 rounded-2xl border border-[#c8d9c6] shadow-2xs">
          <div className="flex items-center justify-between text-[#3d5a3c] text-xs font-semibold">
            <span>수업 전 체크인</span>
            <Sun className="w-4 h-4 text-[#5a5a40]" />
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-black text-[#3d5a3c]">
            {beforeList.length}
            <span className="text-xs font-normal text-[#7a7a6e] ml-1">
              / {rosterCount}명
            </span>
          </div>
          <div className="mt-1 text-xs text-[#3d5a3c] font-medium">
            참여율: {rosterCount ? Math.round((beforeList.length / rosterCount) * 100) : 0}%
          </div>
        </div>

        <div className="bg-[#fcfcf9] p-4 sm:p-5 rounded-2xl border border-[#cadbe1] shadow-2xs">
          <div className="flex items-center justify-between text-[#3d5863] text-xs font-semibold">
            <span>수업 후 소감 기록</span>
            <Award className="w-4 h-4 text-[#4a6572]" />
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-black text-[#3d5863]">
            {afterList.length}
            <span className="text-xs font-normal text-[#7a7a6e] ml-1">
              / {rosterCount}명
            </span>
          </div>
          <div className="mt-1 text-xs text-[#3d5863] font-medium">
            참여율: {rosterCount ? Math.round((afterList.length / rosterCount) * 100) : 0}%
          </div>
        </div>

        <div className="bg-[#5a5a40] p-4 sm:p-5 rounded-2xl text-[#f5f5f0] shadow-xs">
          <div className="flex items-center justify-between text-[#d4c5a9] text-xs font-semibold">
            <span>긍정 전환율 (교육 효과)</span>
            <TrendingUp className="w-4 h-4" />
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-black">
            {positiveShiftRate}%
          </div>
          <div className="mt-1 text-xs text-[#f5f5f0]/80 font-medium">
            1:1 매칭 완료 {completedBothCount}명 기준
          </div>
        </div>
      </div>

      {/* Before vs After Distribution Chart & Top Words */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Proportion Shift */}
        <div className="bg-[#fcfcf9] p-5 sm:p-6 rounded-2xl border border-[#e2e2d8] shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-extrabold text-[#2d2d26] text-sm sm:text-base">
              📊 감정 카테고리 변화 분포 (Before ➡️ After)
            </h3>
            <span className="text-xs text-[#7a7a6e]">
              총 응답 {sessionResponses.length}건
            </span>
          </div>

          <div className="space-y-4">
            {/* Category A: Positive */}
            <div className="p-3.5 rounded-xl bg-[#ebf0ea]/70 border border-[#c8d9c6]">
              <div className="flex items-center justify-between text-xs font-bold text-[#3d5a3c] mb-1.5">
                <span>A. 긍정과 에너지 (설레는, 자신감 등)</span>
                <span>
                  {Math.round((beforeCatCounts.A / beforeTotal) * 100)}% ➡️{' '}
                  <strong className="text-[#2c402b] text-sm">
                    {Math.round((afterCatCounts.A / afterTotal) * 100)}%
                  </strong>
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div>
                  <span className="text-[10px] text-[#7a7a6e] block mb-0.5">
                    수업 전: {beforeCatCounts.A}명
                  </span>
                  <div className="w-full bg-[#d5e0d4] rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-[#5a7d57] h-2 rounded-full transition-all"
                      style={{
                        width: `${(beforeCatCounts.A / beforeTotal) * 100}%`,
                      }}
                    />
                  </div>
                </div>
                <div>
                  <span className="text-[10px] text-[#3d5a3c] font-semibold block mb-0.5">
                    수업 후: {afterCatCounts.A}명
                  </span>
                  <div className="w-full bg-[#d5e0d4] rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-[#3d5a3c] h-2 rounded-full transition-all"
                      style={{
                        width: `${(afterCatCounts.A / afterTotal) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Category B: Calm */}
            <div className="p-3.5 rounded-xl bg-[#eaf0f2]/70 border border-[#cadbe1]">
              <div className="flex items-center justify-between text-xs font-bold text-[#3d5863] mb-1.5">
                <span>B. 차분과 평온 (진지한, 평온한 등)</span>
                <span>
                  {Math.round((beforeCatCounts.B / beforeTotal) * 100)}% ➡️{' '}
                  <strong className="text-[#2b3e47] text-sm">
                    {Math.round((afterCatCounts.B / afterTotal) * 100)}%
                  </strong>
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div>
                  <span className="text-[10px] text-[#7a7a6e] block mb-0.5">
                    수업 전: {beforeCatCounts.B}명
                  </span>
                  <div className="w-full bg-[#d3e0e5] rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-[#688796] h-2 rounded-full transition-all"
                      style={{
                        width: `${(beforeCatCounts.B / beforeTotal) * 100}%`,
                      }}
                    />
                  </div>
                </div>
                <div>
                  <span className="text-[10px] text-[#3d5863] font-semibold block mb-0.5">
                    수업 후: {afterCatCounts.B}명
                  </span>
                  <div className="w-full bg-[#d3e0e5] rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-[#4a6572] h-2 rounded-full transition-all"
                      style={{
                        width: `${(afterCatCounts.B / afterTotal) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Category C: Tense & Fatigued */}
            <div className="p-3.5 rounded-xl bg-[#f5eee6]/70 border border-[#e8d5c4]">
              <div className="flex items-center justify-between text-xs font-bold text-[#7a5332] mb-1.5">
                <span>C. 피로와 긴장 (피곤한, 막막한 등)</span>
                <span>
                  {Math.round((beforeCatCounts.C / beforeTotal) * 100)}% ➡️{' '}
                  <strong className="text-[#593d25] text-sm">
                    {Math.round((afterCatCounts.C / afterTotal) * 100)}%
                  </strong>
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div>
                  <span className="text-[10px] text-[#7a7a6e] block mb-0.5">
                    수업 전: {beforeCatCounts.C}명
                  </span>
                  <div className="w-full bg-[#e8dbcc] rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-[#966b47] h-2 rounded-full transition-all"
                      style={{
                        width: `${(beforeCatCounts.C / beforeTotal) * 100}%`,
                      }}
                    />
                  </div>
                </div>
                <div>
                  <span className="text-[10px] text-[#7a5332] font-semibold block mb-0.5">
                    수업 후: {afterCatCounts.C}명 (감소 효과)
                  </span>
                  <div className="w-full bg-[#e8dbcc] rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-[#7a5332] h-2 rounded-full transition-all"
                      style={{
                        width: `${(afterCatCounts.C / afterTotal) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Top Dominant Words Cloud */}
        <div className="bg-[#fcfcf9] p-5 sm:p-6 rounded-2xl border border-[#e2e2d8] shadow-2xs flex flex-col justify-between">
          <div>
            <h3 className="font-extrabold text-[#2d2d26] text-sm sm:text-base mb-4">
              💬 주요 감정 단어 랭킹
            </h3>

            <div className="space-y-4">
              {/* Before Top Words */}
              <div>
                <span className="text-xs font-bold text-[#7a5332] mb-2 flex items-center space-x-1">
                  <Sun className="w-3.5 h-3.5" />
                  <span>수업 시작 전 주요 감정 TOP</span>
                </span>
                <div className="flex flex-wrap gap-2">
                  {topBeforeWords.length > 0 ? (
                    topBeforeWords.map(([word, count]) => (
                      <span
                        key={word}
                        className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#f5eee6] border border-[#e8d5c4] text-xs font-bold text-[#7a5332]"
                      >
                        <span>{word}</span>
                        <span className="bg-[#ead9c9] px-1.5 py-0.2 rounded text-[10px] text-[#7a5332]">
                          {count}명
                        </span>
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-[#8a8a7a]">
                      수업 전 데이터가 아직 없습니다.
                    </span>
                  )}
                </div>
              </div>

              {/* After Top Words */}
              <div className="pt-3 border-t border-[#e2e2d8]">
                <span className="text-xs font-bold text-[#3d5863] mb-2 flex items-center space-x-1">
                  <Award className="w-3.5 h-3.5" />
                  <span>수업 마친 후 주요 감정 TOP</span>
                </span>
                <div className="flex flex-wrap gap-2">
                  {topAfterWords.length > 0 ? (
                    topAfterWords.map(([word, count]) => (
                      <span
                        key={word}
                        className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#eaf0f2] border border-[#cadbe1] text-xs font-bold text-[#3d5863]"
                      >
                        <span>{word}</span>
                        <span className="bg-[#cadbe1] px-1.5 py-0.2 rounded text-[10px] text-[#3d5863]">
                          {count}명
                        </span>
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-[#8a8a7a]">
                      수업 후 데이터가 아직 없습니다.
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[#e2e2d8] flex items-center justify-between">
            <span className="text-xs text-[#7a7a6e]">
              엑셀 호환 CSV 데이터 전체 백업
            </span>
            <button
              onClick={onDownloadCSV}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-[#5a5a40] hover:bg-[#484833] text-[#f5f5f0] text-xs font-medium rounded-lg transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>CSV 내보내기</span>
            </button>
          </div>
        </div>
      </div>

      {/* Live Response Feed with Search & Filter */}
      <div className="bg-[#fcfcf9] rounded-2xl border border-[#e2e2d8] shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-[#e2e2d8] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-extrabold text-[#2d2d26] text-sm sm:text-base">
              📝 참여자 실시간 응답 피드
            </h3>
            <p className="text-xs text-[#7a7a6e]">
              참여자들이 남긴 기대 멘트 및 수업 소감을 실시간으로 확인합니다.
            </p>
          </div>

          <div className="flex items-center space-x-1.5 bg-[#eaeae2] p-1 rounded-lg">
            <button
              onClick={() => setFeedFilter('all')}
              className={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${
                feedFilter === 'all'
                  ? 'bg-white text-[#2d2d26] shadow-2xs'
                  : 'text-[#5a5a4e]'
              }`}
            >
              전체 ({sessionResponses.length})
            </button>
            <button
              onClick={() => setFeedFilter('before')}
              className={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${
                feedFilter === 'before'
                  ? 'bg-[#5a5a40] text-[#f5f5f0] shadow-2xs'
                  : 'text-[#5a5a4e]'
              }`}
            >
              수업 전 ({beforeList.length})
            </button>
            <button
              onClick={() => setFeedFilter('after')}
              className={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${
                feedFilter === 'after'
                  ? 'bg-[#4a6572] text-[#f5f5f0] shadow-2xs'
                  : 'text-[#5a5a4e]'
              }`}
            >
              수업 후 ({afterList.length})
            </button>
          </div>
        </div>

        <div className="divide-y divide-[#eaeae0] max-h-96 overflow-y-auto">
          {filteredFeed.length > 0 ? (
            filteredFeed.map((resp) => (
              <div key={resp.id} className="p-4 sm:p-5 hover:bg-[#f8f8f4] transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center space-x-2.5">
                    <span className="font-bold text-[#2d2d26] text-sm">
                      {resp.studentName}
                    </span>
                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                        resp.type === 'before'
                          ? 'bg-[#ebf0ea] text-[#3d5a3c] border-[#c8d9c6]'
                          : 'bg-[#eaf0f2] text-[#3d5863] border-[#cadbe1]'
                      }`}
                    >
                      {resp.type === 'before' ? '수업 전' : '수업 후'}
                    </span>
                    <span className="text-xs font-bold text-[#4a4a40] bg-[#eaeae2] px-2 py-0.5 rounded">
                      &ldquo;{resp.emotionWord}&rdquo; ({resp.categoryName})
                    </span>
                  </div>

                  <span className="text-xs text-[#8a8a7a] whitespace-nowrap">
                    {resp.timestamp}
                  </span>
                </div>

                {resp.comment && (
                  <p className="mt-2 text-xs sm:text-sm text-[#4a4a40] bg-[#f8f8f4] p-2.5 rounded-xl border border-[#e2e2d8]">
                    {resp.type === 'before' ? '💡 기대/질문: ' : '🏆 소감: '}
                    {resp.comment}
                  </p>
                )}

                {resp.rating && (
                  <div className="mt-2 flex items-center space-x-1 text-xs text-[#c89240]">
                    <Star className="w-3.5 h-3.5 fill-[#c89240] text-[#c89240]" />
                    <span>만족도: {resp.rating}점</span>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-xs text-[#8a8a7a]">
              해당하는 응답 기록이 없습니다.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

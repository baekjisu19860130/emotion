import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  X,
  Sparkles,
  Sun,
  Award,
  Maximize2,
  Minimize2,
  Copy,
  Check,
  Download,
  Share2,
  MessageSquareShare,
  ShieldCheck,
  Globe,
} from 'lucide-react';
import { SessionData, EmotionResponse } from '../types';
import { getPublicShareUrl } from '../utils/shareUrl';

interface PresentationModalProps {
  session: SessionData;
  responses: EmotionResponse[];
  onClose: () => void;
}

export const PresentationModal: React.FC<PresentationModalProps> = ({
  session,
  responses,
  onClose,
}) => {
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedMessage, setCopiedMessage] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [customUrl, setCustomUrl] = useState<string>(() => getPublicShareUrl());

  const publicUrl = customUrl || getPublicShareUrl();

  const beforeCount = responses.filter(
    (r) => r.sessionId === session.id && r.type === 'before'
  ).length;
  const afterCount = responses.filter(
    (r) => r.sessionId === session.id && r.type === 'after'
  ).length;
  const rosterCount = session.roster?.length || 0;

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCopyMessage = async () => {
    const message = `[마음 출석부: Before & After] 🌿\n\n📌 수업명: ${session.title}\n📅 일시: ${session.date}${session.instructorName ? `\n👤 강사: ${session.instructorName}` : ''}\n\n👇 아래 링크를 눌러 로그인 없이 바로 참여해주세요!\n🔗 ${publicUrl}`;
    try {
      await navigator.clipboard.writeText(message);
      setCopiedMessage(true);
      setTimeout(() => setCopiedMessage(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `마음 출석부 - ${session.title}`,
          text: `[마음 출석부] ${session.title} 감정 체크인에 참여해주세요! (로그인 불필요)`,
          url: publicUrl,
        });
      } catch (err) {
        // User cancelled or share failed
      }
    } else {
      handleCopyUrl();
    }
  };

  const handleDownloadQR = () => {
    const svg = document.getElementById('qr-code-svg');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width + 48;
      canvas.height = img.height + 48;
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 24, 24);
        const pngFile = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        const safeTitle = session.title.replace(/[^a-zA-Z0-9가-힣_]/g, '_');
        downloadLink.download = `마음출석부_QR_${safeTitle}.png`;
        downloadLink.href = pngFile;
        downloadLink.click();
      }
    };

    img.src =
      'data:image/svg+xml;base64,' +
      btoa(unescape(encodeURIComponent(svgData)));
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#2d2d26]/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-[#fcfcf9] rounded-3xl max-w-2xl w-full p-5 sm:p-8 shadow-2xl border border-[#e2e2d8] relative text-center my-auto">
        {/* Top Controls */}
        <div className="absolute top-4 sm:top-6 right-4 sm:right-6 flex items-center space-x-1 sm:space-x-2">
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-full text-[#7a7a6e] hover:text-[#2d2d26] hover:bg-[#eaeae0] transition-colors"
            title={isFullscreen ? '전체화면 종료' : '전체화면'}
          >
            {isFullscreen ? (
              <Minimize2 className="w-5 h-5" />
            ) : (
              <Maximize2 className="w-5 h-5" />
            )}
          </button>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-[#7a7a6e] hover:text-[#2d2d26] hover:bg-[#eaeae0] transition-colors"
            title="창 닫기"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Header Badge */}
        <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-[#ebf0ea] text-[#3d5a3c] border border-[#c8d9c6] text-xs font-bold mb-2">
          <ShieldCheck className="w-3.5 h-3.5 text-[#3d5a3c]" />
          <span>로그인 불필요 • 즉시 접속 QR 코드</span>
        </div>

        <h2 className="text-xl sm:text-3xl font-black text-[#2d2d26] tracking-tight">
          {session.title}
        </h2>
        <p className="text-[#6a6a5e] text-xs sm:text-sm mt-1 max-w-lg mx-auto">
          학생/연수생은 구글 계정 로그인 없이 스마트폰 기본 카메라로 비추면 바로 참여할 수 있습니다.
        </p>

        {/* QR Code Container */}
        <div className="mt-5 p-5 sm:p-6 bg-[#f8f8f4] rounded-3xl inline-block border border-[#e2e2d8] shadow-inner max-w-sm w-full">
          <div className="p-4 bg-white rounded-2xl shadow-xs border border-[#e2e2d8] flex items-center justify-center mx-auto">
            <QRCodeSVG
              id="qr-code-svg"
              value={publicUrl}
              size={220}
              level="H"
              includeMargin={true}
            />
          </div>

          {/* Quick URL Box */}
          <div className="mt-4 flex items-center justify-center space-x-1.5">
            <input
              type="text"
              value={publicUrl}
              onChange={(e) => setCustomUrl(e.target.value)}
              className="text-xs text-[#4a4a40] bg-white px-3 py-1.5 rounded-xl border border-[#e2e2d8] flex-1 truncate text-center font-mono"
            />
            <button
              onClick={handleCopyUrl}
              className="inline-flex items-center space-x-1 px-3 py-1.5 bg-[#5a5a40] hover:bg-[#484833] text-[#f5f5f0] rounded-xl text-xs font-bold transition-colors shadow-2xs shrink-0"
              title="공개 링크 복사"
            >
              {copiedUrl ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#c8d9c6]" />
                  <span>복사됨</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>복사</span>
                </>
              )}
            </button>
          </div>
          <div className="mt-2 text-[11px] text-[#5a5a40] font-medium flex items-center justify-center space-x-1">
            <Globe className="w-3 h-3 text-[#3d5a3c]" />
            <span>외부 참여자 공개 링크로 자동 생성됨</span>
          </div>
        </div>

        {/* Action Buttons for Teachers & Students */}
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2 max-w-lg mx-auto">
          <button
            id="btn-qr-download"
            onClick={handleDownloadQR}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-white border border-[#e2e2d8] hover:bg-[#eaeae0] text-[#2d2d26] text-xs font-bold shadow-2xs transition-colors"
          >
            <Download className="w-4 h-4 text-[#5a5a40]" />
            <span>QR 이미지 저장 (PNG)</span>
          </button>

          <button
            id="btn-qr-copy-invite-msg"
            onClick={handleCopyMessage}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-white border border-[#e2e2d8] hover:bg-[#eaeae0] text-[#2d2d26] text-xs font-bold shadow-2xs transition-colors"
          >
            {copiedMessage ? (
              <>
                <Check className="w-4 h-4 text-[#3d5a3c]" />
                <span className="text-[#3d5a3c]">초대문구 복사완료!</span>
              </>
            ) : (
              <>
                <MessageSquareShare className="w-4 h-4 text-[#3d5a3c]" />
                <span>카톡/채팅방 공유문구 복사</span>
              </>
            )}
          </button>

          <button
            id="btn-qr-native-share"
            onClick={handleNativeShare}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-[#5a5a40] hover:bg-[#484833] text-[#f5f5f0] text-xs font-bold shadow-xs transition-colors"
          >
            <Share2 className="w-4 h-4 text-[#d4c5a9]" />
            <span>스마트폰 공유하기</span>
          </button>
        </div>

        {/* Live Attendance Counters */}
        <div className="mt-5 grid grid-cols-2 gap-3 max-w-md mx-auto">
          <div className="p-3.5 rounded-2xl bg-[#ebf0ea] border border-[#c8d9c6] text-left">
            <div className="flex items-center justify-between text-[#3d5a3c] text-xs font-bold">
              <span>수업 전 체크인 현황</span>
              <Sun className="w-4 h-4 text-[#5a5a40]" />
            </div>
            <div className="mt-1 text-xl sm:text-2xl font-black text-[#2d2d26]">
              {beforeCount}{' '}
              <span className="text-xs font-normal text-[#5a5a4e]">
                / {rosterCount}명 완료
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#eaf0f2] border border-[#cadbe1] text-left">
            <div className="flex items-center justify-between text-[#3d5863] text-xs font-bold">
              <span>수업 후 소감 현황</span>
              <Award className="w-4 h-4 text-[#4a6572]" />
            </div>
            <div className="mt-1 text-xl sm:text-2xl font-black text-[#2d2d26]">
              {afterCount}{' '}
              <span className="text-xs font-normal text-[#5a5a4e]">
                / {rosterCount}명 완료
              </span>
            </div>
          </div>
        </div>

        {/* Close Button */}
        <div className="mt-6 pt-4 border-t border-[#e2e2d8] flex justify-center">
          <button
            onClick={onClose}
            className="px-8 py-2.5 bg-[#2d2d26] hover:bg-black text-[#f5f5f0] text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-colors"
          >
            창 닫기
          </button>
        </div>
      </div>
    </div>
  );
};


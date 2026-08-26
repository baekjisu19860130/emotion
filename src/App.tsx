import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Header } from './components/Header';
import { MainSelector } from './components/MainSelector';
import { BeforeStep } from './components/BeforeStep';
import { AfterStep } from './components/AfterStep';
import { AdminDashboard } from './components/Admin/AdminDashboard';
import { PresentationModal } from './components/PresentationModal';
import { AttendanceStorage } from './services/storage';
import { SupabaseService } from './services/supabase';
import {
  SessionData,
  EmotionResponse,
  EmotionWord,
  GasConfig,
  SupabaseConfig,
  SyncStatus,
} from './types';

export default function App() {
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string>('');
  const [responses, setResponses] = useState<EmotionResponse[]>([]);
  const [emotionWords, setEmotionWords] = useState<EmotionWord[]>([]);
  const [gasConfig, setGasConfig] = useState<GasConfig>({
    webhookUrl: '',
    autoSync: false,
  });
  const [supabaseConfig, setSupabaseConfig] = useState<SupabaseConfig>(() =>
    AttendanceStorage.getSupabaseConfig()
  );

  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
  const syncTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [currentView, setCurrentView] = useState<'participant' | 'admin'>('participant');
  const [participantStep, setParticipantStep] = useState<'select' | 'before' | 'after'>('select');
  const [selectedStudentName, setSelectedStudentName] = useState<string>('');
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);

  // Trigger "동기화 완료" notification and revert to idle after 3.5s
  const triggerSyncedNotification = useCallback(() => {
    setSyncStatus('synced');
    if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
    syncTimerRef.current = setTimeout(() => {
      setSyncStatus('idle');
    }, 3500);
  }, []);

  // Refresh data from local and Supabase cloud
  const refreshAllData = useCallback(async () => {
    if (SupabaseService.isConfigured()) {
      const result = await AttendanceStorage.pullFromSupabase();
      if (result.synced) {
        setSessions(result.sessions);
        setResponses(result.responses);
        if (!selectedSessionId && result.sessions.length > 0) {
          setSelectedSessionId(result.sessions[0].id);
        }
        return;
      }
    }
    // Local storage fallback
    const loadedSessions = AttendanceStorage.getSessions();
    const loadedResponses = AttendanceStorage.getResponses();
    setSessions(loadedSessions);
    setResponses(loadedResponses);
    if (!selectedSessionId && loadedSessions.length > 0) {
      setSelectedSessionId(loadedSessions[0].id);
    }
  }, [selectedSessionId]);

  // Manual Sync Button Handler
  const handleManualSync = useCallback(async () => {
    setSyncStatus('syncing');
    if (syncTimerRef.current) clearTimeout(syncTimerRef.current);

    const startTime = Date.now();
    try {
      await refreshAllData();
      // Ensure at least 600ms of spinning so user clearly observes the sync progress
      const elapsed = Date.now() - startTime;
      if (elapsed < 600) {
        await new Promise((r) => setTimeout(r, 600 - elapsed));
      }
      triggerSyncedNotification();
    } catch (e) {
      console.error('Manual sync error:', e);
      setSyncStatus('error');
      if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
      syncTimerRef.current = setTimeout(() => {
        setSyncStatus('idle');
      }, 3500);
    }
  }, [refreshAllData, triggerSyncedNotification]);

  // Initialize data on mount
  useEffect(() => {
    const loadedSessions = AttendanceStorage.getSessions();
    const loadedResponses = AttendanceStorage.getResponses();
    const loadedEmotions = AttendanceStorage.getEmotionWords();
    const loadedGas = AttendanceStorage.getGasConfig();
    const loadedSupabase = AttendanceStorage.getSupabaseConfig();

    setSessions(loadedSessions);
    if (loadedSessions.length > 0) {
      setSelectedSessionId(loadedSessions[0].id);
    }
    setResponses(loadedResponses);
    setEmotionWords(loadedEmotions);
    setGasConfig(loadedGas);
    setSupabaseConfig(loadedSupabase);

    // Initial pull from Supabase if configured
    refreshAllData();

    // Supabase Realtime Subscription
    let unsubscribeRealtime = () => {};
    if (SupabaseService.isConfigured()) {
      unsubscribeRealtime = SupabaseService.subscribeToChanges(() => {
        refreshAllData();
      });
    }

    // Background periodic poll every 10 seconds for multi-device sync guarantee
    const pollTimer = setInterval(() => {
      if (SupabaseService.isConfigured()) {
        refreshAllData();
      }
    }, 10000);

    return () => {
      unsubscribeRealtime();
      clearInterval(pollTimer);
      if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
    };
  }, [refreshAllData]);

  const currentSession =
    sessions.find((s) => s.id === selectedSessionId) || sessions[0];

  // Handlers for Responses - Fast Auto-sync with visual feedback
  const handleAddResponse = (
    newResp: Omit<EmotionResponse, 'id' | 'timestamp' | 'date'>
  ) => {
    setSyncStatus('syncing');
    const created = AttendanceStorage.addResponse(newResp);
    setResponses(AttendanceStorage.getResponses());
    setTimeout(() => {
      triggerSyncedNotification();
    }, 300);
  };

  // Handlers for Sessions - Fast Auto-sync with visual feedback
  const handleAddSession = (
    sessionData: Omit<SessionData, 'id' | 'createdAt'>
  ) => {
    setSyncStatus('syncing');
    const created = AttendanceStorage.addSession(sessionData);
    setSessions(AttendanceStorage.getSessions());
    setSelectedSessionId(created.id);
    setTimeout(() => {
      triggerSyncedNotification();
    }, 300);
  };

  const handleUpdateSession = (updated: SessionData) => {
    setSyncStatus('syncing');
    const list = AttendanceStorage.updateSession(updated);
    setSessions(list);
    setTimeout(() => {
      triggerSyncedNotification();
    }, 300);
  };

  const handleDeleteSession = (sessionId: string) => {
    setSyncStatus('syncing');
    const list = AttendanceStorage.deleteSession(sessionId);
    setSessions(list);
    if (selectedSessionId === sessionId && list.length > 0) {
      setSelectedSessionId(list[0].id);
    }
    setTimeout(() => {
      triggerSyncedNotification();
    }, 300);
  };

  // Handlers for Emotions Dictionary
  const handleUpdateEmotionWords = (words: EmotionWord[]) => {
    setSyncStatus('syncing');
    AttendanceStorage.saveEmotionWords(words);
    setEmotionWords(words);
    setTimeout(() => {
      triggerSyncedNotification();
    }, 300);
  };

  const handleResetEmotionWords = () => {
    setSyncStatus('syncing');
    const defaults = AttendanceStorage.resetEmotionWords();
    setEmotionWords(defaults);
    setTimeout(() => {
      triggerSyncedNotification();
    }, 300);
  };

  // Handler for GAS Config
  const handleUpdateGasConfig = (config: GasConfig) => {
    AttendanceStorage.saveGasConfig(config);
    setGasConfig(config);
  };

  // Handler for Supabase Config
  const handleUpdateSupabaseConfig = (config: SupabaseConfig) => {
    setSyncStatus('syncing');
    AttendanceStorage.saveSupabaseConfig(config);
    setSupabaseConfig(config);
    refreshAllData().then(() => {
      triggerSyncedNotification();
    });
  };

  // CSV Export
  const handleDownloadCSV = () => {
    AttendanceStorage.downloadCSV(selectedSessionId, currentSession?.title);
  };

  // Pairs for Admin 1:1 Matching
  const pairs = AttendanceStorage.getBeforeAfterPairs(selectedSessionId);

  // Student specific existing responses
  const existingBefore = responses.find(
    (r) =>
      r.sessionId === currentSession?.id &&
      r.studentName === selectedStudentName &&
      r.type === 'before'
  );
  const existingAfter = responses.find(
    (r) =>
      r.sessionId === currentSession?.id &&
      r.studentName === selectedStudentName &&
      r.type === 'after'
  );

  return (
    <div className="min-h-screen bg-[#f5f5f0] text-[#4a4a40] flex flex-col font-sans selection:bg-[#d5d5c8]">
      {/* Navigation Header */}
      <Header
        currentView={currentView}
        onViewChange={(view) => {
          setCurrentView(view);
          if (view === 'participant') {
            setParticipantStep('select');
          }
        }}
        sessions={sessions}
        selectedSessionId={selectedSessionId}
        onSelectSession={(id) => {
          setSelectedSessionId(id);
          setSelectedStudentName('');
          setParticipantStep('select');
        }}
        onOpenQR={() => setIsQRModalOpen(true)}
        syncStatus={syncStatus}
        onManualSync={handleManualSync}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {currentView === 'participant' ? (
          <>
            {participantStep === 'select' && (
              <MainSelector
                sessions={sessions}
                selectedSessionId={selectedSessionId}
                onSelectSession={setSelectedSessionId}
                selectedStudentName={selectedStudentName}
                onSelectStudentName={setSelectedStudentName}
                onNavigateStep={(step) => setParticipantStep(step)}
                responses={responses}
                onOpenQR={() => setIsQRModalOpen(true)}
              />
            )}

            {participantStep === 'before' && currentSession && (
              <BeforeStep
                session={currentSession}
                studentName={selectedStudentName}
                emotionWords={emotionWords}
                existingResponse={existingBefore}
                onSubmit={handleAddResponse}
                onBack={() => setParticipantStep('select')}
              />
            )}

            {participantStep === 'after' && currentSession && (
              <AfterStep
                session={currentSession}
                studentName={selectedStudentName}
                emotionWords={emotionWords}
                beforeResponse={existingBefore}
                existingAfterResponse={existingAfter}
                onSubmit={handleAddResponse}
                onBack={() => setParticipantStep('select')}
              />
            )}
          </>
        ) : (
          <AdminDashboard
            sessions={sessions}
            selectedSessionId={selectedSessionId}
            onSelectSession={setSelectedSessionId}
            responses={responses}
            pairs={pairs}
            emotionWords={emotionWords}
            gasConfig={gasConfig}
            supabaseConfig={supabaseConfig}
            syncStatus={syncStatus}
            onManualSync={handleManualSync}
            onUpdateGasConfig={handleUpdateGasConfig}
            onUpdateSupabaseConfig={handleUpdateSupabaseConfig}
            onRefreshCloudData={handleManualSync}
            onUpdateEmotionWords={handleUpdateEmotionWords}
            onResetEmotionWords={handleResetEmotionWords}
            onAddSession={handleAddSession}
            onUpdateSession={handleUpdateSession}
            onDeleteSession={handleDeleteSession}
            onDownloadCSV={handleDownloadCSV}
            onOpenQR={() => setIsQRModalOpen(true)}
            onBackToParticipant={() => {
              setCurrentView('participant');
              setParticipantStep('select');
            }}
          />
        )}
      </main>

      {/* Classroom QR Code Modal */}
      {isQRModalOpen && currentSession && (
        <PresentationModal
          session={currentSession}
          responses={responses}
          onClose={() => setIsQRModalOpen(false)}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-[#e2e2d8] bg-[#fcfcf9]/80 py-6 text-center text-xs text-[#7a7a6e]">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            © 2026 <strong className="text-[#4a4a40]">마음 출석부 (Before & After)</strong> — 교육 효과 측정 & 감정 체크인 솔루션
          </span>
          <span className="text-[#8a8a7a]">
            Google Sheets & Apps Script 실시간 연동 지원
          </span>
        </div>
      </footer>
    </div>
  );
}

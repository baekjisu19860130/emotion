import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { SessionData, EmotionResponse, SupabaseConfig, EmotionWord } from '../types';

export const SUPABASE_CONFIG_KEY = 'mind_attendance_supabase_config_v1';

let cachedClient: SupabaseClient | null = null;
let currentClientUrl = '';
let currentClientKey = '';

export class SupabaseService {
  /**
   * Load saved Supabase configuration from localStorage or Vite environment variables
   */
  static getConfig(): SupabaseConfig {
    try {
      const saved = localStorage.getItem(SUPABASE_CONFIG_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed.url === 'string') {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to load supabase config from storage', e);
    }

    // Default fallback from client env if available
    const envUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
    const envKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

    return {
      url: envUrl,
      anonKey: envKey,
      autoSync: Boolean(envUrl && envKey),
    };
  }

  /**
   * Save Supabase configuration to localStorage
   */
  static saveConfig(config: SupabaseConfig) {
    try {
      localStorage.setItem(SUPABASE_CONFIG_KEY, JSON.stringify(config));
      // Invalidate cached client to recreate on next call
      cachedClient = null;
      currentClientUrl = '';
      currentClientKey = '';
    } catch (e) {
      console.warn('Failed to save supabase config', e);
    }
  }

  /**
   * Get or initialize the Supabase client instance
   */
  static getClient(): SupabaseClient | null {
    const config = this.getConfig();
    const url = config.url?.trim();
    const key = config.anonKey?.trim();

    if (!url || !key || !url.startsWith('http')) {
      return null;
    }

    if (cachedClient && currentClientUrl === url && currentClientKey === key) {
      return cachedClient;
    }

    try {
      cachedClient = createClient(url, key, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
        realtime: {
          params: {
            eventsPerSecond: 10,
          },
        },
      });
      currentClientUrl = url;
      currentClientKey = key;
      return cachedClient;
    } catch (err) {
      console.error('Failed to create Supabase client', err);
      return null;
    }
  }

  /**
   * Check if Supabase connection is currently configured
   */
  static isConfigured(): boolean {
    const config = this.getConfig();
    return Boolean(config.url?.trim() && config.anonKey?.trim() && config.url.startsWith('http'));
  }

  /**
   * Test connection to Supabase database
   */
  static async testConnection(url?: string, key?: string): Promise<{ success: boolean; message: string }> {
    const targetUrl = (url || this.getConfig().url)?.trim();
    const targetKey = (key || this.getConfig().anonKey)?.trim();

    if (!targetUrl || !targetKey) {
      return { success: false, message: 'Project URL과 anon Key를 모두 입력해주세요.' };
    }

    if (!targetUrl.startsWith('https://') && !targetUrl.startsWith('http://')) {
      return { success: false, message: 'Project URL은 https://로 시작해야 합니다.' };
    }

    try {
      const client = createClient(targetUrl, targetKey, {
        auth: { persistSession: false },
      });

      // Try selecting from 'sessions' or a basic RPC query
      const { data, error } = await client.from('sessions').select('id').limit(1);

      if (error) {
        if (error.code === '42P01' || error.message?.includes('relation "public.sessions" does not exist') || error.message?.includes('not found')) {
          return {
            success: true,
            message: 'Supabase 프로젝트 연결 성공! 단, 테이블이 아직 생성되지 않았습니다. 아래 [SQL 테이블 생성 스크립트]를 Supabase SQL Editor에서 실행해주세요.',
          };
        }
        return {
          success: false,
          message: `연결 오류: ${error.message} (코드: ${error.code})`,
        };
      }

      return {
        success: true,
        message: 'Supabase 데이터베이스에 정상적으로 연결되었습니다! 실시간 동기화가 가능합니다.',
      };
    } catch (err: any) {
      return {
        success: false,
        message: `연결 실패: ${err?.message || '네트워크 오류가 발생했습니다.'}`,
      };
    }
  }

  /**
   * SQL Migration script for user to copy & paste into Supabase SQL Editor
   */
  static getTablesSchemaSQL(): string {
    return `-- ==========================================
-- [마음 출석부: Before & After] Supabase 테이블 스키마
-- Supabase 대시보드 > SQL Editor에 복사하여 [RUN]을 누르세요.
-- ==========================================

-- 1. 수업/연수 세션 테이블 (sessions)
CREATE TABLE IF NOT EXISTS public.sessions (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  instructor_name TEXT DEFAULT '',
  description TEXT DEFAULT '',
  date TEXT NOT NULL,
  roster JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. 감정 체크인 및 소감 응답 테이블 (responses)
CREATE TABLE IF NOT EXISTS public.responses (
  id TEXT PRIMARY KEY,
  timestamp TEXT NOT NULL,
  date TEXT NOT NULL,
  session_id TEXT NOT NULL,
  session_name TEXT DEFAULT '',
  student_name TEXT NOT NULL,
  type TEXT NOT NULL, -- 'before' or 'after'
  category_code TEXT NOT NULL, -- 'A', 'B', 'C'
  category_name TEXT NOT NULL,
  emotion_word TEXT NOT NULL,
  comment TEXT DEFAULT '',
  rating NUMERIC DEFAULT 5,
  tags JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. 감정 사전 커스텀 단어 테이블 (emotions)
CREATE TABLE IF NOT EXISTS public.emotions (
  id TEXT PRIMARY KEY,
  category_id TEXT NOT NULL,
  word TEXT NOT NULL,
  emoji TEXT DEFAULT ''
);

-- 4. RLS (Row Level Security) 설정 및 공개 접근 허용 (학교/연수 참여자 실시간 체크인용)
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emotions ENABLE ROW LEVEL SECURITY;

-- 기존 정책 삭제 후 재생성 (중복 에러 방지)
DROP POLICY IF EXISTS "Public select sessions" ON public.sessions;
DROP POLICY IF EXISTS "Public insert sessions" ON public.sessions;
DROP POLICY IF EXISTS "Public update sessions" ON public.sessions;
DROP POLICY IF EXISTS "Public delete sessions" ON public.sessions;

CREATE POLICY "Public select sessions" ON public.sessions FOR SELECT USING (true);
CREATE POLICY "Public insert sessions" ON public.sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update sessions" ON public.sessions FOR UPDATE USING (true);
CREATE POLICY "Public delete sessions" ON public.sessions FOR DELETE USING (true);

DROP POLICY IF EXISTS "Public select responses" ON public.responses;
DROP POLICY IF EXISTS "Public insert responses" ON public.responses;
DROP POLICY IF EXISTS "Public update responses" ON public.responses;
DROP POLICY IF EXISTS "Public delete responses" ON public.responses;

CREATE POLICY "Public select responses" ON public.responses FOR SELECT USING (true);
CREATE POLICY "Public insert responses" ON public.responses FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update responses" ON public.responses FOR UPDATE USING (true);
CREATE POLICY "Public delete responses" ON public.responses FOR DELETE USING (true);

DROP POLICY IF EXISTS "Public select emotions" ON public.emotions;
DROP POLICY IF EXISTS "Public insert emotions" ON public.emotions;
DROP POLICY IF EXISTS "Public update emotions" ON public.emotions;

CREATE POLICY "Public select emotions" ON public.emotions FOR SELECT USING (true);
CREATE POLICY "Public insert emotions" ON public.emotions FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update emotions" ON public.emotions FOR UPDATE USING (true);

-- 5. 실시간 동기화(Realtime) 활성화
ALTER PUBLICATION supabase_realtime ADD TABLE public.sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.responses;
`;
  }

  // ================= DATA FETCHING =================

  /**
   * Fetch all sessions from Supabase
   */
  static async fetchSessions(): Promise<SessionData[] | null> {
    const client = this.getClient();
    if (!client) return null;

    try {
      const { data, error } = await client
        .from('sessions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Error fetching sessions from Supabase:', error.message);
        return null;
      }

      if (!data) return [];

      return data.map((row: any) => ({
        id: row.id,
        title: row.title,
        instructorName: row.instructor_name || '',
        description: row.description || '',
        date: row.date,
        roster: Array.isArray(row.roster) ? row.roster : [],
        isActive: row.is_active ?? true,
        createdAt: row.created_at || new Date().toISOString(),
      }));
    } catch (err) {
      console.error('Supabase fetchSessions exception:', err);
      return null;
    }
  }

  /**
   * Fetch all responses from Supabase
   */
  static async fetchResponses(sessionId?: string): Promise<EmotionResponse[] | null> {
    const client = this.getClient();
    if (!client) return null;

    try {
      let query = client.from('responses').select('*').order('created_at', { ascending: false });
      if (sessionId) {
        query = query.eq('session_id', sessionId);
      }

      const { data, error } = await query;
      if (error) {
        console.warn('Error fetching responses from Supabase:', error.message);
        return null;
      }

      if (!data) return [];

      return data.map((row: any) => ({
        id: row.id,
        timestamp: row.timestamp,
        date: row.date,
        sessionId: row.session_id,
        sessionName: row.session_name || '',
        studentName: row.student_name,
        type: row.type as 'before' | 'after',
        categoryCode: row.category_code as 'A' | 'B' | 'C',
        categoryName: row.category_name,
        emotionWord: row.emotion_word,
        comment: row.comment || '',
        rating: row.rating ? Number(row.rating) : 5,
        tags: Array.isArray(row.tags) ? row.tags : [],
      }));
    } catch (err) {
      console.error('Supabase fetchResponses exception:', err);
      return null;
    }
  }

  /**
   * Upsert a response to Supabase in real-time
   */
  static async upsertResponse(response: EmotionResponse): Promise<boolean> {
    const client = this.getClient();
    if (!client) return false;

    try {
      const payload = {
        id: response.id,
        timestamp: response.timestamp,
        date: response.date,
        session_id: response.sessionId,
        session_name: response.sessionName,
        student_name: response.studentName,
        type: response.type,
        category_code: response.categoryCode,
        category_name: response.categoryName,
        emotion_word: response.emotionWord,
        comment: response.comment || '',
        rating: response.rating || 5,
        tags: response.tags || [],
      };

      const { error } = await client.from('responses').upsert(payload, { onConflict: 'id' });
      if (error) {
        console.warn('Supabase upsertResponse error:', error.message);
        return false;
      }
      return true;
    } catch (err) {
      console.error('Supabase upsertResponse exception:', err);
      return false;
    }
  }

  /**
   * Upsert a session to Supabase
   */
  static async upsertSession(session: SessionData): Promise<boolean> {
    const client = this.getClient();
    if (!client) return false;

    try {
      const payload = {
        id: session.id,
        title: session.title,
        instructor_name: session.instructorName || '',
        description: session.description || '',
        date: session.date,
        roster: session.roster || [],
        is_active: session.isActive ?? true,
        created_at: session.createdAt || new Date().toISOString(),
      };

      const { error } = await client.from('sessions').upsert(payload, { onConflict: 'id' });
      if (error) {
        console.warn('Supabase upsertSession error:', error.message);
        return false;
      }
      return true;
    } catch (err) {
      console.error('Supabase upsertSession exception:', err);
      return false;
    }
  }

  /**
   * Delete a session from Supabase
   */
  static async deleteSession(sessionId: string): Promise<boolean> {
    const client = this.getClient();
    if (!client) return false;

    try {
      // Also delete associated responses
      await client.from('responses').delete().eq('session_id', sessionId);
      const { error } = await client.from('sessions').delete().eq('id', sessionId);
      return !error;
    } catch (err) {
      console.error('Supabase deleteSession exception:', err);
      return false;
    }
  }

  /**
   * Push all local sessions and responses to Supabase in batch
   */
  static async syncAllLocalToSupabase(
    sessions: SessionData[],
    responses: EmotionResponse[]
  ): Promise<{ sessionsCount: number; responsesCount: number; success: boolean }> {
    const client = this.getClient();
    if (!client) return { sessionsCount: 0, responsesCount: 0, success: false };

    let sessionsCount = 0;
    let responsesCount = 0;

    try {
      if (sessions.length > 0) {
        const sessionPayloads = sessions.map((s) => ({
          id: s.id,
          title: s.title,
          instructor_name: s.instructorName || '',
          description: s.description || '',
          date: s.date,
          roster: s.roster || [],
          is_active: s.isActive ?? true,
          created_at: s.createdAt || new Date().toISOString(),
        }));

        const { error } = await client.from('sessions').upsert(sessionPayloads, { onConflict: 'id' });
        if (!error) sessionsCount = sessions.length;
      }

      if (responses.length > 0) {
        const responsePayloads = responses.map((r) => ({
          id: r.id,
          timestamp: r.timestamp,
          date: r.date,
          session_id: r.sessionId,
          session_name: r.sessionName,
          student_name: r.studentName,
          type: r.type,
          category_code: r.categoryCode,
          category_name: r.categoryName,
          emotion_word: r.emotionWord,
          comment: r.comment || '',
          rating: r.rating || 5,
          tags: r.tags || [],
        }));

        const { error } = await client.from('responses').upsert(responsePayloads, { onConflict: 'id' });
        if (!error) responsesCount = responses.length;
      }

      return { sessionsCount, responsesCount, success: true };
    } catch (err) {
      console.error('Supabase syncAllLocalToSupabase error:', err);
      return { sessionsCount, responsesCount, success: false };
    }
  }

  /**
   * Subscribe to Postgres Changes in real-time
   */
  static subscribeToChanges(onUpdate: () => void): () => void {
    const client = this.getClient();
    if (!client) return () => {};

    try {
      const channel = client
        .channel('mind_attendance_realtime_channel')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'responses' },
          () => {
            onUpdate();
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'sessions' },
          () => {
            onUpdate();
          }
        )
        .subscribe();

      return () => {
        client.removeChannel(channel);
      };
    } catch (err) {
      console.warn('Realtime subscription error:', err);
      return () => {};
    }
  }
}

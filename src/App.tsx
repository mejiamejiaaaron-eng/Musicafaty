import React, { useState, useEffect, useRef, useCallback } from 'react';
import { type User } from '@supabase/supabase-js';
import { supabase, SUPABASE_URL, SUPABASE_KEY } from './supabase.ts';
import { uploadToR2 } from './r2Client';
export { supabase, SUPABASE_URL, SUPABASE_KEY };
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  ChevronDown,
  Volume2,
  VolumeX,
  Upload,
  Trash2,
  LogIn,
  LogOut,
  Music,
  Search,
  Lock,
  X,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Copy,
  Check,
  HelpCircle,
  ExternalLink,
  UserPlus,
  Smartphone,
  Rocket,
  Globe,
  Home,
  Library,
  Plus,
  Heart,
  MoreVertical,
  Cast,
  Headphones,
  Bell,
  Clock,
  Battery,
  ArrowLeft,
  Shuffle,
  Repeat,
  Repeat1,
  Download,
  Folder,
  Image as ImageIcon,
  Share2,
  FolderPlus,
  ListMusic,
  Sparkles,
  RefreshCw,
  MinusCircle,
  FolderCheck,
  Mic,
  UserX,
  Sliders,
  Shield
} from 'lucide-react';

// ==========================================
// 1. CONFIGURACIÓN Y CLIENTE SUPABASE (ver ./supabase.ts)
// ==========================================

export interface Song {
  id: string | number;
  titulo: string;
  artista: string;
  url: string;
  storage_path: string;
  created_at?: string | null;
  cover?: string;
  // Campos oficiales de la tabla 'songs' de Supabase
  title?: string;
  artist?: string;
  cover_url?: string;
  audio_url?: string;
  folder_id?: string;
  lyrics?: string;
}

export interface AudioFolder {
  id: string;
  titulo: string;
  subtitulo: string;
  descripcion: string;
  coverKey: string;
  badge?: string;
  canciones: Song[];
}

export const carpetasAudio: AudioFolder[] = [
  {
    id: 'buchonass',
    titulo: 'buchonass',
    subtitulo: 'Corridos, Bélicos y Regional Mexicano',
    descripcion: 'Carpeta de corridos, música bélica y regional mexicano.',
    coverKey: 'cover_buchonass',
    badge: 'Corridos & Regional',
    canciones: []
  },
  {
    id: 'tus_me_gusta',
    titulo: 'Tus me gusta',
    subtitulo: 'Tus temas favoritos y canciones en la nube',
    descripcion: 'Carpeta personal y sincronizada en la nube.',
    coverKey: 'cover_tus_me_gusta',
    badge: 'Favoritos & En la Nube',
    canciones: []
  },
  {
    id: 'perreale',
    titulo: 'Perreale',
    subtitulo: 'Reggaetón, Urbano y Perreo',
    descripcion: 'Carpeta de reggaetón, perreo intenso y ritmos urbanos latinos.',
    coverKey: 'cover_perreale',
    badge: 'Reggaetón & Perreo',
    canciones: []
  },
  {
    id: 'lob_songs',
    titulo: 'LOB SONGS',
    subtitulo: 'Banda, Campirano y Sierreño',
    descripcion: 'Lo más nuevo de banda, campirano y sierreño en alta fidelidad.',
    coverKey: 'cover_lob',
    badge: 'Banda & Grupero',
    canciones: []
  },
  {
    id: 'los_2000',
    titulo: "los 2000'",
    subtitulo: 'Pop & Clásicos de los 2000s',
    descripcion: 'Pistas nostálgicas y grandes himnos del nuevo milenio.',
    coverKey: 'cover_2000',
    badge: 'Pop 2000s',
    canciones: []
  },
  {
    id: 'grwm',
    titulo: 'GRWM🍒💋⭐💍',
    subtitulo: 'Música para arreglarte y brillar',
    descripcion: 'Vibes aesthetic, pop femenino, R&B y beats envolventes.',
    coverKey: 'cover_grwm',
    badge: 'GRWM & Aesthetic',
    canciones: []
  },
  {
    id: 'baladas',
    titulo: 'Baladas Románticas',
    subtitulo: 'Baladas Inmortales en Español',
    descripcion: 'Las mejores poesías cantadas y clásicos románticos.',
    coverKey: 'cover_baladas',
    badge: 'Baladas de Oro',
    canciones: []
  },
  {
    id: 'la_reina',
    titulo: 'La Reina: Éxitos de la ...',
    subtitulo: 'Selena Quintanilla y Reinas de la Música Latina',
    descripcion: 'Homenaje a Selena y las grandes voces de la música hispana.',
    coverKey: 'cover_reina',
    badge: 'Tributo Legendario',
    canciones: []
  },
  {
    id: 'audiolibro',
    titulo: 'Deja de ser tú (latino): La mente crea la real...',
    subtitulo: 'Dr. Joe Dispenza (Audiolibro Completo)',
    descripcion: 'Capítulos de audio para reprogramar tu mente y transformar tu realidad.',
    coverKey: 'cover_audiolibro',
    badge: 'Audiolibro Premium',
    canciones: []
  },
  {
    id: 'marco_antonio',
    titulo: 'Marco Antonio Solís',
    subtitulo: 'Franco De Vita, Chayanne y Los Bukis',
    descripcion: 'Las mejores poesías cantadas del maestro de maestros.',
    coverKey: 'cover_marco',
    badge: 'Maestros de la Música',
    canciones: []
  },
  {
    id: 'mix_grupero',
    titulo: 'Mix de grupero',
    subtitulo: 'Eden Muñoz, Grupo Mojado, Kany García y más',
    descripcion: 'Pistas seleccionadas con la mejor energía grupera.',
    coverKey: 'cover_grupero',
    badge: 'Mix Grupero',
    canciones: []
  }
];

export const initialDemoSongs: Song[] = [];

export default function App() {
  // Estado de autenticación y control de sesión
  const [user, setUser] = useState<User | null>(null);
  const [sessionLoading, setSessionLoading] = useState<boolean>(true);
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);
  const [isSignUpMode, setIsSignUpMode] = useState<boolean>(false);
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Nombre de la aplicación (configurable por el Admin y persistente en localStorage)
  const [appName, setAppName] = useState<string>(() => {
    try {
      const stored = localStorage.getItem('appName') || localStorage.getItem('fa_app_title_v1');
      if (!stored || stored === 'FINANCIERA AARON' || stored === 'Financiera Aaron' || stored === 'JAaron Music') {
        localStorage.setItem('appName', 'Spotyy_AA');
        localStorage.setItem('fa_app_title_v1', 'Spotyy_AA');
        return 'Spotyy_AA';
      }
      return stored;
    } catch {
      return 'Spotyy_AA';
    }
  });
  const [tempAppName, setTempAppName] = useState<string>(() => {
    try {
      const stored = localStorage.getItem('appName') || localStorage.getItem('fa_app_title_v1');
      if (!stored || stored === 'FINANCIERA AARON' || stored === 'Financiera Aaron' || stored === 'JAaron Music') {
        return 'Spotyy_AA';
      }
      return stored;
    } catch {
      return 'Spotyy_AA';
    }
  });

  // Panel de Ajustes Administrativos y Gestión de Usuarios Bloqueados (Kick)
  const [showAdminSettingsModal, setShowAdminSettingsModal] = useState<boolean>(false);
  const [blockedUsers, setBlockedUsers] = useState<{ email: string; created_at: string }[]>([]);
  const [newBlockEmail, setNewBlockEmail] = useState<string>('');
  const [loadingBlockedUsers, setLoadingBlockedUsers] = useState<boolean>(false);
  const [sqlCopiedBlocked, setSqlCopiedBlocked] = useState<boolean>(false);

  // Lógica de Admin estricta: solo si el correo es mejiamejiaaaron@gmail.com
  const isAdmin = Boolean(user?.email && user.email.trim().toLowerCase() === 'mejiamejiaaaron@gmail.com');

  // Navegación por pestañas y vistas funcionales con persistencia en localStorage
  const [activeTab, setActiveTab] = useState<'inicio' | 'buscar' | 'biblioteca'>(() => {
    try {
      const saved = localStorage.getItem('fa_active_tab_v2');
      if (saved === 'inicio' || saved === 'buscar' || saved === 'biblioteca') return saved;
    } catch {}
    return 'inicio';
  });
  const [activeFilter, setActiveFilter] = useState<'inicio' | 'canciones' | 'carpetas' | 'favoritas'>(() => {
    try {
      const saved = localStorage.getItem('fa_active_filter_v2');
      if (saved === 'inicio' || saved === 'canciones' || saved === 'carpetas' || saved === 'favoritas') return saved;
    } catch {}
    return 'inicio';
  });

  // Estado de canciones y reproductor (solo música del usuario)
  const [songs, setSongs] = useState<Song[]>([]);
  const [canciones, setCanciones] = useState<Song[]>([]);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolume] = useState<number>(0.85);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isShuffle, setIsShuffle] = useState<boolean>(false);
  const [repeatMode, setRepeatMode] = useState<'off' | 'all' | 'one'>('off');

  // Sistema de Favoritos, Cola de Reproducción y Visualizador de Audio
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('fa_favorites_v1');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [queue, setQueue] = useState<Song[]>([]);
  const [showQueueModal, setShowQueueModal] = useState<boolean>(false);
  const [showExpandedPlayer, setShowExpandedPlayer] = useState<boolean>(false);
  const [showVisualizer, setShowVisualizer] = useState<boolean>(false);

  // Visualizador Animado con AudioContext y AnalyserNode
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameIdRef = useRef<number | null>(null);

  // Refs para subida múltiple y carpetas completas
  const multiFileInputRef = useRef<HTMLInputElement | null>(null);
  const folderInputRef = useRef<HTMLInputElement | null>(null);
  const folderDirectFileInputRef = useRef<HTMLInputElement | null>(null);
  const [isDirectFolderUploading, setIsDirectFolderUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<{ total: number; current: number; currentName: string } | null>(null);

  // Estado de carpetas dinámicas y personalizadas (filtrando canciones de prueba)
  const [folders, setFolders] = useState<AudioFolder[]>(() => {
    try {
      const saved = localStorage.getItem('fa_folders_v3');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((f: AudioFolder) => ({
            ...f,
            canciones: (f.canciones || []).filter(
              (c: Song) =>
                !String(c.id).startsWith('demo_') &&
                !String(c.id).startsWith('buch_') &&
                !String(c.id).startsWith('fav_') &&
                !String(c.id).startsWith('perr_') &&
                !String(c.id).startsWith('lob_') &&
                !String(c.id).startsWith('los_') &&
                !String(c.id).startsWith('grwm_') &&
                !String(c.id).startsWith('bal_') &&
                !String(c.id).startsWith('reina_') &&
                !String(c.id).startsWith('audio_') &&
                !String(c.id).startsWith('mas_') &&
                !String(c.id).startsWith('grup_') &&
                !String(c.url).includes('soundhelix')
            )
          }));
        }
      }
    } catch (e) {
      console.warn('Error cargando carpetas guardadas:', e);
    }
    return carpetasAudio;
  });

  // Paginación de alto rendimiento para listas grandes (mostrar de 50 en 50 para evitar bloqueos)
  const [cancionesPageSize, setCancionesPageSize] = useState<number>(50);
  const [folderPageSize, setFolderPageSize] = useState<number>(50);
  const [addMusicModalPageSize, setAddMusicModalPageSize] = useState<number>(50);

  const saveFolders = (newFolders: AudioFolder[]) => {
    setFolders(newFolders);
    try {
      // Guardar representación ligera sin duplicar imágenes base64 ni metadatos pesados para no exceder los 5MB de localStorage
      const lightweight = newFolders.map((f) => ({
        id: f.id,
        titulo: f.titulo,
        subtitulo: f.subtitulo,
        descripcion: f.descripcion,
        coverKey: f.coverKey,
        badge: f.badge,
        canciones: (f.canciones || []).map((c) => ({
          id: c.id,
          title: c.title || c.titulo,
          artist: c.artist || c.artista,
          titulo: c.title || c.titulo,
          artista: c.artist || c.artista,
          cover_url: c.cover_url?.startsWith('data:') ? undefined : c.cover_url,
          audio_url: c.audio_url || c.url,
          url: c.audio_url || c.url,
          storage_path: c.storage_path || c.audio_url || c.url,
          folder_id: c.folder_id || f.id
        }))
      }));
      localStorage.setItem('fa_folders_v3', JSON.stringify(lightweight));
    } catch (e) {
      console.warn('Nota de cuota al guardar carpetas en localStorage (se mantiene en memoria de React):', e);
      try {
        localStorage.removeItem('fa_folders_v2');
      } catch {}
    }
  };

  // Estado del formulario de subida y DeepSeek IA
  const [showUploadModal, setShowUploadModal] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreviewUrl, setCoverPreviewUrl] = useState<string>('');
  const [customTitle, setCustomTitle] = useState<string>('');
  const [customArtist, setCustomArtist] = useState<string>('');
  const [customCoverUrl, setCustomCoverUrl] = useState<string>('');
  const [targetFolderId, setTargetFolderId] = useState<string>('buchonass');
  const [isAiAnalyzing, setIsAiAnalyzing] = useState<boolean>(false);
  const [aiIdentifiedInfo, setAiIdentifiedInfo] = useState<{
    titulo: string;
    artista: string;
    genero: string;
    fuenteIA?: string;
  } | null>(null);

  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadStatus, setUploadStatus] = useState<string>('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Modales de Carpetas, Opciones y Reproductor
  // 1. Estado de la vista actual con persistencia exacta 'ultimaVista'
  const [vistaActual, setVistaActual] = useState<string>(() => {
    try {
      const guardada = localStorage.getItem('ultimaVista');
      if (guardada) return guardada;
    } catch {}
    return 'inicio';
  });

  const [selectedFolder, setSelectedFolder] = useState<AudioFolder | null>(() => {
    try {
      const savedVista = localStorage.getItem('ultimaVista') || localStorage.getItem('fa_selected_folder_id_v2');
      if (savedVista && savedVista !== 'inicio' && savedVista !== 'buscar' && savedVista !== 'biblioteca') {
        const found = carpetasAudio.find((f) => f.id === savedVista);
        if (found) return found;
      }
    } catch {}
    return null;
  });

  // Estados para el Menú de Opciones en Canciones (⋮) y Mover a Carpeta
  const [selectedSongForMenu, setSelectedSongForMenu] = useState<Song | null>(null);
  const [showSongMenuModal, setShowSongMenuModal] = useState<boolean>(false);
  const [showMoveModal, setShowMoveModal] = useState<boolean>(false);

  // 2. useEffect que escucha cambios de vistaActual y guarda en localStorage('ultimaVista')
  useEffect(() => {
    try {
      localStorage.setItem('ultimaVista', vistaActual);
    } catch {}
  }, [vistaActual]);

  // Sincronizar vistaActual con la carpeta seleccionada y las pestañas
  useEffect(() => {
    try {
      if (selectedFolder) {
        setVistaActual(selectedFolder.id);
        localStorage.setItem('ultimaVista', selectedFolder.id);
        localStorage.setItem('fa_selected_folder_id_v2', selectedFolder.id);
      } else {
        setVistaActual(activeTab);
        localStorage.setItem('ultimaVista', activeTab);
        localStorage.removeItem('fa_selected_folder_id_v2');
      }
    } catch {}
  }, [selectedFolder, activeTab]);

  useEffect(() => {
    try {
      localStorage.setItem('fa_active_tab_v2', activeTab);
    } catch {}
  }, [activeTab]);

  useEffect(() => {
    try {
      localStorage.setItem('fa_active_filter_v2', activeFilter);
    } catch {}
  }, [activeFilter]);

  // Mantener selectedFolder sincronizado cuando se actualizan o cargan carpetas desde Supabase o localStorage
  useEffect(() => {
    try {
      const savedVista = localStorage.getItem('ultimaVista') || localStorage.getItem('fa_selected_folder_id_v2');
      if (savedVista && savedVista !== 'inicio' && savedVista !== 'buscar' && savedVista !== 'biblioteca') {
        const f = folders.find((c) => c.id === savedVista) || carpetasAudio.find((c) => c.id === savedVista);
        if (f) {
          setSelectedFolder(f);
          setVistaActual(f.id);
        }
      } else if (savedVista === 'buscar' || savedVista === 'biblioteca') {
        setActiveTab(savedVista);
      }
    } catch {}
  }, [folders]);
  const [folderLiked, setFolderLiked] = useState<Record<string, boolean>>({});
  const [showAddToFolderModal, setShowAddToFolderModal] = useState<boolean>(false);
  const [songToAddToFolder, setSongToAddToFolder] = useState<Song | null>(null);
  const [showChangeSongModal, setShowChangeSongModal] = useState<boolean>(false);
  const [showAddMusicToCurrentFolderModal, setShowAddMusicToCurrentFolderModal] = useState<boolean>(false);
  const [showRlsModal, setShowRlsModal] = useState<boolean>(false);
  const [sqlCopied, setSqlCopied] = useState<boolean>(false);
  const [showDeployModal, setShowDeployModal] = useState<boolean>(false);
  const [showInstallGuideModal, setShowInstallGuideModal] = useState<boolean>(false);
  const [deployTab, setDeployTab] = useState<'vercel' | 'netlify' | 'render' | 'android'>('vercel');
  const [copiedDeployText, setCopiedDeployText] = useState<string>('');
  const [songToDelete, setSongToDelete] = useState<Song | null>(null);
  const [folderToDelete, setFolderToDelete] = useState<AudioFolder | null>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isStandalone, setIsStandalone] = useState<boolean>(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const coverInputRef = useRef<HTMLInputElement | null>(null);

  // ==========================================
  // DESBLOQUEO ESTRICTO DE AUDIO PARA iOS (SAFARI / iPHONE / iPAD)
  // Desbloquea el elemento <audio> y el subsistema de sonido en la primera interacción
  // para permitir autoplay continuo y reproducción en segundo plano sin bloqueos
  // ==========================================
  const isAudioUnlockedRef = useRef<boolean>(false);

  const unlockAudioForIOS = useCallback(() => {
    if (isAudioUnlockedRef.current) return;

    try {
      // 1. Play y Pause rápido en silencio sobre el elemento <audio> principal
      const audioEl = audioRef.current;
      if (audioEl) {
        const prevMuted = audioEl.muted;
        audioEl.muted = true;
        const playPromise = audioEl.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              audioEl.pause();
              audioEl.muted = prevMuted;
              isAudioUnlockedRef.current = true;
            })
            .catch(() => {
              audioEl.muted = prevMuted;
            });
        }
      }

      // 2. Desbloquear Web Audio API (AudioContext) en iOS
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        if (!audioContextRef.current) {
          audioContextRef.current = new AudioCtx();
        }
        if (audioContextRef.current.state === 'suspended') {
          audioContextRef.current.resume();
        }
        const buffer = audioContextRef.current.createBuffer(1, 1, 22050);
        const source = audioContextRef.current.createBufferSource();
        source.buffer = buffer;
        source.connect(audioContextRef.current.destination);
        source.start(0);
      }

      isAudioUnlockedRef.current = true;
    } catch (e) {
      console.warn('iOS audio unlock warning:', e);
    }
  }, []);

  // Escuchar la primera interacción táctil o clic del usuario en pantalla
  useEffect(() => {
    const handleFirstInteraction = () => {
      unlockAudioForIOS();
      window.removeEventListener('touchstart', handleFirstInteraction);
      window.removeEventListener('touchend', handleFirstInteraction);
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('pointerdown', handleFirstInteraction);
    };

    window.addEventListener('touchstart', handleFirstInteraction, { passive: true, once: true });
    window.addEventListener('touchend', handleFirstInteraction, { passive: true, once: true });
    window.addEventListener('click', handleFirstInteraction, { passive: true, once: true });
    window.addEventListener('pointerdown', handleFirstInteraction, { passive: true, once: true });

    return () => {
      window.removeEventListener('touchstart', handleFirstInteraction);
      window.removeEventListener('touchend', handleFirstInteraction);
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('pointerdown', handleFirstInteraction);
    };
  }, [unlockAudioForIOS]);

  const triggerToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4500);
  };

  // SQL exacto para crear la tabla 'songs', RLS y bucket 'musica' en Supabase
  const rlsSql = `-- ========================================================
-- 1. CREACIÓN DE LA TABLA 'songs' EN SUPABASE
-- ========================================================
CREATE TABLE IF NOT EXISTS public.songs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  title TEXT NOT NULL,
  artist TEXT NOT NULL,
  cover_url TEXT,
  audio_url TEXT NOT NULL,
  folder_id TEXT DEFAULT 'tus_me_gusta'
);

-- Asegurar columna folder_id si la tabla ya existía
ALTER TABLE public.songs ADD COLUMN IF NOT EXISTS folder_id TEXT DEFAULT 'tus_me_gusta';

-- Habilitar Seguridad a Nivel de Fila (RLS)
ALTER TABLE public.songs ENABLE ROW LEVEL SECURITY;

-- Políticas de acceso para lectura, inserción, actualización y borrado
DROP POLICY IF EXISTS "Permitir lectura publica de songs" ON public.songs;
CREATE POLICY "Permitir lectura publica de songs"
ON public.songs FOR SELECT
TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS "Permitir insercion publica de songs" ON public.songs;
CREATE POLICY "Permitir insercion publica de songs"
ON public.songs FOR INSERT
TO anon, authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir actualizacion publica de songs" ON public.songs;
CREATE POLICY "Permitir actualizacion publica de songs"
ON public.songs FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir eliminacion publica de songs" ON public.songs;
CREATE POLICY "Permitir eliminacion publica de songs"
ON public.songs FOR DELETE
TO anon, authenticated
USING (true);

-- Habilitar Realtime para reflejar canciones al instante
ALTER PUBLICATION supabase_realtime ADD TABLE public.songs;

-- ========================================================
-- 2. CONFIGURACIÓN DEL BUCKET 'musica' EN STORAGE
-- ========================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('musica', 'musica', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Permitir lectura en bucket musica" ON storage.objects;
CREATE POLICY "Permitir lectura en bucket musica"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'musica');

DROP POLICY IF EXISTS "Permitir subida a bucket musica" ON storage.objects;
CREATE POLICY "Permitir subida a bucket musica"
ON storage.objects FOR INSERT
TO anon, authenticated
WITH CHECK (bucket_id = 'musica');

DROP POLICY IF EXISTS "Permitir eliminar en bucket musica" ON storage.objects;
CREATE POLICY "Permitir eliminar en bucket musica"
ON storage.objects FOR DELETE
TO anon, authenticated
USING (bucket_id = 'musica');`;

  const copyRlsSql = () => {
    navigator.clipboard.writeText(rlsSql);
    setSqlCopied(true);
    triggerToast('¡SQL copiado al portapapeles!', 'success');
    setTimeout(() => setSqlCopied(false), 3000);
  };

  const copyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedDeployText(label);
    triggerToast(`¡${label} copiado al portapapeles!`, 'success');
    setTimeout(() => setCopiedDeployText(''), 2500);
  };

  const blockedUsersSql = `CREATE TABLE IF NOT EXISTS blocked_users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  created_at timestamptz default now()
);

ALTER TABLE blocked_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir gestion de usuarios bloqueados"
ON blocked_users FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);`;

  const copyBlockedSql = () => {
    navigator.clipboard.writeText(blockedUsersSql);
    setSqlCopiedBlocked(true);
    triggerToast('¡SQL para blocked_users copiado!', 'success');
    setTimeout(() => setSqlCopiedBlocked(false), 3000);
  };

  // Sincronizar título en la pestaña del navegador
  useEffect(() => {
    document.title = appName;
  }, [appName]);

  // Consultar si un usuario está en la tabla blocked_users
  const checkIsUserBlocked = async (userEmail?: string | null): Promise<boolean> => {
    if (!userEmail) return false;
    try {
      const clean = userEmail.trim().toLowerCase();
      const { data, error } = await supabase
        .from('blocked_users')
        .select('email')
        .eq('email', clean)
        .maybeSingle();

      if (error) {
        console.warn('Nota verificando blocked_users:', error.message);
        return false;
      }
      return !!data;
    } catch (e) {
      console.warn('Excepción al consultar blocked_users:', e);
      return false;
    }
  };

  // Cargar lista de usuarios bloqueados para el panel de administración
  const cargarUsuariosBloqueados = async () => {
    setLoadingBlockedUsers(true);
    try {
      const { data, error } = await supabase
        .from('blocked_users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Nota cargando blocked_users:', error.message);
      } else if (data) {
        setBlockedUsers(data);
      }
    } catch (err) {
      console.warn('Excepción al cargar usuarios bloqueados:', err);
    } finally {
      setLoadingBlockedUsers(false);
    }
  };

  // Bloquear usuario (Kick) y guardar en la tabla blocked_users
  const bloquearUsuario = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = newBlockEmail.trim().toLowerCase();
    if (!clean) {
      alert('Por favor escribe un correo electrónico para bloquear.');
      return;
    }
    if (clean === 'mejiamejiaaaron@gmail.com') {
      alert('Acción no permitida: No puedes bloquear la cuenta del administrador principal.');
      return;
    }

    try {
      const { error } = await supabase.from('blocked_users').insert([
        { email: clean, created_at: new Date().toISOString() }
      ]);

      if (error) {
        if (error.code === '23505' || error.message.includes('duplicate')) {
          alert(`El usuario ${clean} ya se encuentra bloqueado.`);
        } else {
          alert(`Error al guardar en la tabla blocked_users:\n\n${error.message}\n\nAsegúrate de que la tabla "blocked_users" exista en Supabase con columnas (email text, created_at timestamp).`);
        }
        return;
      }

      setNewBlockEmail('');
      triggerToast(`Usuario ${clean} bloqueado con éxito`, 'success');
      cargarUsuariosBloqueados();
    } catch (err: any) {
      alert(`Error al bloquear usuario:\n\n${err?.message || err}`);
    }
  };

  // Desbloquear usuario de la tabla blocked_users
  const desbloquearUsuario = async (correo: string) => {
    try {
      const { error } = await supabase
        .from('blocked_users')
        .delete()
        .eq('email', correo);

      if (error) {
        alert(`Error al desbloquear usuario: ${error.message}`);
        return;
      }

      triggerToast(`Usuario ${correo} desbloqueado`, 'success');
      cargarUsuariosBloqueados();
    } catch (err: any) {
      alert(`Error al desbloquear: ${err?.message || err}`);
    }
  };

  // Guardar nuevo nombre de la aplicación
  const guardarNombreApp = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = tempAppName.trim();
    if (!clean) {
      alert('Por favor ingresa un nombre para la aplicación.');
      return;
    }
    setAppName(clean);
    try {
      localStorage.setItem('appName', clean);
      localStorage.setItem('fa_app_title_v1', clean);
      document.title = clean;
    } catch {}
    setShowAdminSettingsModal(false);
    triggerToast(`¡Nombre de la app actualizado a "${clean}"!`, 'success');
  };

  // ==========================================
  // INICIALIZACIÓN: SESIÓN & CARGAR CANCIONES
  // ==========================================
  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user?.email) {
        const isBlocked = await checkIsUserBlocked(session.user.email);
        if (isBlocked) {
          await supabase.auth.signOut();
          setUser(null);
          alert('Acceso denegado por el administrador');
        } else {
          setUser(session.user);
          if (session.user.email.toLowerCase() === 'mejiamejiaaaron@gmail.com') {
            cargarUsuariosBloqueados();
          }
        }
      } else {
        setUser(null);
      }
      setSessionLoading(false);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user?.email) {
        const isBlocked = await checkIsUserBlocked(session.user.email);
        if (isBlocked) {
          await supabase.auth.signOut();
          setUser(null);
          alert('Acceso denegado por el administrador');
          setSessionLoading(false);
          return;
        }
        setUser(session.user);
        if (session.user.email.toLowerCase() === 'mejiamejiaaaron@gmail.com') {
          cargarUsuariosBloqueados();
        }
      } else {
        setUser(null);
      }
      setSessionLoading(false);
    });

    cargarCanciones();

    const channel = supabase
      .channel('songs-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'songs' }, () => {
        cargarCanciones();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'canciones' }, () => {
        cargarCanciones();
      })
      .subscribe();

    const checkStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;
    setIsStandalone(checkStandalone);

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey && (e.key === 's' || e.key === 'u' || e.key === 'p')) || e.key === 'F12') {
        e.preventDefault();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      authListener.subscription.unsubscribe();
      supabase.removeChannel(channel);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstallPWA = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        triggerToast(`¡${appName} se ha instalado en tu pantalla de inicio!`, 'success');
        setDeferredPrompt(null);
      }
    } else {
      setDeployTab('android');
      setShowDeployModal(true);
    }
  };

  // Registro persistente de metadatos de canciones subidas a Supabase Storage y Letras
  const STORAGE_META_KEY = 'fa_storage_metadata_v2';
  const FA_LYRICS_STORAGE_KEY = 'fa_song_lyrics_v1';

  const obtenerTodasLasLetrasPersistentes = (): Record<string, string> => {
    try {
      const raw = localStorage.getItem(FA_LYRICS_STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  };

  const guardarLetraPersistente = (
    songId?: string | number,
    storagePath?: string,
    title?: string,
    artist?: string,
    lyrics?: string
  ) => {
    if (!lyrics || typeof lyrics !== 'string' || !lyrics.trim()) {
      // REGLA CRÍTICA: No reemplazar letras existentes por textos vacíos
      return;
    }
    const cleanLyrics = lyrics.trim();
    try {
      const store = obtenerTodasLasLetrasPersistentes();
      if (songId) store[String(songId)] = cleanLyrics;
      if (storagePath) store[String(storagePath)] = cleanLyrics;
      if (title && artist) {
        const slug = `${title.toLowerCase().trim()}___${artist.toLowerCase().trim()}`;
        store[slug] = cleanLyrics;
      }
      localStorage.setItem(FA_LYRICS_STORAGE_KEY, JSON.stringify(store));
    } catch (err) {
      console.warn('Error guardando letra en almacenamiento persistente:', err);
    }
  };

  const obtenerLetraPersistente = (
    songId?: string | number,
    storagePath?: string,
    title?: string,
    artist?: string
  ): string | undefined => {
    try {
      const store = obtenerTodasLasLetrasPersistentes();
      if (songId && store[String(songId)]) return store[String(songId)];
      if (storagePath && store[String(storagePath)]) return store[String(storagePath)];
      if (title && artist) {
        const slug = `${title.toLowerCase().trim()}___${artist.toLowerCase().trim()}`;
        if (store[slug]) return store[slug];
      }
      if (storagePath) {
        const meta = obtenerMetadatosLocales();
        if (meta[storagePath]?.lyrics) return meta[storagePath].lyrics;
      }
    } catch {
      return undefined;
    }
    return undefined;
  };

  // Función de reproducción aleatoria instantánea para botones funcionales
  const reproducirAleatorio = () => {
    const lista = songs.length > 0 ? songs : canciones;
    if (lista.length === 0) {
      triggerToast('No hay canciones disponibles para reproducir aún', 'error');
      return;
    }
    const randomIndex = Math.floor(Math.random() * lista.length);
    const randomSong = lista[randomIndex];
    setIsShuffle(true);
    reproducirCancionDirecta(randomSong);
    triggerToast(`🔀 Modo aleatorio: "${randomSong.title || randomSong.titulo}"`, 'success');
  };

  const obtenerMetadatosLocales = (): Record<string, {
    titulo: string;
    artista: string;
    cover?: string;
    folderId?: string;
    url?: string;
    created_at?: string;
    lyrics?: string;
  }> => {
    try {
      const raw = localStorage.getItem(STORAGE_META_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  };

  const guardarMetadatoCancion = (
    storagePath: string,
    meta: {
      titulo: string;
      artista: string;
      cover?: string;
      folderId?: string;
      url?: string;
      created_at?: string;
      lyrics?: string;
    }
  ) => {
    try {
      const todos = obtenerMetadatosLocales();
      const previo = todos[storagePath] || {};
      todos[storagePath] = {
        ...previo,
        ...meta,
        lyrics: meta.lyrics || previo.lyrics // Preservar letra si la nueva es undefined
      };
      localStorage.setItem(STORAGE_META_KEY, JSON.stringify(todos));
      if (meta.lyrics) {
        guardarLetraPersistente(undefined, storagePath, meta.titulo, meta.artista, meta.lyrics);
      }
    } catch (e) {
      console.warn('Error guardando metadato local:', e);
    }
  };

  const cargarCanciones = async (esReintento = false) => {
    try {
      const { data: dbSongs, error: dbError } = await supabase
        .from('songs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5000);

      console.log('dbSongs (recibidas de Supabase):', dbSongs ? dbSongs.length : 0);

      if (dbError) {
        console.warn('Aviso al cargar canciones desde Supabase:', dbError.message || dbError);
        // Si el schema cache de PostgREST aún se estaba actualizando (PGRST125), reintentar una vez tras breve pausa
        if (!esReintento && (dbError.code === 'PGRST125' || dbError.message?.includes('Invalid path'))) {
          setTimeout(() => {
            cargarCanciones(true);
          }, 1000);
          return;
        }
        return;
      }

      if (dbSongs) {
        // Normalizar los datos garantizando las propiedades title, artist, cover_url, audio_url y folder_id
        const metaLocales = obtenerMetadatosLocales();
        const cancionesBD: Song[] = dbSongs.map((row: any) => {
          const cachedLyrics = obtenerLetraPersistente(row.id, row.audio_url, row.title, row.artist);
          const rawFolder = row.folder_id || row.folderId || metaLocales[row.audio_url]?.folderId || 'tus_me_gusta';
          return {
            id: row.id,
            title: row.title || 'Sin título',
            artist: row.artist || 'Artista',
            cover_url: row.cover_url || '',
            audio_url: row.audio_url || '',
            titulo: row.title || 'Sin título',
            artista: row.artist || 'Artista',
            cover: row.cover_url || 'cover_23',
            url: row.audio_url || '',
            storage_path: row.audio_url || '',
            created_at: row.created_at,
            folder_id: rawFolder,
            lyrics: cachedLyrics || undefined
          };
        });

        setSongs(cancionesBD);
        setCanciones(cancionesBD);

        // Si hay canciones en la base de datos y aún no hay una seleccionada por el usuario
        if (cancionesBD.length > 0 && !currentSong) {
          setCurrentSong(cancionesBD[0]);
        }

        // Sincronizar canciones en las carpetas según su folder_id
        if (cancionesBD.length > 0) {
          setFolders((prevFolders) => {
            const updated = prevFolders.map((f) => {
              const cancionesParaEstaCarpeta = cancionesBD.filter(
                (c) => (c.folder_id || 'tus_me_gusta') === f.id
              );
              return {
                ...f,
                canciones: cancionesParaEstaCarpeta
              };
            });

            try {
              localStorage.setItem('fa_folders_v3', JSON.stringify(updated));
            } catch (e) {}
            return updated;
          });
        }
      }
    } catch (err) {
      console.error('Error inesperado al cargar canciones:', err);
    }
  };

  // ==========================================
  // AUTENTICACIÓN
  // ==========================================
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    unlockAudioForIOS();
    setIsLoggingIn(true);
    setAuthError(null);

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanPassword) {
      setAuthError('Por favor ingresa un correo y contraseña válidos.');
      setIsLoggingIn(false);
      return;
    }

    // 1. Bloqueo de Usuarios: Al intentar hacer Login, consultar si el correo está en la tabla blocked_users
    try {
      const isBlocked = await checkIsUserBlocked(cleanEmail);
      if (isBlocked) {
        setIsLoggingIn(false);
        await supabase.auth.signOut();
        alert('Acceso denegado por el administrador');
        return;
      }
    } catch (bErr) {
      console.warn('Nota verificando bloqueo previo:', bErr);
    }

    try {
      if (isSignUpMode) {
        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password: cleanPassword
        });
        if (error) {
          setAuthError(error.message);
          triggerToast(`Error al registrar: ${error.message}`, 'error');
          return;
        }
        if (data?.user) {
          const isBlockedAfter = await checkIsUserBlocked(data.user.email || cleanEmail);
          if (isBlockedAfter) {
            await supabase.auth.signOut();
            setUser(null);
            alert('Acceso denegado por el administrador');
            return;
          }
          setUser(data.user);
          setShowLoginModal(false);
          triggerToast(`¡Usuario conectado: ${data.user.email}!`, 'success');
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: cleanPassword
        });

        if (error) {
          setAuthError(error.message);
          triggerToast(`Error de login: ${error.message}`, 'error');
          return;
        }

        if (data?.user) {
          const isBlockedAfter = await checkIsUserBlocked(data.user.email || cleanEmail);
          if (isBlockedAfter) {
            await supabase.auth.signOut();
            setUser(null);
            alert('Acceso denegado por el administrador');
            return;
          }
          setUser(data.user);
          setShowLoginModal(false);
          triggerToast(`¡Bienvenido, ${data.user.email}!`, 'success');
        }
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      setAuthError(errMsg);
      triggerToast(`Error: ${errMsg}`, 'error');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    triggerToast('Sesión cerrada correctamente', 'success');
  };

  // ==========================================
  // DEEPSEEK & GEMINI IA: ANÁLISIS DE AUDIO & FOTO RELACIONADA
  // ==========================================

  // ==========================================
  // EXTRACCIÓN DE METADATOS VÍA JSMEDIATAGS (CDN) + ID3 USLT / SYLT + PORTADAS EMBEBIDAS
  // ==========================================
  const extractAudioMetadataFromFile = async (
    file: File
  ): Promise<{ title?: string; artist?: string; coverUrl?: string; lyrics?: string }> => {
    let extractedLyrics: string | undefined = undefined;

    // 1. Intentar con jsmediatags (vía CDN cargado en index.html) para título, artista, carátula y letras USLT/SYLT
    try {
      const jsmediatags = (window as any).jsmediatags;
      if (jsmediatags && typeof jsmediatags.read === 'function') {
        const jmtData = await new Promise<{ title?: string; artist?: string; coverUrl?: string; lyrics?: string }>((resolve) => {
          jsmediatags.read(file, {
            onSuccess: (tag: any) => {
              const tags = tag?.tags || {};
              const title = tags.title ? String(tags.title).trim() : undefined;
              const artist = tags.artist ? String(tags.artist).trim() : undefined;
              let coverUrl: string | undefined = undefined;
              let lyrics: string | undefined = undefined;

              // Extracción de etiquetas USLT (Unsynchronized lyrics) y SYLT (Synchronized lyrics)
              const uslt = tags.USLT || tags['USLT'];
              if (uslt) {
                if (typeof uslt === 'string' && uslt.trim()) lyrics = uslt.trim();
                else if (uslt.data?.lyrics && typeof uslt.data.lyrics === 'string') lyrics = uslt.data.lyrics.trim();
                else if (uslt.lyrics && typeof uslt.lyrics === 'string') lyrics = uslt.lyrics.trim();
                else if (typeof uslt.data === 'string' && uslt.data.trim()) lyrics = uslt.data.trim();
              }

              if (!lyrics) {
                const sylt = tags.SYLT || tags['SYLT'];
                if (sylt) {
                  if (typeof sylt === 'string' && sylt.trim()) lyrics = sylt.trim();
                  else if (sylt.data?.lyrics && typeof sylt.data.lyrics === 'string') lyrics = sylt.data.lyrics.trim();
                  else if (sylt.lyrics && typeof sylt.lyrics === 'string') lyrics = sylt.lyrics.trim();
                  else if (Array.isArray(sylt.data)) {
                    const parts = sylt.data.map((item: any) => item?.text || item?.lyric || '').filter(Boolean);
                    if (parts.length > 0) lyrics = parts.join('\n');
                  }
                }
              }

              if (!lyrics && tags.lyrics) {
                if (typeof tags.lyrics === 'string' && tags.lyrics.trim()) lyrics = tags.lyrics.trim();
                else if (tags.lyrics.data?.lyrics && typeof tags.lyrics.data.lyrics === 'string') lyrics = tags.lyrics.data.lyrics.trim();
                else if (typeof tags.lyrics.data === 'string' && tags.lyrics.data.trim()) lyrics = tags.lyrics.data.trim();
              }

              if (!lyrics) {
                for (const k of Object.keys(tags)) {
                  const upper = k.toUpperCase();
                  if (upper.includes('USLT') || upper.includes('SYLT') || k.toLowerCase().includes('lyrics')) {
                    const val = tags[k];
                    if (typeof val === 'string' && val.trim()) {
                      lyrics = val.trim();
                      break;
                    } else if (val?.data?.lyrics && typeof val.data.lyrics === 'string') {
                      lyrics = val.data.lyrics.trim();
                      break;
                    } else if (val?.lyrics && typeof val.lyrics === 'string') {
                      lyrics = val.lyrics.trim();
                      break;
                    }
                  }
                }
              }

              if (tags.picture) {
                try {
                  const { data, format } = tags.picture;
                  let base64String = '';
                  for (let i = 0; i < data.length; i++) {
                    base64String += String.fromCharCode(data[i]);
                  }
                  coverUrl = `data:${format || 'image/jpeg'};base64,${window.btoa(base64String)}`;
                } catch (picErr) {
                  console.warn('Nota convirtiendo imagen de jsmediatags:', picErr);
                }
              }

              resolve({ title, artist, coverUrl, lyrics });
            },
            onError: (err: any) => {
              console.warn('Nota jsmediatags:', err);
              resolve({});
            }
          });
        });

        if (jmtData.lyrics) extractedLyrics = jmtData.lyrics;

        if (jmtData.title || jmtData.artist || jmtData.coverUrl || jmtData.lyrics) {
          const fast = parseSmartAudioName(file.name);
          return {
            title: jmtData.title || fast.titulo || file.name.replace(/\.[^/.]+$/, '').trim(),
            artist: jmtData.artist || fast.artista || 'Artista',
            coverUrl: jmtData.coverUrl,
            lyrics: jmtData.lyrics
          };
        }
      }
    } catch (jmtErr) {
      console.warn('Error en lectura jsmediatags:', jmtErr);
    }

    // 2. Fallback de escaneo binario ID3 (v2 y v1) si jsmediatags no devolvió información completa
    try {
      let scanSize = Math.min(file.size, 512 * 1024);
      const headBuf = await file.slice(0, 10).arrayBuffer();
      const headBytes = new Uint8Array(headBuf);
      let majorVersion = 3;
      if (headBytes[0] === 0x49 && headBytes[1] === 0x44 && headBytes[2] === 0x33) {
        majorVersion = headBytes[3];
        const synchsafeTagSize =
          ((headBytes[6] & 0x7f) << 21) |
          ((headBytes[7] & 0x7f) << 14) |
          ((headBytes[8] & 0x7f) << 7) |
          (headBytes[9] & 0x7f);
        scanSize = Math.min(file.size, synchsafeTagSize + 20);
      }

      const buffer = await file.slice(0, scanSize).arrayBuffer();
      const bytes = new Uint8Array(buffer);
      let title: string | undefined;
      let artist: string | undefined;
      let lyrics: string | undefined = extractedLyrics;

      if (bytes[0] === 0x49 && bytes[1] === 0x44 && bytes[2] === 0x33) { // 'ID3'
        const textDecoder = new TextDecoder('utf-8');
        const isoDecoder = new TextDecoder('iso-8859-1');
        let offset = 10;
        while (offset < bytes.length - 10) {
          const frameId = String.fromCharCode(bytes[offset], bytes[offset + 1], bytes[offset + 2], bytes[offset + 3]);
          if (!/^[A-Z0-9]{4}$/.test(frameId)) break;

          let frameSize = 0;
          if (majorVersion === 4) {
            frameSize =
              ((bytes[offset + 4] & 0x7f) << 21) |
              ((bytes[offset + 5] & 0x7f) << 14) |
              ((bytes[offset + 6] & 0x7f) << 7) |
              (bytes[offset + 7] & 0x7f);
          } else {
            frameSize =
              (bytes[offset + 4] << 24) | (bytes[offset + 5] << 16) | (bytes[offset + 6] << 8) | bytes[offset + 7];
          }

          if (frameSize <= 0 || offset + 10 + frameSize > bytes.length) break;

          const contentBytes = bytes.slice(offset + 10, offset + 10 + frameSize);

          if (frameId === 'TIT2' && !title) {
            try {
              const enc = contentBytes[0];
              const tSlice = contentBytes.slice(1);
              const val = (enc === 1 || enc === 2 ? new TextDecoder('utf-16').decode(tSlice) : enc === 3 ? textDecoder.decode(tSlice) : isoDecoder.decode(tSlice)).replace(/\0/g, '').trim();
              if (val) title = val;
            } catch (_) {}
          }

          if (frameId === 'TPE1' && !artist) {
            try {
              const enc = contentBytes[0];
              const tSlice = contentBytes.slice(1);
              const val = (enc === 1 || enc === 2 ? new TextDecoder('utf-16').decode(tSlice) : enc === 3 ? textDecoder.decode(tSlice) : isoDecoder.decode(tSlice)).replace(/\0/g, '').trim();
              if (val) artist = val;
            } catch (_) {}
          }

          // Extracción binaria de USLT (Unsynchronized lyrics)
          if (frameId === 'USLT' && !lyrics && contentBytes.length > 5) {
            try {
              const enc = contentBytes[0];
              let descOffset = 4;
              if (enc === 1 || enc === 2) {
                while (descOffset < contentBytes.length - 1) {
                  if (contentBytes[descOffset] === 0 && contentBytes[descOffset + 1] === 0) {
                    descOffset += 2;
                    break;
                  }
                  descOffset += 2;
                }
              } else {
                while (descOffset < contentBytes.length) {
                  if (contentBytes[descOffset] === 0) {
                    descOffset += 1;
                    break;
                  }
                  descOffset += 1;
                }
              }
              const lBytes = contentBytes.slice(descOffset);
              let val = '';
              if (enc === 1 || enc === 2) {
                val = new TextDecoder('utf-16').decode(lBytes);
              } else if (enc === 3) {
                val = textDecoder.decode(lBytes);
              } else {
                val = isoDecoder.decode(lBytes);
              }
              val = val.replace(/\0+$/g, '').replace(/^\0+/g, '').trim();
              if (val) lyrics = val;
            } catch (usltErr) {
              console.warn('Nota parseando USLT:', usltErr);
            }
          }

          // Extracción binaria de SYLT (Synchronized lyrics)
          if (frameId === 'SYLT' && !lyrics && contentBytes.length > 6) {
            try {
              const enc = contentBytes[0];
              let descOffset = 6;
              if (enc === 1 || enc === 2) {
                while (descOffset < contentBytes.length - 1) {
                  if (contentBytes[descOffset] === 0 && contentBytes[descOffset + 1] === 0) {
                    descOffset += 2;
                    break;
                  }
                  descOffset += 2;
                }
              } else {
                while (descOffset < contentBytes.length) {
                  if (contentBytes[descOffset] === 0) {
                    descOffset += 1;
                    break;
                  }
                  descOffset += 1;
                }
              }
              const syltBytes = contentBytes.slice(descOffset);
              const lines: string[] = [];
              let p = 0;
              while (p < syltBytes.length) {
                const s = p;
                if (enc === 1 || enc === 2) {
                  while (p < syltBytes.length - 1 && !(syltBytes[p] === 0 && syltBytes[p + 1] === 0)) {
                    p += 2;
                  }
                  const t = new TextDecoder('utf-16').decode(syltBytes.slice(s, p)).replace(/\0/g, '').trim();
                  if (t) lines.push(t);
                  p += 2;
                } else {
                  while (p < syltBytes.length && syltBytes[p] !== 0) {
                    p++;
                  }
                  const t = (enc === 3 ? textDecoder : isoDecoder).decode(syltBytes.slice(s, p)).replace(/\0/g, '').trim();
                  if (t) lines.push(t);
                  p++;
                }
                p += 4;
              }
              if (lines.length > 0) lyrics = lines.join('\n');
            } catch (syltErr) {
              console.warn('Nota parseando SYLT:', syltErr);
            }
          }

          offset += 10 + frameSize;
        }
      }

      // Escanear ID3v1 (últimos 128 bytes) si faltó título o artista
      if ((!title || !artist) && file.size > 128) {
        const endBuffer = await file.slice(file.size - 128).arrayBuffer();
        const endBytes = new Uint8Array(endBuffer);
        if (endBytes[0] === 0x54 && endBytes[1] === 0x41 && endBytes[2] === 0x47) { // 'TAG'
          const dec = new TextDecoder('iso-8859-1');
          if (!title) {
            const rawT = dec.decode(endBytes.slice(3, 33)).replace(/\0/g, '').trim();
            if (rawT) title = rawT;
          }
          if (!artist) {
            const rawA = dec.decode(endBytes.slice(33, 63)).replace(/\0/g, '').trim();
            if (rawA) artist = rawA;
          }
        }
      }

      if (title || artist || lyrics) {
        const fast = parseSmartAudioName(file.name);
        return {
          title: title || fast.titulo || file.name.replace(/\.[^/.]+$/, '').trim(),
          artist: artist || fast.artista || 'Artista',
          lyrics
        };
      }
    } catch (e) {
      // Fallback
    }

    // 3. Respaldo por nombre de archivo
    const fast = parseSmartAudioName(file.name);
    return {
      title: fast.titulo || file.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' ').trim(),
      artist: fast.artista || 'Artista',
      lyrics: extractedLyrics
    };
  };

  // Limpieza y deducción inteligente instantánea desde el nombre del archivo
  const parseSmartAudioName = (
    rawName: string
  ): { titulo: string; artista: string; sugerenciaCarpeta: string } => {
    let clean = rawName.replace(/\.(mp3|wav|m4a|aac|flac|ogg)$/i, '');
    clean = clean.replace(/^\s*(?:\d+[\s._-]+)+/, '');
    clean = clean
      .replace(
        /\b(official\s+video|video\s+oficial|official\s+audio|audio\s+oficial|video\s+lyric|letra|lyrics|en\s+vivo|live|remix|hd|4k|1080p|hq|320kbps|128kbps|y2mate(?:\.is)?|mp3clan|snaptube|full\s+audio)\b/gi,
        ''
      )
      .replace(/[\[\(\{]\s*[\]\)\}]/g, '')
      .replace(/[_]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    let artista = 'Artista';
    let titulo = clean;
    let carpeta = 'tus_me_gusta';

    const conocidos = [
      { n: ['peso pluma', 'doble p'], art: 'Peso Pluma', f: 'buchonass' },
      { n: ['natanael cano', 'nata'], art: 'Natanael Cano', f: 'buchonass' },
      { n: ['junior h'], art: 'Junior H', f: 'buchonass' },
      { n: ['fuerza regida'], art: 'Fuerza Regida', f: 'buchonass' },
      { n: ['el fantasma'], art: 'El Fantasma', f: 'buchonass' },
      { n: ['los dos carnales'], art: 'Los Dos Carnales', f: 'buchonass' },
      { n: ['luis r conriquez'], art: 'Luis R Conriquez', f: 'buchonass' },
      { n: ['calibre 50'], art: 'Calibre 50', f: 'buchonass' },
      { n: ['bad bunny'], art: 'Bad Bunny', f: 'perreale' },
      { n: ['feid', 'ferxxo'], art: 'Feid', f: 'perreale' },
      { n: ['karol g'], art: 'Karol G', f: 'perreale' },
      { n: ['anuel'], art: 'Anuel AA', f: 'perreale' },
      { n: ['grupo firme'], art: 'Grupo Firme', f: 'lob_songs' },
      { n: ['carin leon'], art: 'Carin Leon', f: 'lob_songs' },
      { n: ['grupo frontera'], art: 'Grupo Frontera', f: 'lob_songs' },
      { n: ['banda ms'], art: 'Banda MS', f: 'lob_songs' },
      { n: ['luis miguel'], art: 'Luis Miguel', f: 'baladas' },
      { n: ['chayanne'], art: 'Chayanne', f: 'baladas' },
      { n: ['selena'], art: 'Selena', f: 'la_reina' }
    ];

    const lower = clean.toLowerCase();
    const match = conocidos.find((c) => c.n.some((name) => lower.includes(name)));
    if (match) {
      artista = match.art;
      carpeta = match.f;
      let t = clean;
      for (const name of match.n) {
        t = t.replace(new RegExp(name, 'gi'), '');
      }
      t = t.replace(/^[\s\-_—–:]+|[\s\-_—–:]+$/g, '').trim();
      if (t.length > 2) titulo = t;
    } else if (clean.includes(' - ')) {
      const parts = clean.split(' - ');
      artista = parts[0].trim();
      titulo = parts.slice(1).join(' - ').trim();
    } else if (clean.includes(' — ')) {
      const parts = clean.split(' — ');
      artista = parts[0].trim();
      titulo = parts.slice(1).join(' — ').trim();
    } else if (clean.toLowerCase().includes(' by ')) {
      const parts = clean.split(/ by /i);
      titulo = parts[0].trim();
      artista = parts[1].trim();
    }

    const cap = (s: string) =>
      s
        .split(' ')
        .map((w) => (w.length > 0 ? w[0].toUpperCase() + w.slice(1) : ''))
        .join(' ');
    if (titulo === titulo.toLowerCase()) titulo = cap(titulo);
    if (artista === artista.toLowerCase()) artista = cap(artista);

    return { titulo: titulo || 'Canción', artista: artista || 'Artista', sugerenciaCarpeta: carpeta };
  };

  const analizarAudioConIA = async (
    file: File,
    hintTitle?: string,
    hintArtist?: string
  ): Promise<{
    titulo: string;
    artista: string;
    genero: string;
    sugerenciaCarpeta: string;
    coverUrl: string;
    fuenteIA: string;
  } | null> => {
    setIsAiAnalyzing(true);
    try {
      const res = await fetch('/api/ai/tag-audio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: file.name,
          folderId: targetFolderId || selectedFolder?.id,
          id3Title: hintTitle || customTitle,
          id3Artist: hintArtist || customArtist
        })
      });
      const json = await res.json();
      if (json.success && json.data) {
        const d = json.data;
        if (d.titulo) setCustomTitle(d.titulo);
        if (d.artista) setCustomArtist(d.artista);
        if (d.coverUrl) setCustomCoverUrl(d.coverUrl);
        if (d.sugerenciaCarpeta) setTargetFolderId(d.sugerenciaCarpeta);

        setAiIdentifiedInfo({
          titulo: d.titulo,
          artista: d.artista,
          genero: d.genero,
          fuenteIA: d.fuenteIA || 'DeepSeek / Gemini IA'
        });
        triggerToast(`✨ IA identificó: "${d.artista} - ${d.titulo}" • Portada generada`, 'success');
        return d;
      }
    } catch (err) {
      console.warn('Error en análisis IA:', err);
    } finally {
      setIsAiAnalyzing(false);
    }
    return null;
  };

  const regenerarFotoIA = () => {
    const seed = Math.floor(Math.random() * 999999);
    const prompt = encodeURIComponent(
      `${customArtist || 'Music Artist'} ${customTitle || 'Song'} stylish album art cover aesthetic vinyl masterpiece 4k`
    );
    const newCover = `https://image.pollinations.ai/prompt/${prompt}?width=512&height=512&nologo=true&seed=${seed}`;
    setCustomCoverUrl(newCover);
    triggerToast('¡Nueva portada generada con IA!', 'success');
  };

  // ==========================================
  // GESTIÓN DE CARPETAS (MOVER, AGREGAR, QUITAR Y ELIMINAR)
  // ==========================================
  const moverCancionACarpeta = async (song: Song, targetFolderId: string) => {
    const target = folders.find((f) => f.id === targetFolderId);
    if (!target) return;

    const currentFid = song.folder_id || 'tus_me_gusta';
    if (currentFid === targetFolderId) {
      triggerToast(`"${song.title || song.titulo}" ya se encuentra en "${target.titulo}"`, 'error');
      setShowMoveModal(false);
      setShowSongMenuModal(false);
      setSelectedSongForMenu(null);
      return;
    }

    // 1. Identificar índice de la canción para depuración detallada
    const indiceActual = (songs.length > 0 ? songs : canciones).findIndex(
      (s) => String(s.id) === String(song.id) || (s.audio_url && song.audio_url && s.audio_url === song.audio_url)
    );
    const numeroCancion = indiceActual >= 0 ? indiceActual + 1 : 1;
    console.log(`[Mover] Moviendo canción #${numeroCancion} ("${song.title || song.titulo}", ID: ${song.id}) a carpeta "${targetFolderId}"...`);

    // 2. Ejecutar UPDATE en Supabase usando la columna exacta folder_id
    let updateError: any = null;
    try {
      // Intentar actualizar por 'id' en la tabla 'songs'
      const { data: updateData, error: errById } = await supabase
        .from('songs')
        .update({ folder_id: targetFolderId })
        .eq('id', song.id)
        .select();

      if (errById) {
        // Si falló por id (por ejemplo si id no es UUID o no coincide) y hay audio_url, intentar por audio_url
        const rutaAudio = song.audio_url || song.url;
        if (rutaAudio) {
          const { error: errByUrl } = await supabase
            .from('songs')
            .update({ folder_id: targetFolderId })
            .eq('audio_url', rutaAudio);

          if (errByUrl) {
            updateError = errByUrl;
            console.error(`[Error Supabase] Falló la petición al mover la canción #${numeroCancion} ("${song.title || song.titulo}", ID: ${song.id}) a "${targetFolderId}":`, errByUrl);
          }
        } else {
          updateError = errById;
          console.error(`[Error Supabase] Falló la petición al mover la canción #${numeroCancion} ("${song.title || song.titulo}", ID: ${song.id}) a "${targetFolderId}":`, errById);
        }
      } else if (!updateData || updateData.length === 0) {
        // Si no arrojó error pero no modificó filas, asegurar actualización por audio_url
        const rutaAudio = song.audio_url || song.url;
        if (rutaAudio) {
          const { error: errByUrl } = await supabase
            .from('songs')
            .update({ folder_id: targetFolderId })
            .eq('audio_url', rutaAudio);
          if (errByUrl) {
            updateError = errByUrl;
            console.error(`[Error Supabase] Falló la petición al mover la canción #${numeroCancion} ("${song.title || song.titulo}", ID: ${song.id}) por audio_url:`, errByUrl);
          }
        }
      }
    } catch (dbErr) {
      updateError = dbErr;
      console.error(`[Error Supabase] Excepción en petición al mover la canción #${numeroCancion} ("${song.title || song.titulo}", ID: ${song.id}) a "${targetFolderId}":`, dbErr);
    }

    // 2. Después del UPDATE, actualizar el estado local de React para reflejar el cambio inmediatamente sin recargar
    const updatedSong: Song = { ...song, folder_id: targetFolderId };

    // Actualizar canciones en estado general (setSongs y setCanciones)
    setSongs((prev) =>
      prev.map((s) => {
        const matchId = String(s.id) === String(song.id);
        const matchUrl = (s.audio_url && song.audio_url && s.audio_url === song.audio_url) ||
                         (s.url && song.url && s.url === song.url);
        return matchId || matchUrl ? { ...s, folder_id: targetFolderId } : s;
      })
    );

    setCanciones((prev) =>
      prev.map((s) => {
        const matchId = String(s.id) === String(song.id);
        const matchUrl = (s.audio_url && song.audio_url && s.audio_url === song.audio_url) ||
                         (s.url && song.url && s.url === song.url);
        return matchId || matchUrl ? { ...s, folder_id: targetFolderId } : s;
      })
    );

    // Actualizar listas de carpetas (actualiza inmediatamente los contadores verdes y contenidos)
    const updatedFolders = folders.map((f) => {
      const listSinCancion = (f.canciones || []).filter((c) => {
        const matchId = String(c.id) === String(song.id);
        const matchUrl = (c.audio_url && song.audio_url && c.audio_url === song.audio_url) ||
                         (c.url && song.url && c.url === song.url);
        return !matchId && !matchUrl;
      });

      if (f.id === targetFolderId) {
        return { ...f, canciones: [updatedSong, ...listSinCancion] };
      }
      return { ...f, canciones: listSinCancion };
    });
    saveFolders(updatedFolders);

    // Actualizar selectedFolder para que la vista detallada abierta de la carpeta refleje el cambio al instante
    if (selectedFolder) {
      const refreshed = updatedFolders.find((f) => f.id === selectedFolder.id);
      if (refreshed) {
        setSelectedFolder(refreshed);
      }
    }

    // Actualizar currentSong si la canción en reproducción fue la que se movió
    setCurrentSong((prev) => {
      if (!prev) return null;
      const matchId = String(prev.id) === String(song.id);
      const matchUrl = (prev.audio_url && song.audio_url && prev.audio_url === song.audio_url) ||
                       (prev.url && song.url && prev.url === song.url);
      return matchId || matchUrl ? { ...prev, folder_id: targetFolderId } : prev;
    });

    // 3. Guardar metadatos locales para persistencia offline
    const ruta = song.audio_url || song.url;
    if (ruta) {
      guardarMetadatoCancion(ruta, {
        titulo: song.title || song.titulo,
        artista: song.artist || song.artista,
        cover: song.cover_url || song.cover,
        folderId: targetFolderId,
        url: ruta,
        created_at: song.created_at || new Date().toISOString(),
        lyrics: song.lyrics
      });
    }

    // Cerrar modal de mover y menú
    setShowMoveModal(false);
    setShowSongMenuModal(false);
    setSelectedSongForMenu(null);

    // Feedback al usuario
    if (updateError) {
      triggerToast(`Movida localmente a "${target.titulo}", pero ocurrió un error en Supabase (ver consola)`, 'error');
    } else {
      triggerToast(`¡"${song.title || song.titulo}" movida a "${target.titulo}"!`, 'success');
    }
  };

  const agregarCancionACarpeta = (folderId: string, song: Song) => {
    const target = folders.find((f) => f.id === folderId);
    if (!target) return;

    const yaExiste = target.canciones.some(
      (c) => String(c.id) === String(song.id) || (c.titulo.toLowerCase() === song.titulo.toLowerCase() && c.artista.toLowerCase() === song.artista.toLowerCase())
    );

    if (yaExiste) {
      triggerToast(`"${song.titulo}" ya existe en "${target.titulo}"`, 'error');
      return;
    }

    const updated = folders.map((f) => {
      if (f.id === folderId) {
        return {
          ...f,
          canciones: [song, ...f.canciones]
        };
      }
      return f;
    });

    saveFolders(updated);
    if (selectedFolder && selectedFolder.id === folderId) {
      setSelectedFolder(updated.find((f) => f.id === folderId) || null);
    }
    triggerToast(`¡"${song.titulo}" agregada a "${target.titulo}"!`, 'success');
    setShowAddToFolderModal(false);
  };

  const quitarCancionDeCarpeta = (folderId: string, songId: string | number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const folder = folders.find((f) => f.id === folderId);
    const songName = folder?.canciones.find((c) => String(c.id) === String(songId))?.titulo || 'Canción';

    const updated = folders.map((f) => {
      if (f.id === folderId) {
        return {
          ...f,
          canciones: f.canciones.filter((c) => String(c.id) !== String(songId))
        };
      }
      return f;
    });

    saveFolders(updated);
    if (selectedFolder && selectedFolder.id === folderId) {
      setSelectedFolder(updated.find((f) => f.id === folderId) || null);
    }
    triggerToast(`"${songName}" quitada de la carpeta "${folder?.titulo || ''}"`, 'success');
  };

  const solicitarEliminarCancion = (song: Song, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSongToDelete(song);
  };

  const eliminarCancion = (song: Song, e?: React.MouseEvent) => {
    solicitarEliminarCancion(song, e);
  };

  const confirmarEliminarCancion = async () => {
    if (!songToDelete) return;
    const song = songToDelete;
    setSongToDelete(null);

    // Quitar de todas las carpetas
    const updatedFolders = folders.map((f) => ({
      ...f,
      canciones: f.canciones.filter((c) => String(c.id) !== String(song.id))
    }));
    saveFolders(updatedFolders);
    if (selectedFolder) {
      setSelectedFolder(updatedFolders.find((f) => f.id === selectedFolder.id) || null);
    }

    setSongs((prev) => prev.filter((item) => String(item.id) !== String(song.id)));
    setCanciones((prev) => prev.filter((item) => String(item.id) !== String(song.id)));
    if (currentSong?.id === song.id) {
      setCurrentSong(initialDemoSongs[0]);
      setIsPlaying(false);
    }

    try {
      if (song.storage_path) {
        await supabase.storage.from('musica').remove([song.storage_path]);
        try {
          const metadatos = obtenerMetadatosLocales();
          delete metadatos[song.storage_path];
          localStorage.setItem(STORAGE_META_KEY, JSON.stringify(metadatos));
        } catch (mErr) {}
      }
      if (!String(song.id).startsWith('local_')) {
        await supabase.from('songs').delete().eq('id', song.id);
        await supabase.from('canciones').delete().eq('id', song.id);
      }
    } catch (err: unknown) {
      console.warn('Nota al eliminar de Supabase:', err);
    }
    triggerToast(`"${song.titulo}" ha sido eliminada permanentemente.`, 'success');
  };

  const solicitarEliminarCarpeta = (folder: AudioFolder, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setFolderToDelete(folder);
  };

  const confirmarEliminarCarpeta = () => {
    if (!folderToDelete) return;
    const fId = folderToDelete.id;
    const fName = folderToDelete.titulo;
    setFolderToDelete(null);

    const updated = folders.filter((f) => f.id !== fId);
    saveFolders(updated);
    if (selectedFolder?.id === fId) {
      setSelectedFolder(null);
    }
    triggerToast(`Carpeta "${fName}" eliminada exitosamente.`, 'success');
  };

  // ==========================================
  // SUBIDA DIRECTA DE AUDIOS A LA CARPETA ACTUAL (CLOUDFLARE R2 + SUPABASE)
  // ==========================================
  const handleFolderDirectUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const currentFolderId = selectedFolder?.id || targetFolderId || 'buchonass';
    const folderObj = folders.find((f) => f.id === currentFolderId) || selectedFolder;

    setIsDirectFolderUploading(true);
    let subidasExitosas = 0;

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        try {
          const id3 = await extractAudioMetadataFromFile(file);
          const fast = parseSmartAudioName(file.name);
          const songTitle = id3.title || fast.titulo || file.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' ');
          const songArtist =
            id3.artist ||
            (folderObj && folderObj.titulo !== 'tus_me_gusta' && fast.artista === 'Artista'
              ? folderObj.titulo
              : fast.artista) ||
            'Artista';

          const promptClean = encodeURIComponent(
            `${songArtist} ${songTitle} album cover art masterpiece vibrant 4k`
          );
          const cover =
            id3.coverUrl ||
            `https://image.pollinations.ai/prompt/${promptClean}?width=512&height=512&nologo=true`;

          // 1. Subir archivo a Cloudflare R2 con PutObjectCommand
          let publicUrl = '';
          try {
            publicUrl = await uploadToR2(file);
            console.log(`[R2] Archivo ${i + 1}/${files.length} "${file.name}" subido a R2:`, publicUrl);
          } catch (r2Err: any) {
            console.error('Error al subir a Cloudflare R2:', r2Err);
            alert(
              `Error al subir a Cloudflare R2:\n\n${r2Err?.message || r2Err}\n\nVerifica tus credenciales de Cloudflare R2 (VITE_R2_ACCESS_KEY_ID, VITE_R2_SECRET_ACCESS_KEY, VITE_R2_ENDPOINT, VITE_R2_BUCKET_NAME) y la configuración de CORS en tu bucket.`
            );
            throw r2Err;
          }

          // 2. Guardar en Supabase tabla 'songs' asignando el folder_id de la carpeta actual
          let dbRecord: any = null;
          try {
            const { data: songInserted, error: insertError } = await supabase
              .from('songs')
              .insert([
                {
                  title: songTitle,
                  artist: songArtist,
                  cover_url: cover,
                  audio_url: publicUrl,
                  folder_id: currentFolderId
                }
              ])
              .select()
              .single();

            if (insertError) {
              console.error('Error al insertar en Supabase con folder_id:', insertError);
              alert(
                `Error al guardar en Supabase:\n\n${insertError.message || JSON.stringify(insertError)}`
              );
            } else {
              dbRecord = songInserted;
            }
          } catch (supaErr: any) {
            console.error('Excepción al guardar en Supabase:', supaErr);
            alert(`Error de red o conexión con Supabase:\n\n${supaErr?.message || supaErr}`);
          }

          const nuevaCancion: Song = {
            id: dbRecord?.id || ('r2_' + Date.now() + '_' + i),
            title: songTitle,
            artist: songArtist,
            titulo: songTitle,
            artista: songArtist,
            cover_url: cover,
            cover: cover,
            audio_url: publicUrl,
            url: publicUrl,
            storage_path: publicUrl,
            created_at: dbRecord?.created_at || new Date().toISOString(),
            folder_id: currentFolderId,
            lyrics: id3.lyrics || undefined
          };

          // 3. Actualizar catálogo general de canciones
          setSongs((prev) => [
            nuevaCancion,
            ...prev.filter((s) => String(s.id) !== String(nuevaCancion.id))
          ]);
          setCanciones((prev) => [
            nuevaCancion,
            ...prev.filter((s) => String(s.id) !== String(nuevaCancion.id))
          ]);

          // 4. Actualizar estado de las carpetas
          setFolders((prevFolders) => {
            const next = prevFolders.map((f) => {
              if (f.id === currentFolderId) {
                return {
                  ...f,
                  canciones: [
                    nuevaCancion,
                    ...(f.canciones || []).filter((c) => String(c.id) !== String(nuevaCancion.id))
                  ]
                };
              }
              return f;
            });
            saveFolders(next);
            return next;
          });

          // 5. Actualizar la vista de la carpeta activa inmediatamente
          setSelectedFolder((prev) => {
            if (prev && prev.id === currentFolderId) {
              return {
                ...prev,
                canciones: [
                  nuevaCancion,
                  ...(prev.canciones || []).filter((c) => String(c.id) !== String(nuevaCancion.id))
                ]
              };
            }
            return prev;
          });

          // 6. Guardar metadatos locales y persistencia de letras
          guardarMetadatoCancion(publicUrl, {
            titulo: songTitle,
            artista: songArtist,
            cover,
            folderId: currentFolderId,
            url: publicUrl,
            created_at: nuevaCancion.created_at || new Date().toISOString(),
            lyrics: id3.lyrics || undefined
          });
          guardarLetraPersistente(nuevaCancion.id, publicUrl, songTitle, songArtist, id3.lyrics);

          subidasExitosas++;
        } catch (fileErr) {
          console.error(`Error procesando archivo "${file.name}":`, fileErr);
          break;
        }
      }

      if (subidasExitosas > 0) {
        triggerToast(
          `¡${subidasExitosas} audio(s) agregado(s) a "${folderObj?.titulo || currentFolderId}"!`,
          'success'
        );
      }
    } finally {
      setIsDirectFolderUploading(false);
      if (e.target) e.target.value = '';
    }
  };

  // ==========================================
  // SUBIDA AL STORAGE CON DEEPSEEK & GEMINI IA (MODAL COMPLETO)
  // ==========================================
  async function subirCancion(file: File) {
    if (!file) {
      alert('Por favor selecciona un archivo de audio MP3.');
      return;
    }

    const destFolder = targetFolderId || selectedFolder?.id || 'tus_me_gusta';
    const folderObj = folders.find((f) => f.id === destFolder) || selectedFolder;

    setIsUploading(true);
    setUploadStatus('✨ IA reconociendo título y artista musical...');

    let songTitle = customTitle.trim();
    let songArtist = customArtist.trim();
    let finalCover = (coverPreviewUrl || customCoverUrl || '').trim();

    let fileLyrics: string | undefined = undefined;

    // 1. Si el usuario sube directamente o aún no ha terminado el análisis de la IA:
    if (!songTitle || !songArtist || songArtist.toLowerCase() === 'desconocido' || isAiAnalyzing) {
      try {
        const id3 = await extractAudioMetadataFromFile(file);
        if (id3.lyrics) fileLyrics = id3.lyrics;
        const fast = parseSmartAudioName(file.name);
        const aiData = await analizarAudioConIA(file, id3.title || fast.titulo, id3.artist || fast.artista);

        if (aiData) {
          if (!songTitle || songTitle === file.name) songTitle = aiData.titulo;
          if (!songArtist || songArtist.toLowerCase() === 'desconocido') songArtist = aiData.artista;
          if (!finalCover) finalCover = aiData.coverUrl || '';
          if (aiData.sugerenciaCarpeta && (!targetFolderId || targetFolderId === 'buchonass')) {
            setTargetFolderId(aiData.sugerenciaCarpeta);
          }
        }
      } catch (aiErr) {
        console.warn('Nota en análisis de IA durante subida:', aiErr);
      }
    }

    if (!fileLyrics) {
      try {
        const meta = await extractAudioMetadataFromFile(file);
        if (meta.lyrics) fileLyrics = meta.lyrics;
      } catch (_) {}
    }

    // 2. Respaldo inteligente si la IA o la red no respondieron
    if (!songTitle || !songArtist || songArtist.toLowerCase() === 'desconocido') {
      const fast = parseSmartAudioName(file.name);
      if (!songTitle) songTitle = fast.titulo;
      if (!songArtist || songArtist.toLowerCase() === 'desconocido') songArtist = fast.artista;
      if (!targetFolderId && fast.sugerenciaCarpeta) setTargetFolderId(fast.sugerenciaCarpeta);
    }

    if (!songTitle) songTitle = file.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' ');
    if (!songArtist || songArtist.toLowerCase() === 'desconocido') songArtist = 'Artista';

    // 3. Subir imagen de portada al bucket 'musica' si el usuario seleccionó un archivo de imagen
    if (coverFile) {
      try {
        setUploadStatus('Subiendo imagen de portada a Supabase Storage...');
        const sanitizedCover = coverFile.name.replace(/[^a-zA-Z0-9._-]/g, '_');
        const coverPath = `covers/${Date.now()}_${sanitizedCover}`;
        const { error: coverErr } = await supabase.storage
          .from('musica')
          .upload(coverPath, coverFile, {
            cacheControl: '3600',
            upsert: true,
            contentType: coverFile.type || 'image/jpeg'
          });

        if (!coverErr) {
          const { data: cUrlData } = supabase.storage.from('musica').getPublicUrl(coverPath);
          if (cUrlData?.publicUrl) {
            finalCover = cUrlData.publicUrl;
          }
        } else {
          console.warn('Nota al subir imagen de portada:', coverErr.message);
        }
      } catch (cErr) {
        console.warn('Error subiendo imagen de portada:', cErr);
      }
    }

    if (!finalCover) {
      const promptClean = encodeURIComponent(`${songArtist} ${songTitle} album cover art masterpiece vibrant 4k`);
      finalCover = `https://image.pollinations.ai/prompt/${promptClean}?width=512&height=512&nologo=true`;
    }

    setUploadStatus(`Subiendo archivo de audio "${songTitle}" a Cloudflare R2...`);

    try {
      let publicUrl = '';

      // 1. Subir archivo a Cloudflare R2 usando PutObjectCommand
      try {
        publicUrl = await uploadToR2(file);
        console.log('Archivo subido exitosamente a Cloudflare R2:', publicUrl);
      } catch (r2Error: any) {
        console.error('Error al subir a Cloudflare R2:', r2Error);
        alert(
          `Error al subir a Cloudflare R2:\n\n${r2Error?.message || r2Error}\n\nVerifica tus credenciales y configuración CORS en Cloudflare R2.`
        );
        throw r2Error;
      }

      // 2. INSERT directo en la tabla 'songs' de Supabase con folder_id de la carpeta de destino
      setUploadStatus(`Guardando "${songTitle}" en Supabase...`);
      let dbRecord: any = null;
      try {
        const { data: songInserted, error: insertError } = await supabase
          .from('songs')
          .insert([
            {
              title: songTitle,
              artist: songArtist,
              cover_url: finalCover,
              audio_url: publicUrl,
              folder_id: destFolder
            }
          ])
          .select()
          .single();

        if (insertError) {
          console.warn('Nota en INSERT de tabla songs con folder_id:', insertError.message);
          alert(`Aviso al guardar en Supabase:\n\n${insertError.message}`);
        } else {
          dbRecord = songInserted;
        }
      } catch (insertErr: any) {
        console.error('Excepción al insertar en tabla songs:', insertErr);
        alert(`Error al guardar en Supabase:\n\n${insertErr?.message || insertErr}`);
      }

      const nuevaCancion: Song = {
        id: dbRecord?.id || ('r2_' + Date.now()),
        title: songTitle,
        artist: songArtist,
        titulo: songTitle,
        artista: songArtist,
        cover_url: finalCover,
        cover: finalCover,
        audio_url: publicUrl,
        url: publicUrl,
        storage_path: publicUrl,
        created_at: dbRecord?.created_at || new Date().toISOString(),
        folder_id: destFolder,
        lyrics: fileLyrics || undefined
      };

      // 3. Guardar metadatos locales y persistentes en la carpeta de destino
      guardarMetadatoCancion(publicUrl, {
        titulo: songTitle,
        artista: songArtist,
        cover: finalCover,
        folderId: destFolder,
        url: publicUrl,
        created_at: nuevaCancion.created_at || new Date().toISOString(),
        lyrics: fileLyrics || undefined
      });
      guardarLetraPersistente(nuevaCancion.id, publicUrl, songTitle, songArtist, fileLyrics);

      // 4. Agregar a la carpeta destino
      setFolders((prevFolders) => {
        const next = prevFolders.map((f) => {
          if (f.id === destFolder) {
            return {
              ...f,
              canciones: [nuevaCancion, ...(f.canciones || []).filter((c) => String(c.id) !== String(nuevaCancion.id))]
            };
          }
          return f;
        });
        saveFolders(next);
        return next;
      });

      setSelectedFolder((prev) => {
        if (prev && prev.id === destFolder) {
          return {
            ...prev,
            canciones: [nuevaCancion, ...(prev.canciones || []).filter((c) => String(c.id) !== String(nuevaCancion.id))]
          };
        }
        return prev;
      });

      // 5. Actualizar los estados de la interfaz
      setSongs((prev) => [nuevaCancion, ...prev.filter((s) => String(s.id) !== String(nuevaCancion.id))]);
      setCanciones((prev) => [nuevaCancion, ...prev.filter((s) => String(s.id) !== String(nuevaCancion.id))]);

      // 6. Reproducir directamente la canción usando la URL pública de R2
      setCurrentSong(nuevaCancion);
      setIsPlaying(true);

      triggerToast(`✨ ¡"${songTitle}" guardada exitosamente en "${folderObj?.titulo || destFolder}"!`, 'success');

      setShowUploadModal(false);
      setSelectedFile(null);
      setCoverFile(null);
      setCoverPreviewUrl('');
      setCustomTitle('');
      setCustomArtist('');
      setCustomCoverUrl('');
      setAiIdentifiedInfo(null);
    } catch (error: any) {
      console.error('Fallo en subirCancion a R2 o Supabase:', error);
      alert(`Error al subir la canción:\n\n${error?.message || error}\n\nVerifica las credenciales de Cloudflare R2 y CORS.`);
    } finally {
      setIsUploading(false);
      setUploadStatus('');
    }
  }

  // ==========================================
  // SUBIDA DE MÚLTIPLES ARCHIVOS MP3 Y CARPETAS ENTERAS
  // ==========================================
  const subirMultiplesArchivos = async (archivos: FileList | File[], folderDestinoId?: string) => {
    const lista = Array.from(archivos).filter((f) => {
      const ext = f.name.toLowerCase();
      return (
        f.type.startsWith('audio/') ||
        ext.endsWith('.mp3') ||
        ext.endsWith('.wav') ||
        ext.endsWith('.m4a') ||
        ext.endsWith('.aac') ||
        ext.endsWith('.flac') ||
        ext.endsWith('.ogg')
      );
    });

    if (lista.length === 0) {
      triggerToast('No se encontraron archivos de audio MP3 compatibles.', 'error');
      return;
    }

    setIsUploading(true);
    const nuevasCanciones: Song[] = [];
    const targetFolder = 'tus_me_gusta';

    for (let i = 0; i < lista.length; i++) {
      const file = lista[i];
      setUploadProgress({ total: lista.length, current: i + 1, currentName: file.name });
      setUploadStatus(`Procesando ${i + 1} de ${lista.length}: "${file.name}"...`);

      try {
        const id3 = await extractAudioMetadataFromFile(file);
        const fast = parseSmartAudioName(file.name);
        const songTitle = id3.title || fast.titulo || file.name.replace(/\.[^/.]+$/, '');
        const songArtist = id3.artist || fast.artista || 'Artista';

        const promptClean = encodeURIComponent(`${songArtist} ${songTitle} album cover art masterpiece vibrant 4k`);
        const cover = id3.coverUrl || `https://image.pollinations.ai/prompt/${promptClean}?width=512&height=512&nologo=true`;

        // 1. Subir archivo de audio a Cloudflare R2 con PutObjectCommand
        let finalAudioUrl = '';
        try {
          finalAudioUrl = await uploadToR2(file);
        } catch (r2Err: any) {
          console.error(`Error al subir a Cloudflare R2 "${file.name}":`, r2Err);
          triggerToast(`Error en R2 con "${file.name}": ${r2Err?.message || 'Error de subida'}`, 'error');
          continue;
        }

        const ruta = finalAudioUrl;

        // Insertar en tabla 'songs' con folder_id
        let dbId: string | undefined;
        try {
          const { data: songInserted, error: insertError } = await supabase
            .from('songs')
            .insert([
              {
                title: songTitle,
                artist: songArtist,
                cover_url: cover,
                audio_url: finalAudioUrl,
                folder_id: 'tus_me_gusta'
              }
            ])
            .select()
            .single();

          if (insertError) {
            const { data: retryInsert } = await supabase
              .from('songs')
              .insert([
                {
                  title: songTitle,
                  artist: songArtist,
                  cover_url: cover,
                  audio_url: finalAudioUrl
                }
              ])
              .select()
              .single();
            if (retryInsert?.id) dbId = retryInsert.id;
          } else if (songInserted?.id) {
            dbId = songInserted.id;
          }
        } catch (e) {
          console.warn('Nota BD:', e);
        }

        const cancion: Song = {
          id: dbId || ('r2_' + Date.now() + '_' + i),
          title: songTitle,
          artist: songArtist,
          titulo: songTitle,
          artista: songArtist,
          cover_url: cover,
          cover: cover,
          audio_url: finalAudioUrl,
          url: finalAudioUrl,
          storage_path: ruta,
          created_at: new Date().toISOString(),
          folder_id: 'tus_me_gusta',
          lyrics: id3.lyrics || undefined
        };

        guardarMetadatoCancion(ruta, {
          titulo: songTitle,
          artista: songArtist,
          cover,
          folderId: 'tus_me_gusta',
          url: finalAudioUrl,
          created_at: cancion.created_at || new Date().toISOString(),
          lyrics: id3.lyrics || undefined
        });
        guardarLetraPersistente(cancion.id, ruta, songTitle, songArtist, id3.lyrics);

        nuevasCanciones.push(cancion);
      } catch (err) {
        console.warn('Error subiendo audio múltiple:', err);
      }
    }

    if (nuevasCanciones.length > 0) {
      setSongs((prev) => [...nuevasCanciones, ...prev.filter((p) => !nuevasCanciones.some((n) => String(n.id) === String(p.id)))]);
      setCanciones((prev) => [...nuevasCanciones, ...prev.filter((p) => !nuevasCanciones.some((n) => String(n.id) === String(p.id)))]);

      setFolders((prev) =>
        prev.map((f) => {
          if (f.id === targetFolder) {
            return {
              ...f,
              canciones: [...nuevasCanciones, ...f.canciones]
            };
          }
          return f;
        })
      );

      // Reproducir automáticamente la primera canción agregada
      reproducirCancionDirecta(nuevasCanciones[0]);
      triggerToast(`¡Se subieron y agregaron ${nuevasCanciones.length} canciones con éxito!`, 'success');
    }

    setIsUploading(false);
    setUploadStatus('');
    setUploadProgress(null);
    setShowUploadModal(false);
  };

  // ==========================================
  // CONTROLES DE REPRODUCCIÓN & AUTOPLAY SIGUIENTE
  // ==========================================
  const obtenerListaActiva = (): Song[] => {
    if (selectedFolder && selectedFolder.canciones.length > 0) {
      return selectedFolder.canciones;
    }
    if (canciones.length > 0) return canciones;
    if (songs.length > 0) return songs;
    return [];
  };

  const reproducirCancionDirecta = (song: Song) => {
    setCurrentSong(song);
    setIsPlaying(true);
    const audioEl = audioRef.current;
    if (audioEl) {
      const src = song.audio_url || song.url;
      if (src) {
        audioEl.src = src;
        audioEl.currentTime = 0;
        audioEl.load();
        const p = audioEl.play();
        if (p !== undefined) {
          p.then(() => {
            setIsPlaying(true);
            if ('mediaSession' in navigator) {
              navigator.mediaSession.playbackState = 'playing';
            }
          }).catch((err) => console.warn('Error en autoplay:', err));
        }
      }
    }
  };

  const seleccionarCancion = (song: Song) => {
    unlockAudioForIOS();
    if (currentSong?.id === song.id) {
      togglePlay();
      return;
    }
    reproducirCancionDirecta(song);
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      if ('mediaSession' in navigator) {
        navigator.mediaSession.playbackState = 'paused';
      }
    } else {
      audioRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
          if ('mediaSession' in navigator) {
            navigator.mediaSession.playbackState = 'playing';
          }
        })
        .catch((err) => console.warn('Error al reproducir audio:', err));
    }
  };

  // ==========================================
  // CONTROLES DE REPRODUCCIÓN (ALEATORIO, REPETIR, SIGUIENTE, ANTERIOR)
  // ==========================================
  const toggleShuffle = () => {
    setIsShuffle((prev) => {
      const next = !prev;
      triggerToast(next ? '🔀 Modo aleatorio activado' : 'Modo aleatorio desactivado', 'success');
      return next;
    });
  };

  const toggleRepeat = () => {
    setRepeatMode((prev) => {
      if (prev === 'off') {
        triggerToast('🔁 Repetir toda la lista', 'success');
        return 'all';
      } else if (prev === 'all') {
        triggerToast('🔂 Repetir esta canción', 'success');
        return 'one';
      } else {
        triggerToast('Repetición desactivada', 'success');
        return 'off';
      }
    });
  };

  const setupAudioContext = () => {
    if (!audioRef.current) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioCtx();
      }
      if (audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume();
      }
      if (!sourceNodeRef.current && audioRef.current) {
        analyserRef.current = audioContextRef.current.createAnalyser();
        analyserRef.current.fftSize = 64;
        sourceNodeRef.current = audioContextRef.current.createMediaElementSource(audioRef.current);
        sourceNodeRef.current.connect(analyserRef.current);
        analyserRef.current.connect(audioContextRef.current.destination);
      }
    } catch (e) {
      console.warn('AudioContext notice:', e);
    }
  };

  const toggleFavorite = (song: Song) => {
    const sId = String(song.id);
    setFavorites((prev) => {
      const exists = prev.includes(sId);
      const updated = exists ? prev.filter((id) => id !== sId) : [...prev, sId];
      try {
        localStorage.setItem('fa_favorites_v1', JSON.stringify(updated));
      } catch {}
      triggerToast(
        exists ? `"${song.title || song.titulo}" se quitó de Tus me gusta` : `💚 "${song.title || song.titulo}" agregada a Tus me gusta`,
        'success'
      );
      return updated;
    });
  };

  const agregarACola = (song: Song, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setQueue((prev) => [...prev, song]);
    triggerToast(`➕ "${song.title || song.titulo}" agregada a la cola`, 'success');
  };

  // Botón "Siguiente" con soporte para Cola y Shuffle (Aleatorio)
  const reproducirSiguiente = () => {
    if (queue.length > 0) {
      const nextSong = queue[0];
      setQueue((prev) => prev.slice(1));
      reproducirCancionDirecta(nextSong);
      triggerToast(`🎶 Reproduciendo de la cola: "${nextSong.title || nextSong.titulo}"`, 'success');
      return;
    }

    const playlist = obtenerListaActiva();
    if (playlist.length === 0) return;
    const currentIndex = playlist.findIndex((s) => String(s.id) === String(currentSong?.id));
    
    let nextIndex = 0;
    if (isShuffle && playlist.length > 1) {
      do {
        nextIndex = Math.floor(Math.random() * playlist.length);
      } while (nextIndex === currentIndex && playlist.length > 1);
    } else {
      nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % playlist.length;
    }

    const nextSong = playlist[nextIndex];
    reproducirCancionDirecta(nextSong);
  };

  // Botón "Anterior" con soporte para reinicio de pista y Shuffle
  const reproducirAnterior = () => {
    if (audioRef.current && audioRef.current.currentTime > 3) {
      audioRef.current.currentTime = 0;
      setCurrentTime(0);
      return;
    }

    const playlist = obtenerListaActiva();
    if (playlist.length === 0) return;
    const currentIndex = playlist.findIndex((s) => String(s.id) === String(currentSong?.id));
    
    let prevIndex = 0;
    if (isShuffle && playlist.length > 1) {
      do {
        prevIndex = Math.floor(Math.random() * playlist.length);
      } while (prevIndex === currentIndex && playlist.length > 1);
    } else {
      prevIndex = currentIndex === -1 ? 0 : (currentIndex - 1 + playlist.length) % playlist.length;
    }

    const prevSong = playlist[prevIndex];
    reproducirCancionDirecta(prevSong);
  };

  // Manejador del final de la pista (onEnded): Soporta Repetir 1 y Reproducción Continua (Autoplay)
  const handleAudioEnded = () => {
    if (repeatMode === 'one') {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch((err) => console.warn('Error repitiendo canción:', err));
      }
      return;
    }
    // Reproducción Continua: ejecuta automáticamente la función que reproduce la siguiente canción
    reproducirSiguiente();
  };

  // ==========================================
  // 2. GESTOS SWIPE (TOUCH Y MOUSE) PARA PASAR DE CANCIÓN
  // ==========================================
  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);
  const mouseStartXRef = useRef<number | null>(null);
  const isMouseDownRef = useRef<boolean>(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
    touchStartYRef.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null || touchStartYRef.current === null) return;
    const diffX = e.changedTouches[0].clientX - touchStartXRef.current;
    const diffY = e.changedTouches[0].clientY - touchStartYRef.current;

    // Detectar swipe horizontal claro (mínimo 40px)
    if (Math.abs(diffX) > 40 && Math.abs(diffX) > Math.abs(diffY)) {
      if (diffX < 0) {
        reproducirSiguiente();
        triggerToast('⏭ Siguiente canción', 'success');
      } else {
        reproducirAnterior();
        triggerToast('⏮ Canción anterior', 'success');
      }
    }
    touchStartXRef.current = null;
    touchStartYRef.current = null;
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) return;
    mouseStartXRef.current = e.clientX;
    isMouseDownRef.current = true;
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!isMouseDownRef.current || mouseStartXRef.current === null) return;
    const diffX = e.clientX - mouseStartXRef.current;
    if (Math.abs(diffX) > 40) {
      if (diffX < 0) {
        reproducirSiguiente();
        triggerToast('⏭ Siguiente canción', 'success');
      } else {
        reproducirAnterior();
        triggerToast('⏮ Canción anterior', 'success');
      }
    }
    isMouseDownRef.current = false;
    mouseStartXRef.current = null;
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const cur = audioRef.current.currentTime;
      setCurrentTime(cur);
      const dur = audioRef.current.duration;
      if (dur && !isNaN(dur)) {
        setDuration(dur);
        if ('mediaSession' in navigator && 'setPositionState' in navigator.mediaSession) {
          try {
            navigator.mediaSession.setPositionState({
              duration: dur,
              playbackRate: audioRef.current.playbackRate || 1,
              position: Math.min(cur, dur)
            });
          } catch {}
        }
      }
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const handleSeekTime = (seconds: number) => {
    setCurrentTime(seconds);
    if (audioRef.current) {
      audioRef.current.currentTime = seconds;
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (audioRef.current) {
      audioRef.current.volume = val;
    }
    setIsMuted(val === 0);
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    if (isMuted) {
      audioRef.current.volume = volume || 0.85;
      setIsMuted(false);
    } else {
      audioRef.current.volume = 0;
      setIsMuted(true);
    }
  };

  const formatTime = (segundos: number) => {
    if (isNaN(segundos)) return '00:00';
    const mins = Math.floor(segundos / 60);
    const secs = Math.floor(segundos % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (audioRef.current && (currentSong?.audio_url || currentSong?.url)) {
      audioRef.current.load();
      if (isPlaying) {
        audioRef.current.play().catch((e) => console.warn('Reproducción diferida:', e));
      }
    }
  }, [currentSong]);

  // ==========================================
  // MEDIA SESSION API (CONTROLES EN PANTALLA BLOQUEADA, NOTIFICACIONES Y BLUETOOTH)
  // ==========================================
  const reproducirSiguienteRef = useRef(reproducirSiguiente);
  reproducirSiguienteRef.current = reproducirSiguiente;

  const reproducirAnteriorRef = useRef(reproducirAnterior);
  reproducirAnteriorRef.current = reproducirAnterior;

  // 1. Configurar manejadores de acción (play, pause, nexttrack, previoustrack, seekbackward, seekforward)
  useEffect(() => {
    if (!('mediaSession' in navigator)) return;

    try {
      // Reanudar reproducción
      navigator.mediaSession.setActionHandler('play', () => {
        if (audioRef.current) {
          audioRef.current
            .play()
            .then(() => {
              setIsPlaying(true);
              if ('mediaSession' in navigator) {
                navigator.mediaSession.playbackState = 'playing';
              }
            })
            .catch((err) => console.warn('Error al reproducir desde Media Session:', err));
        }
      });

      // Pausar reproducción
      navigator.mediaSession.setActionHandler('pause', () => {
        if (audioRef.current) {
          audioRef.current.pause();
          setIsPlaying(false);
          if ('mediaSession' in navigator) {
            navigator.mediaSession.playbackState = 'paused';
          }
        }
      });

      // Canción anterior (controles Bluetooth o pantalla bloqueada)
      navigator.mediaSession.setActionHandler('previoustrack', () => {
        reproducirAnteriorRef.current();
      });

      // Canción siguiente (controles Bluetooth o pantalla bloqueada)
      navigator.mediaSession.setActionHandler('nexttrack', () => {
        reproducirSiguienteRef.current();
      });

      // Retroceder 10 segundos
      navigator.mediaSession.setActionHandler('seekbackward', (details) => {
        const skip = details?.seekOffset || 10;
        if (audioRef.current) {
          const newTime = Math.max(audioRef.current.currentTime - skip, 0);
          audioRef.current.currentTime = newTime;
          setCurrentTime(newTime);
        }
      });

      // Avanzar 10 segundos
      navigator.mediaSession.setActionHandler('seekforward', (details) => {
        const skip = details?.seekOffset || 10;
        if (audioRef.current) {
          const maxDur = audioRef.current.duration || 999999;
          const newTime = Math.min(audioRef.current.currentTime + skip, maxDur);
          audioRef.current.currentTime = newTime;
          setCurrentTime(newTime);
        }
      });

      // Posicionamiento preciso en barra de progreso
      try {
        navigator.mediaSession.setActionHandler('seekto', (details) => {
          if (details?.seekTime !== undefined && audioRef.current) {
            audioRef.current.currentTime = details.seekTime;
            setCurrentTime(details.seekTime);
          }
        });
      } catch {}

      // Detener audio
      try {
        navigator.mediaSession.setActionHandler('stop', () => {
          if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            setIsPlaying(false);
            if ('mediaSession' in navigator) {
              navigator.mediaSession.playbackState = 'none';
            }
          }
        });
      } catch {}
    } catch (err) {
      console.warn('Error al registrar handlers de Media Session:', err);
    }
  }, []);

  // 2. Configurar metadatos (título, artista, álbum, carátula) al iniciar o cambiar de canción
  useEffect(() => {
    if (!('mediaSession' in navigator) || !currentSong) return;

    try {
      const songTitle = currentSong.title || currentSong.titulo || 'Canción';
      const songArtist = currentSong.artist || currentSong.artista || 'Spotyy_AA';
      const albumName = selectedFolder?.titulo || appName || 'Spotyy_AA';
      const rawCover = currentSong.cover_url || currentSong.cover || '/icon-512.png';

      let fullCoverUrl = rawCover;
      try {
        fullCoverUrl = new URL(rawCover, window.location.origin).href;
      } catch {}

      if (typeof MediaMetadata !== 'undefined') {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: songTitle,
          artist: songArtist,
          album: albumName,
          artwork: [
            { src: fullCoverUrl, sizes: '96x96', type: 'image/jpeg' },
            { src: fullCoverUrl, sizes: '128x128', type: 'image/jpeg' },
            { src: fullCoverUrl, sizes: '192x192', type: 'image/jpeg' },
            { src: fullCoverUrl, sizes: '256x256', type: 'image/jpeg' },
            { src: fullCoverUrl, sizes: '384x384', type: 'image/jpeg' },
            { src: fullCoverUrl, sizes: '512x512', type: 'image/jpeg' }
          ]
        });
      }
    } catch (err) {
      console.warn('Error al actualizar MediaMetadata:', err);
    }
  }, [currentSong, selectedFolder, appName]);

  // 3. Sincronizar el estado de reproducción (playbackState)
  useEffect(() => {
    if (!('mediaSession' in navigator)) return;
    try {
      navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';
    } catch (e) {}
  }, [isPlaying]);

  const listaParaBuscar = songs.length > 0 ? songs : canciones;
  const filteredSongs = listaParaBuscar.filter(
    (c) =>
      (c.title || c.titulo || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.artist || c.artista || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ==========================================
  // ARTWORK THUMBNAILS (COVERS IDÉNTICOS AL SCREENSHOT)
  // ==========================================
  const renderCover = (coverType?: string, className: string = 'w-14 h-14') => {
    if (coverType && (coverType.startsWith('http://') || coverType.startsWith('https://') || coverType.startsWith('data:image') || coverType.startsWith('/'))) {
      return (
        <div className={`${className} shrink-0 rounded-l-md overflow-hidden relative shadow bg-neutral-900 border border-white/10`}>
          <img src={coverType} alt="Portada" className="w-full h-full object-cover" />
        </div>
      );
    }

    switch (coverType) {
      case 'cover_buchonass':
        return (
          <div className={`${className} grid grid-cols-2 grid-rows-2 shrink-0 bg-neutral-900 rounded-l-md overflow-hidden relative shadow`}>
            <div className="bg-[#b45309] text-[7px] font-black text-amber-200 flex items-center justify-center p-0.5 text-center leading-tight">
              EL TÓXICO
            </div>
            <div className="bg-[#1e3a8a] text-[7px] font-black text-blue-200 flex items-center justify-center p-0.5 text-center leading-tight">
              RECODITOS
            </div>
            <div className="bg-[#451a03] text-[7px] font-black text-amber-100 flex items-center justify-center p-0.5 text-center leading-tight">
              PUERTO
            </div>
            <div className="bg-[#172554] text-[7px] font-black text-white flex items-center justify-center p-0.5 text-center leading-tight">
              FANTASÍA
            </div>
          </div>
        );

      case 'cover_tus_me_gusta':
        return (
          <div className={`${className} bg-gradient-to-br from-[#4c1d95] via-[#6366f1] to-[#3b82f6] flex items-center justify-center shrink-0 rounded-l-md shadow`}>
            <Heart className="w-6 h-6 text-white fill-current drop-shadow" />
          </div>
        );

      case 'cover_perreale':
        return (
          <div className={`${className} grid grid-cols-2 grid-rows-2 shrink-0 bg-neutral-950 rounded-l-md overflow-hidden shadow`}>
            <div className="bg-red-700 text-[6px] font-black text-yellow-300 flex items-center justify-center">PLAYER</div>
            <div className="bg-neutral-900 text-[8px] font-black text-red-500 flex items-center justify-center">23</div>
            <div className="bg-pink-700 text-[6px] font-black text-white flex items-center justify-center">PERREO</div>
            <div className="bg-red-600 text-[6px] font-black text-white flex items-center justify-center">GUETTA</div>
          </div>
        );

      case 'cover_lob':
        return (
          <div className={`${className} grid grid-cols-2 grid-rows-2 shrink-0 bg-[#1c1917] rounded-l-md overflow-hidden shadow`}>
            <div className="bg-[#292524] text-[6px] font-bold text-amber-300 flex items-center justify-center">NUEVA</div>
            <div className="bg-[#44403c] text-[6px] font-bold text-white flex items-center justify-center">COVERS</div>
            <div className="bg-[#1c1917] text-[6px] font-bold text-amber-400 flex items-center justify-center">REGISTRADA</div>
            <div className="bg-[#0c0a09] text-[6px] font-bold text-yellow-500 flex items-center justify-center">FIRME</div>
          </div>
        );

      case 'cover_2000':
        return (
          <div className={`${className} grid grid-cols-2 grid-rows-2 shrink-0 bg-neutral-900 rounded-l-md overflow-hidden shadow`}>
            <div className="bg-rose-600 text-[6px] font-black text-white flex items-center justify-center">HSM</div>
            <div className="bg-amber-500 text-[6px] font-black text-neutral-900 flex items-center justify-center">CAMP</div>
            <div className="bg-cyan-600 text-[6px] font-black text-white flex items-center justify-center">POP</div>
            <div className="bg-indigo-600 text-[6px] font-black text-white flex items-center justify-center">ROCK</div>
          </div>
        );

      case 'cover_grwm':
        return (
          <div className={`${className} grid grid-cols-2 grid-rows-2 shrink-0 bg-neutral-950 rounded-l-md overflow-hidden shadow`}>
            <div className="bg-neutral-800 text-[6px] font-bold text-gray-300 flex items-center justify-center">DERULO</div>
            <div className="bg-neutral-900 text-[6px] font-bold text-pink-400 flex items-center justify-center">RIHANNA</div>
            <div className="bg-stone-900 text-[6px] font-bold text-amber-200 flex items-center justify-center">YOUNG</div>
            <div className="bg-neutral-800 text-[6px] font-bold text-white flex items-center justify-center">WIZ</div>
          </div>
        );

      case 'cover_baladas':
        return (
          <div className={`${className} bg-gradient-to-tr from-[#881337] via-[#e11d48] to-[#9f1239] flex flex-col items-center justify-center p-1 shrink-0 rounded-l-md shadow relative`}>
            <div className="absolute top-1 left-1 w-2.5 h-2.5 rounded-full bg-white/40 flex items-center justify-center text-[5px]">●</div>
            <span className="text-[7px] text-white font-extrabold text-center leading-none mt-2">
              Baladas<br />Románticas
            </span>
          </div>
        );

      case 'cover_reina':
        return (
          <div className={`${className} bg-[#262626] border border-white/5 flex items-center justify-center shrink-0 rounded-l-md shadow`}>
            <ImageIcon className="w-6 h-6 text-gray-400 stroke-[1.5]" />
          </div>
        );

      case 'cover_23':
        return (
          <div className={`${className} bg-[#881337] border border-white/20 flex flex-col items-center justify-center p-1 shrink-0 rounded shadow`}>
            <span className="text-[14px] font-black text-white tracking-tighter leading-none">23</span>
            <span className="text-[6px] font-bold text-red-200 uppercase tracking-widest mt-0.5">MIKE WILL</span>
          </div>
        );

      default:
        return (
          <div className={`${className} bg-gradient-to-br from-[#1E90FF] to-[#E91E63] flex items-center justify-center shrink-0 rounded-l-md shadow`}>
            <Music className="w-6 h-6 text-white" />
          </div>
        );
    }
  };
  // ==========================================
  // GESTIÓN DE CARPETAS DE AUDIOS (PLAYLISTS)
  // ==========================================

  const obtenerCancionesCarpeta = (folder: AudioFolder): Song[] => {
    const currentFolderData = folders.find((f) => f.id === folder.id) || folder;
    const allSongs = songs.length > 0 ? songs : canciones;

    // Canciones cuyo folder_id coincide con esta carpeta (o por defecto tus_me_gusta)
    const matchingSongs = allSongs.filter((c) => {
      const fid = c.folder_id || 'tus_me_gusta';
      return fid === folder.id;
    });

    const map = new Map<string, Song>();
    for (const c of matchingSongs) {
      map.set(String(c.id), c);
      if (c.audio_url) map.set(c.audio_url, c);
    }

    // Compatibilidad con canciones presentes en la memoria de la carpeta
    for (const c of currentFolderData.canciones || []) {
      const fid = c.folder_id || 'tus_me_gusta';
      // Si la canción existe en allSongs con otra carpeta, ya no pertenece aquí
      const movedToAnotherFolder = allSongs.some((s) => {
        const matchId = String(s.id) === String(c.id);
        const matchUrl = (s.audio_url && c.audio_url && s.audio_url === c.audio_url) ||
                         (s.url && c.url && s.url === c.url);
        return (matchId || matchUrl) && (s.folder_id || 'tus_me_gusta') !== folder.id;
      });

      const alreadyInMap = map.has(String(c.id)) || (c.audio_url && map.has(c.audio_url));
      if (!movedToAnotherFolder && fid === folder.id && !alreadyInMap) {
        map.set(String(c.id), c);
      }
    }

    const seen = new Set<string>();
    const result: Song[] = [];
    for (const songItem of map.values()) {
      const key = String(songItem.id) || songItem.audio_url || songItem.url;
      if (!seen.has(key)) {
        seen.add(key);
        result.push(songItem);
      }
    }

    return result;
  };

  const toggleLikeFolder = (folderId: string) => {
    setFolderLiked((prev) => {
      const nextVal = !prev[folderId];
      triggerToast(
        nextVal ? 'Carpeta guardada en tus favoritas' : 'Carpeta eliminada de favoritas',
        'success'
      );
      return { ...prev, [folderId]: nextVal };
    });
  };

  // Renderizar la vista detallada de la carpeta de audios
  const renderFolderView = (folder: AudioFolder) => {
    const currentFolderState = folders.find((f) => f.id === folder.id) || folder;
    const cancionesCarpeta = obtenerCancionesCarpeta(currentFolderState);
    const estaReproduciendoCarpeta = cancionesCarpeta.some(
      (c) => c.id === currentSong?.id && isPlaying
    );

    return (
      <div className="space-y-6 animate-fade-in pb-16">
        {/* Barra superior de navegación dentro de la carpeta */}
        <div className="flex items-center justify-between sticky top-0 bg-[#121212]/95 backdrop-blur-md py-3 z-20 border-b border-white/5">
          <button
            onClick={() => setSelectedFolder(null)}
            className="flex items-center gap-2 text-sm font-bold text-gray-200 hover:text-white bg-[#222222] hover:bg-[#2e2e2e] px-4 py-2 rounded-full transition shadow-sm active:scale-95"
          >
            <ArrowLeft className="w-5 h-5 text-emerald-400" />
            <span>Volver a Inicio</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-bold tracking-wider px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              {currentFolderState.badge || 'Carpeta de Audios'}
            </span>
          </div>
        </div>

        {/* Encabezado / Hero de la Carpeta */}
        <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 pt-2">
          <div className="w-40 h-40 sm:w-48 sm:h-48 rounded-2xl overflow-hidden shadow-2xl shrink-0 ring-1 ring-white/10 flex items-center justify-center bg-[#1c1c1e]">
            {renderCover(currentFolderState.coverKey, 'w-full h-full object-cover')}
          </div>

          <div className="flex-1 text-center sm:text-left min-w-0">
            <div className="text-xs font-bold text-emerald-400 uppercase tracking-widest flex items-center justify-center sm:justify-start gap-1.5">
              <span>{appName}</span>
              <span>•</span>
              <span>CARPETA DE AUDIOS</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-white mt-1.5 leading-tight tracking-tight">
              {currentFolderState.titulo}
            </h1>
            <p className="text-sm sm:text-base text-gray-300 mt-2 font-medium line-clamp-2">
              {currentFolderState.subtitulo}
            </p>
            <p className="text-xs sm:text-sm text-gray-400 mt-1 line-clamp-2">
              {currentFolderState.descripcion}
            </p>
            <div className="flex items-center justify-center sm:justify-start gap-2.5 text-xs sm:text-sm text-gray-300 mt-3.5 font-medium flex-wrap">
              <span className="text-white font-black bg-white/10 px-2.5 py-0.5 rounded-md">{cancionesCarpeta.length} audios</span>
              <span>•</span>
              <span>Audio HQ 320kbps</span>
              <span>•</span>
              <span className="text-emerald-400 font-bold">Reproducción Inmediata</span>
            </div>
          </div>
        </div>

        {/* Barra de Acciones de la Carpeta */}
        <div className="flex flex-wrap items-center gap-3 py-3 border-y border-white/10">
          {/* Botón Play grande */}
          <button
            onClick={() => {
              if (cancionesCarpeta.length > 0) {
                seleccionarCancion(cancionesCarpeta[0]);
              }
            }}
            className="w-14 h-14 rounded-full bg-[#1ED760] hover:bg-[#1db954] text-black flex items-center justify-center shadow-xl active:scale-95 transition"
            title="Reproducir todos los audios"
          >
            {estaReproduciendoCarpeta ? (
              <Pause className="w-7 h-7 fill-current" />
            ) : (
              <Play className="w-7 h-7 fill-current ml-0.5" />
            )}
          </button>

          {/* Botón Like de Carpeta */}
          <button
            onClick={() => toggleLikeFolder(currentFolderState.id)}
            className={`p-3 rounded-full border transition ${
              folderLiked[currentFolderState.id]
                ? 'text-[#1ED760] border-[#1ED760]/40 bg-emerald-500/10'
                : 'text-gray-400 hover:text-white border-white/10 hover:border-white/30'
            }`}
            title="Guardar en favoritos"
          >
            <Heart className={`w-5 h-5 ${folderLiked[currentFolderState.id] ? 'fill-current' : ''}`} />
          </button>

          {/* Acciones de administración de carpeta (Solo Administrador) */}
          {isAdmin && (
            <>
              {/* Input oculto para subida directa de audio a la carpeta actual */}
              <input
                ref={folderDirectFileInputRef}
                type="file"
                accept="audio/*,audio/mp3,audio/mpeg,audio/wav,audio/m4a,audio/aac,audio/flac,audio/ogg,.mp3,.wav,.m4a"
                multiple
                onChange={handleFolderDirectUpload}
                className="hidden"
              />

              {/* Botón: + Agregar música */}
              <button
                onClick={() => {
                  if (!isDirectFolderUploading) {
                    folderDirectFileInputRef.current?.click();
                  }
                }}
                disabled={isDirectFolderUploading}
                className="px-4 py-2.5 rounded-full text-xs sm:text-sm font-bold bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 disabled:cursor-not-allowed text-white flex items-center gap-2 shadow-lg transition active:scale-95"
                title="Seleccionar y subir archivos de audio directamente a esta carpeta"
              >
                {isDirectFolderUploading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                    <span>Subiendo...</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 stroke-[3]" />
                    <span>+ Agregar música</span>
                  </>
                )}
              </button>

              {/* Botón: Subir MP3 con DeepSeek IA a esta carpeta */}
              <button
                onClick={() => {
                  setTargetFolderId(currentFolderState.id);
                  setCustomArtist(currentFolderState.titulo);
                  setShowUploadModal(true);
                }}
                className="px-4 py-2.5 rounded-full text-xs sm:text-sm font-bold bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white flex items-center gap-2 shadow-lg transition active:scale-95"
                title="Subir un archivo MP3 e identificarlo con IA para esta carpeta"
              >
                <Sparkles className="w-4 h-4 text-yellow-300" />
                <span>Subir MP3 con IA</span>
              </button>
            </>
          )}
        </div>

        {/* Lista de Pistas / Audios de la Carpeta */}
        <div className="space-y-1.5">
          <div className="px-3 py-2 flex items-center text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-white/5">
            <span className="w-8 text-center">#</span>
            <span className="flex-1">Título y Artista</span>
            {isAdmin && <span className="w-28 text-right pr-2">Acciones</span>}
          </div>

          {cancionesCarpeta.length === 0 ? (
            <div className="p-10 text-center bg-[#181818] rounded-2xl border border-white/5 text-gray-400 space-y-3">
              <Folder className="w-12 h-12 mx-auto text-gray-500" />
              <p className="text-base font-bold text-white">Esta carpeta aún no tiene canciones</p>
              {isAdmin ? (
                <>
                  <p className="text-xs sm:text-sm max-w-sm mx-auto">
                    Toca en <strong className="text-blue-400">&quot;+ Agregar música&quot;</strong> para subir audios directamente o en <strong className="text-pink-400">&quot;Subir MP3 con IA&quot;</strong>.
                  </p>
                  <div className="flex flex-wrap justify-center gap-2.5 pt-2">
                    <button
                      onClick={() => {
                        if (!isDirectFolderUploading) {
                          folderDirectFileInputRef.current?.click();
                        }
                      }}
                      disabled={isDirectFolderUploading}
                      className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 disabled:cursor-not-allowed text-white flex items-center gap-2 transition"
                    >
                      {isDirectFolderUploading ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin text-white" />
                          <span>Subiendo...</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4 stroke-[3]" />
                          <span>+ Agregar música</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setTargetFolderId(currentFolderState.id);
                        setCustomArtist(currentFolderState.titulo);
                        setShowUploadModal(true);
                      }}
                      className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white flex items-center gap-2 shadow-lg transition active:scale-95"
                    >
                      <Sparkles className="w-4 h-4 text-yellow-300" />
                      <span>Subir MP3 con IA</span>
                    </button>
                  </div>
                </>
              ) : (
                <p className="text-xs sm:text-sm text-gray-400">
                  El administrador agregará música a esta carpeta próximamente.
                </p>
              )}
            </div>
          ) : (
            <>
              {cancionesCarpeta.slice(0, folderPageSize).map((cancion, idx) => {
                const esActual = currentSong?.id === cancion.id;
                const sonando = esActual && isPlaying;

                return (
                  <div
                    key={cancion.id}
                    onClick={() => seleccionarCancion(cancion)}
                    className={`group flex items-center px-3 py-3 rounded-xl cursor-pointer transition select-none ${
                      esActual
                        ? 'bg-white/10 text-white border border-emerald-500/30'
                        : 'hover:bg-white/5 text-gray-200'
                    }`}
                  >
                    {/* Número o Indicador de reproducción */}
                    <div className="w-8 flex items-center justify-center shrink-0">
                      {sonando ? (
                        <div className="flex items-end gap-0.5 h-4">
                          <span className="w-1 bg-[#1ED760] h-full animate-bounce rounded-full" />
                          <span className="w-1 bg-[#1ED760] h-2.5 animate-bounce rounded-full [animation-delay:0.2s]" />
                          <span className="w-1 bg-[#1ED760] h-3.5 animate-bounce rounded-full [animation-delay:0.4s]" />
                        </div>
                      ) : (
                        <span className={`text-sm font-semibold ${esActual ? 'text-[#1ED760]' : 'text-gray-400 group-hover:hidden'}`}>
                          {idx + 1}
                        </span>
                      )}
                      {!sonando && (
                        <Play className="w-4 h-4 text-white hidden group-hover:block ml-0.5 fill-current" />
                      )}
                    </div>

                    {/* Portada miniatura */}
                    <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 mx-2.5 shadow bg-neutral-800">
                      {renderCover(cancion.cover_url || cancion.cover || currentFolderState.coverKey, 'w-full h-full object-cover')}
                    </div>

                    {/* Datos de la Pista (Letras un poco más grandes) */}
                    <div className="flex-1 min-w-0 pr-2">
                      <p
                        className={`text-sm sm:text-base font-bold truncate leading-tight ${
                          esActual ? 'text-[#1ED760]' : 'text-white'
                        }`}
                      >
                        {cancion.title || cancion.titulo}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-400 truncate mt-0.5 font-medium">
                        {cancion.artist || cancion.artista}
                      </p>
                    </div>

                    {/* Botones de acción (Solo Administrador): Menú de opciones (⋮), Quitar de carpeta y Eliminar */}
                    {isAdmin && (
                      <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                        {/* Botón: Menú de opciones (Mover a carpeta) */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedSongForMenu(cancion);
                            setShowSongMenuModal(true);
                          }}
                          className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition active:scale-90"
                          title="Opciones (Mover a carpeta)"
                        >
                          <MoreVertical className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>

                        {/* Botón: Quitar de esta carpeta */}
                        <button
                          onClick={(e) => quitarCancionDeCarpeta(currentFolderState.id, cancion.id, e)}
                          className="p-2 text-amber-400 hover:text-amber-300 hover:bg-amber-400/10 rounded-lg transition"
                          title="Quitar de esta carpeta"
                        >
                          <MinusCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>

                        {/* Botón: Eliminar canción permanentemente */}
                        <button
                          onClick={(e) => eliminarCancion(cancion, e)}
                          className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition"
                          title="Eliminar canción permanentemente"
                        >
                          <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Controles de paginación de 50 en 50 para alto rendimiento */}
              {cancionesCarpeta.length > folderPageSize && (
                <div className="pt-4 pb-2 flex flex-col sm:flex-row items-center justify-between gap-3 p-4 bg-[#18181a] rounded-2xl border border-white/5 shadow-md">
                  <span className="text-xs text-gray-400 font-medium">
                    Mostrando <strong className="text-white">{Math.min(folderPageSize, cancionesCarpeta.length)}</strong> de <strong className="text-emerald-400">{cancionesCarpeta.length}</strong> audios en esta carpeta
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setFolderPageSize((prev) => prev + 50)}
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition shadow active:scale-95 flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5 stroke-[3]" />
                      <span>Cargar 50 más</span>
                    </button>
                    <button
                      onClick={() => setFolderPageSize(cancionesCarpeta.length)}
                      className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition border border-white/10 active:scale-95"
                    >
                      Mostrar todas ({cancionesCarpeta.length})
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    );
  };

  // Si la sesión aún se está verificando inicialmente
  if (sessionLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[100dvh] h-[100dvh] w-screen bg-[#121212] text-white select-none safe-top safe-bottom">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-[#1ED760] flex items-center justify-center shadow-2xl shadow-emerald-500/30 animate-pulse mb-4">
          <Music className="w-7 h-7 text-black stroke-[2.5]" />
        </div>
        <p className="text-sm font-semibold text-gray-400">Verificando sesión segura...</p>
      </div>
    );
  }

  // 1. PANTALLA DE LOGIN: Mostrar solo si NO hay sesión activa (campos en blanco por defecto)
  if (!user) {
    return (
      <div className="min-h-[100dvh] h-[100dvh] w-screen bg-gradient-to-b from-[#18181b] via-[#121212] to-[#0a0a0a] text-white flex flex-col justify-center items-center p-4 sm:p-6 select-none relative overflow-hidden safe-top safe-bottom">
        {/* Glow decorativo de fondo */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-md bg-[#18181a]/95 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10 animate-fade-in">
          {/* Encabezado con Nombre Dinámico de la App */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-emerald-600 to-[#1ED760] flex items-center justify-center shadow-xl shadow-emerald-500/25 mb-3.5">
              <Music className="w-8 h-8 text-black stroke-[2.5]" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {appName}
            </h1>
            <p className="text-xs sm:text-sm text-gray-400 mt-1">
              {isSignUpMode
                ? 'Crea tu cuenta para acceder a la música'
                : 'Inicia sesión con tu correo y contraseña'}
            </p>
          </div>

          {/* Banner de alerta de error */}
          {authError && (
            <div className="mb-5 p-3.5 bg-red-950/60 border border-red-500/40 rounded-2xl flex items-start gap-2.5 text-xs text-red-200">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
              <div className="flex-1">
                <span className="font-medium">{authError}</span>
                {authError.toLowerCase().includes('invalid login credentials') && !isSignUpMode && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsSignUpMode(true);
                      setAuthError(null);
                    }}
                    className="block mt-1 text-emerald-400 hover:underline font-bold"
                  >
                    ¿No tienes cuenta aún? Regístrate aquí
                  </button>
                )}
              </div>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1.5 uppercase tracking-wider">
                Correo Electrónico
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@correo.com"
                className="w-full px-4 py-3 bg-[#111113] border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#1ED760] focus:ring-1 focus:ring-[#1ED760] transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1.5 uppercase tracking-wider">
                Contraseña
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-[#111113] border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#1ED760] focus:ring-1 focus:ring-[#1ED760] transition"
              />
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-3 px-4 rounded-xl font-black text-sm bg-[#1ED760] hover:bg-[#1db954] text-black shadow-lg shadow-emerald-500/20 active:scale-[0.98] transition disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
            >
              {isLoggingIn ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-black" />
                  <span>{isSignUpMode ? 'Creando cuenta...' : 'Iniciando sesión...'}</span>
                </>
              ) : (
                <span>{isSignUpMode ? 'Crear Cuenta' : 'Iniciar Sesión'}</span>
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-white/10 text-center">
            <button
              type="button"
              onClick={() => {
                setIsSignUpMode(!isSignUpMode);
                setAuthError(null);
              }}
              className="text-xs text-gray-300 hover:text-[#1ED760] transition font-semibold"
            >
              {isSignUpMode
                ? '¿Ya tienes una cuenta? Iniciar Sesión'
                : '¿No tienes cuenta? Regístrate aquí'}
            </button>
          </div>

          <div className="mt-5 p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center gap-2 text-[11px] text-gray-400">
            <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Administrador: <strong className="text-gray-200">mejiamejiaaaron@gmail.com</strong></span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col h-[100dvh] w-screen bg-[#121212] text-white font-sans overflow-hidden select-none"
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* Elemento de Audio Nativo HTML5 Global para Reproducción en Segundo Plano y Media Session */}
      <audio
        ref={audioRef}
        src={currentSong?.audio_url || currentSong?.url || undefined}
        preload="auto"
        controlsList="nodownload noplaybackrate"
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleAudioEnded}
        onPlay={() => {
          setIsPlaying(true);
          if ('mediaSession' in navigator) {
            navigator.mediaSession.playbackState = 'playing';
          }
        }}
        onPause={() => {
          setIsPlaying(false);
          if ('mediaSession' in navigator) {
            navigator.mediaSession.playbackState = 'paused';
          }
        }}
        className="hidden"
      />

      {/* ==========================================
          HEADER SUPERIOR CON NOMBRE DE APP, ROL, AJUSTES ADMIN Y CERRAR SESIÓN (CON SAFE AREA TOP PARA IPHONE NOTCH)
          ========================================== */}
      <header className="px-4 py-2.5 flex items-center justify-between border-b border-white/5 bg-[#121212]/95 backdrop-blur-md shrink-0 z-20 pt-[calc(env(safe-area-inset-top,0px)+0.625rem)]">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-[#1ED760] flex items-center justify-center shadow-lg shadow-emerald-500/20 shrink-0">
            <Music className="w-4 h-4 text-black stroke-[2.5]" />
          </div>
          <div className="min-w-0">
            <h1 className="text-sm sm:text-base font-black text-white tracking-tight truncate leading-tight">
              {appName}
            </h1>
            <p className="text-[10px] text-gray-400 font-medium truncate">
              {isAdmin ? '👑 Modo Administrador' : user.email}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Ícono de Ajustes Administrativos (Solo Administrador) */}
          {isAdmin && (
            <button
              onClick={() => {
                setTempAppName(appName);
                cargarUsuariosBloqueados();
                setShowAdminSettingsModal(true);
              }}
              className="px-2.5 py-1.5 rounded-full text-xs font-bold bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/40 flex items-center gap-1.5 transition active:scale-95 shadow-sm"
              title="Ajustes Administrativos (Solo Administrador)"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Ajustes Admin</span>
            </button>
          )}

          {/* Botón Cerrar Sesión (Visible para cualquier usuario autenticado) */}
          <button
            onClick={handleLogout}
            className="px-2.5 py-1.5 rounded-full text-xs font-bold bg-red-500/15 hover:bg-red-500/25 text-red-400 hover:text-white border border-red-500/30 flex items-center gap-1.5 transition active:scale-95 shadow-sm"
            title="Cerrar Sesión"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Cerrar Sesión</span>
          </button>
        </div>
      </header>

      {/* ==========================================
          BARRA SUPERIOR DE FILTROS (AVATAR + TODAS + MÚSICA + PODCASTS + AUDIOLIBROS)
          ========================================== */}
      <div className="px-4 py-2 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0 z-20">
        {/* Avatar Usuario */}
        <div
          onClick={() => {
            if (isAdmin) {
              setTempAppName(appName);
              cargarUsuariosBloqueados();
              setShowAdminSettingsModal(true);
            } else {
              setShowDeployModal(true);
            }
          }}
          className="relative w-8 h-8 rounded-full overflow-hidden shrink-0 cursor-pointer border border-white/20 active:scale-95 transition"
          title={isAdmin ? 'Ajustes Admin' : user.email || 'Usuario'}
        >
          <img
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
            alt="Usuario"
            className="w-full h-full object-cover"
          />
        </div>

        {/* 1. Botón Inicio */}
        <button
          onClick={() => {
            setActiveFilter('inicio');
            setSelectedFolder(null);
          }}
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition shrink-0 flex items-center gap-1.5 active:scale-95 ${
            activeFilter === 'inicio' && !selectedFolder
              ? 'bg-[#1ED760] text-black shadow-sm font-black'
              : 'bg-[#2A2A2A] text-white hover:bg-[#333333]'
          }`}
          title="Ver pantalla de inicio"
        >
          <Home className="w-3.5 h-3.5" />
          <span>Inicio</span>
        </button>

        {/* 2. Botón Canciones (100% funcional) */}
        <button
          onClick={() => {
            setActiveFilter('canciones');
            setSelectedFolder(null);
          }}
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition shrink-0 flex items-center gap-1.5 active:scale-95 ${
            activeFilter === 'canciones' && !selectedFolder
              ? 'bg-[#1ED760] text-black shadow-sm font-black'
              : 'bg-[#2A2A2A] text-white hover:bg-[#333333]'
          }`}
          title="Ver catálogo completo de canciones"
        >
          <Music className="w-3.5 h-3.5" />
          <span>Canciones</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
            activeFilter === 'canciones' && !selectedFolder ? 'bg-black/20 text-black' : 'bg-white/10 text-emerald-400'
          }`}>
            {(songs.length > 0 ? songs : canciones).length}
          </span>
        </button>

        {/* 3. Botón Carpetas (100% funcional) */}
        <button
          onClick={() => {
            setActiveFilter('carpetas');
            setSelectedFolder(null);
          }}
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition shrink-0 flex items-center gap-1.5 active:scale-95 ${
            activeFilter === 'carpetas' && !selectedFolder
              ? 'bg-[#1ED760] text-black shadow-sm font-black'
              : 'bg-[#2A2A2A] text-white hover:bg-[#333333]'
          }`}
          title="Ver todas las carpetas y playlists"
        >
          <Folder className="w-3.5 h-3.5" />
          <span>Carpetas</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
            activeFilter === 'carpetas' && !selectedFolder ? 'bg-black/20 text-black' : 'bg-white/10 text-blue-300'
          }`}>
            {folders.length}
          </span>
        </button>

        {/* 4. Botón Favoritas (100% funcional) */}
        <button
          onClick={() => {
            setActiveFilter('favoritas');
            setSelectedFolder(null);
          }}
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition shrink-0 flex items-center gap-1.5 active:scale-95 ${
            activeFilter === 'favoritas' && !selectedFolder
              ? 'bg-[#1ED760] text-black shadow-sm font-black'
              : 'bg-[#2A2A2A] text-white hover:bg-[#333333]'
          }`}
          title="Ver tus canciones favoritas"
        >
          <Heart className={`w-3.5 h-3.5 ${activeFilter === 'favoritas' && !selectedFolder ? 'fill-current text-black' : 'text-emerald-400'}`} />
          <span>Favoritas</span>
          {favorites.length > 0 && (
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
              activeFilter === 'favoritas' && !selectedFolder ? 'bg-black/20 text-black' : 'bg-pink-500/25 text-pink-300'
            }`}>
              {favorites.length}
            </span>
          )}
        </button>

        {/* 5. Botón Audiolibro (100% funcional: abre directo la carpeta del audiolibro) */}
        <button
          onClick={() => {
            const f = folders.find((c) => c.id === 'audiolibro') || carpetasAudio.find((c) => c.id === 'audiolibro');
            if (f) setSelectedFolder(f);
          }}
          className="px-3.5 py-1.5 rounded-full text-xs font-bold transition shrink-0 flex items-center gap-1.5 bg-[#2A2A2A] hover:bg-[#333333] text-purple-300 border border-purple-500/30 active:scale-95"
          title="Abrir audiolibro completo con todos sus capítulos"
        >
          <Headphones className="w-3.5 h-3.5 text-purple-400" />
          <span>Audiolibro</span>
        </button>

        {/* 6. Botón Acción "Aleatorio" (100% funcional: reproduce al instante) */}
        <button
          onClick={reproducirAleatorio}
          className="px-3.5 py-1.5 rounded-full text-xs font-bold transition shrink-0 flex items-center gap-1.5 bg-[#1ED760]/15 hover:bg-[#1ED760]/25 text-[#1ED760] border border-[#1ED760]/40 active:scale-95 shadow-sm"
          title="Reproducir música aleatoria al instante"
        >
          <Shuffle className="w-3.5 h-3.5" />
          <span>Aleatorio</span>
        </button>

        {/* 7. Botón Acción "+ Subir MP3" (Solo Administrador) */}
        {isAdmin && (
          <button
            onClick={() => setShowUploadModal(true)}
            className="px-3.5 py-1.5 rounded-full text-xs font-bold transition shrink-0 flex items-center gap-1.5 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white active:scale-95 shadow-sm"
            title="Subir archivos MP3 o carpetas"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>Subir MP3</span>
          </button>
        )}

        {/* Botón rápido Instalar PWA en Celular */}
        <button
          onClick={handleInstallPWA}
          className="ml-auto px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#1ED760]/10 hover:bg-[#1ED760]/20 text-[#1ED760] border border-[#1ED760]/40 flex items-center gap-1 shrink-0 transition shadow-sm active:scale-95"
          title="Instalar en celular Android con su propio icono"
        >
          <Smartphone className="w-3.5 h-3.5 text-[#1ED760]" />
          <span>Instalar App</span>
        </button>

        {/* Botón rápido publicar URL independiente */}
        <button
          onClick={() => setShowDeployModal(true)}
          className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-500/15 hover:bg-blue-500/25 text-blue-400 hover:text-white border border-blue-500/40 flex items-center gap-1 shrink-0 transition active:scale-95 shadow-sm"
          title="Publicar en tu propia URL independiente fuera de AI Studio"
        >
          <Rocket className="w-3.5 h-3.5 text-blue-400" />
          <span>Web Propia</span>
        </button>
      </div>

      {/* ==========================================
          CONTENEDOR PRINCIPAL SCROLLABLE (VISTAS FUNCIONALES)
          ========================================== */}
      <div className="flex-1 overflow-y-auto px-3 sm:px-4 pb-36 pt-1 space-y-6">
        {selectedFolder ? (
          renderFolderView(selectedFolder)
        ) : activeTab === 'inicio' ? (
          <>
            {/* ========================================================
                VISTA 1: INICIO (GRID SPOTIFY, AUDIOLIBRO Y CARRUSEL)
                ======================================================== */}
            {activeFilter === 'inicio' && (
              <>
                {/* GRID 2x4 DE ACCESO RÁPIDO A CARPETAS */}
                <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                  {folders.slice(0, 8).map((folder) => {
                    const count = obtenerCancionesCarpeta(folder).length;
                    return (
                      <div
                        key={folder.id}
                        onClick={() => setSelectedFolder(folder)}
                        className="group flex items-center bg-[#282828] hover:bg-[#333333] rounded-lg overflow-hidden cursor-pointer transition active:scale-[0.98] shadow-md hover:ring-1 hover:ring-white/20 min-h-[62px]"
                        title={`Abrir carpeta ${folder.titulo}`}
                      >
                        {renderCover(folder.coverKey, 'w-16 h-16')}
                        <div className="flex-1 px-3 min-w-0">
                          <span className="text-sm font-black text-white line-clamp-2 leading-tight">
                            {folder.titulo}
                          </span>
                          <span className="text-xs text-gray-400 font-semibold block mt-0.5">
                            {count} {count === 1 ? 'audio' : 'audios'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* SECCIÓN AUDIOLIBRO */}
                <div className="space-y-3 pt-2">
                  <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                    Sumérgete en un audiolibro
                  </h2>

                  <div
                    onClick={() => setSelectedFolder(folders.find((f) => f.id === 'audiolibro') || carpetasAudio.find((f) => f.id === 'audiolibro') || null)}
                    className="bg-[#242424] hover:bg-[#2b2b2b] rounded-xl p-3 sm:p-4 flex gap-3.5 sm:gap-4 items-center cursor-pointer transition shadow-lg relative group hover:ring-1 hover:ring-white/10"
                    title="Abrir audiolibro completo con todos sus capítulos"
                  >
                    <div className="w-28 h-28 sm:w-32 sm:h-32 bg-[#202020] border border-white/5 rounded-lg flex items-center justify-center shrink-0 shadow-inner">
                      <div className="w-16 h-16 rounded-full border-2 border-gray-400 flex items-center justify-center relative">
                        <div className="w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center">
                          <div className="w-2.5 h-2.5 rounded-full bg-gray-300" />
                        </div>
                        <div className="absolute -bottom-2 w-1 h-3 bg-gray-400" />
                      </div>
                    </div>

                    <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-[#1ED760]">
                            Incluido en Premium
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedFolder(folders.find((f) => f.id === 'audiolibro') || carpetasAudio.find((f) => f.id === 'audiolibro') || null);
                            }}
                            className="text-gray-400 hover:text-white p-1"
                            title="Ver capítulos"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </div>

                        <h3 className="text-sm sm:text-base font-bold text-white mt-1 leading-snug line-clamp-2">
                          Deja de ser tú (latino): La mente crea la real...
                        </h3>
                      </div>

                      <div className="flex items-center justify-between pt-4">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            triggerToast('Guardado en Tu Biblioteca', 'success');
                          }}
                          className="text-gray-300 hover:text-white p-1 rounded-full transition"
                          title="Agregar a tu biblioteca"
                        >
                          <div className="w-6 h-6 rounded-full border border-gray-400 flex items-center justify-center">
                            <Plus className="w-4 h-4" />
                          </div>
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const folder = folders.find((f) => f.id === 'audiolibro') || carpetasAudio.find((f) => f.id === 'audiolibro');
                            if (folder && folder.canciones.length > 0) {
                              seleccionarCancion(folder.canciones[0]);
                            }
                          }}
                          className="w-10 h-10 rounded-full bg-white hover:bg-gray-200 text-black flex items-center justify-center shadow-lg active:scale-95 transition"
                          title="Reproducir audiolibro"
                        >
                          {currentSong?.id === 'audio_1' && isPlaying ? (
                            <Pause className="w-5 h-5 fill-current" />
                          ) : (
                            <Play className="w-5 h-5 fill-current ml-0.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* SECCIÓN SIGUE REPRODUCIENDO */}
                <div className="space-y-3 pt-2">
                  <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                    Sigue reproduciendo
                  </h2>

                  <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2 pt-1">
                    <div
                      onClick={() => setSelectedFolder(carpetasAudio.find((f) => f.id === 'marco_antonio') || null)}
                      className="w-44 sm:w-48 shrink-0 bg-[#181818] hover:bg-[#222222] p-3 rounded-xl cursor-pointer transition shadow group"
                      title="Abrir carpeta de Marco Antonio Solís"
                    >
                      <div className="w-full aspect-square rounded-lg overflow-hidden relative mb-2.5 bg-neutral-800">
                        <img
                          src="https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&auto=format&fit=crop&q=80"
                          alt="Marco Antonio Solís"
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                        />
                        <div className="absolute top-2 left-2 w-5 h-5 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center">
                          <Music className="w-3 h-3 text-[#1ED760]" />
                        </div>
                      </div>
                      <h4 className="text-sm font-bold text-white truncate">Marco Antonio Solís</h4>
                      <p className="text-xs text-gray-400 truncate mt-0.5">
                        Franco De Vita, Chayanne y Los Bukis
                      </p>
                    </div>

                    <div
                      onClick={() => setSelectedFolder(carpetasAudio.find((f) => f.id === 'mix_grupero') || null)}
                      className="w-44 sm:w-48 shrink-0 bg-[#181818] hover:bg-[#222222] p-3 rounded-xl cursor-pointer transition shadow group"
                      title="Abrir carpeta de Mix de grupero"
                    >
                      <div className="w-full aspect-square rounded-lg overflow-hidden relative mb-2.5 bg-neutral-800">
                        <img
                          src="https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&auto=format&fit=crop&q=80"
                          alt="Mix de grupero"
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                        />
                        <div className="absolute top-2 left-2 w-5 h-5 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center">
                          <Music className="w-3 h-3 text-[#1ED760]" />
                        </div>
                      </div>
                      <h4 className="text-sm font-bold text-white truncate">Mix de grupero</h4>
                      <p className="text-xs text-gray-400 truncate mt-0.5">
                        Eden Muñoz, Grupo Mojado, Kany García y...
                      </p>
                    </div>

                    <div
                      onClick={() => setActiveFilter('canciones')}
                      className="w-44 sm:w-48 shrink-0 bg-[#181818] hover:bg-[#222222] p-3 rounded-xl cursor-pointer transition shadow group flex flex-col justify-between"
                      title="Ver todas las canciones"
                    >
                      <div className="w-full aspect-square rounded-lg bg-gradient-to-tr from-blue-700 via-pink-600 to-red-600 flex items-center justify-center mb-2.5 relative shadow-inner">
                        <Music className="w-12 h-12 text-white animate-pulse" />
                        <div className="absolute top-2 left-2 w-5 h-5 rounded-full bg-black/60 flex items-center justify-center">
                          <ShieldCheck className="w-3 h-3 text-blue-400" />
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white truncate">Catálogo de Pistas</h4>
                        <p className="text-xs text-blue-400 truncate mt-0.5 font-medium">
                          {(songs.length > 0 ? songs : canciones).length} canciones disponibles
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* ========================================================
                VISTA 2: CANCIONES (CATÁLOGO COMPLETO FUNCIONAL)
                ======================================================== */}
            {activeFilter === 'canciones' && (
              <div className="space-y-4 animate-fade-in pt-1">
                {/* Cabecera con estadísticas y acciones rápidas */}
                <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-gradient-to-r from-[#1c1c1e] to-[#252528] rounded-2xl border border-white/10 shadow-lg">
                  <div>
                    <div className="flex items-center gap-2">
                      <Music className="w-5 h-5 text-[#1ED760]" />
                      <h2 className="text-xl sm:text-2xl font-black text-white">Todas las Canciones</h2>
                    </div>
                    <p className="text-xs text-gray-300 mt-1 font-medium">
                      {(songs.length > 0 ? songs : canciones).length} canciones disponibles para reproducción instantánea
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        const lista = songs.length > 0 ? songs : canciones;
                        if (lista.length > 0) seleccionarCancion(lista[0]);
                      }}
                      className="px-3.5 py-2 rounded-full bg-[#1ED760] hover:bg-[#1db954] text-black font-bold text-xs flex items-center gap-1.5 shadow-lg active:scale-95 transition"
                      title="Reproducir desde la primera pista"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Reproducir Todo</span>
                    </button>
                    <button
                      onClick={reproducirAleatorio}
                      className="px-3.5 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-1.5 border border-white/10 active:scale-95 transition"
                      title="Reproducir en modo aleatorio"
                    >
                      <Shuffle className="w-3.5 h-3.5 text-[#1ED760]" />
                      <span>Aleatorio</span>
                    </button>
                    {isAdmin && (
                      <button
                        onClick={() => setShowUploadModal(true)}
                        className="px-3.5 py-2 rounded-full bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs flex items-center gap-1.5 shadow active:scale-95 transition"
                        title="Subir nueva canción"
                      >
                        <Plus className="w-3.5 h-3.5 stroke-[3]" />
                        <span>+ Subir</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Lista de canciones con acciones completas */}
                <div className="space-y-1.5">
                  {(songs.length > 0 ? songs : canciones).length === 0 ? (
                    <div className="p-8 text-center bg-[#181818] rounded-2xl border border-white/5 space-y-3">
                      <Music className="w-10 h-10 text-gray-500 mx-auto" />
                      <p className="text-sm font-bold text-white">No hay canciones cargadas aún</p>
                      <p className="text-xs text-gray-400">
                        {isAdmin ? 'Sube tus archivos MP3 o carpetas de música para comenzar a reproducir.' : 'El administrador agregará música a esta sección próximamente.'}
                      </p>
                      {isAdmin && (
                        <button
                          onClick={() => setShowUploadModal(true)}
                          className="px-4 py-2 bg-[#1ED760] text-black font-bold text-xs rounded-full shadow hover:bg-[#1db954] transition"
                        >
                          Subir mi primer MP3
                        </button>
                      )}
                    </div>
                  ) : (
                    <>
                      {(songs.length > 0 ? songs : canciones).slice(0, cancionesPageSize).map((cancion, idx) => {
                        const esActual = currentSong?.id === cancion.id;
                        const sonando = esActual && isPlaying;
                        const esFav = favorites.includes(String(cancion.id));

                        return (
                          <div
                            key={cancion.id}
                            onClick={() => seleccionarCancion(cancion)}
                            className={`group flex items-center px-3 py-2.5 rounded-xl cursor-pointer transition select-none ${
                              esActual
                                ? 'bg-white/10 text-white border border-[#1ED760]/40 shadow-md'
                                : 'hover:bg-white/5 text-gray-200 bg-[#161616]'
                            }`}
                          >
                            <div className="w-7 flex items-center justify-center shrink-0">
                              {sonando ? (
                                <div className="flex items-end gap-0.5 h-3.5">
                                  <span className="w-1 bg-[#1ED760] h-full animate-bounce rounded-full" />
                                  <span className="w-1 bg-[#1ED760] h-2 animate-bounce rounded-full [animation-delay:0.2s]" />
                                  <span className="w-1 bg-[#1ED760] h-3 animate-bounce rounded-full [animation-delay:0.4s]" />
                                </div>
                              ) : (
                                <span className={`text-xs font-semibold ${esActual ? 'text-[#1ED760]' : 'text-gray-400 group-hover:hidden'}`}>
                                  {idx + 1}
                                </span>
                              )}
                              {!sonando && (
                                <Play className="w-3.5 h-3.5 text-white hidden group-hover:block ml-0.5 fill-current" />
                              )}
                            </div>

                            <div className="w-11 h-11 rounded-lg overflow-hidden shrink-0 mx-2 shadow bg-neutral-900 border border-white/5">
                              {renderCover(cancion.cover_url || cancion.cover, 'w-full h-full object-cover')}
                            </div>

                            <div className="flex-1 min-w-0 pr-2">
                              <p className={`text-sm font-bold truncate leading-tight ${esActual ? 'text-[#1ED760]' : 'text-white'}`}>
                                {cancion.title || cancion.titulo}
                              </p>
                              <p className="text-xs text-gray-400 truncate mt-0.5">
                                {cancion.artist || cancion.artista}
                              </p>
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleFavorite(cancion);
                                }}
                                className="p-2 text-gray-400 hover:text-[#1ED760] rounded-lg transition active:scale-90"
                                title={esFav ? 'Quitar de favoritos' : 'Añadir a favoritos'}
                              >
                                <Heart className={`w-4 h-4 ${esFav ? 'fill-current text-[#1ED760]' : ''}`} />
                              </button>

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedSongForMenu(cancion);
                                  setShowSongMenuModal(true);
                                }}
                                className="p-2 text-gray-400 hover:text-white rounded-lg transition active:scale-90"
                                title="Opciones de la canción (Mover a carpeta)"
                              >
                                <MoreVertical className="w-4 h-4" />
                              </button>

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  seleccionarCancion(cancion);
                                }}
                                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white text-white hover:text-black flex items-center justify-center transition active:scale-95 ml-1"
                                title={sonando ? 'Pausar' : 'Reproducir'}
                              >
                                {sonando ? (
                                  <Pause className="w-3.5 h-3.5 fill-current" />
                                ) : (
                                  <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                                )}
                              </button>
                            </div>
                          </div>
                        );
                      })}

                      {/* Controles de paginación de 50 en 50 para alto rendimiento */}
                      {(songs.length > 0 ? songs : canciones).length > cancionesPageSize && (
                        <div className="pt-4 pb-2 flex flex-col sm:flex-row items-center justify-between gap-3 p-4 bg-[#18181a] rounded-2xl border border-white/5 shadow-md">
                          <span className="text-xs text-gray-400 font-medium">
                            Mostrando <strong className="text-white">{Math.min(cancionesPageSize, (songs.length > 0 ? songs : canciones).length)}</strong> de <strong className="text-emerald-400">{(songs.length > 0 ? songs : canciones).length}</strong> canciones
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setCancionesPageSize((prev) => prev + 50)}
                              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition shadow active:scale-95 flex items-center gap-1.5"
                            >
                              <Plus className="w-3.5 h-3.5 stroke-[3]" />
                              <span>Cargar 50 más</span>
                            </button>
                            <button
                              onClick={() => setCancionesPageSize((songs.length > 0 ? songs : canciones).length)}
                              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition border border-white/10 active:scale-95"
                            >
                              Mostrar todas ({(songs.length > 0 ? songs : canciones).length})
                            </button>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}

            {/* ========================================================
                VISTA 3: CARPETAS (TODAS LAS PLAYLISTS COMPLETAS)
                ======================================================== */}
            {activeFilter === 'carpetas' && (
              <div className="space-y-4 animate-fade-in pt-1">
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-[#1c1c1e] to-[#252528] rounded-2xl border border-white/10 shadow-lg">
                  <div>
                    <div className="flex items-center gap-2">
                      <Folder className="w-5 h-5 text-blue-400" />
                      <h2 className="text-xl sm:text-2xl font-black text-white">Carpetas de Audios & Playlists</h2>
                    </div>
                    <p className="text-xs text-gray-300 mt-1 font-medium">
                      {folders.length} carpetas organizadas • Toca cualquier carpeta para abrirla
                    </p>
                  </div>
                  {isAdmin && (
                    <button
                      onClick={() => setShowUploadModal(true)}
                      className="px-3.5 py-2 rounded-full bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs flex items-center gap-1.5 shadow active:scale-95 transition"
                    >
                      <Plus className="w-3.5 h-3.5 stroke-[3]" />
                      <span>+ Subir a Carpeta</span>
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {folders.map((folder) => {
                    const count = obtenerCancionesCarpeta(folder).length;
                    return (
                      <div
                        key={folder.id}
                        onClick={() => setSelectedFolder(folder)}
                        className="group flex items-center p-2.5 bg-[#1C1C1E] hover:bg-[#252528] rounded-xl border border-white/5 hover:border-white/20 cursor-pointer transition shadow-md active:scale-[0.98]"
                      >
                        <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 shadow bg-neutral-900 mr-3">
                          {renderCover(folder.coverKey, 'w-full h-full object-cover')}
                        </div>
                        <div className="flex-1 min-w-0 pr-2">
                          <h4 className="text-sm font-black text-white truncate leading-snug group-hover:text-[#1ED760] transition">
                            {folder.titulo}
                          </h4>
                          <p className="text-xs text-gray-400 truncate mt-0.5">
                            {folder.subtitulo || folder.descripcion}
                          </p>
                          <span className="inline-block mt-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                            {count} {count === 1 ? 'audio' : 'audios'}
                          </span>
                        </div>
                        <Play className="w-4 h-4 text-gray-400 group-hover:text-white shrink-0 ml-1" />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ========================================================
                VISTA 4: FAVORITAS (TUS TEMAS CON CORAZÓN 💚)
                ======================================================== */}
            {activeFilter === 'favoritas' && (
              <div className="space-y-4 animate-fade-in pt-1">
                {(() => {
                  const listaTodas = songs.length > 0 ? songs : canciones;
                  const favoritasList = listaTodas.filter((s) => favorites.includes(String(s.id)));

                  return (
                    <>
                      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-gradient-to-r from-pink-950/40 via-purple-950/40 to-[#1c1c1e] rounded-2xl border border-pink-500/30 shadow-lg">
                        <div>
                          <div className="flex items-center gap-2">
                            <Heart className="w-5 h-5 text-[#1ED760] fill-current" />
                            <h2 className="text-xl sm:text-2xl font-black text-white">Tus Canciones Favoritas</h2>
                          </div>
                          <p className="text-xs text-gray-300 mt-1 font-medium">
                            {favoritasList.length} temas marcados con 💚
                          </p>
                        </div>

                        {favoritasList.length > 0 && (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => seleccionarCancion(favoritasList[0])}
                              className="px-3.5 py-2 rounded-full bg-[#1ED760] hover:bg-[#1db954] text-black font-bold text-xs flex items-center gap-1.5 shadow active:scale-95 transition"
                            >
                              <Play className="w-3.5 h-3.5 fill-current" />
                              <span>Reproducir Favoritas</span>
                            </button>
                            <button
                              onClick={reproducirAleatorio}
                              className="px-3.5 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-1.5 border border-white/10 active:scale-95 transition"
                            >
                              <Shuffle className="w-3.5 h-3.5 text-[#1ED760]" />
                              <span>Aleatorio</span>
                            </button>
                          </div>
                        )}
                      </div>

                      {favoritasList.length === 0 ? (
                        <div className="p-10 text-center bg-[#181818] rounded-2xl border border-white/5 space-y-3">
                          <Heart className="w-12 h-12 text-pink-500/50 mx-auto" />
                          <p className="text-base font-bold text-white">Aún no tienes canciones favoritas</p>
                          <p className="text-xs text-gray-400 max-w-sm mx-auto">
                            Toca el corazón <strong className="text-emerald-400">💚</strong> en cualquier canción de tu biblioteca para guardarla en esta lista de acceso rápido.
                          </p>
                          <div className="pt-2">
                            <button
                              onClick={() => setActiveFilter('canciones')}
                              className="px-4 py-2 bg-[#1ED760] text-black font-bold text-xs rounded-full shadow hover:bg-[#1db954] transition active:scale-95"
                            >
                              Explorar canciones
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-1.5">
                          {favoritasList.map((cancion, idx) => {
                            const esActual = currentSong?.id === cancion.id;
                            const sonando = esActual && isPlaying;

                            return (
                              <div
                                key={cancion.id}
                                onClick={() => seleccionarCancion(cancion)}
                                className={`group flex items-center px-3 py-2.5 rounded-xl cursor-pointer transition select-none ${
                                  esActual
                                    ? 'bg-white/10 text-white border border-[#1ED760]/40 shadow-md'
                                    : 'hover:bg-white/5 text-gray-200 bg-[#161616]'
                                }`}
                              >
                                <div className="w-7 flex items-center justify-center shrink-0">
                                  {sonando ? (
                                    <div className="flex items-end gap-0.5 h-3.5">
                                      <span className="w-1 bg-[#1ED760] h-full animate-bounce rounded-full" />
                                      <span className="w-1 bg-[#1ED760] h-2 animate-bounce rounded-full [animation-delay:0.2s]" />
                                      <span className="w-1 bg-[#1ED760] h-3 animate-bounce rounded-full [animation-delay:0.4s]" />
                                    </div>
                                  ) : (
                                    <span className="text-xs font-semibold text-gray-400 group-hover:hidden">
                                      {idx + 1}
                                    </span>
                                  )}
                                  {!sonando && (
                                    <Play className="w-3.5 h-3.5 text-white hidden group-hover:block ml-0.5 fill-current" />
                                  )}
                                </div>

                                <div className="w-11 h-11 rounded-lg overflow-hidden shrink-0 mx-2 shadow bg-neutral-900 border border-white/5">
                                  {renderCover(cancion.cover_url || cancion.cover, 'w-full h-full object-cover')}
                                </div>

                                <div className="flex-1 min-w-0 pr-2">
                                  <p className={`text-sm font-bold truncate leading-tight ${esActual ? 'text-[#1ED760]' : 'text-white'}`}>
                                    {cancion.title || cancion.titulo}
                                  </p>
                                  <p className="text-xs text-gray-400 truncate mt-0.5">
                                    {cancion.artist || cancion.artista}
                                  </p>
                                </div>

                                <div className="flex items-center gap-1 shrink-0">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleFavorite(cancion);
                                    }}
                                    className="p-2 text-[#1ED760] hover:text-white rounded-lg transition active:scale-90"
                                    title="Quitar de favoritas"
                                  >
                                    <Heart className="w-4 h-4 fill-current" />
                                  </button>

                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedSongForMenu(cancion);
                                      setShowSongMenuModal(true);
                                    }}
                                    className="p-2 text-gray-400 hover:text-white rounded-lg transition active:scale-90"
                                    title="Opciones de la canción (Mover a carpeta)"
                                  >
                                    <MoreVertical className="w-4 h-4" />
                                  </button>

                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      seleccionarCancion(cancion);
                                    }}
                                    className="w-8 h-8 rounded-full bg-white/10 hover:bg-white text-white hover:text-black flex items-center justify-center transition active:scale-95 ml-1"
                                    title={sonando ? 'Pausar' : 'Reproducir'}
                                  >
                                    {sonando ? (
                                      <Pause className="w-3.5 h-3.5 fill-current" />
                                    ) : (
                                      <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                                    )}
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            )}
          </>
        ) : null}

        {/* ==========================================
            PESTAÑA: BUSCAR
            ========================================== */}
        {activeTab === 'buscar' && (
          <div className="space-y-4 pt-1">
            <h2 className="text-2xl font-black text-white">Buscar</h2>
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="¿Qué deseas escuchar?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-[#242424] border border-[#333333] rounded-xl text-sm text-white placeholder-gray-400 focus:outline-none focus:border-[#1ED760] transition"
              />
            </div>

            <div className="space-y-2 pt-2">
              <h3 className="text-sm font-bold text-gray-300">Pistas y Artistas disponibles</h3>
              {filteredSongs.map((cancion) => (
                <div
                  key={cancion.id}
                  onClick={() => seleccionarCancion(cancion)}
                  className="flex items-center justify-between p-2.5 bg-[#1C1C1C] hover:bg-[#242424] rounded-lg cursor-pointer transition"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {renderCover(cancion.cover_url || cancion.cover, 'w-10 h-10')}
                    <div className="min-w-0">
                      <p className={`text-sm font-bold truncate ${currentSong?.id === cancion.id ? 'text-[#1ED760]' : 'text-white'}`}>
                        {cancion.title || cancion.titulo}
                      </p>
                      <p className="text-xs text-gray-400 truncate">{cancion.artist || cancion.artista}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedSongForMenu(cancion);
                        setShowSongMenuModal(true);
                      }}
                      className="p-1.5 text-gray-400 hover:text-white rounded-lg transition active:scale-90"
                      title="Opciones (Mover a carpeta)"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                    <Play className="w-4 h-4 text-gray-400 group-hover:text-white" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==========================================
            PESTAÑA: TU BIBLIOTECA (SUPABASE STORAGE)
            ========================================== */}
        {activeTab === 'biblioteca' && (
          <div className="space-y-4 pt-1">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="text-2xl font-black text-white">Tu biblioteca</h2>
                <p className="text-xs text-blue-400 font-medium">Música propia subida</p>
              </div>
              {isAdmin && (
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => multiFileInputRef.current?.click()}
                    className="px-3 py-1.5 rounded-full bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs flex items-center gap-1.5 shadow active:scale-95 transition"
                    title="Subir múltiples archivos MP3"
                  >
                    <Music className="w-3.5 h-3.5" />
                    <span>Subir múltiples MP3</span>
                  </button>
                  <button
                    onClick={() => folderInputRef.current?.click()}
                    className="px-3 py-1.5 rounded-full bg-[#2A2A2A] hover:bg-[#333333] border border-white/10 text-white font-bold text-xs flex items-center gap-1.5 shadow active:scale-95 transition"
                    title="Subir carpeta entera de música"
                  >
                    <Folder className="w-3.5 h-3.5 text-blue-400" />
                    <span>Subir carpeta</span>
                  </button>
                  <button
                    onClick={() => setShowUploadModal(true)}
                    className="px-3 py-1.5 rounded-full bg-[#1ED760] hover:bg-[#1db954] text-black font-bold text-xs flex items-center gap-1 shadow active:scale-95 transition"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Con IA</span>
                  </button>
                </div>
              )}
            </div>

            {/* Tarjeta de estado de sesión */}
            <div className="p-3 bg-[#1C1C1E] border border-white/10 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                <ShieldCheck className={`w-5 h-5 shrink-0 ${isAdmin ? 'text-amber-400' : 'text-blue-400'}`} />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>{user.email}</span>
                    {isAdmin && (
                      <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-1.5 py-0.2 rounded font-bold">
                        Admin
                      </span>
                    )}
                  </p>
                  <p className="text-[11px] text-gray-400">
                    {isAdmin ? 'Sesión de Administrador con acceso completo' : 'Sesión de usuario activa (Solo lectura y reproducción)'}
                  </p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="px-2.5 py-1 text-[11px] font-semibold bg-red-950/60 text-red-300 border border-red-500/30 rounded-lg hover:bg-red-900/60 transition"
              >
                Cerrar Sesión
              </button>
            </div>

            {/* Lista de canciones del usuario */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-300">Tus pistas de música</h3>
                {(songs.length > 0 || canciones.length > 0) && (
                  <span className="text-xs text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full">
                    {(songs.length > 0 ? songs : canciones).length} canciones
                  </span>
                )}
              </div>

              {(songs.length > 0 || canciones.length > 0) ? (
                (songs.length > 0 ? songs : canciones).map((song) => {
                  const isSelected = currentSong?.id === song.id;
                  return (
                    <div
                      key={song.id}
                      onClick={() => seleccionarCancion(song)}
                      className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition ${
                        isSelected ? 'bg-[#202020] border border-[#1ED760]/60' : 'bg-[#181818] hover:bg-[#222222]'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {renderCover(song.cover_url || song.cover, 'w-11 h-11')}
                        <div className="min-w-0">
                          <p className={`text-xs sm:text-sm font-bold truncate ${isSelected ? 'text-[#1ED760]' : 'text-white'}`}>
                            {song.title || song.titulo}
                          </p>
                          <p className="text-[11px] text-gray-400 truncate">{song.artist || song.artista}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 sm:gap-2">
                        {isAdmin && (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedSongForMenu(song);
                                setShowSongMenuModal(true);
                              }}
                              className="p-1.5 text-gray-400 hover:text-white rounded-lg transition active:scale-90"
                              title="Opciones (Mover a carpeta)"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => solicitarEliminarCancion(song, e)}
                              className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
                              title="Eliminar canción"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            seleccionarCancion(song);
                          }}
                          className="w-8 h-8 rounded-full bg-white/10 hover:bg-white text-white hover:text-black flex items-center justify-center transition"
                        >
                          {isSelected && isPlaying ? (
                            <Pause className="w-4 h-4 fill-current" />
                          ) : (
                            <Play className="w-4 h-4 fill-current ml-0.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-8 text-center bg-[#181818] rounded-2xl border border-white/5 space-y-3">
                  <Music className="w-10 h-10 text-gray-500 mx-auto" />
                  <p className="text-sm font-bold text-white">Aún no hay canciones en tu biblioteca</p>
                  <p className="text-xs text-gray-400 max-w-sm mx-auto">
                    {isAdmin ? 'Selecciona múltiples archivos MP3 o una carpeta completa para cargarlos aquí.' : 'El administrador agregará música a tu biblioteca próximamente.'}
                  </p>
                  {isAdmin && (
                    <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
                      <button
                        onClick={() => multiFileInputRef.current?.click()}
                        className="px-4 py-2 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white font-bold text-xs rounded-full shadow-lg flex items-center gap-2 active:scale-95 transition"
                      >
                        <Music className="w-4 h-4" />
                        <span>Subir múltiples MP3</span>
                      </button>
                      <button
                        onClick={() => folderInputRef.current?.click()}
                        className="px-4 py-2 bg-[#282828] hover:bg-[#333333] border border-white/10 text-white font-bold text-xs rounded-full flex items-center gap-2 active:scale-95 transition"
                      >
                        <Folder className="w-4 h-4 text-blue-400" />
                        <span>Subir carpeta</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ==========================================
          MINI PLAYER FLOTANTE (DONDE SE DA PLAY)
          Con opción de agregar a cualquier carpeta y cambiar música directamente desde aquí
          ========================================== */}
      <div className="fixed bottom-[calc(4rem+env(safe-area-inset-bottom,0px)+0.5rem)] sm:bottom-[calc(4.5rem+env(safe-area-inset-bottom,0px))] left-2 right-2 sm:left-4 sm:right-4 z-40">
        <div
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onClick={() => {
            if (currentSong) {
              setShowExpandedPlayer(true);
            }
          }}
          className="bg-gradient-to-r from-[#580816] via-[#6a0a1c] to-[#450510] rounded-xl p-2.5 sm:p-3 shadow-2xl transition border border-red-900/50 relative overflow-hidden backdrop-blur-md cursor-pointer select-none flex flex-col gap-1.5 active:scale-[0.99]"
          title="Toca para abrir el reproductor en pantalla completa"
        >
          {/* Fila Principal: Portada + Info + Controles de Reproducción */}
          <div className="flex items-center justify-between gap-2">
            {/* Izquierda: Portada + Título + Artista */}
            <div
              className="flex items-center gap-2.5 sm:gap-3 min-w-0 cursor-pointer flex-1 mr-1"
            >
              {/* Cuadro de portada con carátula o icono */}
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-lg overflow-hidden shrink-0 shadow-lg border border-white/20 bg-[#881337] flex items-center justify-center">
                {currentSong ? (
                  renderCover(currentSong.cover_url || currentSong.cover, 'w-full h-full object-cover')
                ) : (
                  <Music className="w-5 h-5 sm:w-6 sm:h-6 text-white/70" />
                )}
              </div>

              {/* Título y Artistas */}
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-base font-black text-white truncate leading-tight">
                  {currentSong ? (currentSong.title || currentSong.titulo) : 'Sin canción en reproducción'}
                </p>
                <p className="text-[11px] sm:text-xs text-red-200/90 truncate font-semibold mt-0.5">
                  {currentSong ? (currentSong.artist || currentSong.artista) : 'Sube tus MP3 o carpetas de música'}
                </p>
              </div>
            </div>

            {/* Derecha: Controles completos (Aleatorio, Anterior, Play/Pausa, Siguiente, Repetir, Carpeta, Lista) */}
            <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
              {/* 1. Botón: Aleatorio (Shuffle) */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleShuffle();
                }}
                className={`p-1.5 sm:p-2 rounded-full transition active:scale-90 relative ${
                  isShuffle ? 'text-[#1ED760] bg-white/10' : 'text-white/60 hover:text-white'
                }`}
                title={isShuffle ? 'Modo aleatorio activado' : 'Activar aleatorio'}
              >
                <Shuffle className="w-4 h-4 sm:w-4.5 sm:h-4.5 stroke-[2.2]" />
                {isShuffle && (
                  <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#1ED760]" />
                )}
              </button>

              {/* 2. Botón: Canción Anterior */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  reproducirAnterior();
                }}
                className="p-1.5 sm:p-2 text-white/80 hover:text-white transition active:scale-90"
                title="Pista anterior"
              >
                <SkipBack className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
              </button>

              {/* 3. Botón: PLAY / PAUSA */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  togglePlay();
                }}
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white text-black hover:bg-gray-100 flex items-center justify-center hover:scale-105 active:scale-95 transition shadow-xl shrink-0"
                title={isPlaying ? 'Pausar' : 'Reproducir'}
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5 sm:w-5.5 sm:h-5.5 fill-current" />
                ) : (
                  <Play className="w-5 h-5 sm:w-5.5 sm:h-5.5 fill-current ml-0.5" />
                )}
              </button>

              {/* 4. Botón: Canción Siguiente */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  reproducirSiguiente();
                }}
                className="p-1.5 sm:p-2 text-white/80 hover:text-white transition active:scale-90"
                title="Siguiente pista"
              >
                <SkipForward className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
              </button>

              {/* 5. Botón: Repetir (Repeat) */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleRepeat();
                }}
                className={`p-1.5 sm:p-2 rounded-full transition active:scale-90 relative ${
                  repeatMode !== 'off' ? 'text-[#1ED760] bg-white/10' : 'text-white/60 hover:text-white'
                }`}
                title={
                  repeatMode === 'one'
                    ? 'Repetir canción actual'
                    : repeatMode === 'all'
                    ? 'Repetir lista completa'
                    : 'Activar repetición'
                }
              >
                {repeatMode === 'one' ? (
                  <Repeat1 className="w-4 h-4 sm:w-4.5 sm:h-4.5 stroke-[2.2]" />
                ) : (
                  <Repeat className="w-4 h-4 sm:w-4.5 sm:h-4.5 stroke-[2.2]" />
                )}
                {repeatMode !== 'off' && (
                  <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#1ED760]" />
                )}
              </button>

              {/* 6. Botón: Agregar a cualquier carpeta desde el reproductor (Solo Admin) */}
              {isAdmin && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (currentSong) {
                      setSongToAddToFolder(currentSong);
                      setShowAddToFolderModal(true);
                    }
                  }}
                  className="p-1.5 sm:p-2 rounded-full bg-white/10 hover:bg-white/20 text-emerald-400 hover:text-white transition active:scale-90 shadow-sm"
                  title="Agregar canción actual a cualquier carpeta"
                >
                  <FolderPlus className="w-4 h-4 sm:w-4.5 sm:h-4.5 stroke-[2.2]" />
                </button>
              )}

              {/* 7. Botón: Cambiar música directamente desde aquí */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowChangeSongModal(true);
                }}
                className="p-1.5 sm:p-2 rounded-full bg-white/10 hover:bg-white/20 text-yellow-300 hover:text-white transition active:scale-90 shadow-sm"
                title="Cambiar música / Explorar canciones"
              >
                <ListMusic className="w-4 h-4 sm:w-4.5 sm:h-4.5 stroke-[2.2]" />
              </button>
            </div>
          </div>

          {/* Fila Inferior: Barra de progreso interactiva (Seek: click y arrastre para adelantar/retroceder) */}
          <div
            className="w-full flex items-center gap-2 px-0.5 select-none pt-0.5"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="text-[10px] sm:text-xs font-mono text-gray-300 w-8 text-right select-none tabular-nums shrink-0">
              {formatTime(currentTime)}
            </span>
            <div className="relative flex-1 flex items-center group py-1.5 cursor-pointer">
              {/* Pista de fondo de progreso */}
              <div className="w-full h-1.5 sm:h-2 bg-black/60 rounded-full overflow-hidden shadow-inner">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-[#1ED760] rounded-full transition-all duration-75 relative"
                  style={{ width: `${duration ? Math.min(100, Math.max(0, (currentTime / duration) * 100)) : 0}%` }}
                />
              </div>
              {/* Input range interactivo transparente sobrepuesto para Seek suave en táctil y mouse */}
              <input
                type="range"
                min={0}
                max={duration || 100}
                step="0.1"
                value={currentTime}
                onChange={handleSeek}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                title="Adelantar o retroceder (Seek)"
              />
            </div>
            <span className="text-[10px] sm:text-xs font-mono text-gray-300 w-8 text-left select-none tabular-nums shrink-0">
              {formatTime(duration)}
            </span>
          </div>
        </div>
      </div>

      {/* ==========================================
          BARRA DE NAVEGACIÓN INFERIOR (MÁS GRANDE Y CÓMODA)
          Inicio, Buscar, Tu biblioteca, Crear
          ========================================== */}
      <footer className="fixed bottom-0 left-0 right-0 h-[calc(4rem+env(safe-area-inset-bottom,0px))] pb-[env(safe-area-inset-bottom,0px)] bg-black border-t border-neutral-900 px-4 flex items-center justify-around z-40 select-none">
        {/* Tab 1: Inicio */}
        <button
          onClick={() => {
            setActiveTab('inicio');
            setSelectedFolder(null);
          }}
          className={`flex flex-col items-center justify-center gap-1 transition py-1 ${
            activeTab === 'inicio' && !selectedFolder ? 'text-[#1ED760] font-black' : 'text-gray-400 hover:text-gray-200 font-semibold'
          }`}
        >
          <Home className={`w-6 h-6 ${activeTab === 'inicio' && !selectedFolder ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
          <span className="text-xs">Inicio</span>
        </button>

        {/* Tab 2: Buscar */}
        <button
          onClick={() => setActiveTab('buscar')}
          className={`flex flex-col items-center justify-center gap-1 transition py-1 ${
            activeTab === 'buscar' ? 'text-[#1ED760] font-black' : 'text-gray-400 hover:text-gray-200 font-semibold'
          }`}
        >
          <Search className={`w-6 h-6 ${activeTab === 'buscar' ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
          <span className="text-xs">Buscar</span>
        </button>

        {/* Tab 3: Tu biblioteca */}
        <button
          onClick={() => setActiveTab('biblioteca')}
          className={`flex flex-col items-center justify-center gap-1 transition py-1 ${
            activeTab === 'biblioteca' ? 'text-[#1ED760] font-black' : 'text-gray-400 hover:text-gray-200 font-semibold'
          }`}
        >
          <Library className={`w-6 h-6 ${activeTab === 'biblioteca' ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
          <span className="text-xs">Tu biblioteca</span>
        </button>

        {/* Tab 4: Crear (+ Subir Canción con IA - Solo Administrador) */}
        {isAdmin && (
          <button
            onClick={() => {
              setShowUploadModal(true);
            }}
            className="flex flex-col items-center justify-center gap-1 text-gray-400 hover:text-pink-400 transition font-semibold py-1"
          >
            <Plus className="w-6 h-6 stroke-[2.2] text-pink-400" />
            <span className="text-xs text-pink-300 font-bold">Subir MP3</span>
          </button>
        )}
      </footer>

      {/* ==========================================
          MODAL: SUBIR CANCIÓN CON DEEPSEEK IA (Solo Administrador)
          ========================================== */}
      {showUploadModal && isAdmin && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1E1E1E] border border-[#383838] rounded-2xl w-full max-w-lg p-6 shadow-2xl relative max-h-[92vh] overflow-y-auto">
            <button
              onClick={() => {
                if (!isUploading) setShowUploadModal(false);
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-pink-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-pink-600/30">
                <Sparkles className="w-6 h-6 text-yellow-300" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">Subir MP3 con DeepSeek IA</h3>
                <p className="text-xs text-pink-400 font-semibold">
                  Nombre inteligente, artista y portada automática
                </p>
              </div>
            </div>

            {/* 4. Botones rápidos para subir múltiples archivos MP3 y carpetas enteras */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-4">
              <button
                type="button"
                onClick={() => multiFileInputRef.current?.click()}
                className="p-3 rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition active:scale-95"
                title="Selecciona varios archivos MP3 a la vez"
              >
                <Music className="w-4 h-4 text-white" />
                <span>Subir múltiples MP3</span>
              </button>
              <button
                type="button"
                onClick={() => folderInputRef.current?.click()}
                className="p-3 rounded-xl bg-[#262626] hover:bg-[#333333] border border-white/10 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition active:scale-95"
                title="Selecciona una carpeta completa de música de tu dispositivo"
              >
                <Folder className="w-4 h-4 text-blue-400" />
                <span>Subir carpeta entera</span>
              </button>
            </div>

            {/* Inputs ocultos para subida múltiple y carpetas completas */}
            <input
              ref={multiFileInputRef}
              type="file"
              multiple
              accept="audio/mpeg,audio/mp3,.mp3,audio/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  subirMultiplesArchivos(e.target.files);
                }
              }}
            />
            <input
              ref={folderInputRef}
              type="file"
              {...({ webkitdirectory: '', directory: '', multiple: true } as any)}
              accept="audio/*,.mp3"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  subirMultiplesArchivos(e.target.files);
                }
              }}
            />

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (selectedFile) {
                  subirCancion(selectedFile);
                }
              }}
              className="space-y-4 text-sm"
            >
              {/* Selector de Archivo MP3 Individual con IA */}
              <div>
                <label className="block text-xs font-bold text-gray-200 mb-1.5 uppercase tracking-wide">
                  O selecciona archivo individual con IA <span className="text-pink-500">*</span>
                </label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-[#383838] hover:border-pink-500 rounded-xl p-4 text-center cursor-pointer transition bg-[#141414] active:scale-[0.99]"
                >
                  <Music className="w-9 h-9 text-pink-400 mx-auto mb-2" />
                  {selectedFile ? (
                    <div>
                      <p className="text-sm font-bold text-emerald-400 truncate">
                        {selectedFile.name}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5 font-medium">
                        {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Clic para cambiar
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm text-gray-200 font-semibold">Toca aquí para elegir tu archivo MP3</p>
                      <p className="text-xs text-gray-400 mt-1">
                        La IA DeepSeek detectará automáticamente el título, artista y diseñará la foto.
                      </p>
                    </div>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="audio/mpeg,audio/mp3,.mp3,audio/*"
                  className="hidden"
                  onChange={async (e) => {
                    const f = e.target.files?.[0];
                    if (f) {
                      setSelectedFile(f);
                      // 1. Extracción instantánea de ID3 y parsing heurístico previo
                      const id3 = await extractAudioMetadataFromFile(f);
                      const fast = parseSmartAudioName(f.name);
                      const initialTitle = id3.title || fast.titulo;
                      const initialArtist = id3.artist || fast.artista;
                      setCustomTitle(initialTitle);
                      setCustomArtist(initialArtist);
                      if (id3.coverUrl) {
                        setCoverPreviewUrl(id3.coverUrl);
                        setCustomCoverUrl(id3.coverUrl);
                      }
                      if (fast.sugerenciaCarpeta) setTargetFolderId(fast.sugerenciaCarpeta);

                      // 2. Análisis y nombramiento inteligente con IA (DeepSeek & Gemini)
                      await analizarAudioConIA(f, id3.title || fast.titulo, id3.artist || fast.artista);
                    }
                  }}
                />
              </div>

              {/* Indicador de Estado de la IA DeepSeek / Gemini */}
              {isAiAnalyzing && (
                <div className="p-3.5 rounded-xl bg-gradient-to-r from-pink-950/70 via-purple-950/70 to-indigo-950/70 border border-pink-500/50 flex items-center gap-3 text-xs text-pink-200 animate-pulse shadow-lg">
                  <div className="w-5 h-5 border-2 border-pink-400 border-t-transparent rounded-full animate-spin shrink-0" />
                  <div>
                    <p className="font-extrabold text-white text-sm">🤖 IA identificando canción y artista...</p>
                    <p className="text-[11px] text-pink-200/90 font-medium">Extrayendo el nombre exacto, artista musical y diseñando portada 4K</p>
                  </div>
                </div>
              )}

              {aiIdentifiedInfo && !isAiAnalyzing && (
                <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-500/50 flex items-center justify-between text-xs text-emerald-200 shadow-lg">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    <div>
                      <p className="text-[11px] text-emerald-400 font-bold uppercase tracking-wider">{aiIdentifiedInfo.fuenteIA || 'IA Musical'}</p>
                      <p className="text-sm font-black text-white">
                        {aiIdentifiedInfo.artista} <span className="text-gray-400 font-normal">—</span> {aiIdentifiedInfo.titulo}
                      </p>
                      <p className="text-[11px] text-emerald-300 font-medium">{aiIdentifiedInfo.genero}</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/25 border border-emerald-500/40 text-emerald-300 text-[11px] font-black">
                    Identificado
                  </span>
                </div>
              )}

              {/* Selector e Input oculto de Foto de Portada */}
              <input
                ref={coverInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) {
                    setCoverFile(f);
                    const localPreview = URL.createObjectURL(f);
                    setCoverPreviewUrl(localPreview);
                  }
                }}
              />

              {/* Vista Previa de la Portada / Foto con IA o Subida */}
              <div className="bg-[#141414] border border-white/10 rounded-xl p-3 flex items-center gap-3.5">
                <div
                  onClick={() => coverInputRef.current?.click()}
                  className="w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-neutral-900 border border-white/10 relative shadow-md cursor-pointer group"
                  title="Toca para elegir o cambiar foto de portada"
                >
                  {coverPreviewUrl || customCoverUrl ? (
                    <img
                      src={coverPreviewUrl || customCoverUrl}
                      alt="Portada"
                      className="w-full h-full object-cover group-hover:opacity-80 transition"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-tr from-pink-700 to-indigo-700 text-white font-bold text-[10px] text-center p-1">
                      <ImageIcon className="w-4 h-4 mb-0.5" />
                      FOTO
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-white">Foto de portada (cover_url)</p>
                    {coverFile ? (
                      <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded">
                        ✓ Foto propia
                      </span>
                    ) : customCoverUrl ? (
                      <span className="text-[10px] text-pink-400 font-bold bg-pink-500/10 px-1.5 py-0.5 rounded">
                        ✨ Foto IA
                      </span>
                    ) : null}
                  </div>
                  <p className="text-[11px] text-gray-400 line-clamp-1 mt-0.5">
                    {coverFile
                      ? coverFile.name
                      : customCoverUrl
                      ? 'Diseñada para el artista y canción'
                      : 'Sube tu imagen o la IA la generará al instante'}
                  </p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <button
                      type="button"
                      onClick={() => coverInputRef.current?.click()}
                      className="px-2.5 py-1 text-[11px] font-bold bg-pink-600/25 hover:bg-pink-600/40 text-pink-300 rounded-md transition flex items-center gap-1 active:scale-95"
                    >
                      <ImageIcon className="w-3 h-3" />
                      <span>Subir foto propia</span>
                    </button>
                    <button
                      type="button"
                      onClick={regenerarFotoIA}
                      className="px-2.5 py-1 text-[11px] font-bold bg-white/10 hover:bg-white/20 text-gray-300 rounded-md transition flex items-center gap-1 active:scale-95"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Foto con IA</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Título y Artista */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-gray-200">
                      Título de la canción <span className="text-pink-500">*</span>
                    </label>
                    {customTitle && <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.2 rounded">✨ Asignado por IA</span>}
                  </div>
                  <input
                    type="text"
                    placeholder="Ej: El Tóxico"
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-[#141414] border border-[#333333] focus:border-pink-500 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none font-medium"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-gray-200">
                      Artista / Grupo <span className="text-pink-500">*</span>
                    </label>
                    {customArtist && customArtist.toLowerCase() !== 'desconocido' && (
                      <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.2 rounded">✨ Reconocido</span>
                    )}
                  </div>
                  <input
                    type="text"
                    placeholder="Ej: Grupo Firme"
                    value={customArtist}
                    onChange={(e) => setCustomArtist(e.target.value)}
                    className="w-full px-3 py-2 bg-[#141414] border border-[#333333] focus:border-pink-500 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none font-medium"
                  />
                </div>
              </div>

              {/* Destino automático: Tus me gusta / Lista general */}
              <div className="p-3 bg-[#161618] border border-white/10 rounded-xl flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#4c1d95] to-[#3b82f6] flex items-center justify-center shrink-0">
                  <Heart className="w-5 h-5 text-white fill-current" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-white">
                    Destino: <span className="text-emerald-400">Tus me gusta (Lista General)</span>
                  </p>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    Se subirá directamente a tu música. Luego podrás asignarla o moverla a cualquier carpeta con el menú de 3 puntos (<strong className="text-emerald-400">⋮</strong>).
                  </p>
                </div>
              </div>

              {isUploading && (
                <div className="p-3.5 rounded-xl bg-emerald-950/50 border border-emerald-500/40 flex items-center gap-2.5 text-xs text-emerald-200">
                  <div className="w-4 h-4 border-2 border-[#1ED760] border-t-transparent rounded-full animate-spin shrink-0" />
                  <span className="font-semibold">{uploadStatus || 'Subiendo archivo...'}</span>
                </div>
              )}

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  disabled={isUploading}
                  onClick={() => setShowUploadModal(false)}
                  className="flex-1 py-2.5 text-xs sm:text-sm font-semibold bg-[#282828] hover:bg-[#333333] text-gray-200 rounded-xl transition disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isUploading || !selectedFile}
                  className="flex-1 py-2.5 text-xs sm:text-sm font-bold bg-[#1ED760] hover:bg-[#1db954] text-black rounded-xl shadow-lg transition disabled:opacity-50 flex items-center justify-center gap-2 active:scale-95"
                >
                  {isUploading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      <span>Subiendo...</span>
                    </>
                  ) : (
                    <span>Guardar y Reproducir</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==========================================
          MODAL: INICIAR SESIÓN / REGISTRO ADMIN
          ========================================== */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1E1E1E] border border-[#383838] rounded-2xl w-full max-w-sm p-6 shadow-2xl relative">
            <button
              onClick={() => setShowLoginModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center">
                {isSignUpMode ? <UserPlus className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  {isSignUpMode ? 'Registrar Administrador' : 'Acceso Administrador'}
                </h3>
                <p className="text-xs text-gray-400">Autenticación con Supabase Auth</p>
              </div>
            </div>

            {authError && (
              <div className="mb-4 p-3 bg-red-950/50 border border-red-500/40 rounded-xl flex items-start gap-2 text-xs text-red-200">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
                <div className="flex-1">
                  <span>{authError}</span>
                  {authError.includes('Invalid login credentials') && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsSignUpMode(true);
                        setAuthError(null);
                      }}
                      className="block mt-1 text-blue-400 hover:underline font-semibold"
                    >
                      ¿El usuario no existe? Crear cuenta aquí.
                    </button>
                  )}
                </div>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-gray-200 mb-1">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-[#141414] border border-[#333333] rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-200 mb-1">
                  Contraseña
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-[#141414] border border-[#333333] rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-400"
                />
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <button
                  type="submit"
                  disabled={isLoggingIn}
                  className="w-full py-2.5 text-xs font-bold bg-[#1ED760] hover:bg-[#1db954] text-black rounded-xl shadow transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isLoggingIn ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      <span>{isSignUpMode ? 'Registrando...' : 'Verificando...'}</span>
                    </>
                  ) : (
                    <span>{isSignUpMode ? 'Crear Cuenta' : 'Iniciar Sesión'}</span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsSignUpMode(!isSignUpMode);
                    setAuthError(null);
                  }}
                  className="text-center text-[11px] text-gray-300 hover:text-blue-400 transition font-medium"
                >
                  {isSignUpMode
                    ? '¿Ya tienes cuenta? Iniciar sesión'
                    : '¿Primera vez? Registrar cuenta en Supabase'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==========================================
          MODAL: CENTRO DE PUBLICACIÓN Y DESPLIEGUE EN TU PROPIA URL
          ========================================== */}
      {showDeployModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#1C1C1E] border border-[#3A3A3C] rounded-3xl w-full max-w-2xl p-5 sm:p-7 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowDeployModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white p-1.5 rounded-xl bg-[#2C2C2E] transition active:scale-90"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3.5 mb-5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-blue-600/30 shrink-0">
                <Rocket className="w-6 h-6" />
              </div>
              <div className="min-w-0 pr-6">
                <h3 className="text-lg sm:text-xl font-black text-white truncate">
                  Publicar {appName}
                </h3>
                <p className="text-xs text-blue-400 font-medium">
                  Tu propia URL pública independiente de Google AI Studio para Android
                </p>
              </div>
            </div>

            {/* Pestañas de la Guía */}
            <div className="flex items-center gap-1.5 p-1 bg-[#141416] rounded-2xl border border-white/5 mb-4 overflow-x-auto no-scrollbar">
              <button
                onClick={() => setDeployTab('vercel')}
                className={`flex-1 min-w-[100px] py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  deployTab === 'vercel'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>1. Vercel (Recomendado)</span>
              </button>
              <button
                onClick={() => setDeployTab('android')}
                className={`flex-1 min-w-[100px] py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  deployTab === 'android'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5 text-emerald-300" />
                <span>2. Instalar en Android</span>
              </button>
              <button
                onClick={() => setDeployTab('netlify')}
                className={`flex-1 min-w-[100px] py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  deployTab === 'netlify'
                    ? 'bg-teal-600 text-white shadow-md'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                <span>3. Netlify Drop</span>
              </button>
            </div>

            {/* Garantía de Datos */}
            <div className="p-3 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 flex items-start gap-2.5 mb-4">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-xs">
                <p className="font-bold text-emerald-300">¡Tu trabajo y canciones NO se perderán!</p>
                <p className="text-[11px] text-emerald-200/80 mt-0.5 leading-relaxed">
                  Tu base de datos y audios están alojados en la nube de Supabase (<code className="font-mono text-emerald-300">djqjagjaywphhaoonbdq.supabase.co</code>). Al desplegar en tu propia URL, la app se conectará automáticamente a tus mismas canciones, carpetas y usuarios.
                </p>
              </div>
            </div>

            {/* Contenido Pestaña 1: VERCEL */}
            {deployTab === 'vercel' && (
              <div className="space-y-3.5 text-xs text-gray-200 animate-fade-in">
                <div className="p-4 rounded-2xl bg-[#242426] border border-[#38383A] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-sm flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-blue-500" />
                      <span>Despliegue automático con Vercel (Gratis y Permanente)</span>
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/40 font-bold">
                      2 Minutos
                    </span>
                  </div>

                  <p className="text-gray-300 text-[11px]">
                    Vercel te proporcionará una URL pública HTTPS gratuita (como <code className="text-blue-300 font-mono">https://spotyy-aa.vercel.app</code>) y actualizará la app cada vez que hagas cambios.
                  </p>

                  <div className="space-y-2 text-[11px] text-gray-300 pl-1">
                    <div className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-blue-600/30 text-blue-300 font-bold flex items-center justify-center shrink-0 text-[10px]">1</span>
                      <div className="flex-1">
                        <p className="font-semibold text-white">Tu repositorio de GitHub:</p>
                        <div className="flex items-center justify-between gap-2 p-2 mt-1 rounded-xl bg-[#18181A] border border-white/10 font-mono text-blue-300 text-[11px]">
                          <span className="truncate">https://github.com/mejiamejiaaaron-eng/Musicaaarospoty</span>
                          <button
                            onClick={() => copyText('https://github.com/mejiamejiaaaron-eng/Musicaaarospoty', 'Enlace de GitHub')}
                            className="px-2 py-1 bg-[#282828] hover:bg-[#333333] text-white rounded-lg transition shrink-0 flex items-center gap-1 font-sans"
                          >
                            {copiedDeployText === 'Enlace de GitHub' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                            <span>Copiar</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-blue-600/30 text-blue-300 font-bold flex items-center justify-center shrink-0 text-[10px]">2</span>
                      <div className="flex-1">
                        <p className="font-semibold text-white">Entra a Vercel:</p>
                        <p className="mt-0.5">Ingresa a <strong className="text-white">vercel.com</strong> e inicia sesión con tu cuenta de GitHub.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-blue-600/30 text-blue-300 font-bold flex items-center justify-center shrink-0 text-[10px]">3</span>
                      <div className="flex-1">
                        <p className="font-semibold text-white">Importa el proyecto:</p>
                        <p className="mt-0.5">Haz clic en <strong className="text-white">&quot;Add New...&quot; &gt; &quot;Project&quot;</strong> y selecciona <strong className="text-white">Musicaaarospoty</strong>.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-blue-600/30 text-blue-300 font-bold flex items-center justify-center shrink-0 text-[10px]">4</span>
                      <div className="flex-1">
                        <p className="font-semibold text-white">Configuración automática de Vite:</p>
                        <p className="mt-0.5">Vercel detecta automáticamente: Framework: <strong className="text-white">Vite</strong> | Build Command: <code className="text-blue-300 font-mono">npm run build</code> | Output: <code className="text-blue-300 font-mono">dist</code>.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-blue-600/30 text-blue-300 font-bold flex items-center justify-center shrink-0 text-[10px]">5</span>
                      <div className="flex-1">
                        <p className="font-semibold text-white">Presiona &quot;Deploy&quot;:</p>
                        <p className="mt-0.5">En 40 segundos tendrás tu propia URL pública con certificado HTTPS para abrir en tu celular Android.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Contenido Pestaña 2: ANDROID PWA */}
            {deployTab === 'android' && (
              <div className="space-y-3.5 text-xs text-gray-200 animate-fade-in">
                <div className="p-4 rounded-2xl bg-[#242426] border border-[#38383A] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-sm flex items-center gap-1.5">
                      <Smartphone className="w-4 h-4 text-emerald-400" />
                      <span>Cómo instalar {appName} en Android</span>
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">
                      Icono Propio
                    </span>
                  </div>

                  <p className="text-gray-300 text-[11px]">
                    No necesitas instalar Google AI Studio en tu celular. Tu app web cuenta con Service Worker y Web App Manifest para comportarse como una aplicación nativa de Android:
                  </p>

                  <div className="space-y-2.5 text-[11px] text-gray-300 pl-1">
                    <div className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-emerald-600/30 text-emerald-300 font-bold flex items-center justify-center shrink-0 text-[10px]">1</span>
                      <div>
                        <p className="font-semibold text-white">Abre tu URL pública en Chrome:</p>
                        <p className="mt-0.5">En tu celular Android, abre el navegador <strong className="text-white">Google Chrome</strong> y escribe tu URL (ej. <code className="text-emerald-300 font-mono">https://tu-app.vercel.app</code>).</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-emerald-600/30 text-emerald-300 font-bold flex items-center justify-center shrink-0 text-[10px]">2</span>
                      <div>
                        <p className="font-semibold text-white">Toca el banner o menú (⋮):</p>
                        <p className="mt-0.5">Verás un aviso inferior que dice <strong className="text-emerald-400">&quot;Agregar {appName} a la pantalla principal&quot;</strong>. Si no aparece, toca los <strong className="text-white">tres puntos verticales (⋮)</strong> arriba a la derecha en Chrome.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-emerald-600/30 text-emerald-300 font-bold flex items-center justify-center shrink-0 text-[10px]">3</span>
                      <div>
                        <p className="font-semibold text-white">Toca &quot;Instalar aplicación&quot;:</p>
                        <p className="mt-0.5">Selecciona <strong className="text-emerald-400">&quot;Instalar aplicación&quot;</strong> o <strong className="text-emerald-400">&quot;Agregar a la pantalla principal&quot;</strong> y confirma presionando <strong className="text-white">&quot;Instalar&quot;</strong>.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-emerald-600/30 text-emerald-300 font-bold flex items-center justify-center shrink-0 text-[10px]">4</span>
                      <div>
                        <p className="font-semibold text-white">¡Listo! Acceso directo con su propio icono:</p>
                        <p className="mt-0.5 text-emerald-300 font-medium">Se creará el icono de {appName} en la pantalla de inicio de tu celular. Al tocarlo, se abrirá a pantalla completa sin barra de direcciones, sin Google AI Studio y con reproducción de fondo.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Contenido Pestaña 3: NETLIFY DROP */}
            {deployTab === 'netlify' && (
              <div className="space-y-3.5 text-xs text-gray-200 animate-fade-in">
                <div className="p-4 rounded-2xl bg-[#242426] border border-[#38383A] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-sm flex items-center gap-1.5">
                      <Upload className="w-4 h-4 text-teal-400" />
                      <span>Netlify Drop (Arrastrar y Soltar sin código)</span>
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 border border-teal-500/40 font-bold">
                      1 Minuto
                    </span>
                  </div>

                  <p className="text-gray-300 text-[11px]">
                    Si prefieres no usar GitHub ni comandos, puedes descargar el paquete compilado listo para desplegar y arrastrarlo directamente:
                  </p>

                  <div className="space-y-2.5 text-[11px] text-gray-300 pl-1">
                    <div className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-teal-600/30 text-teal-300 font-bold flex items-center justify-center shrink-0 text-[10px]">1</span>
                      <div className="flex-1">
                        <p className="font-semibold text-white">Descarga el paquete compilado (.zip):</p>
                        <p className="mt-0.5 text-gray-300">Ya está generado con HTML, Service Worker, Manifest, iconos PWA y todos los estilos:</p>
                        <a
                          href="/spotyy-aa-dist.zip"
                          download="spotyy-aa-dist.zip"
                          className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-[11px] shadow-md transition active:scale-95"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Descargar producción spotyy-aa-dist.zip</span>
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-teal-600/30 text-teal-300 font-bold flex items-center justify-center shrink-0 text-[10px]">2</span>
                      <div className="flex-1">
                        <p className="font-semibold text-white">Abre Netlify Drop en tu navegador:</p>
                        <div className="flex items-center justify-between gap-2 p-2 mt-1 rounded-xl bg-[#18181A] border border-white/10 font-mono text-teal-300 text-[11px]">
                          <span>https://app.netlify.com/drop</span>
                          <button
                            onClick={() => copyText('https://app.netlify.com/drop', 'Enlace Netlify Drop')}
                            className="px-2 py-1 bg-[#282828] hover:bg-[#333333] text-white rounded-lg transition shrink-0 flex items-center gap-1 font-sans"
                          >
                            {copiedDeployText === 'Enlace Netlify Drop' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                            <span>Copiar</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-teal-600/30 text-teal-300 font-bold flex items-center justify-center shrink-0 text-[10px]">3</span>
                      <div className="flex-1">
                        <p className="font-semibold text-white">Arrastra y suelta el archivo .zip o la carpeta:</p>
                        <p className="mt-0.5">Suelta el archivo descargado en la zona punteada de Netlify Drop. En 10 segundos te entregará tu URL pública HTTPS (ejemplo: <code className="text-teal-300 font-mono">https://spotyy-aa.netlify.app</code>) permanente y gratuita.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between gap-3 pt-4 border-t border-white/10 mt-5">
              <button
                onClick={() => setDeployTab(deployTab === 'android' ? 'vercel' : 'android')}
                className="py-2.5 px-4 text-xs font-bold bg-[#282828] hover:bg-[#333333] text-gray-200 rounded-xl transition flex items-center gap-1.5 active:scale-95"
              >
                {deployTab === 'android' ? <Globe className="w-3.5 h-3.5 text-blue-400" /> : <Smartphone className="w-3.5 h-3.5 text-emerald-400" />}
                <span>{deployTab === 'android' ? 'Ver guía de Vercel' : 'Ver pasos de instalación Android'}</span>
              </button>
              <button
                onClick={() => setShowDeployModal(false)}
                className="py-2.5 px-6 text-xs font-bold bg-[#1ED760] hover:bg-[#1db954] text-black rounded-xl shadow-lg transition active:scale-95"
              >
                ¡Entendido!
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          MODAL: MENÚ DE OPCIONES DE CANCIÓN (⋮)
          ========================================== */}
      {showSongMenuModal && selectedSongForMenu && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
          <div className="bg-[#1C1C1E] border border-[#3A3A3C] rounded-t-3xl sm:rounded-3xl w-full max-w-md p-5 shadow-2xl relative">
            <button
              onClick={() => {
                setShowSongMenuModal(false);
                setSelectedSongForMenu(null);
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-white p-1.5 rounded-xl bg-[#2C2C2E] transition active:scale-90"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Cabecera con datos de la canción */}
            <div className="flex items-center gap-3.5 mb-5 pr-8">
              <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 shadow-lg bg-neutral-900 border border-white/10">
                {renderCover(selectedSongForMenu.cover_url || selectedSongForMenu.cover, 'w-full h-full object-cover')}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm sm:text-base font-black text-white truncate">
                  {selectedSongForMenu.title || selectedSongForMenu.titulo}
                </p>
                <p className="text-xs text-gray-400 truncate mt-0.5">
                  {selectedSongForMenu.artist || selectedSongForMenu.artista}
                </p>
                <div className="mt-1">
                  {(() => {
                    const fid = selectedSongForMenu.folder_id || 'tus_me_gusta';
                    const curFolder = folders.find((f) => f.id === fid) || carpetasAudio.find((f) => f.id === fid);
                    return (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                        <Folder className="w-3 h-3" />
                        <span>En: {curFolder?.titulo || 'Tus me gusta'}</span>
                      </span>
                    );
                  })()}
                </div>
              </div>
            </div>

            {/* Opciones de la Canción */}
            <div className="space-y-1.5">
              {/* Opción 1: Mover a carpeta (Solo Admin) */}
              {isAdmin && (
                <button
                  onClick={() => {
                    setShowSongMenuModal(false);
                    setShowMoveModal(true);
                  }}
                  className="w-full flex items-center gap-3.5 p-3 rounded-2xl bg-[#252528] hover:bg-[#303035] text-left transition active:scale-[0.99] border border-white/5"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#1ED760]/20 text-[#1ED760] flex items-center justify-center shrink-0">
                    <FolderCheck className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-white">Mover a carpeta</p>
                    <p className="text-xs text-gray-400">Asignar a Perreale, los 2000&apos;, buchonass, etc.</p>
                  </div>
                </button>
              )}

              {/* Opción 2: Favoritos (Todos los usuarios) */}
              <button
                onClick={() => {
                  toggleFavorite(selectedSongForMenu);
                  setShowSongMenuModal(false);
                  setSelectedSongForMenu(null);
                }}
                className="w-full flex items-center gap-3.5 p-3 rounded-2xl bg-[#252528] hover:bg-[#303035] text-left transition active:scale-[0.99] border border-white/5"
              >
                <div className="w-10 h-10 rounded-xl bg-pink-600/20 text-pink-400 flex items-center justify-center shrink-0">
                  <Heart className={`w-5 h-5 ${favorites.includes(String(selectedSongForMenu.id)) ? 'fill-current text-[#1ED760]' : ''}`} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-white">
                    {favorites.includes(String(selectedSongForMenu.id)) ? 'Quitar de Favoritos' : 'Añadir a Favoritos'}
                  </p>
                  <p className="text-xs text-gray-400">Guardar en tu lista de temas con corazón</p>
                </div>
              </button>

              {/* Opción 3: Reproducir ahora (Todos los usuarios) */}
              <button
                onClick={() => {
                  seleccionarCancion(selectedSongForMenu);
                  setShowSongMenuModal(false);
                  setSelectedSongForMenu(null);
                }}
                className="w-full flex items-center gap-3.5 p-3 rounded-2xl bg-[#252528] hover:bg-[#303035] text-left transition active:scale-[0.99] border border-white/5"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center shrink-0">
                  <Play className="w-5 h-5 fill-current ml-0.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-white">Reproducir ahora</p>
                  <p className="text-xs text-gray-400">Escuchar audio al instante</p>
                </div>
              </button>

              {/* Opción 4: Eliminar canción (Solo Admin) */}
              {isAdmin && (
                <button
                  onClick={() => {
                    const s = selectedSongForMenu;
                    setShowSongMenuModal(false);
                    setSelectedSongForMenu(null);
                    solicitarEliminarCancion(s);
                  }}
                  className="w-full flex items-center gap-3.5 p-3 rounded-2xl bg-red-950/30 hover:bg-red-950/60 text-left transition active:scale-[0.99] border border-red-500/30"
                >
                  <div className="w-10 h-10 rounded-xl bg-red-600/20 text-red-400 flex items-center justify-center shrink-0">
                    <Trash2 className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-red-300">Eliminar canción</p>
                    <p className="text-xs text-red-200/70">Quitar de carpetas y base de datos</p>
                  </div>
                </button>
              )}
            </div>

            <button
              onClick={() => {
                setShowSongMenuModal(false);
                setSelectedSongForMenu(null);
              }}
              className="w-full mt-4 py-2.5 text-xs sm:text-sm font-bold bg-[#282828] hover:bg-[#333333] text-gray-300 rounded-xl transition"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* ==========================================
          MODAL: MOVER A CARPETA (LISTA DE TODAS LAS CARPETAS - Solo Admin)
          ========================================== */}
      {showMoveModal && isAdmin && selectedSongForMenu && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[#1C1C1E] border border-[#3A3A3C] rounded-3xl w-full max-w-lg p-6 shadow-2xl relative max-h-[88vh] flex flex-col">
            <button
              onClick={() => {
                setShowMoveModal(false);
                setSelectedSongForMenu(null);
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-white p-1.5 rounded-xl bg-[#2C2C2E] transition active:scale-90"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3.5 mb-4 shrink-0 pr-8">
              <div className="w-12 h-12 rounded-2xl bg-[#1ED760]/20 text-[#1ED760] flex items-center justify-center shrink-0">
                <FolderCheck className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div className="min-w-0">
                <h3 className="text-base sm:text-lg font-black text-white truncate">
                  Mover a carpeta
                </h3>
                <p className="text-xs text-gray-300 truncate mt-0.5">
                  Canción: <strong className="text-[#1ED760]">&quot;{selectedSongForMenu.title || selectedSongForMenu.titulo}&quot;</strong>
                </p>
              </div>
            </div>

            <p className="text-xs text-gray-400 mb-3 shrink-0">
              Selecciona la carpeta donde deseas guardar esta canción. Se actualizará en Supabase y los contadores verdes reflejarán el cambio de inmediato:
            </p>

            {/* Lista de Carpetas Disponibles con Contadores Verdes */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {folders.map((folder) => {
                const count = obtenerCancionesCarpeta(folder).length;
                const esCarpetaActual = (selectedSongForMenu.folder_id || 'tus_me_gusta') === folder.id;

                return (
                  <div
                    key={folder.id}
                    onClick={() => moverCancionACarpeta(selectedSongForMenu, folder.id)}
                    className={`flex items-center justify-between p-3 rounded-2xl cursor-pointer transition border ${
                      esCarpetaActual
                        ? 'bg-[#1ED760]/10 border-[#1ED760]/50'
                        : 'bg-[#242426] hover:bg-[#2c2c30] border-white/5 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 shadow bg-neutral-900">
                        {renderCover(folder.coverKey, 'w-full h-full object-cover')}
                      </div>
                      <div className="min-w-0 pr-2">
                        <p className={`text-sm font-bold truncate ${esCarpetaActual ? 'text-[#1ED760]' : 'text-white'}`}>
                          {folder.titulo}
                        </p>
                        <p className="text-[11px] text-gray-400 truncate mt-0.5">
                          {folder.subtitulo || folder.descripcion}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                        {count} {count === 1 ? 'audio' : 'audios'}
                      </span>
                      {esCarpetaActual ? (
                        <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-[10px] font-bold text-gray-300">
                          Actual
                        </span>
                      ) : (
                        <span className="w-8 h-8 rounded-full bg-[#1ED760] text-black flex items-center justify-center shadow transition hover:scale-105">
                          <Check className="w-4 h-4 stroke-[3]" />
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 pt-3 border-t border-white/10 shrink-0 flex justify-end">
              <button
                onClick={() => {
                  setShowMoveModal(false);
                  setSelectedSongForMenu(null);
                }}
                className="w-full py-2.5 text-xs sm:text-sm font-bold bg-[#282828] hover:bg-[#333333] text-gray-200 rounded-xl transition"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          MODAL: CONFIRMACIÓN PARA ELIMINAR CANCIÓN (Solo Admin)
          ========================================== */}
      {songToDelete && isAdmin && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#1C1C1E] border border-red-500/40 rounded-3xl w-full max-w-md p-6 shadow-2xl relative animate-fade-in">
            <button
              onClick={() => setSongToDelete(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white p-1.5 rounded-xl bg-[#2C2C2E] transition active:scale-90"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3.5 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-red-600/20 text-red-400 flex items-center justify-center shrink-0">
                <Trash2 className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div className="min-w-0 pr-6">
                <h3 className="text-base sm:text-lg font-black text-white truncate">
                  ¿Eliminar canción?
                </h3>
                <p className="text-xs text-red-400 font-semibold">
                  Esta acción es permanente
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#242426] border border-[#38383A] mb-4 flex items-center gap-3">
              {renderCover(songToDelete.cover_url || songToDelete.cover, 'w-12 h-12')}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-white truncate">{songToDelete.title || songToDelete.titulo}</p>
                <p className="text-xs text-gray-400 truncate mt-0.5">{songToDelete.artist || songToDelete.artista}</p>
              </div>
            </div>

            <p className="text-xs text-gray-300 mb-5 leading-relaxed">
              La canción se quitará de todas tus carpetas (buchonass, perreale, etc.) y se eliminará de la base de datos de Supabase.
            </p>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setSongToDelete(null)}
                className="flex-1 py-2.5 text-xs sm:text-sm font-bold bg-[#282828] hover:bg-[#333333] text-gray-300 rounded-xl transition active:scale-95"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarEliminarCancion}
                className="flex-1 py-2.5 text-xs sm:text-sm font-bold bg-red-600 hover:bg-red-500 text-white rounded-xl shadow-lg shadow-red-600/30 transition active:scale-95 flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>Sí, eliminar</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          MODAL: CONFIRMACIÓN PARA ELIMINAR CARPETA (Solo Admin)
          ========================================== */}
      {folderToDelete && isAdmin && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#1C1C1E] border border-red-500/40 rounded-3xl w-full max-w-md p-6 shadow-2xl relative animate-fade-in">
            <button
              onClick={() => setFolderToDelete(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white p-1.5 rounded-xl bg-[#2C2C2E] transition active:scale-90"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3.5 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-red-600/20 text-red-400 flex items-center justify-center shrink-0">
                <Trash2 className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div className="min-w-0 pr-6">
                <h3 className="text-base sm:text-lg font-black text-white truncate">
                  ¿Eliminar carpeta completa?
                </h3>
                <p className="text-xs text-red-400 font-semibold">
                  {folderToDelete.titulo}
                </p>
              </div>
            </div>

            <p className="text-xs text-gray-300 mb-5 leading-relaxed">
              ¿Estás seguro de que deseas eliminar la carpeta <strong className="text-white">&quot;{folderToDelete.titulo}&quot;</strong>? Las canciones dentro seguirán existiendo en tu biblioteca principal.
            </p>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setFolderToDelete(null)}
                className="flex-1 py-2.5 text-xs sm:text-sm font-bold bg-[#282828] hover:bg-[#333333] text-gray-300 rounded-xl transition active:scale-95"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarEliminarCarpeta}
                className="flex-1 py-2.5 text-xs sm:text-sm font-bold bg-red-600 hover:bg-red-500 text-white rounded-xl shadow-lg shadow-red-600/30 transition active:scale-95 flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>Sí, eliminar carpeta</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          MODAL: AGREGAR CANCIÓN A CUALQUIER CARPETA (Solo Admin)
          ========================================== */}
      {showAddToFolderModal && isAdmin && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#1C1C1E] border border-[#3A3A3C] rounded-2xl w-full max-w-md p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => {
                setShowAddToFolderModal(false);
                setSongToAddToFolder(null);
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-lg bg-[#2C2C2E] transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <FolderPlus className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-base sm:text-lg font-black text-white truncate">
                  Agregar a Carpeta
                </h3>
                <p className="text-xs text-gray-400 truncate">
                  {songToAddToFolder?.titulo || currentSong?.titulo || 'Canción'} • {songToAddToFolder?.artista || currentSong?.artista}
                </p>
              </div>
            </div>

            <p className="text-xs text-gray-300 font-medium mb-3">
              Selecciona a cuál de tus carpetas quieres añadir este audio:
            </p>

            {/* Lista de Carpetas Disponibles */}
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {folders.map((f) => {
                const song = songToAddToFolder || currentSong;
                const yaEsta = song
                  ? f.canciones.some(
                      (c) =>
                        String(c.id) === String(song.id) ||
                        (c.titulo.toLowerCase() === song.titulo.toLowerCase() &&
                          c.artista.toLowerCase() === song.artista.toLowerCase())
                    )
                  : false;

                return (
                  <div
                    key={f.id}
                    onClick={() => {
                      if (song) {
                        if (yaEsta) {
                          quitarCancionDeCarpeta(f.id, song.id);
                        } else {
                          agregarCancionACarpeta(f.id, song);
                        }
                      }
                    }}
                    className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition border ${
                      yaEsta
                        ? 'bg-emerald-950/40 border-emerald-500/40 hover:bg-emerald-900/40'
                        : 'bg-[#242426] border-[#38383A] hover:bg-[#2C2C2E]'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {renderCover(f.coverKey, 'w-10 h-10')}
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-white truncate">
                          {f.titulo}
                        </p>
                        <p className="text-[11px] text-gray-400 truncate">
                          {f.canciones.length} audios • {f.badge || 'Carpeta'}
                        </p>
                      </div>
                    </div>

                    <div>
                      {yaEsta ? (
                        <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold flex items-center gap-1">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                          <span>Incluida</span>
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full bg-blue-600/30 text-blue-300 hover:bg-blue-600 hover:text-white text-xs font-bold flex items-center gap-1 transition">
                          <Plus className="w-3.5 h-3.5 stroke-[3]" />
                          <span>Añadir</span>
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 pt-3 border-t border-white/10 flex justify-end">
              <button
                onClick={() => {
                  setShowAddToFolderModal(false);
                  setSongToAddToFolder(null);
                }}
                className="w-full py-2.5 text-xs sm:text-sm font-bold bg-[#282828] hover:bg-[#333333] text-gray-200 rounded-xl transition"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          MODAL: CAMBIAR MÚSICA DIRECTAMENTE DESDE EL REPRODUCTOR
          ========================================== */}
      {showChangeSongModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#1C1C1E] border border-[#3A3A3C] rounded-2xl w-full max-w-lg p-6 shadow-2xl relative max-h-[88vh] flex flex-col">
            <button
              onClick={() => setShowChangeSongModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-lg bg-[#2C2C2E] transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4 shrink-0">
              <div className="w-11 h-11 rounded-2xl bg-yellow-500/20 text-yellow-300 flex items-center justify-center">
                <ListMusic className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-white">
                  Cambiar Canción
                </h3>
                <p className="text-xs text-yellow-300 font-semibold">
                  Toca cualquier audio para reproducirlo al instante
                </p>
              </div>
            </div>

            {/* Buscador Rápido de Pistas */}
            <div className="relative mb-3 shrink-0">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Buscar por canción o artista..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-[#141414] border border-[#333333] rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400 font-medium"
              />
            </div>

            {/* Lista de Canciones para Cambiar */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {filteredSongs.length === 0 ? (
                <div className="p-6 text-center text-gray-400 space-y-3">
                  <Music className="w-8 h-8 text-gray-500 mx-auto" />
                  <p className="text-xs text-gray-400">
                    {isAdmin ? 'Sube tus archivos MP3 o carpetas de música para reproducirlas.' : 'El administrador agregará más canciones pronto.'}
                  </p>
                  {isAdmin && (
                    <div className="flex justify-center gap-2 pt-1">
                      <button
                        onClick={() => {
                          setShowChangeSongModal(false);
                          multiFileInputRef.current?.click();
                        }}
                        className="px-3.5 py-1.5 bg-pink-600 text-white rounded-lg text-xs font-bold"
                      >
                        Subir múltiples MP3
                      </button>
                      <button
                        onClick={() => {
                          setShowChangeSongModal(false);
                          folderInputRef.current?.click();
                        }}
                        className="px-3.5 py-1.5 bg-[#2A2A2A] text-white rounded-lg text-xs font-bold border border-white/10"
                      >
                        Subir Carpeta
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                filteredSongs.map((cancion) => {
                  const esActual = currentSong?.id === cancion.id;
                  return (
                    <div
                      key={cancion.id}
                      onClick={() => {
                        seleccionarCancion(cancion);
                        setShowChangeSongModal(false);
                      }}
                      className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition ${
                        esActual
                          ? 'bg-yellow-500/20 border border-yellow-400/50 text-white'
                          : 'bg-[#242426] hover:bg-[#2e2e30] text-gray-200'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {renderCover(cancion.cover_url || cancion.cover, 'w-11 h-11')}
                        <div className="min-w-0">
                          <p className={`text-sm font-bold truncate ${esActual ? 'text-yellow-300' : 'text-white'}`}>
                            {cancion.title || cancion.titulo}
                          </p>
                          <p className="text-xs text-gray-400 truncate mt-0.5">
                            {cancion.artist || cancion.artista}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {esActual && isPlaying ? (
                          <div className="w-7 h-7 rounded-full bg-yellow-400 text-black flex items-center justify-center">
                            <Pause className="w-3.5 h-3.5 fill-current" />
                          </div>
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-white/10 hover:bg-white hover:text-black text-white flex items-center justify-center transition">
                            <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="mt-3 pt-3 border-t border-white/10 shrink-0 flex justify-end">
              <button
                onClick={() => setShowChangeSongModal(false)}
                className="w-full py-2.5 text-xs sm:text-sm font-bold bg-[#282828] hover:bg-[#333333] text-gray-200 rounded-xl transition"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          MODAL: AGREGAR MÚSICA DE LA BIBLIOTECA A LA CARPETA ACTUAL (Solo Admin)
          ========================================== */}
      {showAddMusicToCurrentFolderModal && isAdmin && selectedFolder && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#1C1C1E] border border-[#3A3A3C] rounded-2xl w-full max-w-lg p-6 shadow-2xl relative max-h-[88vh] flex flex-col">
            <button
              onClick={() => setShowAddMusicToCurrentFolderModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-lg bg-[#2C2C2E] transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4 shrink-0">
              <div className="w-11 h-11 rounded-2xl bg-blue-600/20 text-blue-400 flex items-center justify-center">
                <FolderPlus className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div className="min-w-0">
                <h3 className="text-base sm:text-lg font-black text-white truncate">
                  Agregar a: {selectedFolder.titulo}
                </h3>
                <p className="text-xs text-blue-400 font-semibold">
                  Selecciona canciones de tu biblioteca para añadirlas a esta carpeta
                </p>
              </div>
            </div>

            {/* Lista de Canciones para Agregar a la Carpeta con paginación de 50 */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {canciones.slice(0, addMusicModalPageSize).map((cancion) => {
                const yaEsta = selectedFolder.canciones.some(
                  (c) =>
                    String(c.id) === String(cancion.id) ||
                    (c.titulo.toLowerCase() === cancion.titulo.toLowerCase() &&
                      c.artista.toLowerCase() === cancion.artista.toLowerCase())
                );

                return (
                  <div
                    key={cancion.id}
                    className={`flex items-center justify-between p-2.5 rounded-xl border transition ${
                      yaEsta
                        ? 'bg-emerald-950/30 border-emerald-500/30'
                        : 'bg-[#242426] border-[#38383A] hover:bg-[#2e2e30]'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {renderCover(cancion.cover_url || cancion.cover, 'w-10 h-10')}
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-white truncate">
                          {cancion.title || cancion.titulo}
                        </p>
                        <p className="text-xs text-gray-400 truncate mt-0.5">
                          {cancion.artist || cancion.artista}
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0">
                      {yaEsta ? (
                        <button
                          onClick={() => quitarCancionDeCarpeta(selectedFolder.id, cancion.id)}
                          className="px-3 py-1.5 rounded-lg bg-red-950/60 text-red-300 hover:bg-red-900/60 text-xs font-semibold flex items-center gap-1 transition"
                          title="Quitar de esta carpeta"
                        >
                          <MinusCircle className="w-3.5 h-3.5" />
                          <span>Quitar</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => agregarCancionACarpeta(selectedFolder.id, cancion)}
                          className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1 shadow transition"
                          title="Agregar a esta carpeta"
                        >
                          <Plus className="w-3.5 h-3.5 stroke-[3]" />
                          <span>Agregar</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}

              {canciones.length > addMusicModalPageSize && (
                <div className="pt-2 flex items-center justify-center">
                  <button
                    onClick={() => setAddMusicModalPageSize((prev) => prev + 50)}
                    className="w-full py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[3]" />
                    <span>Cargar 50 más ({Math.min(addMusicModalPageSize, canciones.length)} de {canciones.length})</span>
                  </button>
                </div>
              )}
            </div>

            <div className="mt-3 pt-3 border-t border-white/10 shrink-0 flex justify-end">
              <button
                onClick={() => setShowAddMusicToCurrentFolderModal(false)}
                className="w-full py-2.5 text-xs sm:text-sm font-bold bg-[#282828] hover:bg-[#333333] text-gray-200 rounded-xl transition"
              >
                Listo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          MODAL: GUÍA DE CONFIGURACIÓN RLS SUPABASE
          ========================================== */}
      {showRlsModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1E1E1E] border border-[#383838] rounded-2xl w-full max-w-lg p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowRlsModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  Configurar Tabla 'songs' y Storage en Supabase
                </h3>
                <p className="text-xs text-emerald-400">
                  Crea la tabla songs con persistencia (Título, Artista, Portada y Audio)
                </p>
              </div>
            </div>

            <div className="space-y-4 text-xs text-gray-300">
              <p>
                Para guardar y recuperar tus canciones de forma permanente con su título, artista y foto de portada, ve al <strong className="text-white">SQL Editor</strong> de tu panel de Supabase, pega y ejecuta este script:
              </p>

              <div className="relative">
                <pre className="p-3 bg-[#121212] border border-[#333333] rounded-xl font-mono text-[11px] text-emerald-400 overflow-x-auto leading-relaxed">
                  {rlsSql}
                </pre>
                <button
                  onClick={copyRlsSql}
                  className="absolute top-2 right-2 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#282828] hover:bg-[#383838] text-white text-[11px] font-semibold transition shadow"
                >
                  {sqlCopied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Copiado</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copiar SQL</span>
                    </>
                  )}
                </button>
              </div>

              <button
                onClick={() => setShowRlsModal(false)}
                className="w-full py-2.5 text-xs font-bold bg-[#1ED760] hover:bg-[#1db954] text-black rounded-xl shadow transition"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          REPRODUCTOR A PANTALLA COMPLETA (FULLSCREEN PLAYER)
          ========================================== */}
      {showExpandedPlayer && currentSong && (
        <div
          className="fixed inset-0 z-50 bg-gradient-to-b from-[#580816] via-[#20050b] to-[#121212] flex flex-col text-white overflow-y-auto no-scrollbar select-none pb-[calc(env(safe-area-inset-bottom,0px)+1.5rem)]"
          style={{ animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }}
        >
          {/* Header Superior: Botón Flecha hacia abajo + Título + Opciones */}
          <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-3.5 bg-[#580816]/70 backdrop-blur-md border-b border-white/5 pt-[calc(env(safe-area-inset-top,0px)+0.75rem)]">
            <button
              onClick={() => setShowExpandedPlayer(false)}
              className="p-2 -ml-2 rounded-full hover:bg-white/10 active:scale-90 transition text-white"
              title="Minimizar reproductor"
            >
              <ChevronDown className="w-7 h-7" />
            </button>

            <div className="text-center min-w-0 px-2 flex-1">
              <p className="text-[10px] sm:text-xs font-bold tracking-widest uppercase text-red-200/80">
                {selectedFolder ? `Carpeta: ${selectedFolder.titulo}` : appName}
              </p>
              <p className="text-xs sm:text-sm font-black text-white truncate">
                {currentSong.title || currentSong.titulo}
              </p>
            </div>

            {isAdmin ? (
              <button
                onClick={() => {
                  setSongToAddToFolder(currentSong);
                  setShowAddToFolderModal(true);
                }}
                className="p-2 -mr-2 rounded-full hover:bg-white/10 active:scale-90 transition text-white/80 hover:text-white"
                title="Agregar a carpeta"
              >
                <MoreVertical className="w-6 h-6" />
              </button>
            ) : (
              <div className="w-10" />
            )}
          </div>

          {/* Contenido Principal con Portada en Grande, Controles y Letras */}
          <div className="flex-1 max-w-md w-full mx-auto px-6 py-4 flex flex-col">
            {/* 1. Portada del álbum en grande */}
            <div className="w-full my-auto py-2 flex items-center justify-center">
              <div className="w-full aspect-square max-w-[320px] sm:max-w-[360px] rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/15 bg-black/60 flex items-center justify-center">
                {renderCover(currentSong.cover_url || currentSong.cover, 'w-full h-full object-cover')}
              </div>
            </div>

            {/* 2. Título, Artista y Botón de Favorito */}
            <div className="flex items-center justify-between gap-4 mt-4">
              <div className="min-w-0 flex-1">
                <h1 className="text-xl sm:text-2xl font-black text-white truncate leading-tight">
                  {currentSong.title || currentSong.titulo}
                </h1>
                <p className="text-sm sm:text-base text-gray-300 font-semibold truncate mt-1">
                  {currentSong.artist || currentSong.artista}
                </p>
              </div>
              <button
                onClick={() => toggleFavorite(currentSong)}
                className="p-2 rounded-full text-white hover:text-emerald-400 active:scale-90 transition shrink-0"
                title="Favorito"
              >
                <Heart
                  className={`w-6 h-6 sm:w-7 sm:h-7 ${
                    favorites.includes(String(currentSong.id))
                      ? 'fill-current text-[#1ED760]'
                      : 'text-gray-400'
                  }`}
                />
              </button>
            </div>

            {/* 3. Barra de progreso interactiva (Seek) */}
            <div className="w-full mt-4 select-none">
              <div className="relative flex items-center group py-2 cursor-pointer">
                <div className="w-full h-1.5 sm:h-2 bg-white/20 rounded-full overflow-hidden shadow-inner">
                  <div
                    className="h-full bg-white group-hover:bg-[#1ED760] rounded-full transition-all duration-75 relative"
                    style={{
                      width: `${duration ? Math.min(100, Math.max(0, (currentTime / duration) * 100)) : 0}%`
                    }}
                  />
                </div>
                <input
                  type="range"
                  min={0}
                  max={duration || 100}
                  step="0.1"
                  value={currentTime}
                  onChange={handleSeek}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  title="Adelantar o retroceder"
                />
              </div>
              <div className="flex justify-between items-center text-xs font-mono text-gray-400 mt-0.5 tabular-nums">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* 4. Controles de Reproducción Principales */}
            <div className="flex items-center justify-between gap-2 mt-4 px-1">
              {/* Aleatorio */}
              <button
                onClick={toggleShuffle}
                className={`p-2 rounded-full transition active:scale-90 relative ${
                  isShuffle ? 'text-[#1ED760]' : 'text-gray-400 hover:text-white'
                }`}
                title="Modo aleatorio"
              >
                <Shuffle className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.2]" />
                {isShuffle && (
                  <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#1ED760]" />
                )}
              </button>

              {/* Anterior */}
              <button
                onClick={reproducirAnterior}
                className="p-2 text-white hover:text-gray-200 active:scale-90 transition"
                title="Canción anterior"
              >
                <SkipBack className="w-7 h-7 sm:w-8 sm:h-8 fill-current" />
              </button>

              {/* Play / Pausa */}
              <button
                onClick={togglePlay}
                className="w-16 h-16 sm:w-18 sm:h-18 rounded-full bg-white text-black hover:bg-gray-100 flex items-center justify-center shadow-2xl active:scale-95 hover:scale-105 transition"
                title={isPlaying ? 'Pausar' : 'Reproducir'}
              >
                {isPlaying ? (
                  <Pause className="w-8 h-8 fill-current" />
                ) : (
                  <Play className="w-8 h-8 fill-current ml-1" />
                )}
              </button>

              {/* Siguiente */}
              <button
                onClick={reproducirSiguiente}
                className="p-2 text-white hover:text-gray-200 active:scale-90 transition"
                title="Siguiente canción"
              >
                <SkipForward className="w-7 h-7 sm:w-8 sm:h-8 fill-current" />
              </button>

              {/* Repetir */}
              <button
                onClick={toggleRepeat}
                className={`p-2 rounded-full transition active:scale-90 relative ${
                  repeatMode !== 'off' ? 'text-[#1ED760]' : 'text-gray-400 hover:text-white'
                }`}
                title="Repetición"
              >
                {repeatMode === 'one' ? (
                  <Repeat1 className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.2]" />
                ) : (
                  <Repeat className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.2]" />
                )}
                {repeatMode !== 'off' && (
                  <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#1ED760]" />
                )}
              </button>
            </div>

            {/* Fila secundaria: Añadir a carpeta + Cambiar canción */}
            <div className="flex items-center justify-between text-xs text-gray-400 mt-5 pt-3 border-t border-white/10 px-2">
              <button
                onClick={() => {
                  setSongToAddToFolder(currentSong);
                  setShowAddToFolderModal(true);
                }}
                className="flex items-center gap-1.5 hover:text-white transition active:scale-95"
              >
                <FolderPlus className="w-4 h-4 text-emerald-400" />
                <span>Añadir a carpeta</span>
              </button>

              <button
                onClick={() => setShowChangeSongModal(true)}
                className="flex items-center gap-1.5 hover:text-white transition active:scale-95"
              >
                <ListMusic className="w-4 h-4 text-yellow-300" />
                <span>Cambiar canción</span>
              </button>
            </div>

            {/* Control de volumen rápido en el reproductor */}
            <div className="flex items-center gap-3 mt-6 pt-4 border-t border-white/10 px-2 text-xs text-gray-300">
              <button
                onClick={toggleMute}
                className="text-gray-400 hover:text-white transition active:scale-90"
                title={isMuted ? 'Activar sonido' : 'Silenciar'}
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-5 h-5 text-red-400" />
                ) : (
                  <Volume2 className="w-5 h-5 text-emerald-400" />
                )}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-full accent-[#1ED760] cursor-pointer h-1.5 bg-white/20 rounded-lg"
                title="Ajustar volumen"
              />
              <span className="font-mono text-[11px] text-gray-400 tabular-nums w-8 text-right">
                {Math.round((isMuted ? 0 : volume) * 100)}%
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          MODAL: AJUSTES ADMINISTRATIVOS (SOLO ADMIN)
          ========================================== */}
      {showAdminSettingsModal && isAdmin && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[#1C1C1E] border border-amber-500/40 rounded-3xl w-full max-w-xl p-5 sm:p-7 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowAdminSettingsModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white p-1.5 rounded-xl bg-[#2C2C2E] transition active:scale-90"
              title="Cerrar ajustes"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header del Modal */}
            <div className="flex items-center gap-3.5 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center shadow-lg shrink-0">
                <ShieldCheck className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div className="min-w-0 pr-6">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg sm:text-xl font-black text-white truncate">
                    Ajustes Administrativos
                  </h3>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    Admin
                  </span>
                </div>
                <p className="text-xs text-gray-400 truncate mt-0.5">
                  Conectado como: <strong className="text-white">{user?.email}</strong>
                </p>
              </div>
            </div>

            <div className="space-y-6">
              {/* SECCIÓN 1: CAMBIAR NOMBRE DE LA APP */}
              <div className="p-4 rounded-2xl bg-[#242426] border border-white/5 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-amber-400" />
                    <span>Nombre de la Aplicación</span>
                  </h4>
                  <span className="text-[11px] text-gray-400 font-mono">Persistente</span>
                </div>
                <p className="text-xs text-gray-400">
                  Modifica el nombre o título de la aplicación. Se mantendrá guardado en este dispositivo al recargar.
                </p>
                <form onSubmit={guardarNombreApp} className="flex gap-2">
                  <input
                    type="text"
                    value={tempAppName}
                    onChange={(e) => setTempAppName(e.target.value)}
                    placeholder={appName || "Spotyy_AA"}
                    className="flex-1 px-3.5 py-2 bg-[#161618] border border-white/10 rounded-xl text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-amber-400"
                  />
                  <button
                    type="submit"
                    onClick={guardarNombreApp}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs sm:text-sm rounded-xl shadow active:scale-95 transition shrink-0"
                  >
                    Guardar Nombre
                  </button>
                </form>
              </div>

              {/* SECCIÓN 2: GESTIÓN DE USUARIOS (KICK / BLOQUEAR) */}
              <div className="p-4 rounded-2xl bg-[#242426] border border-white/5 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <UserX className="w-4 h-4 text-red-400" />
                    <span>Gestión de Usuarios (Kick / Bloqueo)</span>
                  </h4>
                  <button
                    onClick={cargarUsuariosBloqueados}
                    disabled={loadingBlockedUsers}
                    className="text-xs text-gray-400 hover:text-white flex items-center gap-1 transition"
                    title="Actualizar lista de bloqueados"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loadingBlockedUsers ? 'animate-spin' : ''}`} />
                    <span>Actualizar</span>
                  </button>
                </div>

                <p className="text-xs text-gray-400 leading-relaxed">
                  Escribe el correo de un usuario para agregarlo a la tabla <code className="font-mono text-red-400 bg-black/40 px-1 py-0.5 rounded">blocked_users</code> de Supabase. Al intentar hacer Login, su sesión se cerrará de inmediato con el aviso <em>&quot;Acceso denegado por el administrador&quot;</em>.
                </p>

                {/* Formulario para bloquear usuario */}
                <form onSubmit={bloquearUsuario} className="flex gap-2">
                  <input
                    type="email"
                    required
                    value={newBlockEmail}
                    onChange={(e) => setNewBlockEmail(e.target.value)}
                    placeholder="usuario@correo.com"
                    className="flex-1 px-3.5 py-2 bg-[#161618] border border-white/10 rounded-xl text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-red-400"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-red-600/25 active:scale-95 transition flex items-center gap-1.5 shrink-0"
                  >
                    <UserX className="w-4 h-4" />
                    <span>Bloquear (Kick)</span>
                  </button>
                </form>

                {/* Lista de usuarios bloqueados */}
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between text-xs font-bold text-gray-400 uppercase tracking-wider">
                    <span>Usuarios Bloqueados ({blockedUsers.length})</span>
                  </div>

                  {loadingBlockedUsers ? (
                    <div className="p-4 text-center text-xs text-gray-400 flex items-center justify-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
                      <span>Consultando tabla blocked_users en Supabase...</span>
                    </div>
                  ) : blockedUsers.length === 0 ? (
                    <div className="p-4 rounded-xl bg-black/20 text-center border border-white/5 text-xs text-gray-400">
                      No hay usuarios bloqueados en este momento.
                    </div>
                  ) : (
                    <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                      {blockedUsers.map((item) => (
                        <div
                          key={item.email}
                          className="flex items-center justify-between p-2.5 rounded-xl bg-[#1c1c1e] border border-white/5"
                        >
                          <div className="min-w-0 pr-2">
                            <p className="text-xs font-bold text-red-300 truncate">{item.email}</p>
                            <p className="text-[10px] text-gray-500">
                              Bloqueado: {item.created_at ? new Date(item.created_at).toLocaleString() : 'Recientemente'}
                            </p>
                          </div>
                          <button
                            onClick={() => desbloquearUsuario(item.email)}
                            className="px-2.5 py-1 text-xs font-semibold bg-white/10 hover:bg-emerald-600 text-gray-200 hover:text-white rounded-lg transition active:scale-95 shrink-0"
                          >
                            Desbloquear
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Botón de respaldo SQL para crear tabla blocked_users */}
                <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                  <span className="text-[11px] text-gray-500">¿Tabla no configurada en Supabase?</span>
                  <button
                    onClick={copyBlockedSql}
                    className="text-[11px] font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 transition"
                  >
                    <Copy className="w-3 h-3" />
                    <span>{sqlCopiedBlocked ? '¡SQL Copiado!' : 'Copiar SQL para blocked_users'}</span>
                  </button>
                </div>
              </div>

              {/* SECCIÓN 3: CERRAR SESIÓN */}
              <div className="pt-2 flex justify-between items-center border-t border-white/10">
                <button
                  onClick={() => setShowAdminSettingsModal(false)}
                  className="px-4 py-2 text-xs font-bold bg-[#282828] hover:bg-[#333333] text-gray-300 rounded-xl transition"
                >
                  Cerrar
                </button>
                <button
                  onClick={() => {
                    setShowAdminSettingsModal(false);
                    handleLogout();
                  }}
                  className="px-4 py-2 text-xs font-bold bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white border border-red-500/40 rounded-xl transition flex items-center gap-1.5 active:scale-95"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Cerrar Sesión</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          TOAST FEEDBACK
          ========================================== */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-2xl border text-xs font-semibold ${
            toast.type === 'success'
              ? 'bg-[#181818] border-[#1ED760] text-white'
              : 'bg-[#181818] border-red-500 text-red-200'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-[#1ED760] shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}
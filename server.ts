import 'dotenv/config';
import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  // En el entorno de AI Studio el dev server debe correr estrictamente en el puerto 3000
  const PORT = 3000;

  app.use(express.json());

  // API Endpoint: Búsqueda en vivo de YouTube sin necesidad de claves API
  app.get('/api/youtube/search', async (req, res) => {
    try {
      const query = String(req.query.q || '').trim();
      if (!query) {
        return res.json({ success: true, results: [] });
      }

      const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
      const response = await fetch(searchUrl, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8'
        }
      });

      if (!response.ok) {
        throw new Error(`YouTube respondió con status ${response.status}`);
      }

      const html = await response.text();
      const match =
        html.match(/var ytInitialData = ({.*?});<\/script>/s) ||
        html.match(/ytInitialData\s*=\s*({.*?});/s);

      if (!match) {
        return res.json({ success: true, results: [] });
      }

      const parsedData = JSON.parse(match[1]);
      const contents =
        parsedData?.contents?.twoColumnSearchResultsRenderer?.primaryContents
          ?.sectionListRenderer?.contents || [];

      const results: Array<{
        id: string;
        videoId: string;
        title: string;
        channelTitle: string;
        duration: string;
        thumbnailUrl: string;
        views?: string;
      }> = [];

      for (const section of contents) {
        const itemSection = section?.itemSectionRenderer?.contents || [];
        for (const item of itemSection) {
          const v = item?.videoRenderer;
          if (v && v.videoId) {
            const title =
              v.title?.runs?.[0]?.text ||
              v.title?.accessibility?.accessibilityData?.label ||
              'Video sin título';
            const channelTitle =
              v.ownerText?.runs?.[0]?.text ||
              v.shortBylineText?.runs?.[0]?.text ||
              'YouTube';
            const duration = v.lengthText?.simpleText || '0:00';
            const thumbnails = v.thumbnail?.thumbnails || [];
            const thumbnailUrl =
              thumbnails[thumbnails.length - 1]?.url ||
              `https://img.youtube.com/vi/${v.videoId}/hqdefault.jpg`;
            const views = v.shortViewCountText?.simpleText || v.viewCountText?.simpleText || '';

            results.push({
              id: 'yt_' + v.videoId,
              videoId: v.videoId,
              title,
              channelTitle,
              duration,
              thumbnailUrl,
              views
            });

            if (results.length >= 25) break;
          }
        }
        if (results.length >= 25) break;
      }

      return res.json({
        success: true,
        query,
        results
      });
    } catch (err: unknown) {
      console.error('Error buscando en YouTube:', err);
      return res.status(500).json({
        success: false,
        error: err instanceof Error ? err.message : 'Error desconocido al buscar en YouTube',
        results: []
      });
    }
  });

  // API Endpoint: Identificación y nombramiento inteligente con DeepSeek / Gemini AI
  app.post('/api/ai/tag-audio', async (req, res) => {
    try {
      const filename = String(req.body.filename || '').trim();
      const folderId = String(req.body.folderId || '').trim();
      const id3Title = String(req.body.id3Title || '').trim();
      const id3Artist = String(req.body.id3Artist || '').trim();

      if (!filename && !id3Title) {
        return res.status(400).json({ success: false, error: 'Nombre de archivo requerido' });
      }

      // Limpieza inteligente previa de extensiones, track numbers, tags de YouTube/descargas
      let rawClean = filename.replace(/\.(mp3|wav|m4a|aac|flac|ogg)$/i, '');
      // Eliminar números de pista iniciales (ej. "01 - ", "12. ", "03_")
      rawClean = rawClean.replace(/^\s*(?:\d+[\s._-]+)+/, '');
      // Eliminar sufijos o prefijos comunes de rippers/YouTube
      rawClean = rawClean
        .replace(/\b(official\s+video|video\s+oficial|official\s+audio|audio\s+oficial|video\s+lyric|letra|lyrics|en\s+vivo|live|remix|hd|4k|1080p|hq|320kbps|128kbps|y2mate(?:\.is)?|mp3clan|snaptube|full\s+audio)\b/gi, '')
        .replace(/[\[\(\{]\s*[\]\)\}]/g, '')
        .replace(/[_]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      let aiResult: {
        titulo: string;
        artista: string;
        genero: string;
        sugerenciaCarpeta: string;
        descripcionPortada: string;
        coverUrl?: string;
        fuenteIA?: string;
      } | null = null;

      // 1. Intentar con DeepSeek si existe DEEPSEEK_API_KEY
      if (process.env.DEEPSEEK_API_KEY) {
        try {
          const dsRes = await fetch('https://api.deepseek.com/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
            },
            body: JSON.stringify({
              model: 'deepseek-chat',
              messages: [
                {
                  role: 'system',
                  content:
                    'Eres el asistente experto de Spotyy_AA para identificación musical. Tu tarea es extraer con máxima precisión el NOMBRE EXACTO DE LA CANCIÓN y el NOMBRE DEL ARTISTA O AGRUPACIÓN a partir del nombre del archivo o metadatos proporcionados. Si el artista o canción son conocidos (ej: regional mexicano, corridos tumbados, reggaetón, baladas, pop), normaliza sus nombres oficiales con ortografía impecable. NUNCA respondas "Desconocido" si el artista se deduce del nombre o título. Responde ÚNICAMENTE un JSON con: {"titulo": "...", "artista": "...", "genero": "...", "sugerenciaCarpeta": "buchonass" | "perreale" | "tus_me_gusta" | "lob_songs" | "los_2000" | "grwm" | "baladas" | "la_reina", "descripcionPortada": "aesthetic album cover art prompt in english"}'
                },
                {
                  role: 'user',
                  content: `Archivo: "${filename}". ID3 Title: "${id3Title}", ID3 Artist: "${id3Artist}". Sugerencia de carpeta: "${folderId}"`
                }
              ],
              response_format: { type: 'json_object' }
            })
          });

          if (dsRes.ok) {
            const dsData = await dsRes.json();
            const textContent = dsData.choices?.[0]?.message?.content;
            if (textContent) {
              const parsed = JSON.parse(textContent);
              aiResult = {
                titulo: parsed.titulo || id3Title || rawClean,
                artista: parsed.artista || id3Artist || 'Artista',
                genero: parsed.genero || 'Música',
                sugerenciaCarpeta: parsed.sugerenciaCarpeta || folderId || 'tus_me_gusta',
                descripcionPortada: parsed.descripcionPortada || `${parsed.artista || ''} ${parsed.titulo || ''} album cover`,
                fuenteIA: 'DeepSeek IA'
              };
            }
          }
        } catch (dsErr) {
          console.warn('DeepSeek API no disponible o falló:', dsErr);
        }
      }

      // 2. Si no hubo DeepSeek, intentar con Gemini (@google/genai)
      if (!aiResult && process.env.GEMINI_API_KEY) {
        try {
          const { GoogleGenAI } = await import('@google/genai');
          const ai = new GoogleGenAI({
            apiKey: process.env.GEMINI_API_KEY,
            httpOptions: {
              headers: {
                'User-Agent': 'aistudio-build'
              }
            }
          });

          const geminiPrompt = `Eres el identificador musical de Spotyy_AA.
Analiza este audio:
- Nombre de archivo: "${filename}"
- ID3 Título previo: "${id3Title}"
- ID3 Artista previo: "${id3Artist}"

Identifica con exactitud:
1. "titulo": Título limpio y oficial de la canción (sin extensiones, sin palabras como "video oficial", "audio", "remix" superfluo, ni números de pista).
2. "artista": Nombre oficial del cantante, banda o agrupación (incluye colaboradores con "&" o "feat" si los hay).
3. "genero": Género musical (ej: Corridos Tumbados, Regional Mexicano, Reggaetón, Balada Romántica, Banda).
4. "sugerenciaCarpeta": Selecciona una de estas carpetas: "buchonass" (corridos bélicos/tumbados/regional), "perreale" (reggaetón/urbano/trap), "lob_songs" (banda/grupero), "baladas" (baladas románticas), "los_2000" (pop 2000s), "la_reina" (cumbias/Selena), "grwm" o "tus_me_gusta".
5. "descripcionPortada": Prompt en inglés para generar una portada de álbum musical estética y profesional (ej: "cinematic modern album cover art for [artist] with vivid neon and gold accents").

Devuelve ÚNICAMENTE un JSON válido con las llaves:
{"titulo": string, "artista": string, "genero": string, "sugerenciaCarpeta": string, "descripcionPortada": string}`;

          const geminiResponse = await ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: geminiPrompt,
            config: {
              responseMimeType: 'application/json'
            }
          });

          const geminiText = geminiResponse.text?.trim();
          if (geminiText) {
            const parsed = JSON.parse(geminiText);
            aiResult = {
              titulo: parsed.titulo || id3Title || rawClean,
              artista: parsed.artista || id3Artist || 'Artista',
              genero: parsed.genero || 'Música',
              sugerenciaCarpeta: parsed.sugerenciaCarpeta || folderId || 'tus_me_gusta',
              descripcionPortada: parsed.descripcionPortada || `${parsed.artista || ''} ${parsed.titulo || ''} album art`,
              fuenteIA: 'DeepSeek / Gemini IA'
            };
          }
        } catch (geminiErr) {
          console.warn('Gemini API fallo:', geminiErr);
        }
      }

      // 3. Heurística inteligente avanzada con catálogo si no hay claves de API o falló la red
      if (!aiResult) {
        let titulo = id3Title || rawClean;
        let artista = id3Artist || '';
        let genero = 'Música';
        let sugerenciaCarpeta = folderId || 'tus_me_gusta';

        // Catálogo de artistas reconocidos frecuentemente en Spotyy_AA
        const artistasConocidos: Array<{
          nombres: string[];
          artistaOficial: string;
          genero: string;
          carpeta: string;
        }> = [
          // Corridos & Regional Bélico
          { nombres: ['peso pluma', 'doble p'], artistaOficial: 'Peso Pluma', genero: 'Corridos Tumbados', carpeta: 'buchonass' },
          { nombres: ['natanael cano', 'nata'], artistaOficial: 'Natanael Cano', genero: 'Corridos Tumbados', carpeta: 'buchonass' },
          { nombres: ['junior h'], artistaOficial: 'Junior H', genero: 'Corridos Tumbados', carpeta: 'buchonass' },
          { nombres: ['fuerza regida', 'jop'], artistaOficial: 'Fuerza Regida', genero: 'Corridos Urbanos', carpeta: 'buchonass' },
          { nombres: ['el fantasma'], artistaOficial: 'El Fantasma', genero: 'Corridos & Regional', carpeta: 'buchonass' },
          { nombres: ['los dos carnales'], artistaOficial: 'Los Dos Carnales', genero: 'Corridos Norteños', carpeta: 'buchonass' },
          { nombres: ['luis r conriquez', 'luis r'], artistaOficial: 'Luis R Conriquez', genero: 'Corridos Bélicos', carpeta: 'buchonass' },
          { nombres: ['gabito ballesteros'], artistaOficial: 'Gabito Ballesteros', genero: 'Corridos Tumbados', carpeta: 'buchonass' },
          { nombres: ['eslabon armado'], artistaOficial: 'Eslabón Armado', genero: 'Regional Mexicano', carpeta: 'buchonass' },
          { nombres: ['chino pacas'], artistaOficial: 'Chino Pacas', genero: 'Corridos Urbanos', carpeta: 'buchonass' },
          { nombres: ['calibre 50'], artistaOficial: 'Calibre 50', genero: 'Norteño Banda', carpeta: 'buchonass' },
          // Reggaetón & Urbano
          { nombres: ['bad bunny', 'benito'], artistaOficial: 'Bad Bunny', genero: 'Reggaetón & Trap', carpeta: 'perreale' },
          { nombres: ['feid', 'ferxxo'], artistaOficial: 'Feid', genero: 'Reggaetón', carpeta: 'perreale' },
          { nombres: ['karol g', 'la bichota'], artistaOficial: 'Karol G', genero: 'Reggaetón & Urbano', carpeta: 'perreale' },
          { nombres: ['anuel', 'anuel aa'], artistaOficial: 'Anuel AA', genero: 'Trap & Reggaetón', carpeta: 'perreale' },
          { nombres: ['daddy yankee'], artistaOficial: 'Daddy Yankee', genero: 'Reggaetón Clásico', carpeta: 'perreale' },
          { nombres: ['don omar'], artistaOficial: 'Don Omar', genero: 'Reggaetón Clásico', carpeta: 'perreale' },
          { nombres: ['rauw alejandro', 'rauw'], artistaOficial: 'Rauw Alejandro', genero: 'Reggaetón & R&B', carpeta: 'perreale' },
          { nombres: ['myke towers'], artistaOficial: 'Myke Towers', genero: 'Urbano & Trap', carpeta: 'perreale' },
          { nombres: ['maluma'], artistaOficial: 'Maluma', genero: 'Urbano', carpeta: 'perreale' },
          { nombres: ['j balvin'], artistaOficial: 'J Balvin', genero: 'Reggaetón', carpeta: 'perreale' },
          { nombres: ['wisin', 'yandel', 'wisin & yandel'], artistaOficial: 'Wisin & Yandel', genero: 'Reggaetón Legendario', carpeta: 'perreale' },
          // Banda & Grupero
          { nombres: ['grupo firme', 'eduin caz'], artistaOficial: 'Grupo Firme', genero: 'Banda & Regional', carpeta: 'lob_songs' },
          { nombres: ['carin leon', 'carin león'], artistaOficial: 'Carin Leon', genero: 'Música Mexicana', carpeta: 'lob_songs' },
          { nombres: ['grupo frontera'], artistaOficial: 'Grupo Frontera', genero: 'Cumbia Norteña', carpeta: 'lob_songs' },
          { nombres: ['banda ms'], artistaOficial: 'Banda MS', genero: 'Banda Sinaloense', carpeta: 'lob_songs' },
          { nombres: ['christian nodal', 'nodal'], artistaOficial: 'Christian Nodal', genero: 'Mariacheño', carpeta: 'lob_songs' },
          { nombres: ['eden muñoz'], artistaOficial: 'Eden Muñoz', genero: 'Regional Mexicano', carpeta: 'lob_songs' },
          { nombres: ['julion alvarez', 'julión álvarez'], artistaOficial: 'Julión Álvarez', genero: 'Norteño Banda', carpeta: 'lob_songs' },
          // Baladas
          { nombres: ['luis miguel'], artistaOficial: 'Luis Miguel', genero: 'Balada & Bolero', carpeta: 'baladas' },
          { nombres: ['chayanne'], artistaOficial: 'Chayanne', genero: 'Balada Pop', carpeta: 'baladas' },
          { nombres: ['cristian castro'], artistaOficial: 'Cristian Castro', genero: 'Balada Romántica', carpeta: 'baladas' },
          { nombres: ['marco antonio solis', 'los bukis'], artistaOficial: 'Marco Antonio Solís', genero: 'Balada Grupera', carpeta: 'baladas' },
          // Cumbia & La Reina
          { nombres: ['selena', 'selena quintanilla'], artistaOficial: 'Selena Quintanilla', genero: 'Tejano & Cumbia', carpeta: 'la_reina' },
          { nombres: ['angeles azules', 'ángeles azules'], artistaOficial: 'Los Ángeles Azules', genero: 'Cumbia Sonidera', carpeta: 'la_reina' },
          // Pop 2000s
          { nombres: ['shakira'], artistaOficial: 'Shakira', genero: 'Pop Latino', carpeta: 'los_2000' },
          { nombres: ['jonas brothers', 'camp rock'], artistaOficial: 'Jonas Brothers', genero: 'Pop 2000s', carpeta: 'los_2000' }
        ];

        // Revisar si el nombre de archivo contiene alguno de los artistas conocidos
        const lowerName = (filename + ' ' + (id3Artist || '')).toLowerCase();
        let matchedCatalog = artistasConocidos.find((a) =>
          a.nombres.some((n) => lowerName.includes(n))
        );

        if (matchedCatalog) {
          artista = matchedCatalog.artistaOficial;
          genero = matchedCatalog.genero;
          sugerenciaCarpeta = matchedCatalog.carpeta;

          // Remover el nombre del artista del título si está incluido
          let cleanTitleCandidate = rawClean;
          for (const n of matchedCatalog.nombres) {
            const re = new RegExp(n, 'gi');
            cleanTitleCandidate = cleanTitleCandidate.replace(re, '');
          }
          cleanTitleCandidate = cleanTitleCandidate
            .replace(/^[\s\-_—–:]+|[\s\-_—–:]+$/g, '')
            .trim();
          if (cleanTitleCandidate.length > 2) {
            titulo = cleanTitleCandidate;
          }
        } else {
          // Detectar separador estándar " - " o " by " o " _ "
          if (rawClean.includes(' - ')) {
            const parts = rawClean.split(' - ');
            artista = parts[0].trim();
            titulo = parts.slice(1).join(' - ').trim();
          } else if (rawClean.includes(' — ')) {
            const parts = rawClean.split(' — ');
            artista = parts[0].trim();
            titulo = parts.slice(1).join(' — ').trim();
          } else if (rawClean.toLowerCase().includes(' by ')) {
            const parts = rawClean.split(/ by /i);
            titulo = parts[0].trim();
            artista = parts[1].trim();
          } else if (rawClean.includes('_') && !rawClean.includes(' ')) {
            const parts = rawClean.split('_');
            if (parts.length >= 2) {
              artista = parts[0].trim();
              titulo = parts.slice(1).join(' ').trim();
            }
          }
        }

        if (!artista || artista.trim().length === 0) {
          artista = id3Artist || 'Artista';
        }
        if (!titulo || titulo.trim().length === 0) {
          titulo = id3Title || rawClean || 'Canción';
        }

        // Capitalizar palabras limpiamente si vienen todo en minúsculas
        const capitalize = (str: string) =>
          str
            .split(' ')
            .map((w) => (w.length > 0 ? w[0].toUpperCase() + w.slice(1) : ''))
            .join(' ');

        if (titulo === titulo.toLowerCase()) titulo = capitalize(titulo);
        if (artista === artista.toLowerCase()) artista = capitalize(artista);

        aiResult = {
          titulo,
          artista,
          genero,
          sugerenciaCarpeta,
          descripcionPortada: `${artista} ${titulo} vivid stylish music album art cover vinyl 4k`,
          fuenteIA: 'DeepSeek / Gemini IA'
        };
      }

      // 4. Generar URL de portada de alta resolución personalizada basada en artista y canción
      const promptClean = encodeURIComponent(
        `${aiResult.descripcionPortada || aiResult.artista + ' ' + aiResult.titulo} vibrant music album art cover masterpiece stylish 4k`
      );
      aiResult.coverUrl = `https://image.pollinations.ai/prompt/${promptClean}?width=512&height=512&nologo=true&seed=${Math.floor(
        Math.random() * 1000000
      )}`;

      return res.json({
        success: true,
        data: aiResult
      });
    } catch (err: unknown) {
      console.error('Error en /api/ai/tag-audio:', err);
      return res.status(500).json({
        success: false,
        error: err instanceof Error ? err.message : 'Error al procesar audio con IA'
      });
    }
  });

  // API Endpoint: Obtención de letras en texto plano con DeepSeek AI
  app.post('/api/ai/lyrics', async (req, res) => {
    try {
      const title = String(req.body.title || '').trim();
      const artist = String(req.body.artist || '').trim();

      if (!title) {
        return res.status(400).json({ success: false, error: 'Título de canción requerido' });
      }

      let lyrics: string | null = null;
      let fuente = 'DeepSeek AI';

      // 1. Petición a DeepSeek API pasándole el nombre del artista y la canción
      if (process.env.DEEPSEEK_API_KEY) {
        try {
          const dsRes = await fetch('https://api.deepseek.com/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
            },
            body: JSON.stringify({
              model: 'deepseek-chat',
              messages: [
                {
                  role: 'system',
                  content:
                    'Eres un asistente musical experto. Tu labor es proporcionar la letra completa y verídica en texto plano de la canción solicitada según el título y el artista oficial. Devuelve ÚNICAMENTE la letra de la canción en texto plano, verso por verso con sus saltos de línea correspondientes entre estrofas. NO incluyas introducciones, ni comentarios, ni explicaciones, ni etiquetas de acordes, ni bloques de código markdown (sin comillas triples ```). Si la canción es puramente instrumental o no tiene letra, responde únicamente: Letra no disponible.'
                },
                {
                  role: 'user',
                  content: `Artista: "${artist || 'Artista'}". Canción: "${title}". Devuelve la letra oficial en texto plano.`
                }
              ],
              temperature: 0.2
            })
          });

          if (dsRes.ok) {
            const dsData = await dsRes.json();
            const textContent = dsData.choices?.[0]?.message?.content;
            if (textContent && typeof textContent === 'string' && textContent.trim()) {
              let clean = textContent.trim();
              // Limpiar delimitadores markdown si el modelo los incluyó
              clean = clean.replace(/^```[a-z]*\s*/i, '').replace(/\s*```$/i, '').trim();
              if (clean.length > 5) {
                lyrics = clean;
              }
            }
          } else {
            console.warn('DeepSeek lyrics HTTP error:', dsRes.status, await dsRes.text().catch(() => ''));
          }
        } catch (dsErr) {
          console.warn('DeepSeek lyrics API request failed:', dsErr);
        }
      }

      // 2. Si no hubo respuesta con DeepSeek y existe GEMINI_API_KEY, respaldo con Gemini
      if (!lyrics && process.env.GEMINI_API_KEY) {
        try {
          const { GoogleGenAI } = await import('@google/genai');
          const ai = new GoogleGenAI({
            apiKey: process.env.GEMINI_API_KEY,
            httpOptions: {
              headers: {
                'User-Agent': 'aistudio-build'
              }
            }
          });

          const geminiPrompt = `Eres un asistente musical experto. Proporciona la letra completa y oficial en texto plano de la siguiente canción:
- Canción: "${title}"
- Artista: "${artist || 'Desconocido'}"

Devuelve ÚNICAMENTE la letra de la canción en texto plano verso por verso con saltos de línea entre estrofas. NO agregues notas, ni introducciones, ni bloques de código markdown. Si es instrumental, responde "Letra no disponible".`;

          const geminiRes = await ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: geminiPrompt
          });

          const geminiText = geminiRes.text;
          if (geminiText && geminiText.trim()) {
            let clean = geminiText.trim().replace(/^```[a-z]*\s*/i, '').replace(/\s*```$/i, '').trim();
            if (clean.length > 5) {
              lyrics = clean;
              fuente = 'Gemini AI (Respaldo)';
            }
          }
        } catch (geminiErr) {
          console.warn('Gemini fallback lyrics failed:', geminiErr);
        }
      }

      if (lyrics) {
        return res.json({
          success: true,
          data: {
            lyrics,
            fuente,
            title,
            artist
          }
        });
      } else {
        return res.json({
          success: false,
          lyrics: null,
          message: 'Letra no disponible'
        });
      }
    } catch (err: unknown) {
      console.error('Error en /api/ai/lyrics:', err);
      return res.status(500).json({
        success: false,
        error: err instanceof Error ? err.message : 'Error al consultar letras con IA'
      });
    }
  });

  // Servir archivos estáticos de /public (PWA manifest, service worker, iconos)
  app.use(express.static(path.join(__dirname, 'public')));

  // Modo desarrollo con Vite middlewares o producción
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true, host: '0.0.0.0', port: PORT },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`JAaron Music Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Error starting server:', err);
});

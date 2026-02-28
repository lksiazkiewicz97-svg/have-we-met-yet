import React, { useState, useEffect, useRef } from 'react';
import { CloudUpload, MapPin, Activity, CircleCheck, TriangleAlert, Play, Settings, CircleHelp, X, Trash2, Wand2, Sparkles, QrCode, Link as LinkIcon, Smartphone, Wifi, Lock, ShieldCheck, ArrowRight, HeartHandshake, Moon, Sun, Globe, Share2 } from 'lucide-react';

// Deklaracja globalnych zmiennych
declare global {
  interface Window { L: any; Peer: any; tailwind: any; html2canvas: any; }
}

// ============================================================================
// SŁOWNIK JĘZYKÓW (i18n)
// ============================================================================
const dict: Record<string, any> = {
  pl: {
    secureBadge: "Bezpieczeństwo. Dane wyparowują po zamknięciu karty.",
    title: "Have we met before?",
    subtitle: "Sprawdź, czy Twoja ścieżka życiowa przecięła się z tą drugą osobą, zanim oficjalnie się poznaliście.",
    howToData: "Jak zdobyć swoje dane lokalizacyjne?",
    hostTitle: "Osoba 1 (Gospodarz)",
    hostDesc: "Wgraj swój plik, aby otworzyć bezpieczny pokój.",
    readyHost: "Twoje wspomnienia dodane",
    readyPts: "Przeanalizujemy {n} punktów na mapie.",
    guestTitle: "Osoba 2 (Gość)",
    inviteGuest: "Zaproś Gościa",
    scanOrPin: "Zeskanuj kod telefonem lub podaj PIN.",
    roomCode: "Kod pokoju",
    copyLink: "Skopiuj link",
    copied: "Skopiowano!",
    waiting: "Oczekuję na dołączenie...",
    guestJoined: "Znajomy dołączył!",
    guestJoinedDesc: "Szyfrowane P2P. Otrzymano {n} punktów.",
    guestReadyManual: "Osoba 2 Gotowa",
    guestManualDesc: "{n} punktów wprowadzonych ręcznie.",
    openScanner: "Otwórz skaner QR",
    pinPlaceholder: "Kod PIN...",
    orTraditionally: "Lub tradycyjnie",
    testMode: "Tryb Testowy (Wygeneruj)",
    searchParams: "Parametry wyszukiwania",
    distLabel: "Byliśmy od siebie bliżej niż...",
    timeLabel: "W oknie czasowym wynoszącym...",
    presetParty: "Klub/Budynek",
    presetFest: "Festiwal/Okolica",
    presetCity: "To samo miasto",
    analyzeBtn: "Odkryjcie prawdę",
    analyzingBtn: "Analizowanie historii...",
    foundMatches: "Znaleźliśmy Wasze ścieżki!",
    noMatches: "😔 Niestety, brak przecięć.",
    distance: "Byliście od siebie o",
    showMore: "Pokaż więcej spotkań",
    aiShortBtn: "Gdzie to było? (Szybko)",
    aiLocating: "Lokalizowanie miejsca...",
    aiMapPoint: "Wasz punkt na mapie:",
    aiPremiumBtn: "Wygeneruj pełną opowieść",
    aiPremiumLock: "Funkcja Premium",
    aiGenerating: "Sztuczna inteligencja tworzy magię...",
    aiStoryTitle: "Magia chwili (Pełna historia):",
    aiSources: "Źródła historyczne:",
    shareStory: "Udostępnij (IG Story)",
    downloading: "Przygotowywanie grafiki...",
    guestModeTitle: "Dołączasz do sesji! 🎉",
    guestModeDesc: "Twój znajomy chce sprawdzić, czy kiedyś już się minęliście. Dodaj swoje wspomnienia z Map Google.",
    uploadYourHistory: "Prześlij swoją historię",
    usuallyFile: "Zwykle jest to pobrany plik",
    connecting: "Nawiązywanie bezpiecznego połączenia...",
    waitingForHost: "Czekamy na rozpoczęcie analizy przez Hosta...",
    resultsReady: "Wyniki są gotowe! Zobacz poniżej.",
    workerInput: "Analiza danych wejściowych...",
    workerMatch: "Poszukiwanie wspólnych ścieżek...",
    peerErrorTitle: "Błąd połączenia",
    instructionModalDesc: "Z uwagi na pełną dbałość o Twoją prywatność, Google zapisuje Twoją historię (Oś czasu) wyłącznie na Twoim fizycznym urządzeniu. Musisz wykonać szybki eksport bezpośrednio ze smartfona.",
    method1: "Metoda 1: Twój Smartfon (Zalecane)",
    openTimelineBtn: "Otwórz Oś Czasu (Skrót)",
    step1: "Otwórz aplikację Mapy Google na telefonie (lub użyj skrótu wyżej).",
    step2: "Kliknij swoje zdjęcie profilowe w prawym górnym rogu.",
    step3: "Wybierz \"Twoja oś czasu\".",
    step4: "Kliknij ikonę menu (prawy górny róg) i \"Ustawienia i prywatność\".",
    step5: "Zjedź na dół i kliknij \"Eksportuj dane osi czasu\".",
    step6: "Gotowy plik wgraj tutaj na stronie!",
    gotIt: "Wszystko jasne, działamy!"
  },
  en: {
    secureBadge: "Secure. Data vanishes when you close the tab.",
    title: "Have we met before?",
    subtitle: "Check if your life path crossed with the other person before you officially met.",
    howToData: "How to get your location data?",
    hostTitle: "Person 1 (Host)",
    hostDesc: "Upload your file to open a secure room.",
    readyHost: "Your memories added",
    readyPts: "We will analyze {n} points on the map.",
    guestTitle: "Person 2 (Guest)",
    inviteGuest: "Invite Guest",
    scanOrPin: "Scan QR with phone or enter PIN.",
    roomCode: "Room Code",
    copyLink: "Copy link",
    copied: "Copied!",
    waiting: "Waiting to join...",
    guestJoined: "Friend joined!",
    guestJoinedDesc: "Encrypted P2P. Received {n} points.",
    guestReadyManual: "Person 2 Ready",
    guestManualDesc: "{n} points entered manually.",
    openScanner: "Open QR Scanner",
    pinPlaceholder: "PIN code...",
    orTraditionally: "Or traditionally",
    testMode: "Test Mode (Generate)",
    searchParams: "Search parameters",
    distLabel: "We were closer than...",
    timeLabel: "In a time window of...",
    presetParty: "Club/Building",
    presetFest: "Festival/Area",
    presetCity: "Same city",
    analyzeBtn: "Discover the truth",
    analyzingBtn: "Analyzing history...",
    foundMatches: "We found your crossed paths!",
    noMatches: "😔 Unfortunately, no intersections found.",
    distance: "You were apart by",
    showMore: "Show more meetings",
    aiShortBtn: "Where was this? (Quick)",
    aiLocating: "Locating place in time and space...",
    aiMapPoint: "Your point on the map:",
    aiPremiumBtn: "Generate full story",
    aiPremiumLock: "Premium Feature",
    aiGenerating: "Artificial Intelligence is creating magic...",
    aiStoryTitle: "Magic of the moment (Full story):",
    aiSources: "Historical sources:",
    shareStory: "Share (IG Story)",
    downloading: "Preparing poster...",
    guestModeTitle: "You're joining the session! 🎉",
    guestModeDesc: "Your friend wants to check if you've crossed paths before. Add your Google Maps memories.",
    uploadYourHistory: "Upload your history",
    usuallyFile: "Usually it's a downloaded file",
    connecting: "Establishing secure connection...",
    waitingForHost: "Waiting for the Host to start analysis...",
    resultsReady: "Results are ready! See below.",
    workerInput: "Analyzing input data...",
    workerMatch: "Searching for shared paths...",
    peerErrorTitle: "Connection Error",
    instructionModalDesc: "For full privacy, Google stores your Location History (Timeline) only on your physical device. You need to do a quick export directly from your smartphone.",
    method1: "Method 1: Your Smartphone (Recommended)",
    openTimelineBtn: "Open Timeline (Shortcut)",
    step1: "Open the Google Maps app on your phone (or use the shortcut above).",
    step2: "Tap your profile picture in the top right corner.",
    step3: "Select \"Your Timeline\".",
    step4: "Tap the menu icon (top right) and \"Settings and privacy\".",
    step5: "Scroll down and tap \"Export Timeline data\".",
    step6: "Upload the generated file here on the site!",
    gotIt: "Got it, let's go!"
  }
};

// ============================================================================
// WEB WORKER
// ============================================================================
const workerScript = `
  function getDistanceFromLatLonInM(lat1, lon1, lat2, lon2) {
    const R = 6371e3; 
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  self.onmessage = function(e) {
    const { dataA, dataB, config } = e.data;
    const { maxDistanceMeters, maxTimeDiffMs } = config;

    self.postMessage({ type: 'STATUS', msgId: 'workerInput' });
    const bucketsA = {};
    dataA.forEach(pt => {
      const day = new Date(pt.time).toISOString().split('T')[0];
      if (!bucketsA[day]) bucketsA[day] = [];
      bucketsA[day].push(pt);
    });

    const matches = [];
    self.postMessage({ type: 'STATUS', msgId: 'workerMatch' });
    
    dataB.forEach((ptB, index) => {
      if (index % 5000 === 0) self.postMessage({ type: 'PROGRESS', percent: Math.round((index / dataB.length) * 100) });
      const dayB = new Date(ptB.time).toISOString().split('T')[0];
      
      if (bucketsA[dayB]) {
        for (let i = 0; i < bucketsA[dayB].length; i++) {
          const ptA = bucketsA[dayB][i];
          const timeDiff = Math.abs(ptA.time - ptB.time);
          if (timeDiff <= maxTimeDiffMs) {
            const distance = getDistanceFromLatLonInM(ptA.lat, ptA.lon, ptB.lat, ptB.lon);
            if (distance <= maxDistanceMeters) {
              matches.push({ time: ptA.time, distance: Math.round(distance), lat: ptA.lat, lon: ptA.lon, timeDiffSec: Math.round(timeDiff / 1000) });
            }
          }
        }
      }
    });

    const uniqueMatches = [];
    let lastMatchTime = 0;
    matches.sort((a, b) => a.time - b.time).forEach(m => {
        if (m.time - lastMatchTime > 30 * 60 * 1000) { uniqueMatches.push(m); lastMatchTime = m.time; }
    });

    self.postMessage({ type: 'DONE', matches: uniqueMatches });
  };
`;

// NORMALIZACJA
const normalizeData = (data: any): any[] => {
  const normalized: any[] = [];
  const parseGeo = (geoStr: any): any => {
    if (typeof geoStr === 'string' && geoStr.startsWith('geo:')) {
      const parts = geoStr.substring(4).split(',');
      if (parts.length >= 2) return { lat: parseFloat(parts[0]), lon: parseFloat(parts[1]) };
    }
    return null;
  };
  const addPoint = (latRaw: any, lonRaw: any, timeRaw: any) => {
    if (latRaw === undefined || lonRaw === undefined || timeRaw === undefined) return;
    let lat = latRaw > 1000 || latRaw < -1000 ? latRaw / 1e7 : parseFloat(latRaw);
    let lon = lonRaw > 1000 || lonRaw < -1000 ? lonRaw / 1e7 : parseFloat(lonRaw);
    let time = typeof timeRaw === 'string' ? (/^\d+$/.test(timeRaw) ? parseInt(timeRaw, 10) : new Date(timeRaw).getTime()) : parseInt(timeRaw, 10);
    if (!isNaN(lat) && !isNaN(lon) && time && !isNaN(time)) normalized.push({ time, lat, lon });
  };

  if (data && data.locations && Array.isArray(data.locations)) {
    data.locations.forEach((pt: any) => addPoint(pt.latitudeE7 || pt.lat, pt.longitudeE7 || pt.lon, pt.timestampMs || pt.timestamp || pt.time));
  } else if (data && data.timelineObjects && Array.isArray(data.timelineObjects)) {
    data.timelineObjects.forEach((obj: any) => {
      if (obj.placeVisit && obj.placeVisit.location) addPoint(obj.placeVisit.location.latitudeE7 || obj.placeVisit.location.lat, obj.placeVisit.location.longitudeE7 || obj.placeVisit.location.lon, obj.placeVisit.duration?.startTimestamp || obj.placeVisit.location.timestamp);
      if (obj.activitySegment) {
         if (obj.activitySegment.startLocation) addPoint(obj.activitySegment.startLocation.latitudeE7, obj.activitySegment.startLocation.longitudeE7, obj.activitySegment.duration?.startTimestamp);
         if (obj.activitySegment.endLocation) addPoint(obj.activitySegment.endLocation.latitudeE7, obj.activitySegment.endLocation.longitudeE7, obj.activitySegment.duration?.endTimestamp);
      }
    });
  } else if (Array.isArray(data)) {
    if (data.length > 0 && data[0].startTime) {
      data.forEach((item: any) => {
        const baseTime = new Date(item.startTime).getTime();
        if (item.timelinePath && Array.isArray(item.timelinePath)) {
          item.timelinePath.forEach((pathPt: any) => {
            const coords = parseGeo(pathPt.point);
            if (coords) addPoint(coords.lat, coords.lon, baseTime + (parseInt(pathPt.durationMinutesOffsetFromStartTime || 0)) * 60000);
          });
        }
        if (item.activity) {
          const startCoords = parseGeo(item.activity.start); const endCoords = parseGeo(item.activity.end);
          if (startCoords) addPoint(startCoords.lat, startCoords.lon, baseTime);
          if (endCoords) addPoint(endCoords.lat, endCoords.lon, new Date(item.endTime).getTime());
        }
      });
    } else data.forEach((pt: any) => addPoint(pt.latitudeE7 || pt.lat, pt.longitudeE7 || pt.lon, pt.timestampMs || pt.timestamp || pt.time));
  }
  return normalized;
};

// ============================================================================
// KOMPONENT MAPY
// ============================================================================
const MapView = ({ matches }: { matches: any[] }) => {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<any>(null);

  useEffect(() => {
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link'); link.id = 'leaflet-css'; link.rel = 'stylesheet'; link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'; document.head.appendChild(link);
    }
    if (!document.getElementById('leaflet-js')) {
      const script = document.createElement('script'); script.id = 'leaflet-js'; script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'; script.async = true; document.head.appendChild(script);
    }
    const checkL = setInterval(() => {
      if ((window as any).L && mapRef.current) {
        clearInterval(checkL);
        (window as any).L.Icon.Default.imagePath = 'https://unpkg.com/leaflet@1.9.4/dist/images/';
        if (!mapInstance.current) {
          mapInstance.current = (window as any).L.map(mapRef.current);
          (window as any).L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap contributors' }).addTo(mapInstance.current);
        }
        mapInstance.current.eachLayer((layer: any) => { if (layer instanceof (window as any).L.Marker) mapInstance.current.removeLayer(layer); });
        if (matches && matches.length > 0) {
          const bounds = (window as any).L.latLngBounds();
          matches.forEach((m: any) => {
            const date = new Date(m.time);
            (window as any).L.marker([m.lat, m.lon]).addTo(mapInstance.current).bindPopup(`<div style="font-family: ui-sans-serif, system-ui, sans-serif; padding: 4px;"><div style="color: #e11d48; font-weight: 700; font-size: 14px; margin-bottom: 4px;">📍 Wspólny punkt</div><div style="color: #4b5563; font-size: 12px;">${date.toLocaleDateString()} ${date.toLocaleTimeString()}</div><div style="color: #111827; font-size: 13px; font-weight: 500; margin-top: 4px;">Dystans: ${m.distance}m</div></div>`);
            bounds.extend([m.lat, m.lon]);
          });
          if (matches.length === 1) mapInstance.current?.setView([matches[0].lat, matches[0].lon], 16);
          else mapInstance.current?.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
          setTimeout(() => { if (mapInstance.current) mapInstance.current?.invalidateSize(); }, 250);
        }
      }
    }, 100);
    return () => clearInterval(checkL);
  }, [matches]);

  if (!matches || matches.length === 0) return null;
  return (
    <div className="mt-8 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm relative z-0">
      <div ref={mapRef} className="w-full h-[400px] bg-gray-50 dark:bg-gray-800" />
    </div>
  );
};

// ============================================================================
// KOMPONENT AI (Wyłącznie generowanie tekstu)
// ============================================================================
const GeminiStory = ({ match, lang, t }: { match: any, lang: string, t: any }) => {
  const [shortStory, setShortStory] = useState<string | null>(null);
  const [longStory, setLongStory] = useState<string | null>(null);
  const [isLoadingShort, setIsLoadingShort] = useState<boolean>(false);
  const [isLoadingLong, setIsLoadingLong] = useState<boolean>(false);
  const [sources, setSources] = useState<any[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Zaktualizowany odczyt klucza API dla Cloudflare
  let apiKey = "";
  try {
    // @ts-ignore
    apiKey = import.meta.env.VITE_GEMINI_API_KEY || "";
  } catch (e) {}

  const dateStr = new Date(match.time).toLocaleDateString(lang === 'pl' ? 'pl-PL' : 'en-US');
  const timeStr = new Date(match.time).toLocaleTimeString(lang === 'pl' ? 'pl-PL' : 'en-US', { hour: '2-digit', minute:'2-digit' });

  const fetchWithRetry = async (url: string, options: any, retries = 5): Promise<any> => {
    let delay = 1000;
    for (let i = 0; i < retries; i++) {
      try {
        const res = await fetch(url, options);
        if (!res.ok) {
           const errBody = await res.text();
           console.error("Gemini API Error:", errBody);
           throw new Error(`HTTP error! status: ${res.status}`);
        }
        return await res.json();
      } catch (e) {
        if (i === retries - 1) throw e;
        await new Promise(r => setTimeout(r, delay));
        delay *= 2;
      }
    }
  };

  const generateShortStory = async () => {
    if (!apiKey) {
      setErrorMsg(lang === 'pl' ? "Błąd: Brak klucza API." : "Error: Missing API Key.");
      return;
    }
    setIsLoadingShort(true);
    setErrorMsg(null);

    let promptParams = lang === 'pl' 
      ? "Napisz maksymalnie 2 krótkie zdania podsumowania po polsku, gdzie się minęli na podstawie tych współrzędnych."
      : "Write max 2 short sentences in English summarizing where they crossed paths based on these coordinates.";
      
    // ZRESTYKCYJNY PROMPT DLA WIĘKSZEJ PRECYZJI
    const prompt = `Data: ${dateStr}, Godzina: ${timeStr}. Lat: ${match.lat}, Lon: ${match.lon}. Dystans: ${match.distance}m. 
    WAŻNE: Działasz jako super precyzyjny geolokator. Zidentyfikuj DOKŁADNE miejsce pod tymi współrzędnymi GPS. Jeśli to zwykła ulica, podaj jej nazwę. NIE UŻYWAJ i nie "przyklejaj" tego punktu do nazw pobliskich dużych obiektów (np. galerii handlowych jak Wroclavia, stadionów, rynków), chyba że współrzędne znajdują się BEZPOŚREDNIO wewnątrz tych obiektów.
    ${promptParams} Bądź zwięzły i zaintryguj ich podając najdokładniejszą lokalizację.`;

    const payload = {
      contents: [{ parts: [{ text: prompt }] }],
      tools: [{ googleSearch: {} }],
      systemInstruction: { parts: [{ text: "Jesteś asystentem podającym krótkie i ekstremalnie precyzyjne fakty geograficzne. Respond in requested language." }] }
    };

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`;
      const data = await fetchWithRetry(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const candidate = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!candidate) throw new Error("No data");
      setShortStory(candidate);
      setSources(data.candidates?.[0]?.groundingMetadata?.groundingAttributions?.map((a: any) => ({ uri: a.web?.uri, title: a.web?.title })).filter((a: any) => a.uri) || []);
    } catch (e) {
      setErrorMsg(lang === 'pl' ? "Magia AI chwilowo zawiodła (sprawdź klucz API)." : "AI magic failed (check API key).");
    } finally {
      setIsLoadingShort(false);
    }
  };

  const generateLongStory = async () => {
    setIsLoadingLong(true);
    let promptParams = lang === 'pl' 
      ? "Napisz 4-5 zdań intrygującej historii po polsku. Styl: ciepły, poetycki."
      : "Write 4-5 sentences of an intriguing, romantic story in English about how they might have passed each other here.";

    const prompt = `Lat: ${match.lat}, Lon: ${match.lon}. ${promptParams} Znane tło (Trzymaj się DOKŁADNIE tej lokalizacji, nie wspominaj o pobliskich większych budynkach): ${shortStory}.`;
    const payload = {
      contents: [{ parts: [{ text: prompt }] }],
      tools: [{ googleSearch: {} }],
      systemInstruction: { parts: [{ text: "Jesteś narratorem piszącym romantyczne opowieści." }] }
    };

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`;
      const data = await fetchWithRetry(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const candidate = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!candidate) throw new Error("No data");
      setLongStory(candidate);
      const newSources = data.candidates?.[0]?.groundingMetadata?.groundingAttributions?.map((a: any) => ({ uri: a.web?.uri, title: a.web?.title })).filter((a: any) => a.uri) || [];
      setSources(prev => [...prev, ...newSources].filter((v, i, a) => a.findIndex(t => (t.uri === v.uri)) === i));
    } catch (e) {
      setErrorMsg(lang === 'pl' ? "Błąd pełnej historii." : "Error generating full story.");
    } finally {
      setIsLoadingLong(false);
    }
  };

  return (
    <div className="mt-5 border-t border-gray-100 dark:border-gray-800 pt-5 relative z-10 w-full">
      {!shortStory && !isLoadingShort && (
        <button onClick={generateShortStory} className="flex items-center gap-2 text-sm px-5 py-2.5 bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 rounded-full transition-colors border border-indigo-200 dark:border-indigo-800/50 font-medium w-full sm:w-auto justify-center group hide-on-export">
          <Sparkles size={16} className="text-indigo-500 group-hover:animate-spin" />
          {t.aiShortBtn}
        </button>
      )}

      {isLoadingShort && (
        <div className="flex items-center gap-2 text-sm text-indigo-600 dark:text-indigo-400 animate-pulse bg-indigo-50/50 dark:bg-indigo-900/20 p-4 rounded-2xl font-medium w-fit hide-on-export">
          <Activity size={16} className="animate-spin" /> {t.aiLocating}
        </div>
      )}

      {errorMsg && (
         <div className="text-sm text-red-500 mt-2 flex items-center gap-1 font-medium hide-on-export"><TriangleAlert size={14}/> {errorMsg}</div>
      )}

      {shortStory && (
        <div className="story-content-container bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 p-5 rounded-2xl border border-indigo-100/50 dark:border-indigo-800/30 shadow-sm relative overflow-hidden transition-all">
          <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none icon-sparkle-bg"><Sparkles size={64} /></div>
          <div className="flex items-center gap-2 mb-3 text-indigo-800 dark:text-indigo-300 font-bold text-sm relative z-10 ai-title">
            <MapPin size={16} className="text-indigo-600 dark:text-indigo-400" /> {t.aiMapPoint}
          </div>
          <p className="text-sm text-gray-800 dark:text-gray-200 font-medium leading-relaxed relative z-10 ai-text">{shortStory}</p>
          
          {!longStory && !isLoadingLong && (
             <div className="mt-5 pt-4 border-t border-indigo-100 dark:border-indigo-800/50 flex flex-col sm:flex-row items-center justify-between gap-3 relative z-10 hide-on-export">
                <span className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <Lock size={12} className="text-amber-500" /> {t.aiPremiumLock}
                </span>
                <button onClick={generateLongStory} className="flex items-center gap-2 text-sm px-5 py-2.5 bg-gradient-to-r from-rose-400 to-pink-500 hover:from-rose-500 hover:to-pink-600 text-white rounded-full transition-all shadow-md font-bold w-full sm:w-auto justify-center group hover:scale-[1.02] active:scale-95">
                  <Sparkles size={16} className="group-hover:animate-pulse" /> {t.aiPremiumBtn}
                </button>
             </div>
          )}
          {isLoadingLong && (
            <div className="mt-5 pt-4 border-t border-indigo-100 dark:border-indigo-800/50 flex flex-col gap-2 text-sm text-rose-500 dark:text-rose-400 animate-pulse font-bold relative z-10 hide-on-export">
              <div className="flex items-center gap-2"><Sparkles size={16} /> {t.aiGenerating}</div>
            </div>
          )}
          {longStory && (
            <div className="mt-5 pt-5 border-t border-indigo-200 dark:border-indigo-800/50 animate-fade-in relative z-10 generated-long-story">
              <div className="flex items-center gap-2 mb-3 text-rose-600 dark:text-rose-400 font-bold text-sm ai-title">
                <Sparkles size={16} /> {t.aiStoryTitle}
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed italic ai-text font-serif">"{longStory}"</p>
            </div>
          )}
          {sources.length > 0 && (
            <div className="mt-5 pt-3 border-t border-indigo-200/50 dark:border-indigo-800/50 text-xs text-gray-500 dark:text-gray-400 flex flex-col gap-2 relative z-10 hide-on-export">
              <span className="font-semibold text-gray-600 dark:text-gray-300">{t.aiSources}</span>
              <div className="flex flex-wrap gap-2">
                {sources.slice(0, 3).map((s: any, idx: number) => (
                  <a key={idx} href={s.uri} target="_blank" rel="noreferrer" className="bg-white dark:bg-gray-800 px-2 py-1 rounded-md text-indigo-600 dark:text-indigo-400 shadow-sm border border-indigo-100 dark:border-gray-700 hover:underline inline-block truncate max-w-[250px]" title={s.title}>🔗 {s.title || "Link"}</a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// KOMPONENT KARTY SPOTKANIA (Z LOGIKĄ UDOSTĘPNIANIA)
// ============================================================================
const MatchCard = ({ match, lang, t }: { match: any, lang: string, t: any }) => {
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const date = new Date(match.time);
  const dateStr = date.toLocaleDateString(lang === 'pl' ? 'pl-PL' : 'en-US');
  
  const handleShare = async () => {
    const win = window as any;
    if (!win.html2canvas) return;
    const element = document.getElementById(`story-card-${match.time}`);
    if (!element) return;
    
    setIsDownloading(true);
    try {
      element.classList.add('exporting-card');
      const canvas = await win.html2canvas(element, { 
        backgroundColor: '#1e1b4b', 
        scale: 3, 
        useCORS: true
      });
      element.classList.remove('exporting-card');
      
      const image = canvas.toDataURL("image/png");
      const fileName = `HaveWeMet-${dateStr.replace(/\//g, '-')}.png`;

      try {
        const response = await fetch(image);
        const blob = await response.blob();
        const file = new File([blob], fileName, { type: 'image/png' });

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          // TIP: Samo przesłanie pliku (bez text i title) wymusza w wielu smartfonach (szczególnie iOS)
          // wywołanie opcji graficznych udostępniania, gdzie Instagram Story / Snapchat grają pierwsze skrzypce!
          await navigator.share({
            files: [file]
          });
        } else {
          throw new Error("Web Share API not supported");
        }
      } catch (shareErr) {
        // Fallback dla komputerów stacjonarnych lub w przypadku przerwania okna dialogowego
        const link = document.createElement('a');
        link.download = fileName;
        link.href = image;
        link.click();
      }
    } catch (e) {
      console.error(e);
      element.classList.remove('exporting-card');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div id={`story-card-${match.time}`} className="relative bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-3xl flex flex-col gap-4 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow group overflow-hidden w-full">
      {/* Znak wodny, ukryty normalnie, widoczny TYLKO na obrazku udostępnionym na Insta */}
      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 hidden watermark-only"></div>
      <div className="absolute bottom-10 left-0 right-0 text-center hidden watermark-only">
         <span className="text-white/80 font-black tracking-[0.4em] text-sm drop-shadow-lg">📍 HAVEWEMET.APP</span>
      </div>

      {/* Kontener nagłówka wymuszający bezpieczny Flexbox przy renderowaniu Canvas */}
      <div className="flex flex-row items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-4 relative z-10 w-full">
        <div className="flex flex-col flex-1 shrink-0">
          <div className="text-2xl font-black text-rose-500 tracking-tight mb-1">{date.toLocaleDateString(lang === 'pl' ? 'pl-PL' : 'en-US')}</div>
          <div className="text-gray-500 dark:text-gray-400 font-medium text-sm flex items-center gap-2">
            <span>{date.toLocaleTimeString(lang === 'pl' ? 'pl-PL' : 'en-US', { hour: '2-digit', minute:'2-digit' })}</span>
          </div>
        </div>
        {/* Pigułka z odległością. Użyto align-items i shrink-0 dla powstrzymania zgniatania w html2canvas */}
        <div className="flex justify-end items-center shrink-0 pl-4">
          <div className="text-sm font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/30 px-4 py-2 rounded-xl flex items-center justify-center gap-2 border border-indigo-100 dark:border-indigo-800/50 whitespace-nowrap">
             <MapPin size={16} className="shrink-0"/> {t.distance}: {match.distance} m
          </div>
        </div>
      </div>
      
      <GeminiStory match={match} lang={lang} t={t} />

      {/* Przycisk udostępniania dostępny niezależnie od tego czy użyto AI */}
      <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-end relative z-10 hide-on-export">
        <button onClick={handleShare} disabled={isDownloading} className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:scale-105 transition-transform rounded-full font-bold shadow-lg w-full sm:w-auto active:scale-95 disabled:opacity-70 disabled:hover:scale-100">
           {isDownloading ? <Activity size={16} className="animate-spin" /> : <Share2 size={16} />} 
           {isDownloading ? t.downloading : t.shareStory}
        </button>
      </div>
    </div>
  );
};


// ============================================================================
// GŁÓWNA APLIKACJA REACT
// ============================================================================
export default function App() {
  const [lang, setLang] = useState<string>('pl');
  const [theme, setTheme] = useState<string>('light');
  const t = dict[lang];

  const [fileA, setFileA] = useState<any[] | null>(null);
  const [fileB, setFileB] = useState<any[] | null>(null);
  const [errorA, setErrorA] = useState<string | null>(null);
  const [errorB, setErrorB] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [statusMsgId, setStatusMsgId] = useState<string>('');
  const [results, setResults] = useState<any[] | null>(null);
  const [visibleCount, setVisibleCount] = useState<number>(5); 
  const [showInstructions, setShowInstructions] = useState<boolean>(false);
  
  const [maxDistance, setMaxDistance] = useState<number>(50);
  const [maxTimeDiff, setMaxTimeDiff] = useState<number>(5);

  const workerRef = useRef<Worker | null>(null);

  const [isGuestMode, setIsGuestMode] = useState<boolean>(false);
  const [peerStatus, setPeerStatus] = useState<string>('offline'); 
  const [peerId, setPeerId] = useState<string>(''); 
  const [joinLink, setJoinLink] = useState<string>('');
  const [manualJoinCode, setManualJoinCode] = useState<string>(''); 
  const [copySuccess, setCopySuccess] = useState<boolean>(false); 
  
  // @ts-ignore
  const [peerError, setPeerError] = useState<string | null>(null);
  
  const [peerConnection, setPeerConnection] = useState<any>(null);
  const peerInstance = useRef<any>(null);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    if (!document.getElementById('tailwind-config')) {
      const configScript = document.createElement('script');
      configScript.id = 'tailwind-config';
      configScript.innerHTML = "window.tailwind = { config: { darkMode: 'class' } };";
      document.head.insertBefore(configScript, document.head.firstChild);
    }

    if (!document.getElementById('tailwind-cdn')) {
      const script = document.createElement('script');
      script.id = 'tailwind-cdn';
      script.src = 'https://cdn.tailwindcss.com';
      document.head.appendChild(script);
    }

    if (!document.getElementById('html2canvas-script')) {
      const script = document.createElement('script');
      script.id = 'html2canvas-script';
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
      document.head.appendChild(script);
    }

    const blob = new Blob([workerScript], { type: 'application/javascript' });
    workerRef.current = new Worker(URL.createObjectURL(blob));

    workerRef.current.onmessage = (e: MessageEvent) => {
      const { type, msgId, percent, matches } = e.data;
      if (type === 'STATUS') setStatusMsgId(msgId);
      if (type === 'PROGRESS') setProgress(percent);
      if (type === 'DONE') {
        setResults(matches);
        setIsProcessing(false);
        setStatusMsgId('resultsReady');
        setProgress(100);
      }
    };

    const params = new URLSearchParams(window.location.search);
    const hostId = params.get('join');
    if (hostId) {
      setIsGuestMode(true);
      initPeerJS().then(() => connectToHost(hostId));
    }

    return () => { 
      workerRef.current?.terminate(); 
      if (peerInstance.current) peerInstance.current.destroy(); 
    };
  }, []);

  useEffect(() => {
    if (results && peerConnection && !isGuestMode) peerConnection.send({ type: 'RESULTS', data: results });
  }, [results, peerConnection, isGuestMode]);

  useEffect(() => {
    if (peerConnection && isGuestMode && fileA) {
      peerConnection.send({ type: 'GUEST_DATA', data: fileA });
      setStatusMsgId('waitingForHost');
    }
  }, [fileA, peerConnection, isGuestMode]);

  const loadPeerJSScript = (): Promise<void> => {
    return new Promise<void>((resolve) => {
      if ((window as any).Peer) return resolve();
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/peerjs@1.5.2/dist/peerjs.min.js';
      script.onload = () => resolve();
      document.head.appendChild(script);
    });
  };

  const initPeerJS = async (): Promise<string> => {
    await loadPeerJSScript();
    return new Promise<string>((resolve, reject) => {
      const idToUse = Math.random().toString(36).substring(2, 8).toUpperCase();
      const peer = new (window as any).Peer(idToUse, { config: { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] } });
      peer.on('open', (id: string) => { peerInstance.current = peer; resolve(id); });
      peer.on('error', (err: any) => { setPeerStatus('offline'); setPeerError(err.type); reject(err); });
    });
  };

  const startHosting = async () => {
    if (!fileA) { setErrorA("Dodaj plik!"); return; }
    setPeerStatus('hosting');
    try {
      const id = await initPeerJS();
      setPeerId(id);
      let base = window.location.href;
      if (base === 'about:srcdoc' || base.startsWith('data:')) base = 'https://czysieznamy.pl/'; 
      try { const url = new URL(base); url.searchParams.set('join', id); setJoinLink(url.toString()); } 
      catch (e) { setJoinLink(`https://czysieznamy.pl/?join=${id}`); }

      peerInstance.current?.on('connection', (conn: any) => {
        setPeerConnection(conn); setPeerStatus('connected');
        conn.on('data', (payload: any) => { if (payload.type === 'GUEST_DATA') setFileB(payload.data); });
      });
    } catch (e) {}
  };

  const handleManualJoin = async () => {
    if (!manualJoinCode.trim()) return;
    setIsGuestMode(true);
    try { await initPeerJS(); connectToHost(manualJoinCode.trim().toUpperCase()); } catch (e) {}
  };

  const connectToHost = (hostId: string) => {
    setPeerStatus('connecting');
    if (!peerInstance.current) return;
    const conn = peerInstance.current.connect(hostId);
    conn.on('open', () => { setPeerConnection(conn); setPeerStatus('connected'); });
    conn.on('data', (payload: any) => {
      if (payload.type === 'RESULTS') { setResults(payload.data); setIsProcessing(false); setProgress(100); setStatusMsgId('resultsReady'); }
    });
  };

  const cancelHosting = () => {
    if (peerInstance.current) peerInstance.current.destroy();
    setPeerStatus('offline'); setJoinLink(''); setPeerId(''); setPeerConnection(null); setFileB(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, setFileFn: React.Dispatch<React.SetStateAction<any[] | null>>, setErrorFn: React.Dispatch<React.SetStateAction<string | null>>) => {
    setErrorFn(null);
    const target = e.target as HTMLInputElement;
    const file = target.files?.[0];
    if (file) {
      if (file.name.toLowerCase().includes('settings.json')) { setErrorFn("To plik Settings. Szukaj Records.json."); target.value = ''; return; }
      const reader = new FileReader();
      reader.onload = (event: ProgressEvent<FileReader>) => {
        try {
          const json = JSON.parse(event.target?.result as string);
          const normalizedData = normalizeData(json);
          if (normalizedData.length > 0) setFileFn(normalizedData);
          else setErrorFn("Plik jest pusty.");
        } catch (error) { setErrorFn("Błąd parsowania pliku."); }
        target.value = '';
      };
      reader.readAsText(file);
    }
  };

  const clearFile = (target: string) => {
    if (target === 'A') { setFileA(null); setErrorA(null); }
    if (target === 'B') { setFileB(null); setErrorB(null); }
    setResults(null); setProgress(0); setVisibleCount(5);
  };

  const startAnalysis = () => {
    if (!fileA || !fileB) return;
    setIsProcessing(true); setProgress(0); setResults(null); setVisibleCount(5);
    workerRef.current?.postMessage({ dataA: fileA, dataB: fileB, config: { maxDistanceMeters: maxDistance, maxTimeDiffMs: maxTimeDiff * 60 * 1000 } });
  };

  const copyLink = () => {
    const textArea = document.createElement("textarea"); textArea.value = joinLink;
    textArea.style.position = "fixed"; textArea.style.left = "-9999px"; textArea.style.top = "0";
    document.body.appendChild(textArea); textArea.focus(); textArea.select();
    try { (document as any).execCommand('copy'); setCopySuccess(true); setTimeout(() => setCopySuccess(false), 3000); } catch (err) {}
    document.body.removeChild(textArea);
  };

  const generateFakePartner = (sourceData: any[], setTargetFn: React.Dispatch<React.SetStateAction<any[] | null>>) => {
    if (!sourceData || sourceData.length === 0) return;
    const basePt = sourceData[Math.floor(sourceData.length * Math.random())];
    let fakePath: any[] = []; let curLat = basePt.lat + 0.005; let curLon = basePt.lon + 0.005;
    for (let i = -60; i <= 60; i++) {
      const t = basePt.time + (i * 60000);
      if (i === 0) { curLat = basePt.lat + 0.0001; curLon = basePt.lon + 0.0001; } else { curLat += (Math.random() - 0.5) * 0.001; curLon += (Math.random() - 0.5) * 0.001; }
      fakePath.push({ time: t, lat: curLat, lon: curLon });
    }
    setTargetFn(fakePath); setResults(null); setProgress(0);
  };

  const applyPreset = (dist: number, time: number) => {
    setMaxDistance(dist); setMaxTimeDiff(time);
  };

  const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');
  const toggleLang = () => setLang(lang === 'pl' ? 'en' : 'pl');

  // WSPÓLNE RENDEROWANIE TOP BAR
  const TopBar = () => (
    <div className="absolute top-4 right-4 flex gap-3 z-50">
      <button onClick={toggleLang} className="p-2 rounded-full bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:scale-105 transition-all flex items-center justify-center font-bold text-xs uppercase w-10 h-10">
         <Globe size={16} className="absolute opacity-20" />
         <span className="relative z-10">{lang}</span>
      </button>
      <button onClick={toggleTheme} className="p-2 rounded-full bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:scale-105 transition-all flex items-center justify-center w-10 h-10">
         {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
      </button>
    </div>
  );

  return (
    <div className={theme === 'dark' ? 'dark' : ''}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans p-4 sm:p-8 flex flex-col items-center selection:bg-rose-200 dark:selection:bg-rose-900/50 transition-colors duration-300">
        <TopBar />

        {isGuestMode ? (
          // ================= RENDEROWANIE: TRYB GOŚCIA =================
          <>
            <div className="absolute top-6 left-6 hidden sm:block">
              <div className="flex items-center justify-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-full shadow-sm border border-gray-100 dark:border-gray-700 text-xs font-medium text-gray-600 dark:text-gray-300">
                 <Lock size={14} className="text-emerald-500" /> {t.secureBadge}
              </div>
            </div>

            <div className="text-center max-w-xl mb-10 mt-12">
              <h1 className="text-4xl font-extrabold tracking-tight mb-4 flex items-center justify-center gap-3">
                <HeartHandshake size={36} className="text-rose-500" /> {t.guestModeTitle}
              </h1>
              <p className="text-gray-500 dark:text-gray-400 text-lg">{t.guestModeDesc}</p>
              
              <button onClick={() => setShowInstructions(true)} className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-full text-sm font-bold shadow-sm border border-gray-200 dark:border-gray-700 transition-all hover:scale-105 active:scale-95">
                <CircleHelp size={18} className="text-indigo-500" /> {t.howToData}
              </button>
            </div>

            {peerError && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl text-red-700 dark:text-red-400 flex items-center gap-3 w-full max-w-md shadow-sm animate-fade-in">
                <TriangleAlert size={24} className="shrink-0 text-red-500" />
                <div className="text-sm">
                  <p className="font-bold">{t.peerErrorTitle}</p>
                  <p>{peerError}</p>
                </div>
              </div>
            )}

            <div className={`w-full max-w-md p-10 rounded-[2rem] flex flex-col items-center justify-center transition-all duration-300 relative shadow-xl ${fileA ? 'bg-emerald-50 dark:bg-emerald-900/20 border-2 border-emerald-100 dark:border-emerald-800' : errorA ? 'bg-red-50 dark:bg-red-900/20 border-2 border-red-100 dark:border-red-800' : 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700'}`}>
              {fileA ? (
                <div className="text-center w-full animate-fade-in">
                  <div className="bg-emerald-100 dark:bg-emerald-900/50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5 shadow-inner">
                    <CircleCheck className="text-emerald-600 dark:text-emerald-400 w-10 h-10" />
                  </div>
                  <h3 className="font-bold text-2xl text-emerald-800 dark:text-emerald-300 mb-2">{t.readyHost}</h3>
                  <p className="text-sm text-emerald-600 dark:text-emerald-400 mb-6 font-medium">{t.readyPts.replace('{n}', fileA.length.toLocaleString('pl-PL'))}</p>
                  
                  <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-emerald-50 dark:border-emerald-900/30">
                    {peerStatus === 'connected' && !results ? (
                      <div className="flex flex-col items-center justify-center gap-3 text-indigo-600 dark:text-indigo-400 font-semibold text-center">
                        <Activity size={28} className="animate-spin text-indigo-400" /> <span>{t.waitingForHost}</span>
                      </div>
                    ) : results ? (
                      <div className="text-rose-500 font-bold flex flex-col items-center justify-center gap-3">
                        <Sparkles size={28} className="animate-pulse" /> <span>{t.resultsReady}</span>
                      </div>
                    ) : (
                      <div className="text-amber-500 flex flex-col items-center justify-center gap-3 font-medium">
                        <Wifi size={28} className="animate-pulse" /> <span>{t.connecting}</span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="w-full flex flex-col items-center">
                  <div className="bg-gray-50 dark:bg-gray-900 w-20 h-20 rounded-full flex items-center justify-center mb-6 border border-gray-100 dark:border-gray-700">
                    <CloudUpload className={`w-10 h-10 ${errorA ? 'text-red-400' : 'text-indigo-500'}`} />
                  </div>
                  <h3 className="font-bold text-xl mb-2">{t.uploadYourHistory}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-8">{t.usuallyFile} <code className="bg-gray-100 dark:bg-gray-900 px-1.5 py-0.5 rounded text-indigo-600 dark:text-indigo-400 font-mono text-xs">Records.json</code></p>
                  
                  <div className="relative w-full group">
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-rose-500 rounded-full blur opacity-20 group-hover:opacity-40 transition-opacity"></div>
                    <input type="file" accept=".json" onChange={(e) => handleFileUpload(e, setFileA, setErrorA)} className="relative text-sm file:mr-4 file:py-3 file:px-6 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-900 dark:file:bg-gray-700 file:text-white hover:file:bg-gray-800 dark:hover:file:bg-gray-600 w-full cursor-pointer bg-white dark:bg-gray-800 rounded-full border border-gray-200 dark:border-gray-700 shadow-sm" />
                  </div>
                  {errorA && (<div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-2xl text-sm text-red-700 dark:text-red-400 flex items-start gap-3 w-full"><TriangleAlert size={20} className="shrink-0" /><span>{errorA}</span></div>)}
                </div>
              )}
            </div>

            {results && (
              <div className="w-full max-w-3xl mt-12 animate-fade-in">
                <h2 className="text-3xl font-extrabold text-gray-900 dark:text-gray-100 mb-8 flex items-center justify-center gap-3">
                  {results.length > 0 ? <><Sparkles className="text-rose-500"/> {t.foundMatches}</> : t.noMatches}
                </h2>
                <div className="space-y-6">
                  {/* STYLE CSS - EFEKT PREMIUM PLAKATU DLA WYEKSPORTOWANEGO SHARE CARD */}
                  <style>{`
                    .exporting-card .hide-on-export { display: none !important; }
                    .exporting-card .watermark-only { display: block !important; }
                    .exporting-card {
                      background: linear-gradient(150deg, #1e1b4b 0%, #312e81 40%, #701a75 100%) !important;
                      color: #f8fafc !important;
                      border-radius: 40px !important;
                      padding: 80px 50px 140px 50px !important;
                      border: none !important;
                      box-shadow: none !important;
                      display: flex !important;
                      flex-direction: column !important;
                      justify-content: center !important;
                      min-height: 850px !important;
                    }
                    .exporting-card .text-rose-500 { color: #fb7185 !important; }
                    .exporting-card .text-indigo-500, .exporting-card .text-indigo-600, .exporting-card .text-indigo-700 { color: #c7d2fe !important; }
                    .exporting-card .text-gray-500, .exporting-card .text-gray-600, .exporting-card .text-gray-700, .exporting-card .text-gray-800 { color: #e2e8f0 !important; }
                    .exporting-card .border-gray-100, .exporting-card .border-b, .exporting-card .border-indigo-100, .exporting-card .border-indigo-200 { border-color: rgba(255,255,255,0.15) !important; }
                    .exporting-card .bg-indigo-50, .exporting-card .bg-gray-50, .exporting-card .bg-white { background: rgba(255,255,255,0.1) !important; border: 1px solid rgba(255,255,255,0.2) !important; backdrop-filter: blur(10px); }
                    .exporting-card .story-content-container { background: rgba(0,0,0,0.2) !important; border: 1px solid rgba(255,255,255,0.1) !important; padding: 40px !important; margin-top: 40px !important; }
                    .exporting-card .icon-sparkle-bg { opacity: 0.2 !important; color: #fff !important; }
                    .exporting-card .generated-long-story { border-top: none !important; margin-top: 15px !important; padding-top: 0 !important; }
                  `}</style>
                  
                  {results.slice(0, visibleCount).map((match: any, i: number) => {
                    return <MatchCard key={i} match={match} lang={lang} t={t} />;
                  })}
                  
                  {results.length > visibleCount && (
                    <div className="text-center pt-6">
                      <button onClick={() => setVisibleCount(v => v + 5)} className="px-6 py-3 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full font-bold text-sm transition-colors border border-gray-200 dark:border-gray-700 shadow-sm">
                        {t.showMore} ({results.length - visibleCount})
                      </button>
                    </div>
                  )}
                </div>
                <MapView matches={results} />
              </div>
            )}
          </>
        ) : (
          // ================= RENDEROWANIE: TRYB HOSTA =================
          <>
            <div className="mt-2 mb-8 animate-fade-in hidden sm:block">
              <div className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-gray-800 rounded-full shadow-sm border border-gray-200 dark:border-gray-700 text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300">
                <ShieldCheck size={18} className="text-emerald-500" /> {t.secureBadge}
              </div>
            </div>

            <div className="text-center max-w-3xl mb-12">
              <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight flex items-center justify-center gap-3 sm:gap-4 mb-4">
                <MapPin size={48} className="text-rose-500 hidden sm:block" /> {t.title}
              </h1>
              <p className="text-lg sm:text-xl text-gray-500 dark:text-gray-400 leading-relaxed font-medium">
                {t.subtitle}
              </p>
              <button onClick={() => setShowInstructions(true)} className="mt-8 inline-flex items-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-full text-sm font-bold shadow-sm border border-gray-200 dark:border-gray-700 transition-all hover:scale-105 active:scale-95">
                <CircleHelp size={18} className="text-indigo-500" /> {t.howToData}
              </button>
            </div>

            {peerError && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl text-red-700 dark:text-red-400 flex items-center gap-3 w-full max-w-5xl shadow-sm animate-fade-in">
                <TriangleAlert size={24} className="shrink-0 text-red-500" />
                <div className="text-sm">
                  <p className="font-bold">{t.peerErrorTitle}</p>
                  <p>{peerError}</p>
                </div>
              </div>
            )}

            <div className="flex flex-col lg:flex-row gap-8 w-full max-w-5xl mb-12">
              {/* Osoba A */}
              <div className={`flex-1 p-8 rounded-[2rem] flex flex-col items-center justify-center transition-all duration-300 relative shadow-sm border-2 ${fileA ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800' : errorA ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' : 'bg-white dark:bg-gray-800 border-dashed border-gray-300 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-500'}`}>
                {fileA ? (
                  <div className="text-center w-full animate-fade-in">
                    <button onClick={() => clearFile('A')} className="absolute top-5 right-5 text-gray-400 hover:text-red-500 transition-colors bg-white dark:bg-gray-700 p-2 rounded-full shadow-sm"><Trash2 size={20} /></button>
                    <div className="bg-emerald-100 dark:bg-emerald-900/50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5"><CircleCheck className="text-emerald-600 dark:text-emerald-400 w-10 h-10" /></div>
                    <h3 className="font-bold text-2xl text-emerald-800 dark:text-emerald-300 mb-2">{t.readyHost}</h3>
                    <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">{t.readyPts.replace('{n}', fileA.length.toLocaleString('pl-PL'))}</p>
                  </div>
                ) : (
                  <div className="w-full flex flex-col items-center">
                    <div className="bg-indigo-50 dark:bg-indigo-900/30 w-20 h-20 rounded-full flex items-center justify-center mb-6"><CloudUpload className={`w-10 h-10 ${errorA ? 'text-red-500' : 'text-indigo-600 dark:text-indigo-400'}`} /></div>
                    <h3 className="font-bold text-2xl mb-2">{t.hostTitle}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-8 font-medium">{t.hostDesc}</p>
                    <input type="file" accept=".json" onChange={(e) => handleFileUpload(e, setFileA, setErrorA)} className="text-sm file:mr-4 file:py-3 file:px-6 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-900 dark:file:bg-gray-700 file:text-white hover:file:bg-gray-800 dark:hover:file:bg-gray-600 w-full max-w-[280px] cursor-pointer bg-gray-50 dark:bg-gray-900 rounded-full border border-gray-200 dark:border-gray-700 shadow-sm" />
                    {errorA && (<div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-2xl text-sm text-red-700 dark:text-red-400 flex items-start gap-3 max-w-xs text-left"><TriangleAlert size={20} className="shrink-0 mt-0.5" /><span>{errorA}</span></div>)}
                  </div>
                )}
              </div>

              {/* Osoba B */}
              <div className={`flex-1 p-8 rounded-[2rem] flex flex-col items-center justify-center transition-all duration-300 relative shadow-sm border-2 overflow-hidden ${
                peerStatus === 'hosting' ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800' : 
                peerStatus === 'connected' ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800' : 
                fileB ? 'bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800' : 'bg-white dark:bg-gray-800 border-dashed border-gray-300 dark:border-gray-700 hover:border-indigo-300'
              }`}>
                {peerStatus === 'hosting' ? (
                   <div className="text-center w-full animate-fade-in flex flex-col items-center">
                     <button onClick={cancelHosting} className="absolute top-5 right-5 text-gray-400 hover:text-red-500 bg-white dark:bg-gray-700 p-2 rounded-full shadow-sm"><X size={20} /></button>
                     <h3 className="font-extrabold text-2xl text-indigo-900 dark:text-indigo-300 mb-3 flex items-center justify-center gap-2"><QrCode size={24} className="text-indigo-600 dark:text-indigo-400"/> {t.inviteGuest}</h3>
                     <p className="text-sm text-indigo-700 dark:text-indigo-400 font-medium mb-6">{t.scanOrPin}</p>
                     {joinLink && (
                       <div className="bg-white p-3 rounded-2xl mb-6 shadow-md border border-indigo-100">
                          <img src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(joinLink)}`} alt="QR Code" className="w-[160px] h-[160px]" />
                       </div>
                     )}
                     <div className="bg-white dark:bg-gray-900 border border-indigo-100 dark:border-gray-700 rounded-2xl p-4 mb-6 w-full shadow-sm">
                        <div className="text-xs font-bold text-indigo-400 dark:text-indigo-500 mb-1 uppercase tracking-wider">{t.roomCode}</div>
                        <div className="text-4xl font-mono font-black text-indigo-900 dark:text-indigo-300 tracking-[0.25em]">{peerId}</div>
                     </div>
                     <button onClick={copyLink} className="flex w-full max-w-[200px] items-center justify-center gap-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 px-5 py-3 rounded-full transition-all shadow-md active:scale-95">
                        {copySuccess ? <CircleCheck size={16}/> : <LinkIcon size={16}/>} {copySuccess ? t.copied : t.copyLink}
                     </button>
                     <div className="mt-6 text-sm font-medium text-indigo-500 flex items-center justify-center gap-2"><Activity size={16} className="animate-spin" /> {t.waiting}</div>
                   </div>
                ) : peerStatus === 'connected' && fileB ? (
                   <div className="text-center w-full animate-fade-in">
                     <button onClick={cancelHosting} className="absolute top-5 right-5 text-gray-400 hover:text-red-500 bg-white dark:bg-gray-700 p-2 rounded-full shadow-sm" title="Zakończ sesję"><Trash2 size={20} /></button>
                     <div className="bg-emerald-100 dark:bg-emerald-900/50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5"><Smartphone className="text-emerald-600 dark:text-emerald-400 w-10 h-10" /></div>
                     <h3 className="font-bold text-2xl text-emerald-800 dark:text-emerald-300 mb-2">{t.guestJoined}</h3>
                     <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400 mt-1">{t.guestJoinedDesc.replace('{n}', fileB.length.toLocaleString('pl-PL'))}</p>
                   </div>
                ) : fileB ? (
                   <div className="text-center w-full animate-fade-in">
                     <button onClick={() => clearFile('B')} className="absolute top-5 right-5 text-gray-400 hover:text-red-500 bg-white dark:bg-gray-700 p-2 rounded-full shadow-sm"><Trash2 size={20} /></button>
                     <div className="bg-rose-100 dark:bg-rose-900/50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5"><CircleCheck className="text-rose-600 dark:text-rose-400 w-10 h-10" /></div>
                     <h3 className="font-bold text-2xl text-rose-800 dark:text-rose-300 mb-2">{t.guestReadyManual}</h3>
                     <p className="text-sm font-medium text-rose-600 dark:text-rose-400 mt-1">{t.guestManualDesc.replace('{n}', fileB.length.toLocaleString('pl-PL'))}</p>
                   </div>
                ) : (
                  <div className="w-full flex flex-col items-center">
                    <div className="bg-rose-50 dark:bg-rose-900/30 w-20 h-20 rounded-full flex items-center justify-center mb-6"><QrCode className="w-10 h-10 text-rose-500 dark:text-rose-400" /></div>
                    <h3 className="font-bold text-2xl mb-6">{t.guestTitle}</h3>
                    <button onClick={startHosting} className={`mb-6 w-full max-w-[280px] py-3.5 px-6 rounded-full font-bold text-base shadow-md transition-all flex items-center justify-center gap-2 ${fileA ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 hover:scale-105 active:scale-95' : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed border border-gray-200 dark:border-gray-700'}`}>
                      <Smartphone size={18} /> {t.openScanner}
                    </button>
                    <div className="flex w-full max-w-[280px] gap-2 mb-6">
                        <input type="text" value={manualJoinCode} onChange={(e) => setManualJoinCode(e.target.value.toUpperCase())} placeholder={t.pinPlaceholder} className="flex-1 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-full px-5 py-3 text-sm uppercase placeholder:normal-case font-mono font-bold tracking-wider focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm" maxLength={8} />
                        <button onClick={handleManualJoin} disabled={!manualJoinCode.trim()} className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-5 py-3 rounded-full text-sm font-bold shadow-sm"><ArrowRight size={18} /></button>
                    </div>
                    <div className="relative flex items-center py-2 w-full max-w-[280px] opacity-60">
                      <div className="flex-grow border-t border-gray-300 dark:border-gray-700"></div><span className="flex-shrink-0 mx-4 text-xs font-bold uppercase tracking-widest">{t.orTraditionally}</span><div className="flex-grow border-t border-gray-300 dark:border-gray-700"></div>
                    </div>
                    <input type="file" accept=".json" onChange={(e) => handleFileUpload(e, setFileB, setErrorB)} className="text-xs file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:font-semibold file:bg-gray-100 dark:file:bg-gray-800 file:text-gray-700 dark:file:text-gray-300 hover:file:bg-gray-200 w-full max-w-[280px] mt-4 cursor-pointer text-gray-500 transition-all" />
                    {errorB && (<div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-xl text-xs text-red-700 flex items-start gap-2 max-w-[280px] text-left"><TriangleAlert size={16} className="shrink-0 text-red-500" /><span>{errorB}</span></div>)}
                    {fileA && !errorB && (
                      <button onClick={() => generateFakePartner(fileA, setFileB)} className="mt-6 flex items-center justify-center gap-1.5 px-4 py-2 bg-rose-50 dark:bg-rose-900/30 hover:bg-rose-100 rounded-full text-xs font-bold text-rose-600 transition-colors border border-rose-200 dark:border-rose-800/50 group">
                        <Wand2 size={14} className="group-hover:rotate-12 transition-transform" /> {t.testMode}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="w-full max-w-5xl bg-white dark:bg-gray-800 rounded-[2rem] p-8 sm:p-10 border border-gray-200 dark:border-gray-700 mb-12 shadow-sm">
              <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-700 pb-4 mb-8">
                <h3 className="text-xl font-extrabold flex items-center gap-3"><Settings size={24} className="text-indigo-500" /> {t.searchParams}</h3>
                
                {/* PRESETY */}
                <div className="hidden md:flex gap-2">
                   <button onClick={() => applyPreset(50, 60)} className="text-xs font-bold bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition-colors">{t.presetParty}</button>
                   <button onClick={() => applyPreset(500, 180)} className="text-xs font-bold bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-3 py-1.5 rounded-lg hover:bg-purple-100 transition-colors">{t.presetFest}</button>
                   <button onClick={() => applyPreset(5000, 720)} className="text-xs font-bold bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 px-3 py-1.5 rounded-lg hover:bg-rose-100 transition-colors">{t.presetCity}</button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-700">
                  <label className="flex justify-between text-sm font-bold text-gray-700 dark:text-gray-300 mb-6">
                    <span>{t.distLabel}</span>
                    <span className="text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1 rounded-lg border border-indigo-100 dark:border-indigo-800/50">{maxDistance >= 1000 ? (maxDistance/1000).toFixed(1) + ' km' : maxDistance + ' m'}</span>
                  </label>
                  <input type="range" min="5" max="5000" step="5" value={maxDistance} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMaxDistance(parseInt(e.target.value))} className="w-full h-2 bg-gray-300 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
                </div>
                <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-700">
                  <label className="flex justify-between text-sm font-bold text-gray-700 dark:text-gray-300 mb-6">
                    <span>{t.timeLabel}</span>
                    <span className="text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/30 px-3 py-1 rounded-lg border border-rose-100 dark:border-rose-800/50">{maxTimeDiff >= 60 ? Math.floor(maxTimeDiff/60) + 'h ' + (maxTimeDiff%60) + 'm' : maxTimeDiff + ' min'}</span>
                  </label>
                  <input type="range" min="1" max="1440" step="1" value={maxTimeDiff} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMaxTimeDiff(parseInt(e.target.value))} className="w-full h-2 bg-gray-300 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-rose-500" />
                </div>
              </div>
              
              <div className="md:hidden flex flex-wrap justify-center gap-2 mt-6 pt-6 border-t border-gray-100 dark:border-gray-700">
                 <button onClick={() => applyPreset(50, 60)} className="text-xs font-bold bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 px-3 py-1.5 rounded-lg">{t.presetParty}</button>
                 <button onClick={() => applyPreset(500, 180)} className="text-xs font-bold bg-purple-50 dark:bg-purple-900/30 text-purple-700 px-3 py-1.5 rounded-lg">{t.presetFest}</button>
                 <button onClick={() => applyPreset(5000, 720)} className="text-xs font-bold bg-rose-50 dark:bg-rose-900/30 text-rose-700 px-3 py-1.5 rounded-lg">{t.presetCity}</button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mb-16 w-full max-w-sm justify-center">
              <button onClick={startAnalysis} disabled={!fileA || !fileB || isProcessing} className="w-full py-4 bg-gray-900 dark:bg-white hover:bg-black dark:hover:bg-gray-100 text-white dark:text-gray-900 rounded-full font-extrabold text-lg shadow-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-3 hover:-translate-y-1">
                {isProcessing ? <Activity className="animate-spin" size={24} /> : <Play fill="currentColor" size={20} />} 
                {isProcessing ? t.analyzingBtn : t.analyzeBtn}
              </button>
            </div>

            {isProcessing && (
              <div className="w-full max-w-3xl bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm mb-12">
                <div className="w-full bg-gray-100 dark:bg-gray-900 rounded-full h-3 mb-4 overflow-hidden relative">
                  <div className="bg-gradient-to-r from-indigo-500 to-rose-500 h-3 transition-all duration-300 ease-out rounded-full" style={{ width: `${progress}%` }}></div>
                </div>
                <p className="text-center text-sm font-bold text-gray-500 dark:text-gray-400">{t[statusMsgId] || statusMsgId} <span className="text-indigo-600 dark:text-indigo-400 ml-1">{progress}%</span></p>
              </div>
            )}

            {results && (
              <div className="w-full max-w-4xl bg-white dark:bg-gray-800 rounded-[2rem] p-8 sm:p-12 shadow-xl border border-gray-200 dark:border-gray-700 animate-fade-in relative overflow-hidden">
                {results.length > 0 && <div className="absolute top-0 right-0 p-8 opacity-5"><HeartHandshake size={200} /></div>}
                <h2 className="text-3xl sm:text-4xl font-extrabold mb-10 flex items-center gap-4 relative z-10">
                  {results.length > 0 ? <><Sparkles className="text-rose-500" size={36} /> {t.foundMatches}</> : t.noMatches}
                </h2>
                
                {/* PAGINACJA WYNIKÓW I KARTY */}
                <div className="space-y-6 relative z-10">
                  {/* STYLE CSS - EFEKT PREMIUM PLAKATU DLA WYEKSPORTOWANEGO SHARE CARD */}
                  <style>{`
                    .exporting-card .hide-on-export { display: none !important; }
                    .exporting-card .watermark-only { display: block !important; }
                    .exporting-card {
                      background: linear-gradient(150deg, #1e1b4b 0%, #312e81 40%, #701a75 100%) !important;
                      color: #f8fafc !important;
                      border-radius: 40px !important;
                      padding: 80px 50px 140px 50px !important;
                      border: none !important;
                      box-shadow: none !important;
                      display: flex !important;
                      flex-direction: column !important;
                      justify-content: center !important;
                      min-height: 850px !important;
                    }
                    .exporting-card .text-rose-500 { color: #fb7185 !important; }
                    .exporting-card .text-indigo-500, .exporting-card .text-indigo-600, .exporting-card .text-indigo-700 { color: #c7d2fe !important; }
                    .exporting-card .text-gray-500, .exporting-card .text-gray-600, .exporting-card .text-gray-700, .exporting-card .text-gray-800 { color: #e2e8f0 !important; }
                    .exporting-card .border-gray-100, .exporting-card .border-b, .exporting-card .border-indigo-100, .exporting-card .border-indigo-200 { border-color: rgba(255,255,255,0.15) !important; }
                    .exporting-card .bg-indigo-50, .exporting-card .bg-gray-50, .exporting-card .bg-white { background: rgba(255,255,255,0.1) !important; border: 1px solid rgba(255,255,255,0.2) !important; backdrop-filter: blur(10px); }
                    .exporting-card .story-content-container { background: rgba(0,0,0,0.2) !important; border: 1px solid rgba(255,255,255,0.1) !important; padding: 40px !important; margin-top: 40px !important; }
                    .exporting-card .icon-sparkle-bg { opacity: 0.2 !important; color: #fff !important; }
                    .exporting-card .generated-long-story { border-top: none !important; margin-top: 15px !important; padding-top: 0 !important; }
                  `}</style>
                  
                  {results.slice(0, visibleCount).map((match: any, i: number) => {
                    return <MatchCard key={i} match={match} lang={lang} t={t} />;
                  })}
                  
                  {results.length > visibleCount && (
                    <div className="text-center pt-6">
                      <button onClick={() => setVisibleCount(v => v + 5)} className="px-6 py-3 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full font-bold text-sm transition-colors border border-gray-200 dark:border-gray-700 shadow-sm">
                        {t.showMore} ({results.length - visibleCount})
                      </button>
                    </div>
                  )}
                </div>
                <MapView matches={results} />
              </div>
            )}
          </>
        )}

        {/* MODAL INSTRUKCJI - WSPÓLNY DLA OBU WIDOKÓW */}
        {showInstructions && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-md overflow-y-auto animate-fade-in">
            <div className="bg-white dark:bg-gray-800 rounded-[2rem] p-8 max-w-3xl w-full shadow-2xl relative my-8 border border-gray-100 dark:border-gray-700">
              <button onClick={() => setShowInstructions(false)} className="absolute top-6 right-6 text-gray-400 hover:text-gray-900 dark:hover:text-white bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 p-2 rounded-full transition-all"><X size={24} /></button>
              <h2 className="text-3xl font-extrabold mb-4 flex items-center gap-3 text-gray-900 dark:text-gray-100">
                <CircleHelp size={32} className="text-indigo-500" /> {t.howToData}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-base mb-8 font-medium leading-relaxed">
                {t.instructionModalDesc}
              </p>
              
              <div className="space-y-6">
                <div className="bg-indigo-50/50 dark:bg-indigo-900/20 p-6 rounded-3xl border border-indigo-100 dark:border-indigo-800/50">
                  <h3 className="font-extrabold text-indigo-900 dark:text-indigo-300 mb-4 flex items-center gap-2 text-xl">
                    <Smartphone className="text-indigo-500" /> {t.method1}
                  </h3>
                  
                  {/* Przycisk głębokiego linkowania do osi czasu */}
                  <a href="https://www.google.com/maps/timeline" target="_blank" rel="noopener noreferrer" className="mb-5 flex items-center justify-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-sm transition-all active:scale-95">
                    <MapPin size={18} /> {t.openTimelineBtn}
                  </a>

                  <ol className="space-y-4 text-sm text-gray-700 dark:text-gray-300 list-decimal list-inside font-medium marker:text-indigo-400 marker:font-bold">
                    <li className="pl-2">{t.step1}</li>
                    <li className="pl-2">{t.step2}</li>
                    <li className="pl-2">{t.step3}</li>
                    <li className="pl-2">{t.step4}</li>
                    <li className="pl-2">{t.step5}</li>
                    <li className="pl-2">{t.step6}</li>
                  </ol>
                </div>
              </div>
              
              <div className="mt-10 text-center">
                <button onClick={() => setShowInstructions(false)} className="px-10 py-4 bg-gray-900 dark:bg-white hover:bg-black dark:hover:bg-gray-100 text-white dark:text-gray-900 rounded-full font-extrabold shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all">
                  {t.gotIt}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
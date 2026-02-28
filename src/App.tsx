import React, { useState, useEffect, useRef } from 'react';
import { UploadCloud, MapPin, Activity, CheckCircle, AlertTriangle, Play, Settings, Sliders, HelpCircle, X, Trash2, Wand2, Sparkles, QrCode, Link as LinkIcon, Smartphone, Wifi } from 'lucide-react';

// ============================================================================
// WEB WORKER: Silnik działający w tle (nie blokuje interfejsu)
// ============================================================================
const workerScript = `
  function getDistanceFromLatLonInM(lat1, lon1, lat2, lon2) {
    const R = 6371e3; 
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  self.onmessage = function(e) {
    const { dataA, dataB, config } = e.data;
    const { maxDistanceMeters, maxTimeDiffMs } = config;

    self.postMessage({ type: 'STATUS', msg: 'Grupowanie po dniach...' });
    const bucketsA = {};
    dataA.forEach(pt => {
      const day = new Date(pt.time).toISOString().split('T')[0];
      if (!bucketsA[day]) bucketsA[day] = [];
      bucketsA[day].push(pt);
    });

    const matches = [];
    self.postMessage({ type: 'STATUS', msg: 'Analizowanie skrzyżowań ścieżek...' });
    
    dataB.forEach((ptB, index) => {
      if (index % 5000 === 0) {
        self.postMessage({ type: 'PROGRESS', percent: Math.round((index / dataB.length) * 100) });
      }

      const dayB = new Date(ptB.time).toISOString().split('T')[0];
      
      if (bucketsA[dayB]) {
        for (let i = 0; i < bucketsA[dayB].length; i++) {
          const ptA = bucketsA[dayB][i];
          const timeDiff = Math.abs(ptA.time - ptB.time);

          if (timeDiff <= maxTimeDiffMs) {
            const distance = getDistanceFromLatLonInM(ptA.lat, ptA.lon, ptB.lat, ptB.lon);
            if (distance <= maxDistanceMeters) {
              matches.push({
                time: ptA.time,
                distance: Math.round(distance),
                lat: ptA.lat,
                lon: ptA.lon,
                timeDiffSec: Math.round(timeDiff / 1000)
              });
            }
          }
        }
      }
    });

    const uniqueMatches = [];
    let lastMatchTime = 0;
    matches.sort((a, b) => a.time - b.time).forEach(m => {
        if (m.time - lastMatchTime > 30 * 60 * 1000) {
            uniqueMatches.push(m);
            lastMatchTime = m.time;
        }
    });

    self.postMessage({ type: 'DONE', matches: uniqueMatches });
  };
`;

// ============================================================================
// NORMALIZACJA DANYCH Z GOOGLE TAKEOUT
// ============================================================================
const normalizeData = (data) => {
  const normalized = [];
  
  const parseGeo = (geoStr) => {
    if (typeof geoStr === 'string' && geoStr.startsWith('geo:')) {
      const parts = geoStr.substring(4).split(',');
      if (parts.length >= 2) return { lat: parseFloat(parts[0]), lon: parseFloat(parts[1]) };
    }
    return null;
  };

  const addPoint = (latRaw, lonRaw, timeRaw) => {
    if (latRaw === undefined || lonRaw === undefined || timeRaw === undefined) return;
    let lat = latRaw > 1000 || latRaw < -1000 ? latRaw / 1e7 : parseFloat(latRaw);
    let lon = lonRaw > 1000 || lonRaw < -1000 ? lonRaw / 1e7 : parseFloat(lonRaw);
    
    let time;
    if (typeof timeRaw === 'string') {
      if (/^\d+$/.test(timeRaw)) time = parseInt(timeRaw, 10);
      else time = new Date(timeRaw).getTime();
    } else {
      time = parseInt(timeRaw, 10);
    }
    
    if (!isNaN(lat) && !isNaN(lon) && time && !isNaN(time)) {
      normalized.push({ time, lat, lon });
    }
  };

  if (data && data.locations && Array.isArray(data.locations)) {
    data.locations.forEach(pt => addPoint(pt.latitudeE7 || pt.lat, pt.longitudeE7 || pt.lon, pt.timestampMs || pt.timestamp || pt.time));
  } else if (data && data.timelineObjects && Array.isArray(data.timelineObjects)) {
    data.timelineObjects.forEach(obj => {
      if (obj.placeVisit && obj.placeVisit.location) {
         const loc = obj.placeVisit.location;
         const dur = obj.placeVisit.duration;
         addPoint(loc.latitudeE7 || loc.lat, loc.longitudeE7 || loc.lon, dur?.startTimestamp || loc.timestamp);
      }
      if (obj.activitySegment) {
         const act = obj.activitySegment;
         if (act.startLocation) addPoint(act.startLocation.latitudeE7, act.startLocation.longitudeE7, act.duration?.startTimestamp);
         if (act.endLocation) addPoint(act.endLocation.latitudeE7, act.endLocation.longitudeE7, act.duration?.endTimestamp);
      }
    });
  } else if (Array.isArray(data)) {
    if (data.length > 0 && data[0].startTime) {
      data.forEach(item => {
        const baseTime = new Date(item.startTime).getTime();
        if (item.timelinePath && Array.isArray(item.timelinePath)) {
          item.timelinePath.forEach(pathPt => {
            const coords = parseGeo(pathPt.point);
            if (coords) {
              const offsetMs = (parseInt(pathPt.durationMinutesOffsetFromStartTime || 0)) * 60000;
              addPoint(coords.lat, coords.lon, baseTime + offsetMs);
            }
          });
        }
        if (item.activity) {
          const startCoords = parseGeo(item.activity.start);
          const endCoords = parseGeo(item.activity.end);
          if (startCoords) addPoint(startCoords.lat, startCoords.lon, baseTime);
          if (endCoords) addPoint(endCoords.lat, endCoords.lon, new Date(item.endTime).getTime());
        }
      });
    } else {
      data.forEach(pt => addPoint(pt.latitudeE7 || pt.lat, pt.longitudeE7 || pt.lon, pt.timestampMs || pt.timestamp || pt.time));
    }
  }
  return normalized;
};

// ============================================================================
// KOMPONENT MAPY (Leaflet)
// ============================================================================
const MapView = ({ matches }) => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);

  useEffect(() => {
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    if (!document.getElementById('leaflet-js')) {
      const script = document.createElement('script');
      script.id = 'leaflet-js';
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.async = true;
      document.head.appendChild(script);
    }

    const checkL = setInterval(() => {
      if (window.L && mapRef.current) {
        clearInterval(checkL);
        window.L.Icon.Default.imagePath = 'https://unpkg.com/leaflet@1.9.4/dist/images/';

        if (!mapInstance.current) {
          mapInstance.current = window.L.map(mapRef.current);
          window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
          }).addTo(mapInstance.current);
        }

        mapInstance.current.eachLayer((layer) => {
          if (layer instanceof window.L.Marker) mapInstance.current.removeLayer(layer);
        });

        if (matches && matches.length > 0) {
          const bounds = window.L.latLngBounds();
          matches.forEach(m => {
            const date = new Date(m.time);
            const marker = window.L.marker([m.lat, m.lon]).addTo(mapInstance.current);
            marker.bindPopup(
              `<div style="color: #1e293b; text-align: center; font-family: sans-serif;">
                <strong style="color: #db2777;">Wspólny punkt</strong><br/>
                ${date.toLocaleDateString('pl-PL')} ${date.toLocaleTimeString('pl-PL')}<br/>
                Odległość: <b>${m.distance}m</b>
              </div>`
            );
            bounds.extend([m.lat, m.lon]);
          });
          
          if (matches.length === 1) {
            mapInstance.current.setView([matches[0].lat, matches[0].lon], 16);
          } else {
            mapInstance.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
          }
          
          setTimeout(() => {
            if (mapInstance.current) mapInstance.current.invalidateSize();
          }, 250);
        }
      }
    }, 100);

    return () => clearInterval(checkL);
  }, [matches]);

  if (!matches || matches.length === 0) return null;
  return (
    <div className="mt-8 rounded-xl overflow-hidden border border-slate-600/50 shadow-lg relative z-0">
      <div ref={mapRef} className="w-full h-96 bg-slate-800" />
    </div>
  );
};

// ============================================================================
// KOMPONENT AI: Magiczne Opowieści (Gemini API)
// ============================================================================
const GeminiStory = ({ match }) => {
  const [story, setStory] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [sources, setSources] = useState([]);

  const generateStory = async () => {
    setIsLoading(true);
    
    // Zmienna na Twój klucz API
    // (Podczas eksportu na GitHub zmień poniższą linijkę z powrotem na: const apiKey = import.meta.env.VITE_GEMINI_API_KEY;)
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY; 

    if (!apiKey) {
      setStory("Błąd: Brak klucza API! Skonfiguruj zmienną w kodzie lub w Cloudflare.");
      setIsLoading(false);
      return;
    }

    const dateStr = new Date(match.time).toLocaleDateString('pl-PL');
    const timeStr = new Date(match.time).toLocaleTimeString('pl-PL', { hour: '2-digit', minute:'2-digit' });

    const prompt = `Data: ${dateStr}, Godzina: ${timeStr}. Współrzędne: ${match.lat}, ${match.lon}. Dystans: ${match.distance}m.
1. Zidentyfikuj miejsce w Polsce/świecie na podstawie współrzędnych.
2. Przeszukaj internet czy ${dateStr} było jakieś święto lub wydarzenie w tym mieście.
3. Napisz 4-5 zdań intrygującej historii jak te dwie osoby mogły się minąć. Użyj znalezionych faktów w opowieści. Zwracaj się do nich bezpośrednio (np. "Byliście zaledwie...").`;

    // Zaktualizowano model do oficjalnego z API (gemini-1.5-flash)
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    const payload = {
      contents: [{ parts: [{ text: prompt }] }],
      tools: [{ google_search: {} }],
      systemInstruction: { parts: [{ text: "Jesteś błyskotliwym narratorem opowiadającym o niesamowitych zbiegach okoliczności w oparciu o prawdziwe dane lokalizacyjne i wydarzenia ze świata." }] }
    };

    const fetchWithRetry = async (url, options, retries = 5) => {
      let delay = 1000;
      for (let i = 0; i < retries; i++) {
        try {
          const res = await fetch(url, options);
          if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
          return await res.json();
        } catch (e) {
          if (i === retries - 1) throw e;
          await new Promise(r => setTimeout(r, delay));
          delay *= 2;
        }
      }
    };

    try {
      const data = await fetchWithRetry(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      const groundingSources = data.candidates?.[0]?.groundingMetadata?.groundingAttributions?.map(a => ({ uri: a.web?.uri, title: a.web?.title })).filter(a => a.uri) || [];
      setStory(text);
      setSources(groundingSources);
    } catch (e) {
      setStory("Magia AI chwilowo zawiodła. Spróbuj ponownie później!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-4 border-t border-slate-600/50 pt-4">
      {!story && !isLoading && (
        <button onClick={generateStory} className="flex items-center gap-2 text-sm px-4 py-2 bg-slate-800 hover:bg-slate-700 text-purple-300 rounded-lg transition-colors border border-purple-500/30 w-full sm:w-auto justify-center group">
          <Sparkles size={16} className="text-yellow-400 group-hover:animate-spin" />
          ✨ Odkryj magię tego spotkania (AI + Sieć)
        </button>
      )}
      {isLoading && (
        <div className="flex flex-col gap-2 text-sm text-purple-400 animate-pulse">
          <div className="flex items-center gap-2"><Sparkles size={16} /> Przeszukiwanie wydarzeń historycznych w sieci...</div>
          <div className="flex items-center gap-2 text-xs text-slate-500"><Activity size={12} className="animate-spin" /> Analizowanie współrzędnych przez Gemini AI...</div>
        </div>
      )}
      {story && !isLoading && (
        <div className="bg-slate-900/50 p-4 rounded-lg border border-purple-500/30 shadow-inner">
          <div className="flex items-center gap-2 mb-2 text-purple-400 font-semibold text-sm">
            <Sparkles size={16} className="text-yellow-400" /> Magia chwili według Gemini AI:
          </div>
          <p className="text-sm text-slate-300 leading-relaxed italic">"{story}"</p>
          {sources.length > 0 && (
            <div className="mt-4 pt-3 border-t border-slate-700/50 text-xs text-slate-500 flex flex-col gap-2">
              <span className="font-semibold text-slate-400">Wykorzystane fakty z sieci dla tego dnia:</span>
              <div className="flex flex-wrap gap-2">
                {sources.slice(0, 3).map((s, idx) => (
                  <a key={idx} href={s.uri} target="_blank" rel="noreferrer" className="bg-slate-800 px-2 py-1 rounded text-blue-400 hover:underline inline-block truncate max-w-[250px]" title={s.title}>🔗 {s.title || "Źródło z sieci"}</a>
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
// GŁÓWNA APLIKACJA REACT
// ============================================================================
export default function App() {
  const [fileA, setFileA] = useState(null);
  const [fileB, setFileB] = useState(null);
  const [errorA, setErrorA] = useState(null);
  const [errorB, setErrorB] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('');
  const [results, setResults] = useState(null);
  const [showInstructions, setShowInstructions] = useState(false);
  
  const [maxDistance, setMaxDistance] = useState(50);
  const [maxTimeDiff, setMaxTimeDiff] = useState(5);

  const workerRef = useRef(null);

  // ================= PEER JS (TRYB IMPREZOWY) STANY =================
  const [isGuestMode, setIsGuestMode] = useState(false);
  const [peerStatus, setPeerStatus] = useState('offline'); // offline, hosting, connecting, connected
  const [peerId, setPeerId] = useState(''); // Wygenerowany kod pokoju
  const [joinLink, setJoinLink] = useState('');
  const [manualJoinCode, setManualJoinCode] = useState(''); // Input gościa
  const [copySuccess, setCopySuccess] = useState(false); // UI Success kopiowania
  
  const [peerConnection, setPeerConnection] = useState(null);
  const peerInstance = useRef(null);

  // INICJALIZACJA APLIKACJI & TAILWIND CSS
  useEffect(() => {
    // Wstrzykiwanie Tailwind CSS (Samonaprawiający się design)
    if (!document.getElementById('tailwind-cdn')) {
      const script = document.createElement('script');
      script.id = 'tailwind-cdn';
      script.src = 'https://cdn.tailwindcss.com';
      document.head.appendChild(script);
    }

    const blob = new Blob([workerScript], { type: 'application/javascript' });
    workerRef.current = new Worker(URL.createObjectURL(blob));

    workerRef.current.onmessage = (e) => {
      const { type, msg, percent, matches } = e.data;
      if (type === 'STATUS') setStatusText(msg);
      if (type === 'PROGRESS') setProgress(percent);
      if (type === 'DONE') {
        setResults(matches);
        setIsProcessing(false);
        setStatusText('Analiza zakończona!');
        setProgress(100);
        
        // Jeśli jesteśmy hostem i mamy połączenie - wysyłamy wyniki do gościa!
        if (peerConnection) {
          peerConnection.send({ type: 'RESULTS', data: matches });
        }
      }
    };

    // Sprawdzanie URL czy jesteśmy Gościem (?join=ID)
    const params = new URLSearchParams(window.location.search);
    const hostId = params.get('join');
    if (hostId) {
      setIsGuestMode(true);
      initPeerJS().then(() => connectToHost(hostId));
    }

    return () => {
      workerRef.current.terminate();
      if (peerInstance.current) peerInstance.current.destroy();
    };
  }, [peerConnection]);

  // Automatyczne wysyłanie danych Gościa do Hosta po ich wgraniu
  useEffect(() => {
    if (peerConnection && isGuestMode && fileA) {
      peerConnection.send({ type: 'GUEST_DATA', data: fileA });
      setStatusText('Twoje anonimowe dane zostały bezpiecznie wysłane do hosta. Czekamy na analizę...');
    }
  }, [fileA, peerConnection, isGuestMode]);

  // ================= PEER JS LOGIKA =================
  const loadPeerJSScript = () => {
    return new Promise((resolve) => {
      if (window.Peer) return resolve();
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/peerjs@1.5.2/dist/peerjs.min.js';
      script.onload = () => resolve();
      document.head.appendChild(script);
    });
  };

  const initPeerJS = async () => {
    await loadPeerJSScript();
    return new Promise((resolve) => {
      // Generujemy łatwy kod, np. A1B2C3
      const idToUse = Math.random().toString(36).substring(2, 8).toUpperCase();
      const peer = new window.Peer(idToUse);
      peer.on('open', (id) => {
        peerInstance.current = peer;
        resolve(id);
      });
    });
  };

  const startHosting = async () => {
    if (!fileA) {
      setErrorA("Najpierw wgraj swój plik, aby móc zapraszać gości!");
      return;
    }
    setPeerStatus('hosting');
    const id = await initPeerJS();
    setPeerId(id);
    
    // Budujemy link - ominięcie ograniczeń iframe Sandboxa
    let base = window.location.href;
    if (base === 'about:srcdoc' || base.startsWith('data:')) {
        base = 'https://have-we-met-before.app/'; 
    }
    try {
        const url = new URL(base);
        url.searchParams.set('join', id);
        setJoinLink(url.toString());
    } catch (e) {
        setJoinLink(`https://have-we-met-before.app/?join=${id}`);
    }

    // Nasłuchiwanie na połączenie
    peerInstance.current.on('connection', (conn) => {
      setPeerConnection(conn);
      setPeerStatus('connected');
      
      conn.on('data', (payload) => {
        if (payload.type === 'GUEST_DATA') {
          setFileB(payload.data); // Gość przesłał dane, ładujemy do panelu B
        }
      });
    });
  };

  // Wejście Gościa przez ręczne wpisanie kodu
  const handleManualJoin = async () => {
    if (!manualJoinCode.trim()) return;
    setIsGuestMode(true);
    await initPeerJS(); // Inicjujemy siebie (Gościa) w sieci
    connectToHost(manualJoinCode.trim().toUpperCase());
  };

  const connectToHost = (hostId) => {
    setPeerStatus('connecting');
    peerInstance.current.on('open', () => {
      const conn = peerInstance.current.connect(hostId);
      conn.on('open', () => {
        setPeerConnection(conn);
        setPeerStatus('connected');
      });

      // Nasłuchiwanie na wyniki od Hosta
      conn.on('data', (payload) => {
        if (payload.type === 'RESULTS') {
          setResults(payload.data);
          setStatusText('Analiza zakończona! Wyniki nadeszły z urządzenia Hosta.');
          setIsProcessing(false);
          setProgress(100);
        }
      });
    });
  };

  const cancelHosting = () => {
    if (peerInstance.current) peerInstance.current.destroy();
    setPeerStatus('offline');
    setJoinLink('');
    setPeerId('');
    setPeerConnection(null);
    setFileB(null);
  };
  // ===================================================

  const handleFileUpload = (e, setFileFn, setErrorFn) => {
    setErrorFn(null);
    const file = e.target.files[0];
    
    if (file) {
      if (file.name.toLowerCase().includes('settings.json')) {
        setErrorFn("Plik Settings.json zawiera tylko ustawienia. Poszukaj pliku z historią w formacie JSON.");
        e.target.value = ''; return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const json = JSON.parse(event.target.result);
          const normalizedData = normalizeData(json);
          if (normalizedData.length > 0) {
            setFileFn(normalizedData);
          } else {
            setErrorFn("Nie znaleziono żadnych współrzędnych w tym pliku. To nie jest historia lokalizacji.");
          }
        } catch (error) {
          setErrorFn("Ten plik jest uszkodzony lub to nie jest poprawny format JSON.");
        }
        e.target.value = '';
      };
      reader.onerror = () => { setErrorFn("Błąd odczytu pliku."); e.target.value = ''; };
      reader.readAsText(file);
    }
  };

  const clearFile = (target) => {
    if (target === 'A') { setFileA(null); setErrorA(null); }
    if (target === 'B') { setFileB(null); setErrorB(null); }
    setResults(null); setProgress(0);
  };

  const startAnalysis = () => {
    if (!fileA || !fileB) return;
    setIsProcessing(true); setProgress(0); setResults(null);
    workerRef.current.postMessage({ 
      dataA: fileA, dataB: fileB, 
      config: { maxDistanceMeters: maxDistance, maxTimeDiffMs: maxTimeDiff * 60 * 1000 } 
    });
  };

  // Niezawodne kopiowanie linku (zastępuje problematyczny navigator.clipboard + alert)
  const copyLink = () => {
    const textArea = document.createElement("textarea");
    textArea.value = joinLink;
    textArea.style.position = "fixed";
    textArea.style.left = "-9999px";
    textArea.style.top = "0";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
        document.execCommand('copy');
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 3000);
    } catch (err) {
        console.error('Kopiowanie nie powiodło się', err);
    }
    document.body.removeChild(textArea);
  };

  const generateFakePartner = (sourceData, setTargetFn) => {
    if (!sourceData || sourceData.length === 0) return;
    const basePt = sourceData[Math.floor(sourceData.length * Math.random())];
    let fakePath = [];
    let curLat = basePt.lat + 0.005; let curLon = basePt.lon + 0.005;

    for (let i = -60; i <= 60; i++) {
      const t = basePt.time + (i * 60000);
      if (i === 0) { curLat = basePt.lat + 0.0001; curLon = basePt.lon + 0.0001; } 
      else { curLat += (Math.random() - 0.5) * 0.001; curLon += (Math.random() - 0.5) * 0.001; }
      fakePath.push({ time: t, lat: curLat, lon: curLon });
    }
    setTargetFn(fakePath); setResults(null); setProgress(0);
  };

  // ================= RENDEROWANIE: TRYB GOŚCIA =================
  if (isGuestMode) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 font-sans p-6 flex flex-col items-center justify-center">
        <div className="text-center max-w-xl mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-400 to-purple-500 bg-clip-text text-transparent mb-4 flex items-center justify-center gap-2">
            <Smartphone size={32} className="text-pink-500" /> Dołączasz do sesji! 🎉
          </h1>
          <p className="text-slate-400">
            Zostałeś zaproszony do wspólnego sprawdzenia historii. Wgraj swój plik JSON z Google Maps. Aplikacja wyciągnie tylko współrzędne i wyśle je bezpiecznie do komputera znajomego. Nic nie jest zapisywane.
          </p>
        </div>

        <div className={`w-full max-w-md p-8 rounded-3xl border-2 flex flex-col items-center justify-center transition-all relative shadow-2xl ${fileA ? 'border-green-500 bg-green-500/10' : errorA ? 'border-red-500 bg-red-500/10' : 'border-slate-700 bg-slate-800'}`}>
          {fileA ? (
            <div className="text-center w-full">
              <CheckCircle className="text-green-500 w-16 h-16 mx-auto mb-4" />
              <h3 className="font-bold text-xl text-green-400 mb-2">Dane gotowe!</h3>
              <p className="text-sm text-slate-300 mb-4">Wczytano {fileA.length.toLocaleString('pl-PL')} punktów GPS.</p>
              
              <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700">
                {peerStatus === 'connected' && !results ? (
                  <div className="flex flex-col items-center justify-center gap-2 text-purple-400 font-semibold text-center">
                    <Activity size={24} className="animate-spin text-purple-500 mb-2" /> 
                    <span>Czekam na uruchomienie analizy przez Hosta...</span>
                  </div>
                ) : results ? (
                  <div className="text-pink-400 font-bold flex flex-col items-center justify-center gap-2">
                    <Sparkles size={24} className="mb-2" /> 
                    <span>Wyniki są gotowe! Przewiń w dół.</span>
                  </div>
                ) : (
                  <div className="text-yellow-400 flex flex-col items-center justify-center gap-2">
                    <Wifi size={24} className="animate-pulse mb-2" /> 
                    <span>Łączenie z Hostem przez WebRTC...</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <>
              <UploadCloud className={`w-16 h-16 mb-6 ${errorA ? 'text-red-400' : 'text-slate-500'}`} />
              <h3 className="font-semibold text-lg mb-2">Wybierz plik z telefonu</h3>
              <p className="text-xs text-slate-400 text-center mb-6">Plik <code className="bg-slate-900 px-1 py-0.5 rounded text-pink-400">.json</code> wyeksportowany z Google Maps.</p>
              
              <input 
                type="file" accept=".json" 
                onChange={(e) => handleFileUpload(e, setFileA, setErrorA)} 
                className="text-sm file:mr-4 file:py-3 file:px-6 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-pink-600 file:text-white hover:file:bg-pink-700 w-full cursor-pointer"
              />
              
              {errorA && (
                <div className="mt-6 p-3 bg-red-950/50 border border-red-500/30 rounded-lg text-xs text-red-300 flex items-start gap-2 text-left animate-fade-in w-full">
                  <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                  <span>{errorA}</span>
                </div>
              )}
            </>
          )}
        </div>

        {results && (
          <div className="w-full max-w-2xl mt-8">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 justify-center">
              {results.length > 0 ? '🎉 Nasze spotkania!' : '😔 Brak wspólnych punktów.'}
            </h2>
            <div className="space-y-4">
              {results.map((match, i) => {
                const date = new Date(match.time);
                return (
                  <div key={i} className="bg-slate-800 p-4 rounded-xl flex flex-col gap-4 border border-slate-700 shadow-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-lg font-bold text-pink-400">{date.toLocaleDateString('pl-PL')}</div>
                        <div className="text-slate-300 font-mono text-sm">{date.toLocaleTimeString('pl-PL', { hour: '2-digit', minute:'2-digit' })}</div>
                      </div>
                      <div className="text-right">
                         <div className="text-sm text-slate-400"><MapPin size={12} className="inline mr-1" />{match.distance}m</div>
                      </div>
                    </div>
                    <GeminiStory match={match} />
                  </div>
                );
              })}
            </div>
            <MapView matches={results} />
          </div>
        )}
      </div>
    );
  }

  // ================= RENDEROWANIE: TRYB HOSTA / NORMALNY =================
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans p-6 flex flex-col items-center">
      <div className="text-center max-w-2xl mt-10 mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent flex items-center justify-center gap-3">
          <MapPin size={40} className="text-pink-500" /> Have we met before?
        </h1>
        <p className="mt-4 text-slate-400">
          Sprawdź, czy Twoja ścieżka życiowa przecięła się ze ścieżką innej osoby. Cała analiza odbywa się prywatnie na Twoim urządzeniu.
        </p>
        <button onClick={() => setShowInstructions(true)} className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-purple-400 rounded-full text-sm font-medium transition-colors border border-purple-500/30">
          <HelpCircle size={16} /> Skąd wziąć plik JSON z historią lokalizacji?
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-6 w-full max-w-4xl mb-8">
        {/* Osoba A */}
        <div className={`flex-1 p-6 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center transition-all relative ${fileA ? 'border-green-500 bg-green-500/10' : errorA ? 'border-red-500 bg-red-500/10' : 'border-slate-700 bg-slate-800'}`}>
          {fileA ? (
            <div className="text-center w-full">
              <button onClick={() => clearFile('A')} className="absolute top-4 right-4 text-slate-400 hover:text-red-400 transition-colors p-1" title="Usuń plik"><Trash2 size={20} /></button>
              <CheckCircle className="text-green-500 w-12 h-12 mx-auto mb-2" />
              <h3 className="font-semibold text-green-400">Osoba 1 (Ty) gotowa</h3>
              <p className="text-xs text-slate-400 mt-1">Wczytano {fileA.length.toLocaleString('pl-PL')} punktów</p>
            </div>
          ) : (
            <>
              <UploadCloud className={`w-12 h-12 mb-4 ${errorA ? 'text-red-400' : 'text-slate-500'}`} />
              <h3 className="font-semibold mb-2">Twój plik historii (Gospodarz)</h3>
              <p className="text-xs text-slate-400 text-center mb-4">Wgraj swój plik, aby otworzyć pokój.</p>
              <input type="file" accept=".json" onChange={(e) => handleFileUpload(e, setFileA, setErrorA)} className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700 w-full max-w-[250px] cursor-pointer" />
              {errorA && (<div className="mt-4 p-3 bg-red-950/50 border border-red-500/30 rounded-lg text-xs text-red-300 flex items-start gap-2 max-w-[280px] text-left"><AlertTriangle size={16} className="shrink-0 mt-0.5" /><span>{errorA}</span></div>)}
            </>
          )}
        </div>

        {/* Osoba B (Z panelem WebRTC) */}
        <div className={`flex-1 p-6 rounded-2xl border-2 flex flex-col items-center justify-center transition-all relative overflow-hidden ${
          peerStatus === 'hosting' ? 'border-blue-500 bg-blue-950/30' : 
          peerStatus === 'connected' ? 'border-green-500 bg-green-900/20' : 
          fileB ? 'border-pink-500 bg-pink-500/10 border-solid' : 'border-slate-700 bg-slate-800 border-dashed'
        }`}>
          {peerStatus === 'hosting' ? (
             <div className="text-center w-full animate-fade-in flex flex-col items-center">
               <button onClick={cancelHosting} className="absolute top-4 right-4 text-slate-400 hover:text-red-400 transition-colors p-1"><X size={20} /></button>
               <h3 className="font-bold text-blue-400 mb-2 flex items-center justify-center gap-2"><QrCode size={18}/> Pokój otwarty!</h3>
               <p className="text-xs text-slate-400 mb-4">Podaj ten kod Gościowi.</p>
               
               <div className="bg-slate-900 border border-slate-700 rounded-xl p-3 mb-4 w-full">
                  <div className="text-xs text-slate-500 mb-1">KOD POKOJU:</div>
                  <div className="text-3xl font-mono font-bold text-white tracking-[0.2em]">{peerId}</div>
               </div>

               <button onClick={copyLink} className="flex w-full items-center justify-center gap-1.5 text-xs text-blue-100 bg-blue-600 hover:bg-blue-500 px-3 py-2.5 rounded-xl font-semibold transition-colors mb-4">
                  {copySuccess ? <CheckCircle size={14}/> : <LinkIcon size={14}/>} 
                  {copySuccess ? "Skopiowano kod pomyślnie!" : "Skopiuj link dla pewności"}
               </button>

               <div className="mt-2 text-xs text-blue-400 flex items-center justify-center gap-2"><Activity size={14} className="animate-spin" /> Oczekuję na połączenie...</div>
             </div>
          ) : peerStatus === 'connected' && fileB ? (
             <div className="text-center w-full">
               <button onClick={cancelHosting} className="absolute top-4 right-4 text-slate-400 hover:text-red-400 transition-colors p-1" title="Zakończ sesję"><Trash2 size={20} /></button>
               <Smartphone className="text-green-400 w-12 h-12 mx-auto mb-2" />
               <h3 className="font-semibold text-green-400">Gość przesłał dane!</h3>
               <p className="text-xs text-slate-400 mt-1">Połączono przez P2P. Otrzymano {fileB.length.toLocaleString('pl-PL')} punktów.</p>
             </div>
          ) : fileB ? (
             <div className="text-center w-full">
               <button onClick={() => clearFile('B')} className="absolute top-4 right-4 text-slate-400 hover:text-red-400 transition-colors p-1"><Trash2 size={20} /></button>
               <CheckCircle className="text-pink-500 w-12 h-12 mx-auto mb-2" />
               <h3 className="font-semibold text-pink-400">Dane Osoby 2 (Lokalnie)</h3>
               <p className="text-xs text-slate-400 mt-1">{fileB.length.toLocaleString('pl-PL')} punktów</p>
             </div>
          ) : (
            <>
              <QrCode className="w-10 h-10 mb-3 text-blue-400" />
              <h3 className="font-semibold mb-2 text-center text-sm">Dołącz lub zaproś</h3>
              
              <button onClick={startHosting} className={`mb-3 w-full max-w-[250px] py-2 px-4 rounded-xl font-bold text-sm shadow-lg transition-transform flex items-center justify-center gap-2 ${fileA ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:scale-[1.02] text-white' : 'bg-slate-700 text-slate-400 cursor-not-allowed'}`}>
                <Smartphone size={16} /> Zaproś Gościa
              </button>
              
              <div className="flex w-full max-w-[250px] gap-2 mb-3">
                  <input 
                      type="text" 
                      value={manualJoinCode}
                      onChange={(e) => setManualJoinCode(e.target.value.toUpperCase())}
                      placeholder="Kod np. A1B2C3" 
                      className="flex-1 bg-slate-900 border border-slate-600 rounded-xl px-3 py-2 text-xs text-white uppercase placeholder:normal-case font-mono tracking-wider focus:outline-none focus:border-blue-500"
                      maxLength={8}
                  />
                  <button 
                      onClick={handleManualJoin}
                      disabled={!manualJoinCode.trim()}
                      className="bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-white px-3 py-2 rounded-xl text-xs font-bold transition-colors"
                  >
                      Dołącz
                  </button>
              </div>

              <div className="relative flex items-center py-2 w-full max-w-[250px]">
                <div className="flex-grow border-t border-slate-600"></div>
                <span className="flex-shrink-0 mx-4 text-slate-500 text-xs">lub z dysku</span>
                <div className="flex-grow border-t border-slate-600"></div>
              </div>

              <input type="file" accept=".json" onChange={(e) => handleFileUpload(e, setFileB, setErrorB)} className="text-sm file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-slate-700 file:text-slate-300 hover:file:bg-slate-600 w-full max-w-[250px] mt-2 cursor-pointer" />
              {errorB && (<div className="mt-4 p-3 bg-red-950/50 border border-red-500/30 rounded-lg text-xs text-red-300 flex items-start gap-2 max-w-[280px] text-left"><AlertTriangle size={16} className="shrink-0 mt-0.5" /><span>{errorB}</span></div>)}
              {fileA && !errorB && (
                <button onClick={() => generateFakePartner(fileA, setFileB)} className="mt-5 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-full text-xs font-medium text-pink-300 transition-colors border border-pink-500/30">
                  <Wand2 size={14} /> Wygeneruj pasujące dane
                </button>
              )}
            </>
          )}
        </div>
      </div>

      <div className="w-full max-w-4xl bg-slate-800 rounded-2xl p-6 border border-slate-700 mb-8 shadow-lg">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-slate-200"><Settings size={20} className="text-purple-400" /> Parametry Spotkania</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <label className="flex justify-between text-sm font-medium text-slate-300 mb-2"><span>Maksymalna odległość</span><span className="text-pink-400 font-bold">{maxDistance >= 1000 ? (maxDistance/1000).toFixed(1) + ' km' : maxDistance + ' m'}</span></label>
            <input type="range" min="5" max="5000" step="5" value={maxDistance} onChange={(e) => setMaxDistance(parseInt(e.target.value))} className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-pink-500" />
          </div>
          <div>
            <label className="flex justify-between text-sm font-medium text-slate-300 mb-2"><span>Maksymalna różnica czasu</span><span className="text-purple-400 font-bold">{maxTimeDiff >= 60 ? Math.floor(maxTimeDiff/60) + 'h ' + (maxTimeDiff%60) + 'm' : maxTimeDiff + ' min'}</span></label>
            <input type="range" min="1" max="1440" step="1" value={maxTimeDiff} onChange={(e) => setMaxTimeDiff(parseInt(e.target.value))} className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-purple-500" />
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-12">
        <button onClick={startAnalysis} disabled={!fileA || !fileB || isProcessing} className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full font-bold text-lg shadow-lg hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2">
          {isProcessing ? <Activity className="animate-spin" /> : <Play fill="currentColor" size={20} />} {isProcessing ? 'Analizowanie...' : 'Znajdź wspólne momenty'}
        </button>
      </div>

      {isProcessing && (
        <div className="w-full max-w-2xl bg-slate-800 rounded-full h-4 mb-4 overflow-hidden">
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-4 transition-all duration-300 ease-out" style={{ width: `${progress}%` }}></div>
          <p className="text-center text-xs mt-2 text-slate-400">{statusText} ({progress}%)</p>
        </div>
      )}

      {results && (
        <div className="w-full max-w-2xl bg-slate-800 rounded-2xl p-6 shadow-xl border border-slate-700 animate-fade-in">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">{results.length > 0 ? '🎉 Znaleziono powiązania!' : '😔 Niestety, brak wspólnych punktów.'}</h2>
          <div className="space-y-4">
            {results.map((match, i) => {
              const date = new Date(match.time);
              return (
                <div key={i} className="bg-slate-700/50 p-4 rounded-xl flex flex-col gap-4 border border-slate-600/50">
                  <div className="flex items-start sm:items-center justify-between flex-col sm:flex-row gap-4">
                    <div>
                      <div className="text-lg font-bold text-pink-400 mb-1">{date.toLocaleDateString('pl-PL')}</div>
                      <div className="text-slate-300 font-mono text-sm">{date.toLocaleTimeString('pl-PL', { hour: '2-digit', minute:'2-digit' })}</div>
                    </div>
                    <div className="text-right flex-1 sm:flex-none">
                      <div className="text-sm text-slate-400 mb-1 flex items-center justify-end gap-1"><MapPin size={14} /> Odległość: <span className="text-white font-semibold">{match.distance} m</span></div>
                    </div>
                  </div>
                  <GeminiStory match={match} />
                </div>
              );
            })}
          </div>
          <MapView matches={results} />
        </div>
      )}

      {showInstructions && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 max-w-2xl w-full shadow-2xl relative my-8">
            <button onClick={() => setShowInstructions(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"><X size={24} /></button>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 text-pink-400"><HelpCircle size={24} /> Jak pobrać swoje dane?</h2>
            <p className="text-slate-300 text-sm mb-6">Aby aplikacja zadziałała, potrzebujesz pliku z historią Twojej lokalizacji w formacie JSON. Z powodu niedawnych zmian w polityce Google, sposób pobierania zależy od tego, gdzie przechowywana jest Twoja Oś czasu.</p>
            <div className="space-y-6">
              <div className="bg-slate-700/30 p-4 rounded-xl border border-slate-600/50">
                <h3 className="font-bold text-purple-400 mb-2 flex items-center gap-2">📱 Sposób 1: Z aplikacji na telefonie (Rekomendowane)</h3>
                <ol className="space-y-2 text-sm text-slate-300 list-decimal list-inside marker:text-purple-500 marker:font-bold">
                  <li className="pl-1">Otwórz aplikację <b>Mapy Google</b> na swoim smartfonie (Android / iOS).</li>
                  <li className="pl-1">Kliknij swoje zdjęcie profilowe w prawym górnym rogu.</li>
                  <li className="pl-1">Wybierz <b>"Twoja oś czasu"</b>.</li>
                  <li className="pl-1">Kliknij ikonę trzech kropek (menu) i wybierz <b>"Ustawienia i prywatność"</b>.</li>
                  <li className="pl-1">Zjedź w dół do sekcji "Ustawienia lokalizacji" i wybierz <b>"Eksportuj dane osi czasu"</b>.</li>
                  <li className="pl-1">Zapisz wygenerowany plik <code className="bg-slate-900 px-1 py-0.5 rounded text-pink-400">.json</code>.</li>
                </ol>
              </div>
              <div className="bg-slate-700/30 p-4 rounded-xl border border-slate-600/50">
                <h3 className="font-bold text-pink-400 mb-2 flex items-center gap-2">💻 Sposób 2: Przez Google Takeout (Dla starszych kont)</h3>
                <ol className="space-y-2 text-sm text-slate-300 list-decimal list-inside marker:text-pink-500 marker:font-bold">
                  <li className="pl-1">Wejdź na stronę <a href="https://takeout.google.com/" target="_blank" rel="noreferrer" className="text-purple-400 hover:underline font-semibold">Google Takeout</a>.</li>
                  <li className="pl-1">Kliknij <b>"Odznacz wszystkie"</b>, a następnie zaznacz tylko <b>"Historia lokalizacji"</b>.</li>
                  <li className="pl-1">Upewnij się, że format to <b>JSON</b> i pobierz archiwum.</li>
                </ol>
              </div>
            </div>
            <div className="mt-8 text-center">
              <button onClick={() => setShowInstructions(false)} className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full font-bold text-white shadow-lg hover:scale-105 transition-transform">Rozumiem, zamykamy!</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
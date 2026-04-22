import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { Institution, INSTITUTION_TYPES, WILAYA_COORDS } from '../types';
import { Navigation } from 'lucide-react';
import { cn } from '../lib/utils';
import { useLanguage } from '../hooks/useLanguage';

// Fix for default marker icons in Leaflet with React
import 'leaflet/dist/leaflet.css';

const blueDotIcon = L.divIcon({
  className: 'user-location-marker',
  html: `
    <div class="relative flex items-center justify-center">
      <div class="absolute w-8 h-8 bg-blue-500/30 rounded-full animate-pulse"></div>
      <div class="relative w-4 h-4 bg-blue-600 border-2 border-white rounded-full shadow-lg"></div>
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

const createCustomIcon = (color: string, saturationColor: string, type: string) => {
  // Mapping of types to SVG paths based on INSTITUTION_TYPES icons
  const getIconPath = (t: string) => {
    switch(t) {
      case 'CARDIOLOGIST': return '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>';
      case 'PULMONOLOGIST': return '<path d="M17.7 7.7A7.1 7.1 0 0 0 12.3 5c-3.9 0-7.1 3.2-7.1 7.1a7.1 7.1 0 0 0 2.7 5.4l-2.7 2.7l1.4 1.4l2.7-2.7a7.1 7.1 0 0 0 11.2-5.4c0-2-.8-3.8-2.1-5.2Z"/>';
      case 'GASTROENTEROLOGIST': return '<path d="M6 18h8"/><path d="M3 22h18"/><path d="M14 22a7 7 0 1 0 0-14h-1"/><path d="M9 14h2"/><path d="M9 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z"/>';
      case 'NEPHROLOGIST': return '<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>';
      case 'NEUROLOGIST': return '<path d="M9.5 2A5.5 5.5 0 0 0 4 7.5c0 1.25.4 2.4 1.1 3.3l-1.3 1.3l1.4 1.4l1.3-1.3c.9.7 2.05 1.1 3.3 1.1c3 0 5.5-2.5 5.5-5.5S12.5 2 9.5 2Z"/><path d="M14.5 10.5a5.5 5.5 0 0 1 5.5 5.5c0 3-2.5 5.5-5.5 5.5S9 19 9 16c0-1.25.41-2.43 1.14-3.32"/>';
      case 'ENDOCRINOLOGIST': return '<path d="M14 4v10.5a4.5 4.5 0 1 1-4 0V4a2 2 0 0 1 4 0Z"/>';
      case 'ORL': return '<path d="M2 20h.01"/><path d="M7 20h.01"/><path d="M12 20h.01"/><path d="M17 20h.01"/><path d="M22 20h.01"/><path d="M2 15h.01"/><path d="M7 15h.01"/><path d="M12 15h.01"/><path d="M17 15h.01"/><path d="M22 15h.01"/><path d="M2 10h.01"/><path d="M7 10h.01"/><path d="M12 10h.01"/><path d="M17 10h.01"/><path d="M22 10h.01"/><path d="M2 5h.01"/><path d="M7 5h.01"/><path d="M12 5h.01"/><path d="M17 5h.01"/><path d="M22 5h.01"/>';
      case 'OPHTHALMOLOGIST': return '<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>';
      case 'GENERALIST': return '<path d="M9 12h.01"/><path d="M15 12h.01"/><path d="M10 16c.5.3 1.2.5 2 .5s1.5-.2 2-.5"/><path d="M19 6.3a9 9 0 0 1 1.8 3.9a2 2 0 0 1 0 3.6a9 9 0 0 1-17.6 0a2 2 0 0 1 0-3.6a9 9 0 0 1 1.8-3.9"/><path d="M16.3 11.3a2 2 0 1 1-4.6 0a2 2 0 0 1 4.6 0Z"/>';
      case 'CLINIQUE': return '<path d="M6 18h12"/><path d="M3 22h18"/><path d="M3 7v14"/><path d="M19 21V7"/><path d="M14 12v4"/><path d="M12 14h4"/><path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16"/>';
      case 'HOPITAL_PRIVE': return '<path d="M3 21h18"/><path d="M3 7v1l9-4.5V21"/><path d="M19 21V7l-7-3.5"/>';
      case 'PHARMACY': return '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>';
      case 'BANQUE_PRIVEE': return '<path d="M21 12V7H5a2 2 0 0 1 0-4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1 0-4h16"/>';
      case 'ASSURANCE': return '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>';
      case 'INVESTMENT': return '<circle cx="8" cy="8" r="6"/><path d="M18.09 10.37A6 6 0 1 1 10.34 18.1"/>';
      case 'SHOP': return '<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>';
      case 'WHOLESALER': return '<path d="M10 17h4V5H2v12h3"/><path d="M20 17h2v-3.34a4 4 0 0 0-1.17-2.83L19 9h-5v8h1"/><circle cx="7.5" cy="17.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/>';
      case 'IMPORT_EXPORT': return '<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>';
      case 'SOFTWARE': return '<rect width="20" height="8" x="2" y="2" rx="2" ry="2"/><rect width="20" height="8" x="2" y="14" rx="2" ry="2"/><line x1="6" x2="6" y1="6" y2="6"/><line x1="6" x2="6" y1="18" y2="18"/>';
      case 'STARTUP': return '<path d="M13 2 3 14h9l-1 8 10-12h-9l1-8Z"/>';
      case 'CYBERSECURITY': return '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>';
      case 'TELECOM': return '<path d="M2 20h.01"/><path d="M7 20h.01"/><path d="M12 20h.01"/><path d="M17 20h.01"/><path d="M22 20h.01"/><path d="M2 15h.01"/><path d="M7 15h.01"/><path d="M12 15h.01"/><path d="M17 15h.01"/><path d="M22 15h.01"/><path d="M2 10h.01"/><path d="M7 10h.01"/><path d="M12 10h.01"/><path d="M17 10h.01"/><path d="M22 10h.01"/><path d="M2 5h.01"/><path d="M7 5h.01"/><path d="M12 5h.01"/><path d="M17 5h.01"/><path d="M22 5h.01"/>';
      case 'DIGITAL_SERVICE': return '<rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><path d="M12 18h.01"/>';
      case 'FARM': return '<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>';
      case 'FACTORY': return '<path d="M2 20V9l5 2V9l5 2V9l10 4v7a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2Z"/><path d="M17 18h1"/><path d="M12 18h1"/><path d="M7 18h1"/>';
      case 'ELECTRONICS': return '<rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><line x1="8" x2="8" y1="3" y2="3"/><line x1="12" x2="12" y1="3" y2="3"/><line x1="16" x2="16" y1="3" y2="3"/><line x1="8" x2="8" y1="21" y2="21"/><line x1="12" x2="12" y1="21" y2="21"/><line x1="16" x2="16" y1="21" y2="21"/><line x1="3" x2="3" y1="8" y2="8"/><line x1="3" x2="3" y1="12" y2="12"/><line x1="3" x2="3" y1="16" y2="16"/><line x1="21" x2="21" y1="8" y2="8"/><line x1="21" x2="21" y1="12" y2="12"/><line x1="21" x2="21" y1="16" y2="16"/><path d="M9 9h6v6H9z"/>';
      case 'CAR_MANUF': return '<path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.5 2.6C1.4 11.1 1 11.7 1 12.4V16c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/>';
      case 'UNIVERSITY': return '<path d="m16 6 4 14"/><path d="M12 6v14"/><path d="M8 6 4 20"/><path d="M2 20h20"/><path d="M5 2c0 2.2 1.8 4 4 4s4-1.8 4-4"/><path d="M11 2c0 2.2 1.8 4 4 4s4-1.8 4-4"/>';
      default: return '<path d="M12 2L2 7V22H22V7L12 2ZM20 20H4V9L12 5L20 9V20Z"/>';
    }
  };

  return L.divIcon({
    className: 'custom-div-icon',
    html: `<div style="position: relative; width: 64px; height: 64px; filter: drop-shadow(0 8px 20px rgba(0,0,0,0.35));">
            <div style="background-color: ${color}; width: 54px; height: 54px; border-radius: 18px; border: 3.5px solid white; box-shadow: 0 12px 30px rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; transform: rotate(45deg); position: absolute; top: 0; left: 0;">
              <div style="transform: rotate(-45deg); color: white;">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">${getIconPath(type)}</svg>
              </div>
            </div>
            <div style="position: absolute; top: -2px; right: -2px; width: 24px; height: 24px; background-color: ${saturationColor}; border: 3px solid white; border-radius: 50%; box-shadow: 0 4px 10px rgba(0,0,0,0.35); z-index: 10;"></div>
          </div>`,
    iconSize: [64, 64],
    iconAnchor: [32, 64],
  });
};

interface MapViewProps {
  institutions: Institution[];
  onSelectInstitution: (inst: Institution) => void;
  selectedInstitutionId?: string;
  selectedWilaya?: string;
  isDarkMode?: boolean;
  center?: [number, number];
  zoom?: number;
  onMapMove?: (center: [number, number], zoom: number) => void;
  userLocation?: [number, number] | null;
}

// Initial center for the map (Algiers)
const INITIAL_CENTER: [number, number] = [36.7372, 3.0889];
const INITIAL_ZOOM = 13;

function MapEvents({ onMove, currentCenter, currentZoom }: { onMove?: (center: [number, number], zoom: number) => void, currentCenter?: [number, number], currentZoom?: number }) {
  const map = useMapEvents({
    moveend: () => {
      const center = map.getCenter();
      const zoom = map.getZoom();
      
      // Only trigger update if there's a significant change to prevent loops
      if (currentCenter && currentZoom !== undefined) {
        const dLat = Math.abs(center.lat - currentCenter[0]);
        const dLng = Math.abs(center.lng - currentCenter[1]);
        const dZoom = Math.abs(zoom - currentZoom);
        
        if (dLat < 0.000001 && dLng < 0.000001 && dZoom < 0.01) {
          return;
        }
      }
      
      onMove?.([center.lat, center.lng], zoom);
    },
    zoomend: () => {
      // Zoomend is also covered by moveend in most leaflet versions, but safe to keep
      const center = map.getCenter();
      const zoom = map.getZoom();

      if (currentCenter && currentZoom !== undefined) {
        const dLat = Math.abs(center.lat - currentCenter[0]);
        const dLng = Math.abs(center.lng - currentCenter[1]);
        const dZoom = Math.abs(zoom - currentZoom);
        
        if (dLat < 0.000001 && dLng < 0.000001 && dZoom < 0.01) {
          return;
        }
      }
      
      onMove?.([center.lat, center.lng], zoom);
    }
  });
  return null;
}

function SetMapRef({ mapRef }: { mapRef: React.MutableRefObject<L.Map | null> }) {
  const map = useMap();
  useEffect(() => {
    mapRef.current = map;
  }, [map, mapRef]);
  return null;
}

export const MapView: React.FC<MapViewProps> = ({ 
  institutions, 
  onSelectInstitution, 
  selectedInstitutionId, 
  selectedWilaya, 
  isDarkMode,
  center,
  zoom,
  onMapMove,
  userLocation
}) => {
  const { t } = useLanguage();
  const [mapType, setMapType] = useState<'streets' | 'satellite'>('streets');
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    // Center map on selected wilaya
    if (selectedWilaya && WILAYA_COORDS[selectedWilaya] && mapRef.current) {
      const coords = WILAYA_COORDS[selectedWilaya];
      mapRef.current.setView([coords.lat, coords.lng], 12, { animate: true });
    }
  }, [selectedWilaya]);

  const handleLocateMe = () => {
    // Immediate feedback: if we already have a location, pan there first
    if (userLocation && mapRef.current) {
      mapRef.current.flyTo(userLocation, 16, { animate: true, duration: 1 });
    }

    if (navigator.geolocation) {
      // Faster acquisition first if we don't have a recent userLocation
      if (!userLocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const loc: [number, number] = [position.coords.latitude, position.coords.longitude];
            if (mapRef.current) {
              mapRef.current.flyTo(loc, 16, { animate: true, duration: 1 });
            }
          },
          null,
          { enableHighAccuracy: false, timeout: 3000 }
        );
      }

      // Then try high accuracy
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const loc: [number, number] = [position.coords.latitude, position.coords.longitude];
          if (mapRef.current) {
            mapRef.current.flyTo(loc, 16, { animate: true, duration: 1 });
          }
        },
        (error) => {
          console.error("Locate me high accuracy error:", error);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    }
  };

  const tiles = {
    // Google Maps Roadmap with scale=2 for high-DPI clarity
    streets: 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}&scale=2',
    // Google Maps Satellite only
    satellite: 'https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}&scale=2',
    // Google Maps Labels/Roads only (Hybrid overlay)
    hybrid: 'https://mt1.google.com/vt/lyrs=h&x={x}&y={y}&z={z}&scale=2'
  };

  return (
    <div className={cn("relative w-full h-full", isDarkMode && "dark-map")}>
      <MapContainer 
        center={center || INITIAL_CENTER} 
        zoom={zoom || INITIAL_ZOOM} 
        className="w-full h-full z-0 bg-[#f8f9fa] dark:bg-[#111827]"
        zoomControl={false}
        attributionControl={false}
        preferCanvas={true}
      >
        <SetMapRef mapRef={mapRef} />
        <MapEvents onMove={onMapMove} currentCenter={center} currentZoom={zoom} />
        
        {/* Base Layer */}
        <TileLayer
          key={`base-${mapType}-${isDarkMode}`}
          url={mapType === 'satellite' ? tiles.satellite : tiles.streets}
          maxZoom={20}
          tileSize={512}
          zoomOffset={-1}
          opacity={mapType === 'satellite' ? 1 : 0.65}
          className={cn(isDarkMode && mapType === 'streets' && "dark-tile-filter")}
        />

        {/* Hybrid Labels Layer (Only for Satellite) */}
        {mapType === 'satellite' && (
          <TileLayer
            key="hybrid-labels"
            url={tiles.hybrid}
            maxZoom={20}
            tileSize={512}
            zoomOffset={-1}
            opacity={0.65} // Keep "reduced occupancy" for labels/icons as requested before
          />
        )}
        
        {userLocation && (
          <Marker 
            position={userLocation} 
            icon={blueDotIcon}
            zIndexOffset={1000}
          />
        )}

        {institutions.map((inst) => {
          const typeInfo = INSTITUTION_TYPES.find(t => t.type === inst.type);
          const color = typeInfo?.color || '#333';
          const wait = inst.lastGivenTicket - inst.currentTicket;
          
          let saturationColor = '#22c55e'; // Green
          if (wait >= 20) saturationColor = '#ef4444'; // Red
          else if (wait >= 10) saturationColor = '#f97316'; // Orange
          
            return (
              <Marker 
                key={inst.id} 
                position={[inst.lat, inst.lng]}
                icon={createCustomIcon(color, saturationColor, inst.type)}
                eventHandlers={{
                  click: () => onSelectInstitution(inst),
                }}
              >
                <Popup closeButton={false} minWidth={180}>
                  <div className="overflow-hidden rounded-[19px]">
                    <div className="p-3 bg-white dark:bg-gray-800">
                      <div className="flex items-start gap-2.5">
                        <div 
                          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-sm"
                          style={{ backgroundColor: color }}
                        >
                          {typeInfo && <typeInfo.icon className="w-5 h-5 text-white" />}
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-display font-bold text-sm text-gray-900 dark:text-white leading-tight truncate">{inst.name}</h3>
                          <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium truncate mt-0.5">{inst.address}</p>
                        </div>
                      </div>
                      
                      <div className="mt-3 pt-2.5 border-t border-gray-100 dark:border-gray-700/50 flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: saturationColor }}></div>
                          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">
                            {wait} {t('ticketsCount')}
                          </span>
                        </div>
                        <div 
                          className="px-1.5 py-0.5 rounded-md text-[8px] font-black uppercase tracking-tighter"
                          style={{ backgroundColor: `${saturationColor}15`, color: saturationColor }}
                        >
                          {wait >= 20 ? t('high') : wait >= 10 ? t('medium') : t('low')}
                        </div>
                      </div>
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
        })}
      </MapContainer>

      {/* Map Controls */}
      <div className="absolute top-24 right-4 z-[1000] flex flex-col gap-3 pointer-events-auto">
        <button 
          onClick={(e) => {
            e.stopPropagation();
            handleLocateMe();
          }}
          className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl w-12 h-12 rounded-2xl shadow-2xl flex items-center justify-center text-blue-600 dark:text-blue-400 border border-white/20 dark:border-gray-700/50 ring-1 ring-black/5 dark:ring-white/5 active:scale-90 transition-all hover:bg-white dark:hover:bg-gray-700 focus:outline-none"
        >
          <Navigation className="w-6 h-6 fill-current" />
        </button>

        <button 
          onClick={(e) => {
            e.stopPropagation();
            setMapType(mapType === 'streets' ? 'satellite' : 'streets');
          }}
          className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl p-1 rounded-2xl shadow-2xl hover:bg-white dark:hover:bg-gray-700 transition-all border border-white/20 dark:border-gray-700/50 ring-1 ring-black/5 dark:ring-white/5 active:scale-95 focus:outline-none"
        >
          <div className="w-10 h-10 rounded-xl overflow-hidden relative">
             <img 
               src={mapType === 'streets' ? "https://www.gstatic.com/images/branding/product/2x/maps_96dp.png" : "https://www.gstatic.com/images/branding/product/2x/earth_96dp.png"} 
               alt="Toggle Map"
               className="w-full h-full object-cover p-1"
             />
             <div className="absolute inset-0 bg-black/5 flex items-end justify-center pb-0.5">
               <span className="text-[7px] text-gray-900 dark:text-white font-black uppercase tracking-tighter leading-none bg-white/80 dark:bg-black/50 px-1 rounded-sm">
                 {mapType === 'streets' ? t('satellite') : t('map')}
               </span>
             </div>
          </div>
        </button>
      </div>
    </div>
  );
};

import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { Institution, INSTITUTION_TYPES, WILAYA_COORDS } from '../types';
import { Navigation } from 'lucide-react';
import { cn } from '../lib/utils';
import { useLanguage } from '../hooks/useLanguage';

// Fix for default marker icons in Leaflet with React
import 'leaflet/dist/leaflet.css';
import { renderToString } from 'react-dom/server';

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

const createCustomIcon = (color: string, saturationColor: string, type: string, isBooking: boolean = false) => {
  const typeInfo = INSTITUTION_TYPES.find(t => t.type === type);
  const IconComponent = typeInfo?.icon || Navigation;

  return L.divIcon({
    className: 'custom-div-icon',
    html: `<div style="position: relative; width: 64px; height: 64px; filter: drop-shadow(0 8px 20px rgba(0,0,0,0.35));">
            <div style="background-color: ${color}; width: 54px; height: 54px; border-radius: 18px; border: 3.5px solid white; box-shadow: 0 12px 30px rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; transform: rotate(45deg); position: absolute; top: 0; left: 0;">
              <div style="transform: rotate(-45deg); color: white;">
                ${renderToString(<IconComponent size={28} strokeWidth={2.5} color="currentColor" />)}
              </div>
            </div>
            ${!isBooking ? `<div style="position: absolute; top: -2px; right: -2px; width: 24px; height: 24px; background-color: ${saturationColor}; border: 3px solid white; border-radius: 50%; box-shadow: 0 4px 10px rgba(0,0,0,0.35); z-index: 10;"></div>` : ''}
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
          const isBooking = typeInfo && ['HEALTHCARE', 'SERVICES', 'TECHNOLOGY'].includes(typeInfo.sector);
          const wait = inst.lastGivenTicket - inst.currentTicket;
          
          let saturationColor = '#22c55e'; // Green
          if (wait >= 20) saturationColor = '#ef4444'; // Red
          else if (wait >= 10) saturationColor = '#f97316'; // Orange
          
            return (
              <Marker 
                key={inst.id} 
                position={[inst.lat, inst.lng]}
                icon={createCustomIcon(color, saturationColor, inst.type, !!isBooking)}
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
                      
                      {!isBooking && (
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
                      )}
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

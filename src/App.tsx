import React, { useEffect, useState, useCallback, useRef } from 'react'
import L from 'leaflet'
import { useKV } from '@github/spark/hooks'
import { MapContainer } from '@/components/MapContainer'
import { LayerSelector } from '@/components/LayerSelector'
import { QuickLayerSwitcher } from '@/components/QuickLayerSwitcher'
import { ZoomControls } from '@/components/ZoomControls'
import { LocationButton } from '@/components/LocationButton'
import { OrchardLayer } from '@/components/OrchardLayer'
import { Toaster } from '@/components/ui/sonner'

const DEFAULT_CENTER: [number, number] = [50.9333, 7.2833] // Overath, NRW
const DEFAULT_ZOOM = 8

function App() {
  const [map, setMap] = useState<L.Map | null>(null)
  const [currentLayer, setCurrentLayer] = useKV('selected-layer', 'orto')
  const [mapCenter, setMapCenter] = useKV<[number, number]>('map-center', DEFAULT_CENTER)
  const [mapZoom, setMapZoom] = useKV<number>('map-zoom', DEFAULT_ZOOM)
  
  // Use refs to prevent stale closures
  const mapCenterRef = useRef(mapCenter)
  const mapZoomRef = useRef(mapZoom)
  
  // Update refs when values change
  useEffect(() => {
    mapCenterRef.current = mapCenter
  }, [mapCenter])
  
  useEffect(() => {
    mapZoomRef.current = mapZoom
  }, [mapZoom])

  const handleMoveEnd = useCallback(() => {
    if (!map) return
    
    const center = map.getCenter()
    const zoom = map.getZoom()
    const newCenter: [number, number] = [center.lat, center.lng]
    
    // Only update if values actually changed to prevent infinite loops
    const currentCenter = mapCenterRef.current
    const currentZoom = mapZoomRef.current
    
    if (currentCenter && (Math.abs(newCenter[0] - currentCenter[0]) > 0.0001 || 
        Math.abs(newCenter[1] - currentCenter[1]) > 0.0001)) {
      setMapCenter(newCenter)
    }
    
    if (currentZoom !== undefined && Math.abs(zoom - currentZoom) > 0.1) {
      setMapZoom(zoom)
    }
  }, [map, setMapCenter, setMapZoom])

  useEffect(() => {
    if (!map) return

    map.on('moveend', handleMoveEnd)
    map.on('zoomend', handleMoveEnd)

    return () => {
      map.off('moveend', handleMoveEnd)
      map.off('zoomend', handleMoveEnd)
    }
  }, [map, handleMoveEnd])

  const handleZoomIn = () => {
    if (map) {
      map.zoomIn()
    }
  }

  const handleZoomOut = () => {
    if (map) {
      map.zoomOut()
    }
  }

  const handleLocationFound = (lat: number, lng: number) => {
    if (map) {
      map.setView([lat, lng], 16)
      
      L.marker([lat, lng], {
        icon: L.divIcon({
          html: `<div style="background: oklch(0.55 0.20 240); width: 12px; height: 12px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 0 2px oklch(0.55 0.20 240);"></div>`,
          className: 'custom-location-marker',
          iconSize: [18, 18],
          iconAnchor: [9, 9]
        })
      }).addTo(map)
    }
  }

  return (
    <div className="relative w-full h-screen bg-background">
      <MapContainer
        currentLayer={currentLayer || 'orto'}
        center={mapCenter || DEFAULT_CENTER}
        zoom={mapZoom || DEFAULT_ZOOM}
        onMapReady={setMap}
      />
      
      <QuickLayerSwitcher
        currentLayer={currentLayer || 'orto'}
        onLayerChange={setCurrentLayer}
      />
      
      <ZoomControls
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
      />
      
      <LocationButton
        onLocationFound={handleLocationFound}
      />
      
      <LayerSelector
        currentLayer={currentLayer || 'orto'}
        onLayerChange={setCurrentLayer}
      />

      <OrchardLayer map={map} />

      <Toaster />
    </div>
  )
}

export default App
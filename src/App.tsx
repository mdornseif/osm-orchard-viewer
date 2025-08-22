import React, { useEffect, useState } from 'react'
import L from 'leaflet'
import { useKV } from '@github/spark/hooks'
import { MapContainer } from '@/components/MapContainer'
import { LayerSelector } from '@/components/LayerSelector'
import { QuickLayerSwitcher } from '@/components/QuickLayerSwitcher'
import { ZoomControls } from '@/components/ZoomControls'
import { LocationButton } from '@/components/LocationButton'
import { Toaster } from '@/components/ui/sonner'

const DEFAULT_CENTER: [number, number] = [51.4818, 7.2162] // Dortmund, NRW
const DEFAULT_ZOOM = 10

function App() {
  const [map, setMap] = useState<L.Map | null>(null)
  const [currentLayer, setCurrentLayer] = useKV('selected-layer', 'osm')
  const [mapCenter, setMapCenter] = useKV('map-center', DEFAULT_CENTER)
  const [mapZoom, setMapZoom] = useKV('map-zoom', DEFAULT_ZOOM)

  useEffect(() => {
    if (!map) return

    const handleMoveEnd = () => {
      const center = map.getCenter()
      const zoom = map.getZoom()
      setMapCenter([center.lat, center.lng])
      setMapZoom(zoom)
    }

    map.on('moveend', handleMoveEnd)
    map.on('zoomend', handleMoveEnd)

    return () => {
      map.off('moveend', handleMoveEnd)
      map.off('zoomend', handleMoveEnd)
    }
  }, [map])

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
        currentLayer={currentLayer}
        center={mapCenter}
        zoom={mapZoom}
        onMapReady={setMap}
      />
      
      <QuickLayerSwitcher
        currentLayer={currentLayer}
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
        currentLayer={currentLayer}
        onLayerChange={setCurrentLayer}
      />

      <Toaster />
    </div>
  )
}

export default App
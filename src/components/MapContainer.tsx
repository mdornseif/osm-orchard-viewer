import React, { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import { tileLayers } from '@/lib/tile-layers'

// Fix Leaflet's default icon path issue with bundlers
try {
  delete (L.Icon.Default.prototype as any)._getIconUrl
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  })
} catch (error) {
  console.warn('Could not configure Leaflet icons:', error)
}

interface MapContainerProps {
  currentLayer: string
  center: [number, number]
  zoom: number
  onMapReady?: (map: L.Map) => void
}

export function MapContainer({ currentLayer, center, zoom, onMapReady }: MapContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<L.Map | null>(null)
  const [currentTileLayer, setCurrentTileLayer] = useState<L.TileLayer | null>(null)

  // Initialize map
  useEffect(() => {
    if (!containerRef.current || map) return

    try {
      const leafletMap = L.map(containerRef.current, {
        center,
        zoom,
        zoomControl: false,
        attributionControl: true
      })

      setMap(leafletMap)
      onMapReady?.(leafletMap)
    } catch (error) {
      console.error('Failed to initialize map:', error)
    }

    return () => {
      if (map) {
        try {
          map.remove()
        } catch (error) {
          console.error('Failed to remove map:', error)
        }
        setMap(null)
      }
    }
  }, [])

  // Handle layer changes
  useEffect(() => {
    if (!map) return

    const layer = tileLayers.find(l => l.id === currentLayer)
    if (!layer) return

    // Remove current layer
    if (currentTileLayer) {
      map.removeLayer(currentTileLayer)
    }

    let tileLayer: L.TileLayer

    try {
      // Handle WMS layers for NRW services
      if (layer.url.includes('wms_nw_dop') || layer.url.includes('wms_nw_alkis')) {
        const baseUrl = layer.url.split('?')[0]
        const isOrthophoto = layer.url.includes('dop')
        
        tileLayer = L.tileLayer.wms(baseUrl, {
          layers: isOrthophoto ? 'nw_dop_rgb' : 'adv_alkis_flurstuecke,adv_alkis_gebaeude',
          format: isOrthophoto ? 'image/jpeg' : 'image/png',
          transparent: !isOrthophoto,
          attribution: layer.attribution,
          maxZoom: layer.maxZoom,
          version: '1.1.1',
          crs: L.CRS.EPSG3857
        })
      } else {
        // Handle standard tile layers
        tileLayer = L.tileLayer(layer.url, {
          attribution: layer.attribution,
          maxZoom: layer.maxZoom,
          subdomains: layer.subdomains
        })
      }

      tileLayer.addTo(map)
      setCurrentTileLayer(tileLayer)
    } catch (error) {
      console.error('Failed to add tile layer:', error)
    }
  }, [map, currentLayer])

  // Handle position changes
  useEffect(() => {
    if (map) {
      map.setView(center, zoom)
    }
  }, [map, center, zoom])

  return (
    <div 
      ref={containerRef} 
      className="w-full h-full bg-muted"
      style={{ minHeight: '100vh' }}
    />
  )
}
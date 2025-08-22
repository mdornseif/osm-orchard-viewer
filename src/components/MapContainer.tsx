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
  const [currentTileLayer, setCurrentTileLayer] = useState<L.TileLayer | L.TileLayer.WMS | null>(null)

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
      
      // Add a small delay before calling onMapReady to ensure map is fully initialized
      setTimeout(() => {
        onMapReady?.(leafletMap)
      }, 100)
      
      // Return cleanup function that has access to leafletMap
      return () => {
        try {
          leafletMap.remove()
        } catch (error) {
          console.error('Failed to remove map:', error)
        }
      }
    } catch (error) {
      console.error('Failed to initialize map:', error)
    }
  }, [])

  // Handle layer changes
  useEffect(() => {
    if (!map) return

    const layer = tileLayers.find(l => l.id === currentLayer)
    if (!layer) {
      console.warn(`Layer not found: ${currentLayer}`)
      return
    }

    // Remove current layer
    if (currentTileLayer) {
      try {
        map.removeLayer(currentTileLayer)
      } catch (error) {
        console.warn('Failed to remove previous layer:', error)
      }
    }

    let tileLayer: L.TileLayer | L.TileLayer.WMS

    try {
      // Handle WMS layers for NRW services
      if (layer.url.includes('wms_nw_dop') || layer.url.includes('wms_nw_alkis')) {
        const baseUrl = layer.url.split('?')[0]
        const isOrthophoto = layer.url.includes('dop')
        
        const wmsOptions: any = {
          layers: isOrthophoto ? 'nw_dop_rgb' : 'adv_alkis_flurstuecke,adv_alkis_gebaeude',
          format: isOrthophoto ? 'image/jpeg' : 'image/png',
          transparent: !isOrthophoto,
          attribution: layer.attribution,
          maxZoom: layer.maxZoom,
          version: '1.1.1',
          crs: L.CRS.EPSG3857
        }
        
        tileLayer = L.tileLayer.wms(baseUrl, wmsOptions)
      } else {
        // Handle standard tile layers
        const tileOptions: L.TileLayerOptions = {
          attribution: layer.attribution,
          maxZoom: layer.maxZoom
        }
        
        // Only add subdomains if they exist and are not empty
        if (layer.subdomains && Array.isArray(layer.subdomains) && layer.subdomains.length > 0) {
          tileOptions.subdomains = layer.subdomains
        }
        
        tileLayer = L.tileLayer(layer.url, tileOptions)
      }

      tileLayer.addTo(map)
      setCurrentTileLayer(tileLayer)
    } catch (error) {
      console.error('Failed to add tile layer:', error)
      // Try to add a fallback layer
      try {
        const fallbackLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors',
          subdomains: ['a', 'b', 'c']
        })
        fallbackLayer.addTo(map)
        setCurrentTileLayer(fallbackLayer)
      } catch (fallbackError) {
        console.error('Failed to add fallback layer:', fallbackError)
      }
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
import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { tileLayers, type TileLayer } from '@/lib/tile-layers'

interface MapComponentProps {
  currentLayer: string
  center: [number, number]
  zoom: number
  onMapReady?: (map: L.Map) => void
}

export function MapComponent({ currentLayer, center, zoom, onMapReady }: MapComponentProps) {
  const mapRef = useRef<L.Map | null>(null)
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const currentTileLayerRef = useRef<L.TileLayer | null>(null)

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return

    const map = L.map(mapContainerRef.current, {
      center,
      zoom,
      zoomControl: false,
      attributionControl: true
    })

    mapRef.current = map
    onMapReady?.(map)

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    if (!mapRef.current) return

    const layer = tileLayers.find(l => l.id === currentLayer)
    if (!layer) return

    if (currentTileLayerRef.current) {
      mapRef.current.removeLayer(currentTileLayerRef.current)
    }

    let tileLayer: L.TileLayer

    if (layer.url.includes('{bbox-epsg-3857}')) {
      tileLayer = L.tileLayer.wms(layer.url.split('?')[0], {
        layers: layer.url.includes('dop') ? 'nw_dop_rgb' : 'adv_alkis_flurstuecke,adv_alkis_gebaeude',
        format: layer.url.includes('dop') ? 'image/jpeg' : 'image/png',
        transparent: !layer.url.includes('dop'),
        attribution: layer.attribution,
        maxZoom: layer.maxZoom
      })
    } else {
      tileLayer = L.tileLayer(layer.url, {
        attribution: layer.attribution,
        maxZoom: layer.maxZoom,
        subdomains: layer.subdomains
      })
    }

    tileLayer.addTo(mapRef.current)
    currentTileLayerRef.current = tileLayer
  }, [currentLayer])

  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.setView(center, zoom)
    }
  }, [center, zoom])

  return (
    <div 
      ref={mapContainerRef} 
      className="w-full h-full bg-muted"
      style={{ minHeight: '100vh' }}
    />
  )
}
import React, { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { queryOrchards, elementToPolygon, OverpassElement } from '@/lib/overpass'
import { toast } from 'sonner'

interface OrchardLayerProps {
  map: L.Map | null
  visible: boolean
  onToggle: () => void
}

export function OrchardLayer({ map, visible, onToggle }: OrchardLayerProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [orchardCount, setOrchardCount] = useState(0)
  const layerGroupRef = useRef<L.LayerGroup | null>(null)
  const lastBoundsRef = useRef<L.LatLngBounds | null>(null)
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Initialize layer group
  useEffect(() => {
    if (!map) return

    if (!layerGroupRef.current) {
      layerGroupRef.current = L.layerGroup()
    }

    // Always add to map and load orchards
    layerGroupRef.current.addTo(map)
    loadOrchards()

    return () => {
      if (layerGroupRef.current) {
        layerGroupRef.current.remove()
      }
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current)
      }
    }
  }, [map])

  // Listen for map movement to reload orchards
  useEffect(() => {
    if (!map || !visible) return

    const handleMoveEnd = () => {
      const currentBounds = map.getBounds()
      const lastBounds = lastBoundsRef.current

      // Only reload if bounds changed significantly (more than ~100m)
      if (!lastBounds || !boundsOverlapSignificantly(currentBounds, lastBounds)) {
        // Debounce the loading to avoid too many requests
        if (loadingTimeoutRef.current) {
          clearTimeout(loadingTimeoutRef.current)
        }
        loadingTimeoutRef.current = setTimeout(() => {
          loadOrchards()
        }, 500)
      }
    }

    map.on('moveend', handleMoveEnd)
    map.on('zoomend', handleMoveEnd)

    return () => {
      map.off('moveend', handleMoveEnd)
      map.off('zoomend', handleMoveEnd)
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current)
      }
    }
  }, [map, visible])

  const boundsOverlapSignificantly = (bounds1: L.LatLngBounds, bounds2: L.LatLngBounds): boolean => {
    // Validate inputs
    if (!bounds1 || !bounds2 || typeof bounds1.intersects !== 'function') return false
    
    // Check if bounds intersects at all (note: method is 'intersects', not 'intersect')
    if (!bounds1.intersects(bounds2)) return false
    
    // Calculate intersection manually
    const north = Math.min(bounds1.getNorth(), bounds2.getNorth())
    const south = Math.max(bounds1.getSouth(), bounds2.getSouth())
    const east = Math.min(bounds1.getEast(), bounds2.getEast())
    const west = Math.max(bounds1.getWest(), bounds2.getWest())
    
    // If no valid intersection, return false
    if (north <= south || east <= west) return false
    
    const intersectionArea = (north - south) * (east - west)
    const bounds1Area = (bounds1.getNorth() - bounds1.getSouth()) * 
                       (bounds1.getEast() - bounds1.getWest())
    
    // If more than 80% of the area overlaps, consider it the same view
    return (intersectionArea / bounds1Area) > 0.8
  }

  const loadOrchards = async () => {
    if (!map || !layerGroupRef.current || isLoading) return

    const bounds = map.getBounds()
    const zoom = map.getZoom()
    
    // Don't load at very low zoom levels (performance)
    if (zoom < 12) {
      toast.info('Zoomen Sie näher heran, um Obstgärten zu sehen')
      return
    }

    setIsLoading(true)
    
    try {
      // Clear existing orchards
      layerGroupRef.current.clearLayers()
      setOrchardCount(0)
      
      // Query Overpass API
      const elements = await queryOrchards(bounds)
      
      let addedCount = 0
      
      // Add orchards to map
      elements.forEach((element: OverpassElement) => {
        const polygon = elementToPolygon(element)
        if (polygon && layerGroupRef.current) {
          layerGroupRef.current.addLayer(polygon)
          addedCount++
        }
      })

      setOrchardCount(addedCount)
      lastBoundsRef.current = bounds

      if (addedCount > 0) {
        toast.success(`${addedCount} Obstgärten geladen`)
      } else {
        toast.info('Keine Obstgärten in diesem Bereich gefunden')
      }
    } catch (error) {
      console.error('Failed to load orchards:', error)
      let errorMessage = 'Fehler beim Laden der Obstgärten'
      
      if (error instanceof Error) {
        if (error.message.includes('timeout')) {
          errorMessage = 'Zeitüberschreitung - versuchen Sie es erneut'
        } else if (error.message.includes('network')) {
          errorMessage = 'Netzwerkfehler - prüfen Sie Ihre Verbindung'
        }
      }
      
      toast.error(errorMessage)
      setOrchardCount(0)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRefresh = () => {
    lastBoundsRef.current = null // Force reload
    loadOrchards()
  }

  return (
    <div className="absolute top-20 left-4 z-[1000] flex flex-col gap-2">
      <div className="bg-card/95 backdrop-blur-sm border border-border rounded-lg p-3 shadow-lg max-w-[200px]">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
            className="px-2"
          >
            {isLoading ? '⟳' : '↻'}
          </Button>
        </div>
        
        <div className="mt-2 flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            {orchardCount}
          </Badge>
          {isLoading && (
            <Badge variant="outline" className="text-xs">
              Laden...
            </Badge>
          )}
        </div>
        
        <div className="mt-2 text-xs text-muted-foreground">
          Obstgärten (OSM)
        </div>
      </div>
    </div>
  )
}
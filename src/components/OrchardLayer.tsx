import React, { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import { queryOrchards, elementToPolygon, OverpassElement } from '@/lib/overpass'
import { toast } from 'sonner'

interface OrchardLayerProps {
  map: L.Map | null
}

export function OrchardLayer({ map }: OrchardLayerProps) {
  const [isLoading, setIsLoading] = useState(false)
  const layerGroupRef = useRef<L.LayerGroup | null>(null)
  const lastBoundsRef = useRef<L.LatLngBounds | null>(null)
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastApiCallRef = useRef<number>(0)

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
    if (!map) return

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

    const handleZoomEnd = () => {
      // Always reload on zoom to switch between markers and polygons
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current)
      }
      loadingTimeoutRef.current = setTimeout(() => {
        loadOrchards()
      }, 200)
    }

    map.on('moveend', handleMoveEnd)
    map.on('zoomend', handleZoomEnd)

    return () => {
      map.off('moveend', handleMoveEnd)
      map.off('zoomend', handleZoomEnd)
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current)
      }
    }
  }, [map])

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

    // Implement 3-second throttling for API calls
    const now = Date.now()
    const timeSinceLastCall = now - lastApiCallRef.current
    if (timeSinceLastCall < 3000) {
      // If less than 3 seconds since last call, schedule for later
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current)
      }
      loadingTimeoutRef.current = setTimeout(() => {
        loadOrchards()
      }, 3000 - timeSinceLastCall)
      return
    }

    const bounds = map.getBounds()
    const zoom = map.getZoom()
    
    // Don't load at very low zoom levels (performance)
    if (zoom < 10) {
      // Clear existing orchards at very low zoom
      layerGroupRef.current.clearLayers()
      return
    }

    setIsLoading(true)
    lastApiCallRef.current = now
    
    try {
      // Query Overpass API first, keep existing layers until new ones are ready
      const elements = await queryOrchards(bounds)
      
      // Create a temporary layer group for new features
      const tempLayerGroup = L.layerGroup()
      let addedCount = 0
      
      // Add orchards to temporary layer group with zoom-dependent styling
      elements.forEach((element: OverpassElement) => {
        const feature = elementToPolygon(element, zoom)
        if (feature) {
          tempLayerGroup.addLayer(feature)
          addedCount++
        }
      })

      // Only update the map once all new features are ready
      if (layerGroupRef.current) {
        // Clear old layers and add new ones atomically
        layerGroupRef.current.clearLayers()
        tempLayerGroup.eachLayer(layer => {
          if (layerGroupRef.current) {
            layerGroupRef.current.addLayer(layer)
          }
        })
      }

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
    } finally {
      setIsLoading(false)
    }
  }

  return null
}
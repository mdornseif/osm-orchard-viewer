import L from 'leaflet'

export interface OverpassElement {
  type: 'way' | 'node' | 'relation'
  id: number
  nodes?: number[]
  geometry?: Array<{ lat: number; lon: number }>
  tags?: Record<string, string>
}

export interface OverpassResponse {
  version: number
  generator: string
  osm3s: {
    timestamp_osm_base: string
    copyright: string
  }
  elements: OverpassElement[]
}

/**
 * Query Overpass API for landuse=orchard areas within a bounding box
 */
export async function queryOrchards(bounds: L.LatLngBounds): Promise<OverpassElement[]> {
  const south = bounds.getSouth()
  const west = bounds.getWest()
  const north = bounds.getNorth()
  const east = bounds.getEast()

  // Overpass QL query for orchards
  const query = `
    [out:json][timeout:25];
    (
      way["landuse"="orchard"](${south},${west},${north},${east});
      relation["landuse"="orchard"](${south},${west},${north},${east});
    );
    out geom;
  `

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout

    const response = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'data=' + encodeURIComponent(query),
      signal: controller.signal
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      throw new Error(`Overpass API error: ${response.status} ${response.statusText}`)
    }

    const contentType = response.headers.get('content-type')
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error('Invalid response format from Overpass API')
    }

    const data: OverpassResponse = await response.json()
    return data.elements || []
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error('Overpass API request timed out')
      }
      throw error
    }
    throw new Error('Unknown error occurred while querying Overpass API')
  }
}

/**
 * Convert Overpass element to Leaflet polygon
 */
export function elementToPolygon(element: OverpassElement): L.Polygon | null {
  if (!element.geometry || element.geometry.length < 3) {
    return null
  }

  try {
    const coordinates: [number, number][] = element.geometry.map(coord => [coord.lat, coord.lon])
    
    // Close the polygon if it's not already closed
    const firstPoint = coordinates[0]
    const lastPoint = coordinates[coordinates.length - 1]
    if (firstPoint[0] !== lastPoint[0] || firstPoint[1] !== lastPoint[1]) {
      coordinates.push(firstPoint)
    }
    
    // Create polygon with orchard styling
    const polygon = L.polygon(coordinates, {
      fillColor: '#4ade80', // Green color for orchards
      fillOpacity: 0.4,
      color: '#16a34a',
      weight: 2,
      opacity: 0.8
    })

    // Add popup with information
    const name = element.tags?.name || 'Obstgarten'
    const crop = element.tags?.crop || null
    const operator = element.tags?.operator || null
    const access = element.tags?.access || null
    
    let popupContent = `<div class="font-medium text-sm">${name}</div>`
    
    if (crop) {
      popupContent += `<div class="text-xs mt-1"><strong>Anbau:</strong> ${crop}</div>`
    }
    if (operator) {
      popupContent += `<div class="text-xs"><strong>Betreiber:</strong> ${operator}</div>`
    }
    if (access) {
      popupContent += `<div class="text-xs"><strong>Zugang:</strong> ${access}</div>`
    }
    
    popupContent += `<div class="text-xs text-gray-500 mt-2 border-t pt-1">OSM ID: ${element.id}</div>`
    
    polygon.bindPopup(popupContent, {
      maxWidth: 250,
      className: 'orchard-popup'
    })

    return polygon
  } catch (error) {
    console.error('Failed to create polygon from element:', error)
    return null
  }
}
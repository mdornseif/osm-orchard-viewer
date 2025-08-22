import React from 'react'
import { Button } from '@/components/ui/button'
import { tileLayers } from '@/lib/tile-layers'

interface QuickLayerSwitcherProps {
  currentLayer: string
  onLayerChange: (layerId: string) => void
}

const quickLayers = ['osm', 'satellite', 'nrw-orthophoto', 'nrw-cadastre']

// Short display names for the buttons
const layerDisplayNames = {
  osm: 'OSM',
  satellite: 'Satellite',
  'nrw-orthophoto': 'Ortho',
  'nrw-cadastre': 'Cadastre'
}

export function QuickLayerSwitcher({ currentLayer, onLayerChange }: QuickLayerSwitcherProps) {
  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[1000] flex gap-1 bg-card/95 backdrop-blur-sm rounded-lg p-1 map-control-shadow">
      {quickLayers.map((layerId) => {
        const layer = tileLayers.find(l => l.id === layerId)
        if (!layer) return null
        
        const isActive = currentLayer === layerId
        const displayName = layerDisplayNames[layerId as keyof typeof layerDisplayNames]
        
        return (
          <Button
            key={layerId}
            variant={isActive ? "default" : "ghost"}
            size="sm"
            className={`px-3 py-2 text-xs font-medium transition-all duration-200 ${
              isActive 
                ? 'bg-primary text-primary-foreground shadow-sm scale-105' 
                : 'text-muted-foreground hover:text-foreground hover:bg-muted hover:scale-105'
            }`}
            onClick={() => onLayerChange(layerId)}
          >
            {displayName}
          </Button>
        )
      })}
    </div>
  )
}
import React from 'react'
import { Globe, Satellite, MapPin, Buildings } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { tileLayers } from '@/lib/tile-layers'

interface QuickLayerSwitcherProps {
  currentLayer: string
  onLayerChange: (layerId: string) => void
}

const layerIcons = {
  osm: Globe,
  satellite: Satellite,
  'nrw-orthophoto': MapPin,
  'nrw-cadastre': Buildings
}

const quickLayers = ['osm', 'satellite', 'nrw-orthophoto', 'nrw-cadastre']

export function QuickLayerSwitcher({ currentLayer, onLayerChange }: QuickLayerSwitcherProps) {
  return (
    <TooltipProvider>
      <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[1000] flex gap-1 bg-card/95 backdrop-blur-sm rounded-lg p-1 map-control-shadow">
        {quickLayers.map((layerId) => {
          const layer = tileLayers.find(l => l.id === layerId)
          if (!layer) return null
          
          const IconComponent = layerIcons[layerId as keyof typeof layerIcons]
          const isActive = currentLayer === layerId
          
          return (
            <Tooltip key={layerId}>
              <TooltipTrigger asChild>
                <Button
                  variant={isActive ? "default" : "ghost"}
                  size="sm"
                  className={`h-10 w-10 p-0 transition-all duration-200 ${
                    isActive 
                      ? 'bg-primary text-primary-foreground shadow-sm scale-105' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted hover:scale-105'
                  }`}
                  onClick={() => onLayerChange(layerId)}
                >
                  <IconComponent size={18} />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="bg-card/95 backdrop-blur-sm">
                <p className="text-sm font-medium">{layer.name}</p>
              </TooltipContent>
            </Tooltip>
          )
        })}
      </div>
    </TooltipProvider>
  )
}
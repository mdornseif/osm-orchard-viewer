import React, { useState } from 'react'
import { Layers, Check, MapPin, Satellite, Buildings, Globe } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { tileLayers } from '@/lib/tile-layers'

interface LayerSelectorProps {
  currentLayer: string
  onLayerChange: (layerId: string) => void
}

const layerIcons = {
  osm: Globe,
  satellite: Satellite,
  'nrw-orthophoto': MapPin,
  'nrw-cadastre': Buildings
}

const layerDescriptions = {
  osm: 'Detailed street map with roads, POIs, and labels',
  satellite: 'High-resolution satellite and aerial imagery',
  'nrw-orthophoto': 'Official NRW aerial photography with precise details',
  'nrw-cadastre': 'Property boundaries, parcels, and building outlines'
}

const layerCategories = {
  'Street Maps': ['osm'],
  'Aerial & Satellite': ['satellite', 'nrw-orthophoto'],
  'Cadastral & Property': ['nrw-cadastre']
}

export function LayerSelector({ currentLayer, onLayerChange }: LayerSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const currentLayerName = tileLayers.find(l => l.id === currentLayer)?.name || 'Unknown'

  const handleLayerSelect = (layerId: string) => {
    onLayerChange(layerId)
    setIsOpen(false)
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button 
          variant="secondary" 
          size="sm"
          className="fixed bottom-4 right-4 z-[1000] map-control-shadow h-12 px-3 bg-card/95 backdrop-blur-sm"
        >
          <Layers size={20} className="mr-2" />
          <span className="text-sm font-medium">{currentLayerName}</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="h-[70vh] bg-card/95 backdrop-blur-sm">
        <SheetHeader className="pb-4">
          <SheetTitle className="flex items-center gap-2">
            <Layers size={20} />
            Map Layers
          </SheetTitle>
          <p className="text-sm text-muted-foreground">
            Choose your preferred map display style
          </p>
        </SheetHeader>
        
        <div className="space-y-6 py-2 max-h-[calc(70vh-120px)] overflow-y-auto">
          {Object.entries(layerCategories).map(([category, layerIds]) => (
            <div key={category} className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground/80 uppercase tracking-wide">
                {category}
              </h3>
              <div className="grid gap-3">
                {layerIds.map((layerId) => {
                  const layer = tileLayers.find(l => l.id === layerId)
                  if (!layer) return null
                  
                  const IconComponent = layerIcons[layerId as keyof typeof layerIcons]
                  const isActive = currentLayer === layerId
                  
                  return (
                    <Card 
                      key={layer.id}
                      className={`cursor-pointer transition-all duration-200 ${
                        isActive 
                          ? 'border-primary bg-primary/10 shadow-md' 
                          : 'border-border hover:border-primary/50 hover:bg-muted/50'
                      }`}
                      onClick={() => handleLayerSelect(layer.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg ${
                            isActive 
                              ? 'bg-primary text-primary-foreground' 
                              : 'bg-muted text-muted-foreground'
                          }`}>
                            <IconComponent size={20} />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium text-foreground truncate">
                                {layer.name}
                              </h4>
                              {isActive && (
                                <div className="flex items-center gap-1 text-primary">
                                  <Check size={16} weight="bold" />
                                  <Badge variant="default" className="text-xs">
                                    Active
                                  </Badge>
                                </div>
                              )}
                            </div>
                            
                            <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                              {layerDescriptions[layerId as keyof typeof layerDescriptions]}
                            </p>
                            
                            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                              <span>Max zoom: {layer.maxZoom}</span>
                              {layer.id.includes('nrw') && (
                                <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                                  NRW Official
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
        
        <div className="pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground text-center">
            Tap any layer to switch your map view instantly
          </p>
        </div>
      </SheetContent>
    </Sheet>
  )
}
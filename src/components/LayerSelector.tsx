import React from 'react'
import { Layers } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { tileLayers } from '@/lib/tile-layers'

interface LayerSelectorProps {
  currentLayer: string
  onLayerChange: (layerId: string) => void
}

export function LayerSelector({ currentLayer, onLayerChange }: LayerSelectorProps) {
  const currentLayerName = tileLayers.find(l => l.id === currentLayer)?.name || 'Unknown'

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button 
          variant="secondary" 
          size="sm"
          className="fixed bottom-4 right-4 z-[1000] map-control-shadow h-12 px-3"
        >
          <Layers size={20} className="mr-2" />
          <span className="text-sm font-medium">{currentLayerName}</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="h-[60vh]">
        <SheetHeader>
          <SheetTitle>Map Layers</SheetTitle>
        </SheetHeader>
        <div className="grid gap-3 py-4">
          {tileLayers.map((layer) => (
            <div
              key={layer.id}
              className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                currentLayer === layer.id 
                  ? 'border-primary bg-primary/5' 
                  : 'border-border hover:bg-muted'
              }`}
              onClick={() => onLayerChange(layer.id)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-foreground">{layer.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {layer.id === 'osm' && 'Street map with detailed road networks'}
                    {layer.id === 'satellite' && 'High-resolution aerial imagery'}
                    {layer.id === 'nrw-orthophoto' && 'Official NRW aerial photography'}
                    {layer.id === 'nrw-cadastre' && 'Property boundaries and buildings'}
                  </p>
                </div>
                {currentLayer === layer.id && (
                  <Badge variant="default" className="ml-2">
                    Active
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="text-xs text-muted-foreground">
          <p>Tap a layer to switch the map display</p>
        </div>
      </SheetContent>
    </Sheet>
  )
}
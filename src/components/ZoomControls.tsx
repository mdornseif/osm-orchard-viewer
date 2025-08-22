import { Plus, Minus } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'

interface ZoomControlsProps {
  onZoomIn: () => void
  onZoomOut: () => void
}

export function ZoomControls({ onZoomIn, onZoomOut }: ZoomControlsProps) {
  return (
    <div className="fixed left-4 bottom-4 z-[1000] flex flex-col gap-2">
      <Button
        variant="secondary"
        size="icon"
        className="h-12 w-12 map-control-shadow"
        onClick={onZoomIn}
      >
        <Plus size={20} />
      </Button>
      <Button
        variant="secondary"
        size="icon"
        className="h-12 w-12 map-control-shadow"
        onClick={onZoomOut}
      >
        <Minus size={20} />
      </Button>
    </div>
  )
}
import React, { useState, useEffect } from 'react'
import { NavigationArrow } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface LocationButtonProps {
  onLocationFound: (lat: number, lng: number) => void
}

export function LocationButton({ onLocationFound }: LocationButtonProps) {
  const [isLocating, setIsLocating] = useState(false)
  const [hasLocation, setHasLocation] = useState(false)

  const requestLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by this browser')
      return
    }

    setIsLocating(true)

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        onLocationFound(latitude, longitude)
        setHasLocation(true)
        setIsLocating(false)
        toast.success('Location found')
      },
      (error) => {
        setIsLocating(false)
        let message = 'Unable to get your location'
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = 'Location access denied'
            break
          case error.POSITION_UNAVAILABLE:
            message = 'Location information unavailable'
            break
          case error.TIMEOUT:
            message = 'Location request timed out'
            break
        }
        
        toast.error(message)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000
      }
    )
  }

  return (
    <Button
      variant="secondary"
      size="icon"
      className={`fixed right-4 top-20 z-[1000] h-12 w-12 map-control-shadow bg-card/95 backdrop-blur-sm ${
        hasLocation ? 'bg-accent text-accent-foreground' : ''
      } ${isLocating ? 'animate-pulse' : ''}`}
      onClick={requestLocation}
      disabled={isLocating}
    >
      <NavigationArrow 
        size={20} 
        className={isLocating ? 'animate-spin' : ''} 
      />
    </Button>
  )
}
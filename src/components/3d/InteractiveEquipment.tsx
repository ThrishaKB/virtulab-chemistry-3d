import { ReactNode } from 'react'

interface InteractiveEquipmentProps {
  equipmentId: string
  equipmentType: string
  position: [number, number, number]
  canReceiveLiquid?: boolean
  onPour?: (targetId: string) => void
  children: ReactNode
}

export default function InteractiveEquipment({
  position,
  children,
}: InteractiveEquipmentProps) {
  return (
    <group position={position}>
      {children}
    </group>
  )
}

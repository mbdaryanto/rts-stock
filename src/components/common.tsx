import { FaCheck, FaTimes } from 'react-icons/fa'


export function Active({ isActive }:{ isActive: boolean }) {
  if (isActive) return <FaCheck color="green"/>
  return <FaTimes color="red"/>
}

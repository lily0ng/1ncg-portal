import React from 'react';
import { Badge } from '../ui/Badge';
interface StatusBadgeProps {
  status: string;
}
export function StatusBadge({ status }: StatusBadgeProps) {
  const normalizedStatus = status.toLowerCase();
  let variant: 'default' | 'secondary' | 'destructive' | 'outline' = 'default';
  let colorClass = '';
  let showPulse = false;
  switch (normalizedStatus) {
    case 'running':
    case 'active':
    case 'enabled':
    case 'implemented':
    case 'ready':
      variant = 'default';
      colorClass =
      'bg-green-500/10 text-green-500 hover:bg-green-500/20 border-green-500/20';
      showPulse = normalizedStatus === 'running';
      break;
    case 'stopped':
    case 'disabled':
      variant = 'secondary';
      colorClass =
      'bg-gray-500/10 text-gray-500 hover:bg-gray-500/20 border-gray-500/20';
      break;
    case 'error':
    case 'destroyed':
      variant = 'destructive';
      colorClass =
      'bg-red-500/10 text-red-500 hover:bg-red-500/20 border-red-500/20';
      break;
    case 'starting':
    case 'stopping':
    case 'setup':
      variant = 'outline';
      colorClass =
      'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20 border-yellow-500/20';
      showPulse = true;
      break;
    case 'allocated':
      variant = 'default';
      colorClass =
      'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 border-blue-500/20';
      break;
    default:
      variant = 'secondary';
  }
  return (
    <Badge
      variant={variant}
      className={`font-medium ${colorClass} transition-colors`}>
      
      {showPulse &&
      <span className="relative flex h-2 w-2 mr-2">
          <span
          className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${normalizedStatus === 'running' ? 'bg-green-400' : 'bg-yellow-400'}`}>
        </span>
          <span
          className={`relative inline-flex rounded-full h-2 w-2 ${normalizedStatus === 'running' ? 'bg-green-500' : 'bg-yellow-500'}`}>
        </span>
        </span>
      }
      {!showPulse &&
      <span
        className={`inline-block h-2 w-2 rounded-full mr-2 ${normalizedStatus === 'stopped' || normalizedStatus === 'disabled' ? 'bg-gray-500' : normalizedStatus === 'error' || normalizedStatus === 'destroyed' ? 'bg-red-500' : normalizedStatus === 'allocated' ? 'bg-blue-500' : 'bg-current'}`}>
      </span>
      }
      {status}
    </Badge>);

}
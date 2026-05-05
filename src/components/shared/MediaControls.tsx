/**
 * MediaControls.tsx
 *
 * Camera/Microphone controls for video consultation
 * Features:
 * - Toggle camera on/off
 * - Toggle microphone on/off
 * - Switch between front/back camera (mobile)
 * - Screen share button (doctor only)
 * - End call button
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Camera,
  CameraOff,
  Mic,
  MicOff,
  Phone,
  Share2,
  RotateCw,
} from 'lucide-react';

interface MediaControlsProps {
  isCameraOn: boolean;
  isMicOn: boolean;
  onToggleCamera: () => void;
  onToggleMic: () => void;
  onToggleCameraFacing?: () => void; // Mobile camera switch
  onScreenShare?: () => void; // Doctor only
  onEndCall: () => void;
  userRole: 'doctor' | 'medic'; // Only doctor can screen share
  disabled?: boolean;
}

export function MediaControls({
  isCameraOn,
  isMicOn,
  onToggleCamera,
  onToggleMic,
  onToggleCameraFacing,
  onScreenShare,
  onEndCall,
  userRole,
  disabled = false,
}: MediaControlsProps) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="flex items-center justify-center gap-2 p-4 bg-slate-900 rounded-lg">
      {/* Camera Toggle */}
      <button
        onClick={onToggleCamera}
        disabled={disabled}
        className={`p-3 rounded-full transition-colors ${
          isCameraOn
            ? 'bg-blue-600 hover:bg-blue-700 text-white'
            : 'bg-red-600 hover:bg-red-700 text-white'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
        title={isCameraOn ? 'Turn camera off' : 'Turn camera on'}
      >
        {isCameraOn ? <Camera size={24} /> : <CameraOff size={24} />}
      </button>

      {/* Microphone Toggle */}
      <button
        onClick={onToggleMic}
        disabled={disabled}
        className={`p-3 rounded-full transition-colors ${
          isMicOn
            ? 'bg-blue-600 hover:bg-blue-700 text-white'
            : 'bg-red-600 hover:bg-red-700 text-white'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
        title={isMicOn ? 'Mute microphone' : 'Unmute microphone'}
      >
        {isMicOn ? <Mic size={24} /> : <MicOff size={24} />}
      </button>

      {/* Camera Facing Switch (Mobile) */}
      {onToggleCameraFacing && (
        <button
          onClick={onToggleCameraFacing}
          disabled={disabled || !isCameraOn}
          className="p-3 rounded-full bg-slate-700 hover:bg-slate-600 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Switch to front/back camera"
        >
          <RotateCw size={24} />
        </button>
      )}

      {/* Screen Share (Doctor only) */}
      {userRole === 'doctor' && onScreenShare && (
        <button
          onClick={onScreenShare}
          disabled={disabled}
          className="p-3 rounded-full bg-purple-600 hover:bg-purple-700 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Share screen"
        >
          <Share2 size={24} />
        </button>
      )}

      {/* Spacer */}
      <div className="w-4" />

      {/* End Call (Red button) */}
      <button
        onClick={onEndCall}
        disabled={disabled}
        className="p-3 rounded-full bg-red-600 hover:bg-red-700 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed animate-pulse"
        title="End call"
      >
        <Phone size={24} className="rotate-90" />
      </button>

      {/* Help Text */}
      <div className="ml-4 text-xs text-slate-300">
        {!isCameraOn && !isMicOn && (
          <p className="text-red-400 font-semibold">Camera & Mic OFF</p>
        )}
        {!isCameraOn && isMicOn && <p className="text-yellow-400">Camera OFF</p>}
        {isCameraOn && !isMicOn && <p className="text-yellow-400">Mic OFF</p>}
        {isCameraOn && isMicOn && (
          <p className="text-green-400 font-semibold">Connected</p>
        )}
      </div>
    </div>
  );
}

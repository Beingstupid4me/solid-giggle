/**
 * ClinicalVideoContainer.tsx
 *
 * Main video consultation component using LiveKit
 * - Doctor view: Large main feed with controls
 * - Medic view: Full-screen camera showing patient
 * - Automatic room name: sanocare-{consultationId}
 * - Token-based authentication
 */

'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  LiveKitRoom,
  VideoConference,
  GridLayout,
  ParticipantTile,
  useLocalParticipant,
  useRemoteParticipants,
  RoomAudioRenderer,
  Chat,
} from '@livekit/components-react';
import { Room } from 'livekit-client';
import { supabase } from '@/lib/supabase';
import { backendAPI } from '@/lib/backendAPI';
import { MediaControls } from './MediaControls';
import { AlertCircle, Loader } from 'lucide-react';

interface ClinicalVideoContainerProps {
  consultationId: string;
  userRole: 'doctor' | 'medic';
  isActive: boolean; // Only show when status is 'arrived' or 'vitals_captured'
  onCallEnd?: () => void;
}

export function ClinicalVideoContainer({
  consultationId,
  userRole,
  isActive,
  onCallEnd,
}: ClinicalVideoContainerProps) {
  const [livekitToken, setLivekitToken] = useState<string | null>(null);
  const [livekitUrl, setLivekitUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cameraFacing, setCameraFacing] = useState<'user' | 'environment'>('environment'); // Default back camera for medic
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [room, setRoom] = useState<Room | null>(null);

  // Fetch LiveKit token from backend
  const fetchVideoToken = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await backendAPI.getVideoToken(consultationId);

      if (!result.success) {
        setError(result.error || 'Failed to get video token');
        return;
      }

      const { token, livekitUrl } = result.data || {};

      if (!token || !livekitUrl) {
        setError('Invalid token response from server');
        return;
      }

      setLivekitToken(token);
      setLivekitUrl(livekitUrl);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(`Failed to initialize video: ${message}`);
      console.error('[Video] Token fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [consultationId]);

  useEffect(() => {
    if (!isActive) {
      setLivekitToken(null);
      setError(null);
      return;
    }

    fetchVideoToken();
  }, [isActive, fetchVideoToken]);

  const handleToggleCamera = async () => {
    if (room) {
      const newState = !isCameraOn;
      await room.localParticipant.setCameraEnabled(newState);
      setIsCameraOn(newState);
    }
  };

  const handleToggleMic = async () => {
    if (room) {
      const newState = !isMicOn;
      await room.localParticipant.setMicrophoneEnabled(newState);
      setIsMicOn(newState);
    }
  };

  const handleSwitchCamera = async () => {
    const newFacing = cameraFacing === 'user' ? 'environment' : 'user';
    setCameraFacing(newFacing);

    if (room) {
      try {
        const constraints =
          newFacing === 'environment'
            ? { video: { facingMode: { exact: 'environment' } } }
            : { video: { facingMode: { exact: 'user' } } };

        // Stop current camera
        await room.localParticipant.setCameraEnabled(false);

        // Restart with new facing mode
        setTimeout(async () => {
          await room.localParticipant.setCameraEnabled(true);
        }, 500);
      } catch (err) {
        console.error('[Video] Camera switch error:', err);
      }
    }
  };

  const handleEndCall = async () => {
    try {
      if (room) {
        await room.disconnect();
      }

      // Mark consultation as closed in database
      const { error: updateError } = await supabase
        .from('consultations')
        .update({
          status: 'closed',
          closed_at: new Date().toISOString(),
        })
        .eq('id', consultationId);

      if (updateError) {
        console.warn('[Video] Database update error:', updateError);
      }

      onCallEnd?.();
    } catch (err) {
      console.error('[Video] End call error:', err);
    }
  };

  if (!isActive) {
    return (
      <div className="w-full h-96 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
        Video will be available once medic has arrived
      </div>
    );
  }

  if (loading) {
    return (
      <div className="w-full h-96 rounded-lg bg-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader size={48} className="text-white animate-spin" />
          <p className="text-white text-sm">Initializing video session...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-96 rounded-lg bg-red-50 border-2 border-red-200 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 p-6">
          <AlertCircle size={48} className="text-red-600" />
          <div className="text-center">
            <p className="text-red-900 font-semibold">Video Call Failed</p>
            <p className="text-red-700 text-sm mt-2">{error}</p>
          </div>
          <button
            onClick={fetchVideoToken}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!livekitToken || !livekitUrl) {
    return (
      <div className="w-full h-96 rounded-lg bg-slate-900 flex items-center justify-center">
        <p className="text-white">Waiting for video session...</p>
      </div>
    );
  }

  return (
    <div className="w-full rounded-lg overflow-hidden border border-slate-200 shadow-lg bg-slate-900">
      {/* LiveKit Video Container */}
      <LiveKitRoom
        video={isCameraOn}
        audio={isMicOn}
        token={livekitToken}
        serverUrl={livekitUrl}
        onRoomStateChanged={setRoom}
        className="w-full h-96"
      >
        {/* Video Conference Grid */}
        <GridLayout>
          <ParticipantTile />
        </GridLayout>

        {/* Audio Renderer (for participants without video) */}
        <RoomAudioRenderer />

        {/* This slot will be filled with participant grid */}
      </LiveKitRoom>

      {/* Media Controls */}
      <MediaControls
        isCameraOn={isCameraOn}
        isMicOn={isMicOn}
        onToggleCamera={handleToggleCamera}
        onToggleMic={handleToggleMic}
        onToggleCameraFacing={userRole === 'medic' ? handleSwitchCamera : undefined}
        onScreenShare={userRole === 'doctor' ? undefined : undefined} // Can add later
        onEndCall={handleEndCall}
        userRole={userRole}
        disabled={!room}
      />

      {/* Call Info */}
      <div className="px-4 py-2 bg-slate-800 border-t border-slate-700 flex justify-between items-center text-sm text-slate-300">
        <div>
          <p className="font-semibold text-slate-100">
            {userRole === 'doctor' ? 'Doctor - You' : 'Medic - You'}
          </p>
          <p className="text-xs text-slate-400">Consultation ID: {consultationId}</p>
        </div>
        {room && (
          <div className="text-right">
            <p className="text-green-400 font-semibold">Connected</p>
            <p className="text-xs text-slate-400">
              {room.participants.size + 1} participant{room.participants.size !== 0 ? 's' : ''}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

import React, { createContext, useContext, useEffect, useCallback, useRef } from 'react';
import { useSegments, router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useMultiplayer } from '@/hooks/useMultiplayer';
import InvitationModal from '@/components/InvitationModal';

// ─── Context Type ───

type MultiplayerHookReturn = ReturnType<typeof useMultiplayer>;

interface MultiplayerContextType extends MultiplayerHookReturn {
  /** Whether the user is currently on a game screen */
  isInGame: boolean;
}

const MultiplayerContext = createContext<MultiplayerContextType | null>(null);

/**
 * Consume the global multiplayer context.
 * Must be used within `<MultiplayerProvider>`.
 */
export function useMultiplayerContext(): MultiplayerContextType {
  const ctx = useContext(MultiplayerContext);
  if (!ctx) {
    throw new Error('useMultiplayerContext must be used within MultiplayerProvider');
  }
  return ctx;
}

// ─── Game routes where status = 'playing' and invitations are suppressed ───

const GAME_ROUTES = ['game', 'multiplayer-game', 'results'];

// ─── Provider ───

export function MultiplayerProvider({ children }: { children: React.ReactNode }) {
  const { user, isGuest } = useAuth();
  const segments = useSegments();

  const userId = (!isGuest && user) ? user.id : null;
  const username = (!isGuest && user) ? user.username : null;

  // Single shared instance of the multiplayer hook for the entire app
  const multiplayer = useMultiplayer(userId, username);

  const {
    joinLobby,
    leaveLobby,
    updatePresenceStatus,
    pendingInvitation,
    currentRoom,
    acceptInvite,
    declineInvite,
    startMatch,
  } = multiplayer;

  // ─── Determine if user is on a game screen ───

  const currentRoute = (segments[0] || '') as string;
  const isInGame = GAME_ROUTES.includes(currentRoute);

  // ─── Auto-join lobby presence when authenticated ───

  useEffect(() => {
    if (userId && username) {
      joinLobby();
    } else {
      leaveLobby();
    }
  }, [userId, username, joinLobby, leaveLobby]);

  // ─── Auto-track presence status based on route + room state ───
  // 'playing' when: on a game screen OR have an active (non-finished/cancelled) room
  // 'online' otherwise

  useEffect(() => {
    if (!userId || !username) return;

    const hasActiveRoom =
      currentRoom != null &&
      currentRoom.status !== 'finished' &&
      currentRoom.status !== 'cancelled';

    const status = (isInGame || hasActiveRoom) ? 'playing' : 'online';
    updatePresenceStatus(status);
  }, [isInGame, currentRoom?.status, userId, username, updatePresenceStatus]);

  // ─── Room status automation ───
  // - Host auto-starts match when room becomes 'waiting'
  // - Both players auto-navigate to multiplayer-game when room becomes 'playing'

  const hasNavigatedRef = useRef(false);

  useEffect(() => {
    if (!currentRoom) {
      hasNavigatedRef.current = false;
      return;
    }

    // Host: auto-start the match once the guest has accepted
    if (currentRoom.status === 'waiting' && currentRoom.host_id === userId) {
      const timer = setTimeout(() => startMatch(), 500);
      return () => clearTimeout(timer);
    }

    // Both: navigate to the game screen when match starts
    if (currentRoom.status === 'playing' && !hasNavigatedRef.current) {
      hasNavigatedRef.current = true;

      // Only navigate if not already on the game screen
      if (currentRoute !== 'multiplayer-game') {
        router.push({
          pathname: '/multiplayer-game',
          params: {
            roomId: currentRoom.id.toString(),
            difficulty: currentRoom.difficulty,
            isHost: (currentRoom.host_id === userId).toString(),
          },
        });
      }
    }

    // Reset navigation guard when room finishes/cancels
    if (currentRoom.status === 'finished' || currentRoom.status === 'cancelled') {
      hasNavigatedRef.current = false;
    }
  }, [currentRoom?.status, currentRoom?.id, userId, currentRoute, startMatch]);

  // ─── Invitation modal: show everywhere EXCEPT during active games ───

  const showInvitation = !!pendingInvitation && !isInGame;

  const handleAcceptInvite = useCallback(() => {
    acceptInvite();
  }, [acceptInvite]);

  const handleDeclineInvite = useCallback(() => {
    declineInvite();
  }, [declineInvite]);

  // ─── Build context value ───

  const contextValue: MultiplayerContextType = {
    ...multiplayer,
    isInGame,
  };

  return (
    <MultiplayerContext.Provider value={contextValue}>
      {children}

      {/* Global invitation modal — appears on any screen except during games */}
      <InvitationModal
        visible={showInvitation}
        hostUsername={pendingInvitation?.hostUsername ?? ''}
        difficulty={pendingInvitation?.difficulty ?? 'easy'}
        onAccept={handleAcceptInvite}
        onDecline={handleDeclineInvite}
      />
    </MultiplayerContext.Provider>
  );
}

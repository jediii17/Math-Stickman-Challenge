import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';
import type { MathProblem } from '@/lib/math-engine';

// ─── Types ───

export interface OnlinePlayer {
  id: string;
  username: string;
  presenceRef?: string;
}

export interface Invitation {
  roomId: number;
  hostId: string;
  hostUsername: string;
  difficulty: 'easy' | 'average' | 'hard';
  createdAt: number; // timestamp ms
}

export interface MultiplayerRoom {
  id: number;
  host_id: string;
  guest_id: string | null;
  status: 'inviting' | 'waiting' | 'playing' | 'finished' | 'cancelled';
  difficulty: 'easy' | 'average' | 'hard';
  host_lives: number;
  guest_lives: number;
  host_score: number;
  guest_score: number;
  winner_id: string | null;
}

export interface BroadcastProblem {
  display: string;
  answer: number;
  stringAnswer?: string;
  questionNum: number;
}

// ─── Hook ───

export function useMultiplayer(userId: string | null, username: string | null) {
  const [onlinePlayers, setOnlinePlayers] = useState<OnlinePlayer[]>([]);
  const [pendingInvitation, setPendingInvitation] = useState<Invitation | null>(null);
  const [currentRoom, setCurrentRoom] = useState<MultiplayerRoom | null>(null);
  const [isInLobby, setIsInLobby] = useState(false);

  // Game channel state
  const [receivedProblem, setReceivedProblem] = useState<BroadcastProblem | null>(null);
  const [gameStarted, setGameStarted] = useState(false);

  const lobbyChannelRef = useRef<RealtimeChannel | null>(null);
  const roomChannelRef = useRef<RealtimeChannel | null>(null);
  const gameChannelRef = useRef<RealtimeChannel | null>(null);
  const inviteTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Use refs to avoid stale closure issues in timers/callbacks
  const pendingInvitationRef = useRef<Invitation | null>(null);
  const currentRoomRef = useRef<MultiplayerRoom | null>(null);

  // Keep refs in sync with state
  useEffect(() => {
    pendingInvitationRef.current = pendingInvitation;
  }, [pendingInvitation]);

  useEffect(() => {
    currentRoomRef.current = currentRoom;
  }, [currentRoom]);

  // ───── Subscribe to a specific room for real-time updates ─────

  const subscribeToRoom = useCallback((roomId: number) => {
    // Cleanup previous subscription
    if (roomChannelRef.current) {
      roomChannelRef.current.unsubscribe();
    }

    const channel = supabase
      .channel(`room_${roomId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'multiplayer_rooms',
          filter: `id=eq.${roomId}`,
        },
        (payload) => {
          const room = payload.new as MultiplayerRoom;
          setCurrentRoom(room);
        }
      )
      .subscribe();

    roomChannelRef.current = channel;

    // Also fetch the initial state
    supabase
      .from('multiplayer_rooms')
      .select('*')
      .eq('id', roomId)
      .single()
      .then(({ data }) => {
        if (data) setCurrentRoom(data as MultiplayerRoom);
      });
  }, []);

  // ───── Game Broadcast Channel (shared questions) ─────

  const joinGameChannel = useCallback((roomId: number) => {
    if (gameChannelRef.current) {
      gameChannelRef.current.unsubscribe();
    }

    const channel = supabase
      .channel(`game_${roomId}`)
      .on('broadcast', { event: 'question' }, ({ payload }) => {
        setReceivedProblem(payload as BroadcastProblem);
      })
      .on('broadcast', { event: 'game_start' }, () => {
        setGameStarted(true);
      })
      .subscribe();

    gameChannelRef.current = channel;
  }, []);

  const leaveGameChannel = useCallback(() => {
    if (gameChannelRef.current) {
      gameChannelRef.current.unsubscribe();
      gameChannelRef.current = null;
    }
    setReceivedProblem(null);
    setGameStarted(false);
  }, []);

  const broadcastQuestion = useCallback((problem: BroadcastProblem) => {
    if (gameChannelRef.current) {
      gameChannelRef.current.send({
        type: 'broadcast',
        event: 'question',
        payload: problem,
      });
    }
  }, []);

  const broadcastGameStart = useCallback(() => {
    if (gameChannelRef.current) {
      gameChannelRef.current.send({
        type: 'broadcast',
        event: 'game_start',
        payload: {},
      });
    }
  }, []);

  // ───── Decline / auto-expire an invitation ─────

  const declineInvite = useCallback(async () => {
    if (inviteTimerRef.current) clearTimeout(inviteTimerRef.current);

    const invitation = pendingInvitationRef.current;
    if (invitation) {
      await supabase
        .from('multiplayer_rooms')
        .update({ status: 'cancelled' })
        .eq('id', invitation.roomId);
    }

    setPendingInvitation(null);
  }, []);

  // ───── Join the lobby (presence tracking) ─────

  const joinLobby = useCallback(() => {
    if (!userId || !username) return;
    if (lobbyChannelRef.current) return;

    const channel = supabase.channel('lobby_presence', {
      config: { presence: { key: userId } },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState<{ id: string; username: string }>();
        const players: OnlinePlayer[] = [];
        for (const [key, presences] of Object.entries(state)) {
          if (key === userId) continue;
          const p = presences[0];
          if (p) {
            players.push({ id: p.id, username: p.username, presenceRef: key });
          }
        }
        setOnlinePlayers(players);
      })
      .on('broadcast', { event: 'invite' }, ({ payload }) => {
        if (payload.targetId === userId) {
          const invitation: Invitation = {
            roomId: payload.roomId,
            hostId: payload.hostId,
            hostUsername: payload.hostUsername,
            difficulty: payload.difficulty,
            createdAt: Date.now(),
          };
          setPendingInvitation(invitation);

          if (inviteTimerRef.current) clearTimeout(inviteTimerRef.current);
          inviteTimerRef.current = setTimeout(() => {
            declineInvite();
          }, 15000);
        }
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({ id: userId, username });
          setIsInLobby(true);
        }
      });

    lobbyChannelRef.current = channel;
  }, [userId, username, declineInvite]);

  // ───── Leave the lobby ─────

  const leaveLobby = useCallback(() => {
    if (lobbyChannelRef.current) {
      lobbyChannelRef.current.unsubscribe();
      lobbyChannelRef.current = null;
    }
    setIsInLobby(false);
    setOnlinePlayers([]);
  }, []);

  // ───── Send an invitation ─────

  const sendInvite = useCallback(async (targetId: string, difficulty: 'easy' | 'average' | 'hard') => {
    if (!userId || !username) return null;

    const { data, error } = await supabase
      .from('multiplayer_rooms')
      .insert({
        host_id: userId,
        guest_id: targetId,
        status: 'inviting',
        difficulty,
      })
      .select('id')
      .single();

    if (error || !data) {
      console.warn('[useMultiplayer] Failed to create room:', error?.message);
      return null;
    }

    if (lobbyChannelRef.current) {
      lobbyChannelRef.current.send({
        type: 'broadcast',
        event: 'invite',
        payload: {
          roomId: data.id,
          hostId: userId,
          hostUsername: username,
          targetId,
          difficulty,
        },
      });
    }

    subscribeToRoom(data.id);

    return data.id as number;
  }, [userId, username, subscribeToRoom]);

  // ───── Accept an invitation ─────

  const acceptInvite = useCallback(async () => {
    if (!pendingInvitation || !userId) return;
    if (inviteTimerRef.current) clearTimeout(inviteTimerRef.current);

    const { error } = await supabase
      .from('multiplayer_rooms')
      .update({ status: 'waiting' })
      .eq('id', pendingInvitation.roomId);

    if (error) {
      console.warn('[useMultiplayer] Failed to accept invite:', error.message);
      return;
    }

    subscribeToRoom(pendingInvitation.roomId);
    setPendingInvitation(null);
  }, [pendingInvitation, userId, subscribeToRoom]);

  // ───── Start the match (host triggers this) ─────

  const startMatch = useCallback(async () => {
    if (!currentRoom) return;

    await supabase
      .from('multiplayer_rooms')
      .update({ status: 'playing', host_lives: 5, guest_lives: 5, host_score: 0, guest_score: 0 })
      .eq('id', currentRoom.id);
  }, [currentRoom]);

  // ───── Report a life lost ─────

  const reportLifeLost = useCallback(async (isHost: boolean) => {
    const room = currentRoomRef.current;
    if (!room) return;

    const field = isHost ? 'host_lives' : 'guest_lives';
    const newLives = (isHost ? room.host_lives : room.guest_lives) - 1;
    const updates: Record<string, any> = { [field]: newLives };

    if (newLives <= 0) {
      updates.status = 'finished';
      updates.winner_id = isHost ? room.guest_id : room.host_id;
    }

    await supabase
      .from('multiplayer_rooms')
      .update(updates)
      .eq('id', room.id);
  }, []);

  // ───── Report a correct answer ─────

  const reportCorrectAnswer = useCallback(async (isHost: boolean) => {
    const room = currentRoomRef.current;
    if (!room) return;

    const field = isHost ? 'host_score' : 'guest_score';
    const newScore = (isHost ? room.host_score : room.guest_score) + 1;

    await supabase
      .from('multiplayer_rooms')
      .update({ [field]: newScore })
      .eq('id', room.id);
  }, []);

  // ───── Cancel / leave the room ─────

  const leaveRoom = useCallback(async () => {
    if (roomChannelRef.current) {
      roomChannelRef.current.unsubscribe();
      roomChannelRef.current = null;
    }

    const room = currentRoomRef.current;
    if (room && room.status !== 'finished') {
      await supabase
        .from('multiplayer_rooms')
        .update({ status: 'cancelled' })
        .eq('id', room.id);
    }

    setCurrentRoom(null);
  }, []);

  // ───── Cleanup on unmount ─────

  useEffect(() => {
    return () => {
      if (lobbyChannelRef.current) lobbyChannelRef.current.unsubscribe();
      if (roomChannelRef.current) roomChannelRef.current.unsubscribe();
      if (gameChannelRef.current) gameChannelRef.current.unsubscribe();
      if (inviteTimerRef.current) clearTimeout(inviteTimerRef.current);
    };
  }, []);

  return {
    // State
    onlinePlayers,
    pendingInvitation,
    currentRoom,
    isInLobby,
    receivedProblem,
    gameStarted,

    // Actions
    joinLobby,
    leaveLobby,
    sendInvite,
    acceptInvite,
    declineInvite,
    startMatch,
    reportLifeLost,
    reportCorrectAnswer,
    leaveRoom,
    subscribeToRoom,
    joinGameChannel,
    leaveGameChannel,
    broadcastQuestion,
    broadcastGameStart,
  };
}

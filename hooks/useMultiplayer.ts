import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';
import type { MathProblem } from '@/lib/math-engine';

// ─── Types ───

export interface OnlinePlayer {
  id: string;
  username: string;
  presenceRef?: string;
  status: 'online' | 'playing';
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
  current_question_num: number;
  host_answered_q: number;
  guest_answered_q: number;
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

  // ─── New answer-tracking state ───
  // ─── New answer-tracking state ───
  const [opponentAnsweredCurrentQ, setOpponentAnsweredCurrentQ] = useState<{
    playerId: string;
    questionNum: number;
    isCorrect: boolean;
    livesLeft: number;
    score: number;
    matchEnded: boolean;
  } | null>(null);
  const [bothAnsweredSignal, setBothAnsweredSignal] = useState<BroadcastProblem | null>(null);
  const [matchEnded, setMatchEnded] = useState<{ winnerId: string; reason?: 'surrender' } | null>(null);
  const [opponentAccessories, setOpponentAccessories] = useState<Record<string, string | null> | null>(null);

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
      supabase.removeChannel(roomChannelRef.current);
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

  // ───── Game Broadcast Channel (shared questions + answer sync) ─────

  const joinGameChannel = useCallback((roomId: number) => {
    if (gameChannelRef.current) {
      supabase.removeChannel(gameChannelRef.current);
    }

    const channel = supabase
      .channel(`game_${roomId}`)
      .on('broadcast', { event: 'question' }, ({ payload }) => {
        setReceivedProblem(payload as BroadcastProblem);
      })
      .on('broadcast', { event: 'game_start' }, () => {
        setGameStarted(true);
      })
      .on('broadcast', { event: 'player_answered' }, ({ payload }) => {
        // The other player answered — update local tracking
        if (payload.playerId !== userId) {
          setOpponentAnsweredCurrentQ(payload);
        }
      })
      .on('broadcast', { event: 'both_answered' }, ({ payload }) => {
        // Both players answered — carries the next question for the guest
        setBothAnsweredSignal(payload as BroadcastProblem);
      })
      .on('broadcast', { event: 'accessories' }, ({ payload }) => {
        // Received opponent's accessories
        if (payload.playerId !== userId) {
          setOpponentAccessories(payload.accessories);
        }
      })
      .on('broadcast', { event: 'match_end' }, ({ payload }) => {
        setMatchEnded({ winnerId: payload.winnerId, reason: payload.reason });
      })
      .on('broadcast', { event: 'surrender' }, ({ payload }) => {
        // Opponent surrendered
        if (payload.playerId !== userId) {
          setMatchEnded({ winnerId: userId!, reason: 'surrender' });
        }
      })
      .subscribe();

    gameChannelRef.current = channel;
  }, [userId]);

  const leaveGameChannel = useCallback(() => {
    if (gameChannelRef.current) {
      supabase.removeChannel(gameChannelRef.current);
      gameChannelRef.current = null;
    }
    setReceivedProblem(null);
    setGameStarted(false);
    setOpponentAnsweredCurrentQ(null);
    setBothAnsweredSignal(null);
    setMatchEnded(null);
  }, []);

  const broadcastAccessories = useCallback((accessories: Record<string, string | null>) => {
    if (gameChannelRef.current) {
      gameChannelRef.current.send({
        type: 'broadcast',
        event: 'accessories',
        payload: { playerId: userId, accessories },
      });
    }
  }, [userId]);

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
        const state = channel.presenceState<{ id: string; username: string; status: 'online' | 'playing' }>();
        const players: OnlinePlayer[] = [];
        for (const [key, presences] of Object.entries(state)) {
          if (key === userId) continue;
          const p = presences[0];
          if (p) {
            players.push({
              id: p.id,
              username: p.username,
              presenceRef: key,
              status: p.status || 'online'
            });
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
          await channel.track({ id: userId, username, status: 'online' });
          setIsInLobby(true);
        }
      });

    lobbyChannelRef.current = channel;
  }, [userId, username, declineInvite]);

  // ───── Leave the lobby ─────

  const leaveLobby = useCallback(() => {
    if (lobbyChannelRef.current) {
      supabase.removeChannel(lobbyChannelRef.current);
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
    
    // Track as playing
    if (lobbyChannelRef.current && userId && username) {
      lobbyChannelRef.current.track({ id: userId, username, status: 'playing' });
    }
  }, [pendingInvitation, userId, username, subscribeToRoom]);

  // ───── Start the match (host triggers this) ─────

  const startMatch = useCallback(async () => {
    if (!currentRoom) return;

    await supabase
      .from('multiplayer_rooms')
      .update({
        status: 'playing',
        host_lives: 5,
        guest_lives: 5,
        host_score: 0,
        guest_score: 0,
        current_question_num: 1,
        host_answered_q: 0,
        guest_answered_q: 0,
      })
      .eq('id', currentRoom.id);
  }, [currentRoom]);

  // ───── Submit an answer (replaces reportLifeLost / reportCorrectAnswer) ─────

  const submitAnswer = useCallback(async (params: {
    isHost: boolean;
    questionNum: number;
    isCorrect: boolean;
    localLives: number; // caller's accurate local lives count (AFTER this answer)
    localScore: number; // caller's accurate local score (AFTER this answer)
  }) => {
    const room = currentRoomRef.current;
    if (!room) return { matchEnded: false };

    // Duplicate check: skip if player already answered this question
    const alreadyAnswered = params.isHost
      ? room.host_answered_q >= params.questionNum
      : room.guest_answered_q >= params.questionNum;
    if (alreadyAnswered) return { matchEnded: false };

    const answeredField = params.isHost ? 'host_answered_q' : 'guest_answered_q';
    const updates: Record<string, any> = {
      [answeredField]: params.questionNum,
    };

    if (params.isCorrect) {
      const scoreField = params.isHost ? 'host_score' : 'guest_score';
      const currentScore = params.isHost ? room.host_score : room.guest_score;
      updates[scoreField] = currentScore + 1;
    } else {
      const livesField = params.isHost ? 'host_lives' : 'guest_lives';
      const currentLives = params.isHost ? room.host_lives : room.guest_lives;
      const newLives = currentLives - 1;
      updates[livesField] = newLives;

      if (newLives <= 0) {
        updates.status = 'finished';
        updates.winner_id = params.isHost ? room.guest_id : room.host_id;
      }
    }

    await supabase
      .from('multiplayer_rooms')
      .update(updates)
      .eq('id', room.id);

    // Use the caller's LOCAL accurate stats for broadcast (avoids stale room data)
    const didEnd = params.localLives <= 0;

    // Broadcast that this player has answered
    if (gameChannelRef.current) {
      gameChannelRef.current.send({
        type: 'broadcast',
        event: 'player_answered',
        payload: {
          playerId: userId,
          questionNum: params.questionNum,
          isCorrect: params.isCorrect,
          livesLeft: params.localLives,
          score: params.localScore,
          matchEnded: didEnd
        },
      });
    }

    if (didEnd) {
      const winnerId = params.isHost ? room.guest_id : room.host_id;
      // Broadcast match end to both clients
      if (gameChannelRef.current && winnerId) {
        gameChannelRef.current.send({
          type: 'broadcast',
          event: 'match_end',
          payload: { winnerId },
        });
      }
    }

    return { matchEnded: didEnd };
  }, [userId]);

  // ───── Surrender (end match giving win to opponent) ─────

  const surrenderMatch = useCallback(async () => {
    const room = currentRoomRef.current;
    if (!room || room.status === 'finished') return;

    const winnerId = userId === room.host_id ? room.guest_id : room.host_id;

    // Update DB
    await supabase
      .from('multiplayer_rooms')
      .update({
        status: 'finished',
        winner_id: winnerId
      })
      .eq('id', room.id);

    // Broadcast surrender
    if (gameChannelRef.current) {
      gameChannelRef.current.send({
        type: 'broadcast',
        event: 'surrender',
        payload: { playerId: userId },
      });
    }
  }, [userId]);

  // ───── Advance to the next question (host-only) ─────

  const advanceQuestion = useCallback(async (nextProblem: BroadcastProblem) => {
    const room = currentRoomRef.current;
    if (!room) return;

    // Update DB with next question number
    await supabase
      .from('multiplayer_rooms')
      .update({ current_question_num: nextProblem.questionNum })
      .eq('id', room.id);

    // Send the question via 'question' broadcast as a backup delivery channel
    broadcastQuestion(nextProblem);

    // Broadcast "both_answered" signal — this is the PRIMARY source of next question for the guest.
    // The guest has a questionNum guard to prevent double-processing from both channels.
    if (gameChannelRef.current) {
      gameChannelRef.current.send({
        type: 'broadcast',
        event: 'both_answered',
        payload: nextProblem,
      });
    }

    // Reset opponent tracking for the new question
    setOpponentAnsweredCurrentQ(null);
  }, [broadcastQuestion]);

  // ───── Reset answer tracking for a new question ─────

  const resetAnswerTracking = useCallback(() => {
    setOpponentAnsweredCurrentQ(null);
    setBothAnsweredSignal(null);
  }, []);

  // ───── Legacy functions (kept for computer mode compatibility) ─────

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
      supabase.removeChannel(roomChannelRef.current);
      roomChannelRef.current = null;
    }

    const room = currentRoomRef.current;
    if (room && room.status !== 'finished') {
      await supabase
        .from('multiplayer_rooms')
        .update({ status: 'cancelled' })
        .eq('id', room.id);
    }

    // Restore presence to online
    if (lobbyChannelRef.current && userId && username) {
      lobbyChannelRef.current.track({ id: userId, username, status: 'online' });
    }

    setCurrentRoom(null);
  }, [userId, username]);

  // ───── Cleanup on unmount ─────

  useEffect(() => {
    return () => {
      if (lobbyChannelRef.current) supabase.removeChannel(lobbyChannelRef.current);
      if (roomChannelRef.current) supabase.removeChannel(roomChannelRef.current);
      if (gameChannelRef.current) supabase.removeChannel(gameChannelRef.current);
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
    opponentAnsweredCurrentQ,
    bothAnsweredSignal,
    matchEnded,
    opponentAccessories,

    // Actions
    joinLobby,
    leaveLobby,
    sendInvite,
    acceptInvite,
    declineInvite,
    startMatch,
    submitAnswer,
    advanceQuestion,
    resetAnswerTracking,
    reportLifeLost,
    reportCorrectAnswer,
    leaveRoom,
    subscribeToRoom,
    joinGameChannel,
    leaveGameChannel,
    broadcastQuestion,
    broadcastGameStart,
    broadcastAccessories,
    surrenderMatch,
  };
}

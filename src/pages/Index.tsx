import { useRoom } from '@/hooks/useRoom';
import LobbyScreen from '@/components/LobbyScreen';
import ChatRoom from '@/components/ChatRoom';

const Index = () => {
  const {
    roomId, roomCode, username, isAdmin,
    messages, members, loading,
    createRoom, joinRoom, sendMessage, leaveRoom,
  } = useRoom();

  if (!roomId || !roomCode || !username) {
    return (
      <LobbyScreen
        onCreateRoom={createRoom}
        onJoinRoom={joinRoom}
        loading={loading}
      />
    );
  }

  return (
    <ChatRoom
      roomCode={roomCode}
      username={username}
      isAdmin={isAdmin}
      messages={messages}
      members={members}
      onSend={sendMessage}
      onLeave={leaveRoom}
    />
  );
};

export default Index;

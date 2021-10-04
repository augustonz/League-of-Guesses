import {useEffect, useRef} from 'react';
import {io,Socket} from 'socket.io-client';

const useSocket = () => {

  const ref = useRef<Socket>({} as Socket);

  const joinRoom = (username: string, room: string) => {
    ref.current.emit('join_room', {
      username,
      room
    });
  }

  const connect = (origin:string) => {
    const socket = io(origin);

    socket.on('disconnect', () => {
        console.log('disconnected');
      });
  
      socket.on('connect', () => {
          console.log('connected');
      });
  
      ref.current = socket;
  }

  const disconnect = () => {
      ref.current.disconnect();
  }

  useEffect(()=>{
      connect('http://localhost:8080');
      return ()=>{disconnect()}
  })
  return {joinRoom,
    disconnect,
    connect,
    socket:ref.current};
};

export default useSocket;
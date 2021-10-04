import { ReactNode,useContext,createContext,useRef, useState, useEffect } from "react";
import {io,Socket} from 'socket.io-client';
import {playerInfo} from '../types';
import Blank from '../assets/icons/blank.jpg';
import { stringify } from "querystring";

interface SocketContext {
    socket: Socket,
    username:string,
    ready:boolean,
    isAllReady:boolean,
    playersRoom:playerInfo[],
    isConnected: ()=>boolean,
    connect: (history:any)=>void,
    joinRoom: (username:string,room:string)=>Promise<boolean>,
    closeRoom: ()=>void,
    isLeader: ()=>Promise<boolean>,
    changeReady: ()=>void,
    leaveRoom: ()=>void,
    sendMessage: (message:string)=>void
}

interface Props {
    children:ReactNode
}

const socketContext=createContext<SocketContext>({} as SocketContext);

export function SocketContextProvider(props:Props) {

    const ref = useRef<Socket>({} as Socket);
    const [username,setUsername] = useState('');
    const [room,setRoom] = useState('');
    const [ready,setReady] = useState<boolean>(false);
    const [isAllReady,setAllReady] = useState<boolean>(false);
    const [playersRoom,setPlayersRoom] = useState<playerInfo[]>([]);

    useEffect(()=>{
        const startPlayerArray:playerInfo[] = [];
        for (let i=0;i<10;i++){
            startPlayerArray.push({username:'Blank',imageSrc:Blank,leader:false,ready:ready,points:0});
        }
        setPlayersRoom(startPlayerArray);
    },[]);

    useEffect(()=>{
        console.log(`Room code is ${room}`);
    },[room])

    function isConnected() {
        return ref.current.connected;
    }

    function reconnect() {
        const newSocket = io(process.env.REACT_APP_BACK_URL as string);
        ref.current=newSocket;
        const {username:oldUsername,room:oldRoom} = JSON.parse(localStorage.getItem('info') as string);
        setUsername(oldUsername);
        setRoom(oldRoom);
        console.log('RECONNECTED')
    }

    function connect(history:any) {
        const newSocket = io(process.env.REACT_APP_BACK_URL as string);

        newSocket.on('set_all_ready',(data:{isAllReady:boolean})=>{
            setAllReady(data.isAllReady);
        });

        newSocket.on('set_players',(data:{players:playerInfo[]})=>{
            data.players.map(player=>{
                if (!player.imageSrc){
                    player.imageSrc=Blank;
                }
            });
            setPlayersRoom(data.players);
        });

        newSocket.on('start_game',(data:{roomCode:string})=>{
            history.push(`/game/${data.roomCode}`);
        });

        ref.current=newSocket;
    }

    function closeRoom() {
        ref.current.emit('close_room',room);
    }

    function leaveRoom() {
        ref.current.emit('leave_room',room);
    }

    function joinRoom(usernameNew:string,roomNew:string) {
        return new Promise((resolve:(val:boolean)=>void)=>{
            ref.current.emit('join_room',{username:usernameNew,room:roomNew},(response:boolean)=>{
                if (response){
                    setUsername(usernameNew);
                    setRoom(roomNew);
                    localStorage.setItem('info',JSON.stringify({username:usernameNew,room:roomNew}));

                    resolve(true);
                } else {
                    resolve(false);
                }
            });
        });
    }

    function sendMessage(content:string) {
        ref.current.emit('send_message',{username,content,room});
    }

    function isLeader() {
        if (!isConnected()){
            reconnect();
        }
        return new Promise<boolean>((resolve)=>{
            ref.current.emit('is_leader',{username,room},(response:boolean)=>{
                resolve(response);
            })
        })
    }

    async function changeReady() {
        ref.current.emit('change_ready',{username,room,ready:!ready});
        setReady(!ready);
    }

    return(
        <socketContext.Provider value={
            {connect,
            ready,
            username,
            isAllReady,
            playersRoom,
            sendMessage,
            joinRoom,
            isConnected,
            closeRoom,
            isLeader,
            changeReady,
            leaveRoom,
            socket:ref.current}}>
            {props.children}
        </socketContext.Provider>
    )
}

export function useSocketContext() {
    return useContext(socketContext);
}
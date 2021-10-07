import { ReactNode,useContext,createContext,useRef, useState, useEffect } from "react";
import {io,Socket} from 'socket.io-client';
import {PlayerInfo,Game, UserRoom,Room,Message,personalGame} from '../types';

import BlankImage from '../assets/icons/blank.jpg';
import correctSound from '../assets/SFXs/correct.wav';
import allyCorrect from '../assets/SFXs/allyCorrect.wav';
import winSound from '../assets/SFXs/win.wav';

interface SocketContext {
    socket: Socket,
    username:string,
    ready:boolean,
    isAllReady:boolean,
    fullRoom:Room,
    game:Game,
    gameEnded:boolean,
    myGame:personalGame,
    isConnected: ()=>boolean,
    connect: (history:any)=>void,
    joinRoom: (username:string,room:string)=>Promise<boolean>,
    closeRoom: ()=>void,
    changeReady: ()=>void,
    leaveRoom: ()=>void,
    changeImg: (index:number)=>void,
    sendMessage: (message:string)=>void,
    backToMenu: ()=>void
}

interface Props {
    children:ReactNode
}

const socketContext=createContext<SocketContext>({} as SocketContext);

export function SocketContextProvider(props:Props) {

    const blankFullRoom = {room:'',isOpen:true,leader:{} as UserRoom,users:[]};
    const blankGame = {players:[],roomCode:'',images:[{winPoints:0,url:'',timeRemaining:20},{winPoints:0,url:'',timeRemaining:20},{winPoints:0,url:'',timeRemaining:20}]};
    const blankMyGame = {messages:[],correctItems:[false,false,false]};

    const ref = useRef<Socket>({} as Socket);

    const [game,setGame] = useState<Game>(blankGame);
    const [fullRoom,setFullRoom] = useState<Room>(blankFullRoom);
    const [myGame,setMyGame] = useState<personalGame>(blankMyGame);
    
    const [username,setUsername] = useState<string>('');
    const [ready,setReady] = useState<boolean>(false);
    const [isAllReady,setAllReady] = useState<boolean>(false);
    const [gameEnded,setGameEnded] = useState<boolean>(false);

    useEffect(()=>{
        const startPlayerArray:UserRoom[] = [];
        for (let i=0;i<10;i++){
            startPlayerArray.push({username:'Blank',imageSrc:BlankImage,isReady:false,socketId:'',room:''});
        }
        setFullRoom(fullRoom=>({...fullRoom,users:startPlayerArray}))
    // eslint-disable-next-line react-hooks/exhaustive-deps
    },[]);

    function playAudio(soundURL:string) {
        const sound = new Audio(soundURL);
        sound.play();
    }

    function isConnected() {
        return ref.current.connected;
    }

    function reconnect() {
        const newSocket = io(process.env.REACT_APP_BACK_URL as string);
        ref.current=newSocket;
        const {username:oldUsername,room:oldRoom} = JSON.parse(localStorage.getItem('info') as string);
        setUsername(oldUsername);
        setFullRoom(oldRoom);
    }

    function backToMenu() {
        setGame(blankGame);
    }
    function connect(history:any) {
        const newSocket = io(process.env.REACT_APP_BACK_URL as string);

        newSocket.on('set_all_ready',(data:{isAllReady:boolean})=>{
            setAllReady(data.isAllReady);
        });

        newSocket.on('set_players',(data:{players:UserRoom[]})=>{
            // eslint-disable-next-line array-callback-return
            data.players.map(player=>{
                if (!player.imageSrc){
                    player.imageSrc=BlankImage;
                }
            });
            setFullRoom(fullRoom=>({...fullRoom,users:data.players}))
        });

        newSocket.on('start_game',(data:Game)=>{
            history.push(`/game/${data.roomCode}`);
            // eslint-disable-next-line array-callback-return
            data.players.map(player=>{
                if (!player.imageSrc){
                    player.imageSrc=BlankImage;
                }
            });
            setGame(data);
        });

        newSocket.on('send_message',(data:Message)=>{
            setMyGame(OldGame=>{
                if (OldGame.messages.length>=60){
                    return {...OldGame,messages:[data,...OldGame.messages].slice(0,-1)};
                } else {
                   return {...OldGame,messages:[data,...OldGame.messages]};
                }
            });
        });

        newSocket.on('correct_message',(data:{points:number,index:number})=>{
            playAudio(correctSound);

            setMyGame(oldMyGame=>{
                let newArr = [...oldMyGame.correctItems];
                newArr[data.index]=true;
                return {...oldMyGame,correctItems:newArr}
            });
        });

        newSocket.on('other_correct',()=>{
            playAudio(allyCorrect);
        });

        newSocket.on('update_game',(data:Game)=>{
             // eslint-disable-next-line array-callback-return
            data.players.map(player=>{
                if (!player.imageSrc) {
                    player.imageSrc=BlankImage;
                }
            })

            for (let player of data.players) {
                if (player.points>=150) {
                    ref.current.emit('game_over',{game:data,winner:player});
                }
            }

            setGame(data);
        });

        newSocket.on('end_game',()=>{
            setFullRoom(blankFullRoom);
            setMyGame(blankMyGame);
            setReady(false);
            setUsername('');
            setAllReady(false);
            setGameEnded(true);

            playAudio(winSound);
        });

        ref.current=newSocket;
    }

    function changeImg(index:number) {
        setMyGame(oldMyGame=>{
            let newArr = [...oldMyGame.correctItems];
            newArr[index]=false;
            return {...oldMyGame,correctItems:newArr}
        });
    }

    function closeRoom() {
        ref.current.emit('close_room',fullRoom.room);
    }

    function leaveRoom() {
        setFullRoom(blankFullRoom);
        setUsername('');
        ref.current.emit('leave_room',fullRoom.room);
    }

    function joinRoom(usernameNew:string,roomNew:string) {
        return new Promise((resolve:(val:boolean)=>void)=>{
            ref.current.emit('join_room',{username:usernameNew,room:roomNew},(response:Room | null)=>{
                if (response){
                    setGameEnded(false);
                    setGame(blankGame);

                    setUsername(usernameNew);
                    // eslint-disable-next-line array-callback-return
                    response.users.map(user=>{
                        if (!user.imageSrc){
                            user.imageSrc=BlankImage;
                        }
                    });
                    setFullRoom(response);
                    localStorage.setItem('info',JSON.stringify({username:usernameNew,room:roomNew}));

                    resolve(true);
                } else {
                    resolve(false);
                }
            });
        });
    }

    function sendMessage(content:string) {
        ref.current.emit('send_message',{username,content,room:fullRoom.room,system:false,color:'#ffffff'} as Message,myGame.correctItems);
    }

    async function changeReady() {
        ref.current.emit('change_ready',{username,room:fullRoom.room,ready:!ready});
        setReady(!ready);
    }

    return(
        <socketContext.Provider value={
            {connect,
            ready,
            username,
            backToMenu,
            isAllReady,
            fullRoom,
            gameEnded,
            game,
            myGame,
            sendMessage,
            joinRoom,
            isConnected,
            closeRoom,
            changeReady,
            leaveRoom,
            changeImg,
            socket:ref.current}}>
            {props.children}
        </socketContext.Provider>
    )
}

export function useSocketContext() {
    return useContext(socketContext);
}
import React, { useEffect, useState } from 'react';
import './styles.scss';

import { useHistory } from 'react-router-dom';
import Button from '../../components/Button';
import { useParams } from 'react-router';
import { useSocketContext } from '../../contexts/SocketContext';
import LeagueCrown from '../../assets/icons/LeagueCrown';
import ReadyIcon from '../../assets/icons/ReadyIcon';


interface RoomParams {
    id:string
}

const Room = () => {

    const history = useHistory();
    const params = useParams<RoomParams>();
    const {ready,username,isAllReady,playersRoom,isLeader,changeReady,closeRoom,leaveRoom} = useSocketContext();
    const [IsLeader,setIsLeader] = useState<boolean>(false);
    const roomId = params.id;

    function handleBack() {
        leaveRoom();
        history.goBack();
    }

    function handleClose() {
        closeRoom();
    }

    async function handleChangeReady() {
        await changeReady();
    }

    useEffect(()=>{
        async function fetchData() {
            setIsLeader(await isLeader());
        }
        fetchData();
    },[]);

    return(
        <div className='room'>
            <div className='title'>
                <h1>Room: {roomId}</h1>
            </div>
            <div className='player-list'>
                {playersRoom.map((player,index)=>{
                    return(
                        <div className='player-box' key={index}>
                            <img src={player.imageSrc} alt='Summoner Icon'/>
                            <span>{player.username}</span>
                            {player.leader?
                            <LeagueCrown/>:
                            player.ready?
                            <ReadyIcon/>:
                            <></>}
                        </div>
                    )
                })}
            </div>
            <footer className='buttons'>
                <Button onClick={handleBack}>Go back</Button>
                {IsLeader?
                <Button disabled={!isAllReady} onClick={handleClose}>Start game</Button>:
                <Button onClick={handleChangeReady}>{ready?'Hold up!':'I\'m ready!'}</Button>}
            </footer>
        </div>
    )
}

export default Room;
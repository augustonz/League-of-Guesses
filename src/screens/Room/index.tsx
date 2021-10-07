import React from 'react';
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
    const {ready,isAllReady,fullRoom,username,changeReady,closeRoom,leaveRoom} = useSocketContext();
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

    return(
        <div className='room'>
            <div className='title'>
                <h1>Room: {roomId}</h1>
            </div>
            <div className='player-list'>
                {fullRoom.users.map((player,index)=>{
                    return(
                        <div className='player-box' key={index}>
                            <img src={player.imageSrc} alt='Summoner Icon'/>
                            <span>{player.username}</span>
                            {fullRoom.leader.username===player.username?
                            <LeagueCrown/>:
                            player.isReady?
                            <ReadyIcon/>:
                            <></>}
                        </div>
                    )
                })}
            </div>
            <footer className='buttons'>
                <Button onClick={handleBack}>Go back</Button>
                {fullRoom.leader.username===username?
                <Button disabled={!isAllReady} onClick={handleClose}>Start game</Button>:
                <Button onClick={handleChangeReady}>{ready?'Hold up!':'I\'m ready!'}</Button>}
            </footer>
        </div>
    )
}

export default Room;
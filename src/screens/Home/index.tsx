import React, { FormEvent, useEffect, useState } from 'react';
import './styles.scss';
//import useSocket from '../../hooks/useSocket';
import { useHistory } from 'react-router-dom';
import { useSocketContext } from '../../contexts/SocketContext';
import Button from '../../components/Button';

const Home = () => {

    const history = useHistory();
    const [username,setUsername] = useState<string>('');
    const [room,setRoom] = useState<string>('');

    const {joinRoom,connect,isConnected} = useSocketContext();
    useEffect(()=>{
        if (!isConnected()) {
            connect(history);
        }
    },[]);

    async function handleForm(ev:FormEvent) {
        ev.preventDefault();
        if (room.trim().length<=0) {
            console.log('Error informe a sala');
            return;
        } if (username.trim().length<=0) {
            console.log('Error informe o usuário');
            return;
        }
        const response = await joinRoom(username,room);
        if (response) {
            history.push(`/room/${room}`);
        } else {
            alert('Sala já está fecahda');
        }
    }

    return(
    <div className='home'>
        <h1>League of Guesses</h1>
        <form onSubmit={handleForm}>

            <span>Enter your username and room code</span>

            <div className='field'>
                <label>Username</label>
                <input autoFocus type='text' value={username} onChange={(ev)=>setUsername(ev.target.value)}></input>
            </div>
            <div className='field'>
                <label>Room code</label>
                <input type='text' value={room} onChange={(ev)=>setRoom(ev.target.value)}></input>
            </div>
            <Button type='submit'>Join Room</Button>
        </form>
    </div>
    )
}

export default Home;
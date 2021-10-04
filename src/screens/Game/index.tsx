import React, { KeyboardEvent, useState } from 'react';
import './styles.scss'

import { useSocketContext } from '../../contexts/SocketContext';

const Game = () => {

    const {playersRoom,sendMessage} = useSocketContext();
    const [message,setMessage] = useState<string>('');

    function handleKeyPress(event:KeyboardEvent) {
        if (event.key==='Enter') {
            sendMessage(message);
            setMessage('');
        }
    }

    return(
        <div className='game'>
            <aside>
                {playersRoom.map((player,index)=>{
                    return(
                        <div className='player-box' key={index}>
                            <img src={player.imageSrc} alt='Summoner Icon'/>
                            <div>
                                <span>{player.username}</span><br/>
                                <h6>{player.points} points</h6>
                            </div>
                            
                        </div>
                    )
                })}
            </aside>
            <main>
                <div>
                    <div className='chat'>
                        <span>Augusto: </span>
                        <span>Pyke Q</span>
                    </div>

                    <div className='input-box'>
                        <input onKeyPress={handleKeyPress} type='text' value={message} onChange={ev=>setMessage(ev.target.value)}/>
                    </div>
                </div>

                <div className='main-screen'>

                </div>
            </main>
        </div>
    )
}

export default Game;
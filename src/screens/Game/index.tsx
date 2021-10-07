import React, { KeyboardEvent, useEffect, useState } from 'react';
import Modal from 'react-modal';
import './styles.scss'

import { useHistory } from 'react-router-dom';
import { useSocketContext } from '../../contexts/SocketContext';

import ReadyIcon from '../../assets/icons/ReadyIcon';
import nextSound from '../../assets/SFXs/pop.wav';
import Button from '../../components/Button';

const Game = () => {

    const history = useHistory();
    const {game,sendMessage,myGame,changeImg,gameEnded,backToMenu} = useSocketContext();
    const [message,setMessage] = useState<string>('');
    const [images,setImages] = useState<{url:string,data:string}[]>([{data:'',url:''},{data:'',url:''},{data:'',url:''}]);

    useEffect(()=>{
        async function getImages() {
            const newImages:{data:string,url:string}[] = [...images];
            for (let i=0;i<game.images.length;i++){
                const img = game.images[i];
                if (!img.url) return;
                if (img.url!==newImages[i].url) {
                    changeImg(i);
                    const data = await import(`../../assets/skills/${img.url}`);
                    newImages[i].data=data.default;
                    newImages[i].url=img.url;
                }
            }
            setImages(newImages);
        }
        getImages();
        playAudio(nextSound);
    },[game.images[0].url,game.images[1].url,game.images[2].url]);

    function handleKeyPress(event:KeyboardEvent) {
        if (event.key==='Enter') {
            if (message.trim()!==''){
                sendMessage(message);
                setMessage('');
            }
        }
    }

    function playAudio(soundURL:string) {
        const sound = new Audio(soundURL);
        sound.play();
    }

    function handleLeaveGame() {
        backToMenu();
        history.push('/');
    }

    return(
        <>
            <div className='game'>
                <aside>
                    {game.players.map((player,index)=>{
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
                            {myGame.messages.map((message,index)=>{
                                return(
                                    <div className='message' key={index}>
                                        {message.system?
                                            <span style={{color:message.color}}>{message.content}</span>
                                        :<>
                                            <span>{message.username}:</span>
                                            <span>{message.content}</span>
                                        </>}
                                    </div>
                                )
                            })}
                        </div>

                        <div className='input-box'>
                            <input spellCheck='false' placeholder='Your answer' onKeyPress={handleKeyPress} type='text' value={message} onChange={ev=>setMessage(ev.target.value)}/>
                        </div>
                    </div>

                    <div className='main-screen'>
                        {game.images.map((img,index)=>{ 
                            return(
                                <div key={index}>
                                    <div className='image-holder'>
                                        <img  className={myGame.correctItems[index]?'correct':''} src={images[index].data} alt='test'/>
                                        {myGame.correctItems[index] && <ReadyIcon/>}
                                    </div>
                                    <span>{img.timeRemaining}</span>
                                </div>
                            );
                        })}
                    </div>
                </main>
            </div>

            <Modal isOpen={gameEnded} overlayClassName='overlay' className='modal'>
                <main>
                    <h1>Final scores</h1>
                    
                    {game.players.slice(0,5).map((player,index)=>{
                        return(
                            <div className='player-box' key={index}>
                                <img src={player.imageSrc} alt='Summoner Icon'/>
                                <div>
                                    <span>{player.username}</span>
                                    <span>Final score: {player.points} points</span>
                                </div>
                            </div>
                        )
                    })}
                </main>
                <footer>
                    <Button onClick={handleLeaveGame}>Leave game</Button>
                </footer>
            </Modal>
        </>
    )
}

export default Game;
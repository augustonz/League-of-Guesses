export interface PlayerInfo {
    username:string,
    imageSrc:string,
    points:number
}

export interface UserRoom {
    username:string,
    room:string,
    socketId:string,
    isReady:boolean,
    imageSrc:string
}

export interface Game {
    roomCode:string,
    players:PlayerInfo[],
    images:Image[]
}

export interface Image {
    url:string,
    winPoints:number,
    timeRemaining:number
}

export interface Room {
    room:string,
    isOpen:boolean,
    leader:UserRoom,
    users:UserRoom[]
}

export interface Message {
    content:string,
    username:string,
    room:string,
    color:string,
    system:boolean
}

export interface personalGame {
    messages:Message[],
    correctItems:boolean[]
}
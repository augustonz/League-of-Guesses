export interface playerInfo {
    username:string,
    imageSrc:string,
    leader:boolean,
    ready:boolean,
    points:number
}

export interface Message {
    content:string,
    username:string,
    room:string
}
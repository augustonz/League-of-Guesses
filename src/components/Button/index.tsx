import './styles.scss';
import {ButtonHTMLAttributes} from 'react';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  outlined?:boolean
}

export default function Button({outlined,...props}:Props) {

    return(
      <button className={`button ${outlined?'outlined':''}`} {...props}/>
    );
}
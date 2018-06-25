import React from 'react'
// import ReactDom from 'react-dom'
import Board from './board'

class Game extends React.Component {
    constructor(h, w, m) {
        super()
        this.state = {
        height: 8,
        width: 8,
        mines: 10,
    }   
    }
    render(){
        const { height, width, mines } = this.state;
        return (
            <div className='game'>
                <Board height={height} width={width} mines={mines} />
            </div>
        )
    }
}

export default Game;
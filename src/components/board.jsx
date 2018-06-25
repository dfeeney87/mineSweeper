import React from 'react'
// import ReactDom from 'react-dom'
import PropTypes from 'prop-types'
import Cell from './cell';

export default class Board extends React.Component {
    state = {
        boardData: this.initBoardData(this.props.height, this.props.width, this.props.mines),
        gameStatus: "Game in Progress",
        mineCount: this.props.mines,
    };

    emptyGrid (height, width) {
        let data = [];
        for (var i = 0; i<height;i++) {
            data.push([]);
            for (var j = 0; j<width; j++) {
                data[i][j] = {
                    x:j,
                    y:i,
                    isMine: false,
                    neighbor: 0,
                    isRevealed: false,
                    isEmpty: false,
                    isFlagged: false,
                }
            }
        }
        return data;
    }

    plantMines (data, height, width, mines) {
        let randomX, 
        randomY, 
        minesPlanted = 0;

        while (minesPlanted < mines) {
            randomX = (Math.floor(Math.random() * Math.floor(height)));
            randomY = (Math.floor(Math.random() * Math.floor(width)));
            if(!data[randomY][randomX].isMine) {
                data[randomY][randomX].isMine = true;
                minesPlanted++;
            }
        }
        return data;
    }

    traverseBoard (x, y, data) {
        var neighbors = [];

        //up
        if (y > 0) {
            neighbors.push(data[y-1][x])
        }
        //down
        if (y < this.props.height - 1) {
            neighbors.push(data[y+1][x])
        }
        //left
        if (x > 0) {
            neighbors.push(data[y][x-1])
        }
        //right
        if (x < this.props.width - 1) {
            neighbors.push(data[y][x+1])
        }
        //upleft
        if (x > 0 && y > 0) {
            neighbors.push(data[y-1][x-1])
        }
        //upright
        if (y > 0 && x < this.props.width -1) {
            neighbors.push(data[y-1][x+1])
        }
        //downright
        if (y < this.props.height - 1 && x < this.props.width -1) {
            neighbors.push(data[y+1][x+1])
        }
        //downleft
        if (y < this.props.height - 1 && x > 0) {
            neighbors.push(data[y+1][x-1])
        }
        return neighbors;
    }

    getNeighbors (data, height, width) {
        let updatedData = data;

        for (var i = 0; i < height; i++) {
            for (var j = 0; j < width; j++) {
                let dataPoint = data[i][j]
                if(!dataPoint.isMine){
                    let mine = 0;
                    const area = this.traverseBoard(dataPoint.x, dataPoint.y, data)
                    area.map((value)=>{
                        if (value.isMine) {
                            mine++;
                        }
                    })
                    if(mine === 0){
                        updatedData[i][j].isEmpty = true;
                    } else {
                        updatedData[i][j].neighbor = mine; 
                    }
                }
            }
        }
        return updatedData;
    }

    initBoardData (height, width, mines) {
        let data = this.emptyGrid(height,width);
        data = this.plantMines(data, height, width, mines);
        data = this.getNeighbors(data, height, width);
        return data;
    }

    revealEmpty(x, y, data) {
        let area = this.traverseBoard(x, y, data);
        area.forEach(value => {
            if(!value.isFlagged && !value.isRevealed && (value.isEmpty || !value.isMine)) {
                data[value.y][value.x].isRevealed = true;
                if (value.isEmpty) {
                    this.revealEmpty(value.x, value.y, data);
                }
            }
        })
        return data;
    }

    revealBoard(){
        let updatedData = this.state.boardData;
        updatedData.forEach(dRow=>{
            dRow.forEach(dataCell=>{
                dataCell.isRevealed = true;
            })
        })
        
        return this.setState({boardData:updatedData})
    }

    getMines(data){
        let mineArrray = [];
        data.forEach(dRow=>{
            dRow.forEach(dataCell=>{
                if (dataCell.isMine) {
                    mineArrray.push(dataCell)
                }
            })
        })
        return mineArrray;
    }

    getHidden(data){
        let hiddenArrray = [];
        data.forEach(dRow=>{
            dRow.forEach(dataCell=>{
                if (dataCell.isRevealed) {
                    hiddenArrray.push(dataCell)
                }
            })
        })
        return hiddenArrray;
    }

    getFlags(data){
        let flagArrray = [];
        data.forEach(dRow=>{
            dRow.forEach(dataCell=>{
                if (dataCell.isFlagged) {
                    flagArrray.push(dataCell)
                }
            })
        })
        return flagArrray;
    }

    handleCellClick (xSpot, ySpot) {
    
        let clickedCell =this.state.boardData[ySpot][xSpot]
        console.log(clickedCell)    
        if (clickedCell.isRevealed || clickedCell.isFlagged) {
            return null
        }

        if (clickedCell.isMine) {
            this.setState({gameStatus: 'YOU LOST'})
            this.revealBoard();
            alert("Game Over")
        }

        let updatedData = this.state.boardData;
        clickedCell.isFlagged = false;
        clickedCell.isRevealed = true;

        if (clickedCell.isEmpty) {
            console.log('heh smelly ass')
            updatedData = this.revealEmpty(xSpot, ySpot, updatedData);
        }

        if (this.getHidden(updatedData).length === this.props.mines) {
            this.setState({gameStatus:'YOU WIN'})
            this.revealBoard()
            alert('You Win')
        }

        this.setState({
            boardData: updatedData,
            mineCount: this.props.mines - this.getFlags(updatedData).length,
        })
    }


    handleContextMenu (event, xSpot, ySpot) {
        event.preventDefault();

        let updatedData = this.state.boardData;

        let checkCell = updatedData[ySpot][xSpot]

        let mines = this.state.mineCount;

        let win = false;

        if (checkCell.isRevealed) return;

        if (checkCell.isFlagged) {
            checkCell.isFlagged = false;
            mines++;
        } else {
            checkCell.isFlagged = true;
            mines--;
        }

        if (mines === 0) {
            const mineArray = this.getMines(updatedData);
            const flagArray = this.getFlags(updatedData);

            if(JSON.stringify(mineArray) === JSON.stringify(flagArray)) {
                this.setState({gameStatus: 'You win'})
                this.revealBoard();
                alert('YOU WIN');
            }

        }

        this.setState({
            boardData: updatedData,
            mineCount: mines,
            gameWon: win,
        })

    }
    
    renderBoard(data){
        return data.map((dataRow) => {
            return dataRow.map((dataCell)=>{
                return(
                    <div
                    key={dataCell.x * dataRow.length + dataCell.y}
                    >
                        <Cell
                            onClick={()=> this.handleCellClick(dataCell.x, dataCell.y)}
                            cMenu={(e)=> this.handleContextMenu(e, dataCell.x, dataCell.y)}
                            value={dataCell}
                         />
                        {(dataRow[dataRow.length - 1] === dataCell) ? <div className="clear" /> : ""}
                    </div>
                )
            })
        })
    }
    
    render(){
        return(
            <div className="board">
                <div className="game-info">
                    <span className="mine-count"> Mines Remaining: {this.state.mineCount} </span>
                    <span className="info"> Game Status: {this.state.gameStatus} </span>
                </div>
                {this.renderBoard(this.state.boardData)}
            </div>
        )
    }
}

Board.propTypes = {
    height: PropTypes.number,
    width: PropTypes.number,
    mines:PropTypes.number,
}
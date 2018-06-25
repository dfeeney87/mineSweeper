import React from 'react';
// import ReactDom from 'react-dom';
// import PropTypes from 'prop-types';

class Cell extends React.Component {
    getValue(){
        const { value } = this.props;
        if (!value.isRevealed) {
            return this.props.value.isFlagged ? 'F' : null;
        }
        if (value.isMine) {
            return 'M';
        }

        if (value.neighbor === 0) {
            return null;
        }
        return value.neighbor;
    }
    
    render(){
        const { value, onClick, cMenu } = this.props;
        let className =
        "cell" +
        (value.isRevealed ? "" : " hidden") +
        (value.isMine ? " is-mine" : "") +
        (value.isFlagged ? " is-flag" : "");
  
        return (
            <div 
                onClick={onClick}
                onContextMenu={cMenu}
                className={className}
            >
                {this.getValue()}
            </div>
        )
    }
}
// const cellItemShape = {
//     isRevealed: PropTypes.bool,
//     isMine: PropTypes.bool,
//     isFlagged: PropTypes.bool,
// }

export default Cell
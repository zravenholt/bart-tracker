import React from 'react';

class Option extends React.Component {
  constructor(props) {
    super(props);

    this.buildOption = this.buildOption.bind(this);
  }

  buildOption (obj) {
    console.log('build options called');
    let stationNames = {
      EMBR: 'Embarcadero',
      MONT: 'Montgomery',
      POWL: 'Powell',
      CIVC: 'Civic Center'
    };
    let possible = false;
    if (obj.leavesIn > obj.timeToGetThere) {
      possible = true;
    }
    let text = `Your train will take ${obj.timeToGetThere} 
      minutes to reach ${stationNames[obj.stationAbbr]}, and 
      your train leaves from there in ${obj.leavesIn}. 
      ${possible ? 'You can make it!' : 'You can\'t make it'}`;
    console.log(text);
    return text;
  }

  render() {
    return (
      <div >
        {this.buildOption(props.data)}
      </div>
    );
  }
}





export default Option;
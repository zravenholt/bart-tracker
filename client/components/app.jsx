import React from 'react';
import retrieveData from '../bart/bart.js';

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      stationData: [],
      startStationAbbr: false,
      endStationAbbr: false,
      startStationData: {},
      endStationData: {},
      EMBR: {},
      MONT: {},
      POWL: {},
      CIVC: {},
      stationOptions: null,
      stationTexts: null
    };

    this.handleStartChange = this.handleStartChange.bind(this);    
    this.handleEndChange = this.handleEndChange.bind(this);
    this.handleSubmission = this.handleSubmission.bind(this);    
    this.fillStationData = this.fillStationData.bind(this);
    this.checkBackTrackStations = this.checkBackTrackStations.bind(this);    
    this.calculateTimeDifference = this.calculateTimeDifference.bind(this);    
    this.calculateBackTime = this.calculateBackTime.bind(this);
    this.buildOption = this.buildOption.bind(this);    
  }

  handleStartChange(event) {
    this.setState({
      startStationAbbr: event.target.value
    });
  }
  
  handleEndChange(event) {
    this.setState({
      endStationAbbr: event.target.value
    });
  }

  handleSubmission() {
    this.fillStationData(this.state.startStationAbbr, this.state.endStationAbbr);
  }

  fillStationData(start, end) {
    let stateHolder = {};

    this.state.stationData.forEach((station) => {
      //first, check data for each of the back tracking stations
      if (station.abbr === 'EMBR') {
        stateHolder.EMBR = station;
      } else if (station.abbr === 'MONT') {
        stateHolder.MONT = station;
      } else if (station.abbr === 'POWL') {
        stateHolder.POWL = station;
      } else if (station.abbr === 'CIVC') {
        stateHolder.CIVC = station;
      }

      //then, check for user start and end points
      if (station.abbr === start) {
        stateHolder.startStationData = station;
      } else if (station.abbr === end) {
        stateHolder.endStationData = station;
      }
    });
    this.setState({
      EMBR: stateHolder.EMBR,
      MONT: stateHolder.MONT,
      POWL: stateHolder.POWL,
      CIVC: stateHolder.CIVC,
      startStationData: stateHolder.startStationData,
      endStationData: stateHolder.endStationData
    }, this.checkBackTrackStations);
  }

  checkBackTrackStations () {
    let stations = ['EMBR', 'MONT', 'POWL', 'CIVC'];
    for (let i = 0; i < stations.length; i++) {
      if (stations[i] === this.state.startStationAbbr) {
        let remainingStations = stations.slice(i, 4);
        this.calculateTimeDifference(remainingStations);
        break;
      }
    }
  }

  calculateTimeDifference (stations) {
    if (stations.length === 1) {
      this.setState({
        stationTexts: [`You are at Civic Center, this app does 
                        not check for further back hopping`]
      });
    } else {

      let foundDeparture = false;
      let stationDepartTimes = [];
      let leaveTime = null;
      let backWait = null;

      this.state[stations[0]].etd.forEach((departure) => {
        if (!foundDeparture) {
          if (departure.abbreviation === 'DALY' || departure.abbreviation === 'SFIA') {
            if (departure.estimate[0] !== 'Leaving') {
              backWait = [departure.abbreviation, parseInt(departure.estimate[0].minutes)];
            } else {
              backWait = [departure.abbreviation, parseInt(departure.estimate[1].minutes)];
            }
            foundDeparture = true;
          } 
        }
      });

      for (let i = 1; i < stations.length; i++) {
        for (let j = 0; j < this.state[stations[i]].etd.length; j++) {
          let depart = this.state[stations[i]].etd[j];
          if (depart.abbreviation === this.state.endStationAbbr) {
            if (depart.estimate[0].minutes !== 'Leaving') {
              leaveTime = parseInt(depart.estimate[0].minutes);
            } else {
              leaveTime = parseInt(depart.estimate[1].minutes);
            }
          }
        }
        stationDepartTimes.push([stations[i], leaveTime]);
      }
      let stationOptions = [];
      stationDepartTimes.forEach((tuple) => {
        let travelTime = this.calculateBackTime(this.state.startStationAbbr, tuple[0]);
        let totalBackTime = travelTime + backWait[1];
        stationOptions.push({
          stationAbbr: tuple[0],
          leavesIn: tuple[1],
          timeToGetThere: totalBackTime
        }); 
      });
      this.setState({
        stationOptions: stationOptions
      }, () => {
        this.buildOption();
      });
    }
  }

  calculateBackTime (start, backStation) {
    let stations = ['EMBR', 'MONT', 'POWL', 'CIVC'];
    let location = null;
    let end = null;
    for (let i = 0; i < stations.length; i++) {
      if (stations[i] === start) {
        location = i;
      } else if (stations[i] === backStation) {
        end = i;
      }
    }

    //I use this equation after looking at the regular schedules of
    //southbound trains through the city. Each stop takes approx.
    //1.5 minutes to get between.
    let travelTime = ((end - location) * 1.5);
    return travelTime;
  }

  buildOption () {
    let stationNames = {
      EMBR: 'Embarcadero',
      MONT: 'Montgomery',
      POWL: 'Powell',
      CIVC: 'Civic Center'
    };
    let holderArray = [];
    this.state.stationOptions.forEach((obj) => {
      let possible = false;
      if (obj.leavesIn > obj.timeToGetThere) {
        possible = true;
      }
      let text = `${possible ? `You can make it to ${stationNames[obj.stationAbbr]} 
                  with ${obj.leavesIn - obj.timeToGetThere} minutes to spare!` :
                  `You can\'t make it to ${stationNames[obj.stationAbbr]}`}`;
      holderArray.push(text);
    });
    this.setState({
      stationTexts: holderArray
    });
  }

  componentDidMount () {
    retrieveData(this);
  }

  render() {

    return (
      <div>
        <h3>Welcome to BART Hopper</h3>
        <select className='Menu' onChange={this.handleStartChange}>
          <option value='NONE'>Select your current location</option>
          <option value='EMBR'>Embarcadero</option>
          <option value='MONT'>Montgomery St.</option>
          <option value='POWL'>Powell St.</option>
          <option value='CIVC'>Civic Center/UN Plaza</option>
        </select>
        {this.state.startStationAbbr ? 
          <div>
            <select className='Menu' onChange={this.handleEndChange}>
              <option value='NONE'>Select your East Bay line</option>
              <option value='PITT'>Pittsburg/Bay Point</option>
              <option value='DUBL'>Dublin/Pleasanton</option>
              <option value='PHIL'>Pleasant Hill</option>
              <option value='RICH'>Richmond</option>
              <option value='WARM'>Warm Springs/South Fremont</option>
            </select>
          </div> : null}
        {this.state.endStationAbbr ? <button className='Btn' onClick={this.handleSubmission}>
          Click to See Options!</button> : null}
        {this.state.stationTexts ?
          <div>
            <h5 className='Text'>Assuming you hop on the next southbound train:</h5>
            <ul className='List'>
              {this.state.stationTexts.map((text) => 
                <li key={Math.random()}>{text}</li>
              )}
            </ul>
          </div> 
        : null}
        <div className='Btn'>
          <a href="javascript:location.reload(true)">Refresh Data</a>
        </div>
      </div>
    );
  }
}

export default App;


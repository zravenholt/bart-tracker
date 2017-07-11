import axios from 'axios';
import React, {setState} from 'react';

export default (context) => {
  axios.get('/retrieveData')
    .then((response) =>{
      context.setState({
        stationData: response.data.root.station
      });
    });
};
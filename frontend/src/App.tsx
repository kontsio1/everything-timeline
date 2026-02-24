import React from 'react';
import './App.css';
import {TimelinePage} from "./Components/TimelinePage";
import {bgColor} from "./Constants/GlobalConfigConstants";

function App() {
  return (
    <div className="App" style={{backgroundColor: bgColor, height: '100vh'}}>
        <TimelinePage/>
    </div>
  );
}

export default App;

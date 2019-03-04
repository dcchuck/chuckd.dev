import React, { Component } from 'react';
import github from './github.svg';
import './App.css';

const Github = () =>
  <a
    href="https://github.com/dcchuck"
  >
    <img src={github} className="Icon" />
  </a>

class App extends Component {
  render() {
    return (
      <div className="App">
        <div className="Name">
          <h1>Chuck</h1>
          <h1>Danielsson</h1>
        </div>
        <div className="Details">
          <div className="NavDesktop">
            <Github />
          </div>
          <h5 className="Gig">developer</h5>
          <div className="NavMobile">
            <Github />
          </div>
        </div>
      </div>
    );
  }
}

export default App;

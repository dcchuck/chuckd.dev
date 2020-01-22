import React, { Component } from 'react';
import { BrowserRouter as Router, Route, } from 'react-router-dom';
import {
  GithubLink,
} from './nav'

/**
 * stylesheet
 */
import './App.css';

const HomeScreen = () =>
  <div className="App">
    <div className="Name">
      <h1>Chuck</h1>
      <h1>Danielsson</h1>
    </div>
    <div className="Details">
      <div className="NavDesktop">
        <GithubLink />
      </div>
      <h5 className="Gig">developer</h5>
      <div className="NavMobile">
        <GithubLink />
      </div>
    </div>
  </div>

class App extends Component {
  render() {
    return (
      <Router>
        <div>
          <Route path="/" exact component={HomeScreen} />
        </div>
      </Router>
    );
  }
}

export default App;

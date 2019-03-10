import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Link } from 'react-router-dom';
import Logo from './elements/Logo';
import {
  GithubLink,
  AboutLink,
  HomeLink,
} from './nav'

import About from './pages/About'

/**
 * icons
 */
import { languages, services } from './logos'

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
        <AboutLink />
      </div>
      <h5 className="Gig">developer</h5>
      <div className="NavMobile">
        <GithubLink />
        <AboutLink />
      </div>
    </div>
  </div>

class App extends Component {
  render() {
    return (
      <Router>
        <div>
          <Route path="/" exact component={HomeScreen} />
          <Route path="/about/" exact component={About} />
        </div>
      </Router>
    );
  }
}

export default App;

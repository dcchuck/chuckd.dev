import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Link } from 'react-router-dom';

/**
 * icons
 */
import home from './home.svg';
import github from './github.svg';
import user from './user.svg';

import { languages, tools } from './logos'

/**
 * stylesheet
 */
import './App.css';

const Home = () =>
  <Link to="/">
    <img src={home} className="Icon" />
  </Link>

const Github = () =>
  <a
    href="https://github.com/dcchuck"
  >
    <img src={github} className="Icon" />
  </a>

const User = () =>
  <Link to="/about">
    <img src={user} className="Icon" />
  </Link>

const HomeScreen = () =>
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

const SummarySectionTitle = (props: any) =>
  <div className="SummarySectionTitle">{props.children}</div>

const SummarySection = (props: any) =>
  <div className="SummarySection">{props.children}</div>

const Logo = (props: any) => <img className="Logo" src={props.src} />

const ToolLogos = () => languages.map(( e, i ) => <Logo src={e} key={i} />)
const LanguageLogos = () => tools.map(( e, i ) => <Logo src={e} key={i} />)

const AboutNav = () =>
  <div className="AboutHeader">
    <div className="AboutTitle">ChuckD</div>
    <div className="AboutNav"><Home /></div>
  </div>

const Summary = () =>
  <div className="Summary">
    <SummarySectionTitle>
      Enjoys building things in languages like...
    </SummarySectionTitle>
    <SummarySection>
      { LanguageLogos() }
    </SummarySection>
    <SummarySectionTitle>
      Leveraging tools and frameworks like...
    </SummarySectionTitle>
    <SummarySection>
      { ToolLogos() }
    </SummarySection>
  </div>

const About = () =>
  <div className="About">
    <AboutNav />
    <Summary />
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

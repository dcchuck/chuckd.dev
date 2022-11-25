import {
  GithubLink,
} from '../nav'

export const Home = () =>
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
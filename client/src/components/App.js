import React, { Component }  from 'react';
import { Route, Redirect, Switch } from 'react-router'
import { connect } from 'react-redux'
import { logIn, logOut, setToken, updateToken } from '../redux/actions'

import { firebase } from '../firebase'
import '../styles/App.css';

import Login from './Login'
import Main from './Main'

import url from '../server'

class App extends Component {

  constructor(props) {
    super(props)

    this.state = { 
      error: '',
      isLoading: true,
    }
  }

  componentDidMount() {
    firebase.onAuthStateChanged(authUser => {
      if(authUser) {
        this.props.logIn(authUser)
        authUser.getIdToken(true)
          .then((token) => {
            this.props.setToken(token)
            this.props.updateToken(`${url}/api/updateToken`, { 'Content-Type': 'application/json', 'Authorization': token }, JSON.stringify({
              token
            }))
          })
      } else {
        this.props.logOut(authUser)
      }
      this.setState({ isLoading: false })
    })
  }

  loggedIn = () => {
    return this.props.loggedIn
  }

  render = () => {
    return (
      <div className="App">
        <Switch>
          <Route path="/login" render={(navProps) => 
            !this.loggedIn() || this.state.isLoading
            ? <Login {...navProps} />
            : <Redirect to="/data"/>
          }/>
          <Route path="/" render={(navProps) =>
            this.loggedIn() || this.state.isLoading
            ? <Main 
                {...this.props}
                logOut={this.logOut}
                uid={this.props.uid}
              />
            : <Redirect to="/login" />
          }/>
        </Switch>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    loggedIn: state.auth.loggedIn,
    account: state.auth.data ? state.auth.data : null,
    uid: state.auth.data ? state.auth.data.uid : null,
  }
}

const mapDispatchToProps = (dispatch) => {
	return {
    logIn: (user) => dispatch(logIn(user)),
    logOut: () => dispatch(logOut()),
    setToken: (token) => dispatch(setToken(token)),
    updateToken: (url, headers, body) => dispatch(updateToken(url, headers, body)),
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(App)
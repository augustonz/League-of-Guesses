import React from 'react';
import Home from './screens/Home';
import Room from './screens/Room';
import Game from './screens/Game';

import { SocketContextProvider } from './contexts/SocketContext';

import {BrowserRouter as Router,Route,Switch} from 'react-router-dom';

function App() {
  return (
    <SocketContextProvider>
      <Router>
        <Switch>
          <Route path='/' exact component={Home} />
          <Route path='/room/:id' component={Room} />
          <Route path='/game/:id' component={Game} />
        </Switch>
      </Router>
    </SocketContextProvider>
  );
}

export default App;

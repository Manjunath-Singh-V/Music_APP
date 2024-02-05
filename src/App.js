import React from 'react';
import {BrowserRouter as BR, Routes, Route} from 'react-router-dom'
import './App.css';
import MusicApp from './Pages/MusicApp';
import Test from './Pages/test'

function App() {
  return (
    <BR>
    <Routes>
      <Route exact path = 'MusicApp' element = {<MusicApp />} />
      <Route exact path = 'test' element = {<Test />} />
    </Routes>
    </BR>
  );
}

export default App;

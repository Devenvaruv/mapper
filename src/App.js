import React, { useEffect, useState } from "react";
import "./App.css";
import axios from "axios";

import { initializeApp } from "firebase/app";
import { getAuth, signInWithRedirect, GoogleAuthProvider } from "firebase/auth";


function App() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState("");
  const [pageNo, setPageNo] = useState(0);
  const [records, setRecords] = useState([]);
  const [userRecords, setUserRecords] = useState([]);

  const [phrases] = useState([
    "Change the world from here",
    "Be the change you wish to see",
    "Turn your wounds into wisdom",
  ]);
  const [phrase, setPhrase] = useState("");
  const [hiddenPhrase, setHiddenPhrase] = useState("");
  const [previousGuesses, setPreviousGuesses] = useState("");
  const [maxGuesses] = useState(1);
  const [wrongGuesses, setWrongGuesses] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [solved, setSolved] = useState(false);
  const [handle, setHandle] = useState("");

  const firebaseConfig = {
    apiKey: "AIzaSyCfndJ5pcN5lfzyyTxlT0WbyBCTV0ktncM",
    authDomain: "fir-test-58373.firebaseapp.com",
    projectId: "fir-test-58373",
    storageBucket: "fir-test-58373.appspot.com",
    messagingSenderId: "971121072370",
    appId: "1:971121072370:web:bdcdb9d48307b03f32586b",
    measurementId: "G-BK9B9VWGFK",
  };
  initializeApp(firebaseConfig);

  const signInWithGoogle = () => {
    const provider = new GoogleAuthProvider();
    const auth = getAuth();
    signInWithRedirect(auth, provider)
      .then((result) => {
        // User signed in
        console.log(result.user);
      })
      .catch((error) => {
        // Handle Errors here.
        console.error(error);
      });
  };
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        // User is signed in.
        console.log("User is signed in:", user);
        setUserId(user.uid);
      } else {
        // No user is signed in.
        console.log("No user is signed in.");
      }
    });
    return () => unsubscribe();
  }, []);

  function displayAllRecords() {
    axios
      .get("https://gamerecords-405919.wn.r.appspot.com/findAllGameRecord")
      .then((response) => {
        setRecords(response.data);
        console.log(response);
      })
      .catch((error) => {
        console.log(error);
      });
  }
  function displayAllUserRecords() {
    axios
      .get("https://gamerecords-405919.wn.r.appspot.com/findAllUserRecord")
      .then((response) => {
        setUserRecords(response.data);
        console.log(response);
      })
      .catch((error) => {
        console.log(error);
      });
  }
  

  // Function to generate a hidden version of the phrase
  const generateHiddenPhrase = (currentPhrase) => {
    const updatedHiddenPhrase = currentPhrase
      .split("")
      .map((char) => (char.match(/[a-zA-Z]/) ? "*" : char))
      .join("");
    setHiddenPhrase(updatedHiddenPhrase);
  };

  // Function to process a player's guess
  const processGuess = (guess) => {
    if (previousGuesses.includes(guess.toLowerCase())) {
      // Check if the guess has already been used
      alert("You have already tried this.");
      return;
    }

    if (phrase.toLowerCase().includes(guess.toLowerCase())) {
      const updatedHiddenPhrase = hiddenPhrase
        .split("")
        .map((char, index) => {
          if (phrase[index].toLowerCase() === guess.toLowerCase()) {
            return phrase[index];
          }
          return char;
        })
        .join("");
      setHiddenPhrase(updatedHiddenPhrase);

      if (updatedHiddenPhrase.toLowerCase() === phrase.toLowerCase()) {
        setGameOver(true); // The game is won
        setSolved(true);
      }
    } else {
      setWrongGuesses(wrongGuesses + 1);

      if (wrongGuesses >= maxGuesses - 1) {
        setGameOver(true); // The game is over
      }
    }

    setPreviousGuesses(previousGuesses + guess.toLowerCase() + ",");
  };
  const handleNameChange = (event) => {
    setHandle(event.target.value);
  };
  const handleSubmitName = () => {
    setPageNo(3)
    displayAllRecords();
    displayAllUserRecords();
    console.log(records);

    
    
    
  };


  // Function to start a new game
  const newGame = () => {
    // Reset all game state variables and select a new phrase
    setHiddenPhrase("");
    setPreviousGuesses("");
    setWrongGuesses(0);
    setGameOver(false);
    setSolved(false);

    // Select a random phrase from the provided phrases
    const randomIndex = Math.floor(Math.random() * phrases.length);
    setPhrase(phrases[randomIndex]);
    generateHiddenPhrase(phrases[randomIndex]);
  };

  //Component did mount
  React.useEffect(() => {
    newGame(); // Initialize the game with a random phrase
  }, [phrases]);

  return (
    <>
      {!userId && (
        <button type="button" className="wofButton" onClick={signInWithGoogle}>
          Sign in with Google
        </button>
      )}
      {userId && (
        <div className="App">
          {!gameOver ? (
            <div>
              <h1>Wheel of Fortune</h1>
              <div className="phrase">{hiddenPhrase}</div>
              <div className="previous-guesses">
                Previous Guesses: {previousGuesses}
              </div>
              <input
                type="text"
                maxLength="1"
                onChange={(e) => {
                  const guess = e.target.value;
                  if (guess.match(/[a-zA-Z]/) && guess.length === 1) {
                    processGuess(guess);
                    e.target.value = "";
                  } else {
                    alert("Please enter Alphabet only");
                    e.target.value = "";
                  }
                }}
              />
              <div className="wrong-guesses">Wrong Guesses: {wrongGuesses}</div>
            </div>
          ) : (
            <div className="end-game-message">
              {solved && pageNo === 0 && (<div className="win-message">YOU WON!!</div>)}
              {!solved && pageNo === 0 && (<div className="lose-message">Game Over!</div>)}
              {pageNo === 0 && (
                <div>
                  <p>do you want to save your game record?</p>
                  <button type="button" onClick={() => { setPageNo(2)}}> Yes </button>
                  <button type="button" onClick={() => {setPageNo(1)}}> No </button>
                </div>
              )}
              {pageNo === 1 && <button onClick={newGame}>New Game</button>}

              {pageNo === 2 && <div>
        <label htmlFor="nameInput">Enter your name:</label>
        <input
          type="text"
          id="nameInput"
          value={handle}
          onChange={handleNameChange}
        />
        <button type="button" onClick={handleSubmitName}>Submit Name</button>
      </div>}

      {pageNo === 3 && records.map((record) => (
         <div className="record-item">
         <h3>{record.id}</h3>
         <p>by {record.score}</p>
         <p> {record.date}</p>
         <p> {record.userId}</p>
       </div>
      )) }
     {pageNo === 4 && userRecords.map((record) => (
        <div className="-item">
        <h3>{record.id}</h3>
        <p>by {record.score}</p>
        <p> {record.handle}</p>
        <p> {record.date}</p>
        <p> {record.userId}</p>
      </div>
     ))}

            </div>
          )}
        </div>
      )}
    </>
  );
}

export default App;

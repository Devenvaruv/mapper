import React, { useEffect, useState } from "react";
import "./App.css";
import axios from "axios";

import { initializeApp } from "firebase/app";
import { getAuth, signInWithRedirect, GoogleAuthProvider } from "firebase/auth";


function App() {
  const [phrases] = useState([
    "Change the world from here",
    "Be the change you wish to see",
    "Turn your wounds into wisdom",
  ]);
  const [phrase, setPhrase] = useState("");
  const [hiddenPhrase, setHiddenPhrase] = useState("");
  const [previousGuesses, setPreviousGuesses] = useState("");
  const [maxGuesses] = useState(5);
  const [wrongGuesses, setWrongGuesses] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [solved, setSolved] = useState(false);
  const [userName, setUserName] = useState("");
  const [userId, setUserId] = useState("");
  const [CurrentPage, setCurrentPage] = useState(0);
  const [allGameRecord, setAllGameRecord] = useState([]);
  const [currentUserRecords, setCurrentUserRecords] = useState([]);


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

  function showAllGameRecords() {
    axios
      .get("https://gamerecords-405919.wn.r.appspot.com/findAllGameRecord")
      .then((response) => {
        const sortedData = response.data.sort((a, b) => b.score - a.score);
        setAllGameRecord(sortedData);
        console.log(response);
      })
      .catch((error) => {
        console.log(error);
      });
  }

  function showCurrentUserRecord() {
    axios
      .get("https://gamerecords-405919.wn.r.appspot.com/findAllUserRecord")
      .then((response) => {
        setCurrentUserRecords(response.data);
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
  const userNameNameChange = (event) => {
    setUserName(event.target.value);
  };
  const userNameSubmitName = () => {
    const postData = {
      handle: userName,
      userId: userId,
      score: maxGuesses - wrongGuesses,
      date: new Date().toLocaleString(), 
    }
    const postDataTwo = {
      userId: userId,
      score: maxGuesses - wrongGuesses,
      date: new Date().toLocaleString(), 
    }

    axios.post('https://gamerecords-405919.wn.r.appspot.com/saveUserRecord', postData)
    .then(response => {
      console.log('Data posted successfully:', response.data)
    }).catch(error => {
      console.error('Error posting data:', error);
    })
    axios.post('https://gamerecords-405919.wn.r.appspot.com/saveGameRecord', postDataTwo)
    .then(response => {
      console.log('Data posted successfully:', response.data)
    }).catch(error => {
      console.error('Error posting data:', error);
    }) 
    setCurrentPage(5)
    showAllGameRecords();
    showCurrentUserRecord();
    console.log(allGameRecord);

  };
  const handleDelete = async (recordId) => {
    try {
      const response = await axios.delete(`https://gamerecords-405919.wn.r.appspot.com/deleteUserRecord`, { params: { id: recordId } });
      console.log(response.data);
      // Add your logic to handle the UI update or state change after deletion
    } catch (error) {
      console.error("Error deleting record: ", error);
      // Handle error
    }
  };

  // Function to start a new game
  const newGame = () => {
    // Reset all game state variables and select a new phrase
    setHiddenPhrase("");
    setPreviousGuesses("");
    setWrongGuesses(0);
    setGameOver(false);
    setSolved(false);
    setCurrentPage(0);
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
              {solved && CurrentPage === 0 && (<div className="win-message">YOU WON!!</div>)}
              {!solved && CurrentPage === 0 && (<div className="lose-message">Game Over!</div>)}
              {CurrentPage === 0 && (
                <div>
                  <p>do you want to save your game record?</p>
                  <button type="button" onClick={() => { setCurrentPage(2)}}> Yes </button>
                  <button type="button" onClick={() => {setCurrentPage(1)}}> No </button>
                </div>
              )}
              {CurrentPage === 1 && <button onClick={newGame}>New Game</button>}

              {CurrentPage === 2 && <div>
        <label htmlFor="nameInput">Enter your name:</label>
        <input
          type="text"
          id="nameInput"
          value={userName}
          onChange={userNameNameChange}
        />
        <button type="button" onClick={userNameSubmitName}>Submit Name</button>
      </div>}
      {CurrentPage === 5 && (<div>
                  <p>do you want to view your record or all??</p>
                  <button type="button" onClick={() => { setCurrentPage(3)}}> ALL record </button>
                  <button type="button" onClick={() => {setCurrentPage(4)}}> Your Record </button>
                </div>)}

      {CurrentPage === 3 && allGameRecord.map((record) => (
         <div className="record-item">
         <h3>anon</h3>
         <p>{record.score}</p>
         <p> {record.date}</p>
       </div>
      )) }
     {CurrentPage === 4 && currentUserRecords.map((record) => (
      
        <div className="record-item">
          {record.userId === userId && (
      <>
        <p>{record.handle}</p>
        <p>{record.score}</p>
        <p>{record.date}</p>
        <button onClick={() => handleDelete(record.id)}>Delete</button>
      </>
    )}
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

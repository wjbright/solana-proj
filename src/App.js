import React, { useEffect, useState } from "react";
import { Connection, PublicKey, clusterApiUrl } from "@solana/web3.js";
import { Program, Provider, web3 } from "@project-serum/anchor";
import idl from "./idl.json";
import kp from "./keypair.json";
import twitterLogo from "./assets/twitter-logo.svg";
import {
  checkIfWalletIsConnected,
  renderNotConnectedContainer,
  renderConnectedContainer,
  getGifList,
  createGifAccount,
} from "./helper";
import "./App.css";

// Constants
const TWITTER_HANDLE = "_wjbright";
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;

// An app to drop vetted interns (vetted through  CVs, randomized interview questions, and coding challenges on a block chain)
// Recruiters pay a small gas fee to hire an intern after reviewing their details

const App = () => {
  const [walletAddress, setWalletAddress] = useState(null);
  const [inputValue, setInputValue] = useState("");
  const [gifList, setGifList] = useState([]);

  // System Program is a reference to the Solana runtime
  const { SystemProgram, Keypair } = web3;

  // create a keypair for the account that will hold our gifs
  const arr = Object.values(kp._keypair.secretKey);
  const secret = new Uint8Array(arr);
  const baseAccount = web3.Keypair.fromSecretKey(secret);

  // get our program's id from the IDL file.
  const programID = new PublicKey(idl.metadata.address);

  // set our network to devnet.
  const network = clusterApiUrl("devnet");

  // control how we want to acknowledge when a transaction is "done"
  const opts = {
    preflightCommitment: "processed",
  };

  useEffect(() => {
    const onLoad = async () => {
      await checkIfWalletIsConnected(setWalletAddress);
    };

    window.addEventListener("load", onLoad);
    return () => window.removeEventListener("load", onLoad);
  }, []);

  useEffect(() => {
    if (walletAddress) {
      console.log("Fetching GIF list...");
      // Call Solana program here.
      getGifList({
        Program,
        Connection,
        Provider,
        network,
        opts,
        idl,
        programID,
        baseAccount,
        setGifList,
      });
    }
  }, [walletAddress]);

  return (
    <div className="App">
      <div className={walletAddress ? "authed-container" : "container"}>
        <div className="header-container">
          <p className="header">🪞 Krak Portal</p>
          <p className="sub-text">Rare minted pictures of Lord Krak 👽</p>
          {!walletAddress && renderNotConnectedContainer(setWalletAddress)}
          {walletAddress &&
            renderConnectedContainer(
              inputValue,
              setInputValue,
              gifList,
              setGifList,
              Program,
              Connection,
              Provider,
              SystemProgram,
              network,
              opts,
              idl,
              programID,
              baseAccount,
              setGifList
            )}
        </div>
        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built by @${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  );
};

export default App;

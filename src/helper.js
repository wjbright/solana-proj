// eslint-disable-next-line no-unused-vars
const TEST_GIFS = [
  "https://media.giphy.com/media/dyjrpqaUVqCELGuQVr/giphy.gif",
  "https://media.giphy.com/media/QexWWszyJE1CG3MSqq/giphy.gif",
  "https://media.giphy.com/media/tEcIyVc6ukQV2eb86t/giphy.gif",
  "https://media.giphy.com/media/QpDBsX0ZbjbsiQw1xS/giphy.gif",
];

const checkIfWalletIsConnected = async (setWalletAddress) => {
  try {
    // Try and get the solana object injected into the window object once website loads
    const { solana } = window;

    if (solana) {
      // check whether the solana object has the phantom wallet connected
      if (solana.isPhantom) {
        console.log("Phantom wallet found");

        // connect to user's wallet
        const { publicKey } = await solana.connect({ onlyIfTrusted: true });
        setWalletAddress(publicKey);

        console.log("Connected with Public key: ", publicKey.toString());
      } else {
        alert("Solana object not found! Get a phantom wallet now!!!");
      }
    }
  } catch (error) {
    console.log("Solana Error: ", error);
  }
};

const connectWallet = async (setWalletAddress) => {
  const { solana } = window;

  if (solana) {
    const { publicKey } = await solana.connect();
    console.log("Connected with Public Key: ", publicKey.toString());

    setWalletAddress(publicKey);
  }
};

const renderNotConnectedContainer = (setWalletAddress) => {
  return (
    <button
      className="cta-button connect-wallet-button"
      onClick={() => connectWallet(setWalletAddress)}
    >
      Connect to wallet
    </button>
  );
};

const onInputChange = (event, setInputValue) => {
  const { value } = event.target;
  setInputValue(value);
};

const getProvider = ({ Connection, Provider, network, opts }) => {
  const connection = new Connection(network, opts.preflightCommitment);
  const provider = new Provider(
    connection,
    window.solana,
    opts.preflightCommitment
  );

  return provider;
};

const createGifAccount = async ({
  Program,
  Connection,
  Provider,
  SystemProgram,
  network,
  opts,
  idl,
  programID,
  baseAccount,
  setGifList,
}) => {
  try {
    const provider = getProvider({ Connection, Provider, network, opts });
    const program = new Program(idl, programID, provider);
    console.log("ring ring");

    await program.rpc.startStuff({
      accounts: {
        baseAccount: baseAccount.publicKey,
        user: provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      },
      signers: [baseAccount],
    });

    console.log(
      "Created a new BaseAccount w/ address:",
      baseAccount.publicKey.toString()
    );
    await getGifList({
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
  } catch (error) {
    console.log("Error creating BaseAccount account:", error);
  }
};

const sendGif = async (
  Connection,
  Provider,
  Program,
  baseAccount,
  network,
  opts,
  idl,
  programID,
  inputValue,
  setInputValue,
  setGifList
) => {
  if (inputValue.length === 0) {
    console.log("No gif link given");
    return;
  }

  setInputValue("");
  console.log("Gif link:", inputValue);
  try {
    const provider = getProvider({ Connection, Provider, network, opts });
    const program = new Program(idl, programID, provider);

    await program.rpc.addGif(inputValue, {
      accounts: {
        baseAccount: baseAccount.publicKey,
        user: provider.wallet.publicKey,
      },
    });

    console.log("GIF successfully sent to program", inputValue);

    await getGifList({
      Connection,
      Provider,
      network,
      opts,
      idl,
      programID,
      baseAccount,
      setGifList,
    });
  } catch (error) {}
};

const getGifList = async ({
  Program,
  Connection,
  Provider,
  network,
  opts,
  idl,
  programID,
  baseAccount,
  setGifList,
}) => {
  try {
    const provider = getProvider({ Connection, Provider, network, opts });
    const program = new Program(idl, programID, provider);
    const account = await program.account.baseAccount.fetch(
      baseAccount.publicKey
    );

    console.log("Got the account", account);
    setGifList(account.gifList);
  } catch (error) {
    console.error("Error in getGifList:", error);
    setGifList(null);
  }
};

const renderConnectedContainer = (
  inputValue,
  setInputValue,
  gifs,
  setGifList,
  Program,
  Connection,
  Provider,
  SystemProgram,
  network,
  opts,
  idl,
  programID,
  baseAccount
) => {
  if (gifs === null) {
    return (
      <div className="connected-container">
        <button
          className="cta-button submit-gif-button"
          onClick={() =>
            createGifAccount({
              Program,
              Connection,
              Provider,
              SystemProgram,
              network,
              opts,
              idl,
              programID,
              baseAccount,
              setGifList,
            })
          }
        >
          Do One-Time Initialization For GIF Program Account
        </button>
      </div>
    );
  } else {
    return (
      <div className="connected-container">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            sendGif(
              Connection,
              Provider,
              Program,
              baseAccount,
              network,
              opts,
              idl,
              programID,
              inputValue,
              setInputValue,
              setGifList
            );
          }}
        >
          <input
            type="text"
            placeholder="Enter gif link!"
            value={inputValue}
            onChange={(e) => onInputChange(e, setInputValue)}
          />
          <button type="submit" className="cta-button submit-gif-button">
            Submit
          </button>
        </form>
        <div className="gif-grid">
          {gifs.map((gif, index) => (
            <div className="gif-item" key={index}>
              <img src={gif.gifLink} alt={gif.gifLink} />
            </div>
          ))}
        </div>
      </div>
    );
  }
};

export {
  connectWallet,
  checkIfWalletIsConnected,
  renderConnectedContainer,
  renderNotConnectedContainer,
  getGifList,
  createGifAccount,
};

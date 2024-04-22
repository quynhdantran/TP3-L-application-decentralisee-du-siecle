// const web3 = new Web3('https://sepolia.etherscan.io/address/0x777eaad22e5db1cab49c8f9e7d79a676ea4d8d32');

// const infuraApiKey = '2d8a4e1ac6eb4b39819c2187e9a6fa89';
// const infuraRpcUrl = `https://mainnet.infura.io/v3/${infuraApiKey}`;
// const web3 = new Web3(new Web3.providers.HttpProvider(infuraRpcUrl));

const alchemyApiKey = '9bXAy7IyQccZEcBT3pqBFDcVbGAZHa-N';
const alchemyRpcUrl = `https://eth-sepolia.g.alchemy.com/v2/${alchemyApiKey}`;
const web3 = new Web3(new Web3.providers.HttpProvider(alchemyRpcUrl));


const contractAbi = [
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "address",
        "name": "loser",
        "type": "address"
      }
    ],
    "name": "HasLost",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "address",
        "name": "winner",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "winningAmount",
        "type": "uint256"
      }
    ],
    "name": "HasWon",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "winningPrize",
        "type": "uint256"
      }
    ],
    "name": "NewDraw",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "finalized",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "constant": true
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "constant": true
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "players",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "constant": true
  },
  {
    "inputs": [],
    "name": "winningPrize",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "constant": true
  },
  {
    "stateMutability": "payable",
    "type": "receive",
    "payable": true
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_initialOwner",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "_initialWinningPrize",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_initialLuckyNumber",
        "type": "uint256"
      }
    ],
    "name": "initialize",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getFinalized",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "constant": true
  },
  {
    "inputs": [],
    "name": "getWinningPrize",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "constant": true
  },
  {
    "inputs": [],
    "name": "hasAlreadyPlayed",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "constant": true
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_number",
        "type": "uint256"
      }
    ],
    "name": "isValid",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "pure",
    "type": "function",
    "constant": true
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_newLuckyNumber",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_newWinningPrize",
        "type": "uint256"
      }
    ],
    "name": "changeAmounts",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_betNumber",
        "type": "uint256"
      }
    ],
    "name": "play",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "payable",
    "type": "function",
    "payable": true
  }
];

const contractAddress = '0xcb3DC3cf17F8c63b5A8854174e97fa3c6850970C';
const contractInstance = new web3.eth.Contract(contractAbi, contractAddress);


const form = document.getElementById('participation-form');
const confetti = document.querySelector('.confetti');

async function sendParticipation(chosenNumber, userAccount) {
    try {
        const participationAmount = web3.utils.toWei('0.05', 'ether'); //conversion de ETH à wei

        // Vérification si le joueur a déjà joué
        const hasAlreadyPlayed = await contractInstance.methods.hasAlreadyPlayed().call();
        console.log('Le joueur a déjà joué :', hasAlreadyPlayed);
        if (hasAlreadyPlayed) {
          alert('Sorry, you have already played. Please try again later !');
          return;
        }

        // Envoi de la participation au contrat intelligent
        contractInstance.methods.play(chosenNumber)
        .send({from: userAccount, value: participationAmount})
        .then(function(receipt) {
            console.log("Transaction receipt:", receipt);
        })
        .catch(function(error) {
            console.error("Transaction error:", error);
        });
        
        console.log('Transaction successful :', transaction);


        const logs = await transaction.logs;
        console.log('Logs :', logs);

        let eventEmitted = false;
        for (let i = 0; i < logs.length; i++) {
          const log = logs[i];
          if (log.event === "HasWon") {
            eventEmitted = true;

            break
          }
        }

        if (eventEmitted) {
          alert('Congratulations ! You have won the lottery !');
          confetti.style.display = "block";
        } else {
            alert('Sorry, you did not win this time. Better luck next time !');
        }

    } catch (error) {
        console.error('Error during transaction :', error);
        alert('An error occurred while sending your entry. Please try again.')
    }
}



window.addEventListener('DOMContentLoaded', async function() {
  try {
      // Vérification si la loterie est fermée
      var finalized = await contractInstance.methods.finalized().call();
      console.log('Au chargement, la loterie est finie :', finalized);
      
      const lotteryClose = document.getElementById('lottery-close');
      const lotteryOpen = document.getElementById('lottery-open');

      // Si la loterie est fermée, affichage du message statique
      if (finalized) {
          lotteryClose.style.display = 'block';
      } else {
        lotteryOpen.style.display = 'block';
      }
  } catch (error) {
      console.error('Erreur lors de la vérification de l\'état de la loterie :', error);
  }
});



form.addEventListener('submit', async function(e) {
    e.preventDefault();

    const numberInput = document.getElementById('chosen-number');
    const chosenNumber = parseInt(numberInput.value);

    // Vérification si la loterie est ouverte
    var finalized = await contractInstance.methods.finalized().call();
    console.log('La loterie est finie :', finalized);
    if (finalized) {
      alert('Sorry, the lottery is actually closed. Please try again later !');
      return;
    }

    try {
        const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
        if (accounts && accounts.length > 0) {
          const userAccount = accounts[0];
          await sendParticipation(chosenNumber, userAccount);
        } else {
            alert('No Ethereum account selected :(');
        }
    } catch (error) {
        console.error('Error connecting wallet :', error);
        alert('An error occurred while connecting to your wallet. Please try again.')
    }
});
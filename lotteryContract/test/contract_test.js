const ContractTest = artifacts.require("./LotteryContract.sol");

/*
 * uncomment accounts to access the test accounts made available by the
 * Ethereum client
 * See docs: https://www.trufflesuite.com/docs/truffle/testing/writing-tests-in-javascript
 */
contract("LotteryContract", function (accounts) {
  const initializedWinningPrize = web3.utils.toWei('0.1', 'ether');
  const initializedWinningNumber = 50;


  async function initializeContractInstance(initializedWinningPrize, initializedWinningNumber) {
    const contractInstance = await ContractTest.new();
    await contractInstance.initialize(accounts[0], initializedWinningPrize, initializedWinningNumber, { from: accounts[0] });

    return contractInstance;
  }

  async function sendOneETHToContractInstance(contractInstance) {
    const amountToSend = web3.utils.toWei("1", "ether");
    await web3.eth.sendTransaction({
      from: accounts[0],
      to: contractInstance.address,
      value: amountToSend
    });
  }


  it("should receive and handle transferred ETH", async function () {
    const contractInstance = await initializeContractInstance(initializedWinningPrize, initializedWinningNumber);

    const amountToSend = web3.utils.toWei("1", "ether");
    await sendOneETHToContractInstance(contractInstance);
    const contractBalance = await web3.eth.getBalance(contractInstance.address);
    
    assert.equal(contractBalance, amountToSend, "Incorrect contract balance");
  });


  it("should set the winning amount to what is given in the intialization", async function () {
    const contractInstance = await initializeContractInstance(initializedWinningPrize, initializedWinningNumber);
    
    const winningPrize = await contractInstance.winningPrize.call();

    assert.isTrue(winningPrize == initializedWinningPrize);
  });


  it("should set the game as unfinished when creating the contract", async function() {
    const contractInstance = await initializeContractInstance(initializedWinningPrize, initializedWinningNumber);

    const gameIsFinished = await contractInstance.getFinalized();

    assert.isFalse(gameIsFinished);
  });


  it("should return false when calling isValid on a number that is less than 1", async function() {
    const contractInstance = await initializeContractInstance(initializedWinningPrize, initializedWinningNumber);

    let valid = await contractInstance.isValid(0);

    assert.isFalse(valid);
  });


  it("should return false when calling isValid on a number that is more than 100", async function() {
    const contractInstance = await initializeContractInstance(initializedWinningPrize, initializedWinningNumber);

    let valid = await contractInstance.isValid(200);

    assert.isFalse(valid);
  });


  it("should return true when calling isValid on a number that is more than or equal to 1 and less than or equal to 100", async function() {
    const contractInstance = await initializeContractInstance(initializedWinningPrize, initializedWinningNumber);

    let valid = await contractInstance.isValid(75);

    assert.isTrue(valid);
  });


  it("should not allow people to play when it doesn't have enough ETH", async function() {
    const contractInstance = await initializeContractInstance(initializedWinningPrize, initializedWinningNumber);

    try {
      await contractInstance.play(13, {from: accounts[1], value: web3.utils.toWei(0.05.toString())});
      assert.fail("Expected revert did not happen");
    } catch (error) {
      assert.include(error.message, "The contract doesn't hold enough ETH to allow players to bet");
    }
  });


  it("should save false in players for people who haven't played", async function() {
    const contractInstance = await initializeContractInstance(initializedWinningPrize, initializedWinningNumber);
    await sendOneETHToContractInstance(contractInstance);

    let hasPlayed = await contractInstance.hasAlreadyPlayed({from:accounts[1]});

    assert.isFalse(hasPlayed);
  });


  it("should save true in players for people who have played", async function() {
    const contractInstance = await initializeContractInstance(initializedWinningPrize, initializedWinningNumber);
    await sendOneETHToContractInstance(contractInstance);

    await contractInstance.play(13, {from: accounts[1], value: web3.utils.toWei(0.05.toString())});
    let hasPlayed = await contractInstance.hasAlreadyPlayed({ from: accounts[1] });

    assert.isTrue(hasPlayed);
  });


  it("should revert when someone who has played tries to play again", async function() {
    const contractInstance = await initializeContractInstance(initializedWinningPrize, initializedWinningNumber);
    await sendOneETHToContractInstance(contractInstance);
    await contractInstance.play(13, {from: accounts[1], value: web3.utils.toWei(0.05.toString())});
  
    try {
      await contractInstance.play(13, {from: accounts[1], value: web3.utils.toWei(0.05.toString())});
      assert.fail("Expected revert did not happen");
    } catch (error) {
      assert.include(error.message, "You have already played");
    }
  });


  it("should revert when someone who plays for the first time enters the wrong amount of ETH (ie not 0.5 ETH)", async function() {
    const contractInstance = await initializeContractInstance(initializedWinningPrize, initializedWinningNumber);
    await sendOneETHToContractInstance(contractInstance);

  try {
    await contractInstance.play(13, {from: accounts[1], value: web3.utils.toWei(0.01.toString())});
    assert.fail("Expected revert did not happen");
  } catch (error) {
    assert.include(error.message, "Wrong amount, you should bet 0.05 ETH", "Revert did not happen as expected");
  }
  });


  it("should revert when someone who plays for the first time has not entered a valid number", async function() {
    const contractInstance = await initializeContractInstance(initializedWinningPrize, initializedWinningNumber);
    await sendOneETHToContractInstance(contractInstance);

  try {
    await contractInstance.play(845, {from: accounts[1], value: web3.utils.toWei(0.05.toString())});
    assert.fail("Expected revert did not happen");
  } catch (error) {
    assert.include(error.message, "Invalid number, please enter a number between 1 and 100", "Revert did not happen as expected");
  }
  });


  it("should emit the event HasLost when someone loses", async function() {
    const contractInstance = await initializeContractInstance(initializedWinningPrize, initializedWinningNumber);
    await sendOneETHToContractInstance(contractInstance);
    
    const tx = await contractInstance.play(37, {from: accounts[1], value: web3.utils.toWei(0.05.toString())});
    const logs = tx.logs;

    let eventEmitted = false;
    for (let i = 0; i < logs.length; i++) {
        const log = logs[i];
        if (log.event === "HasLost") {
            eventEmitted = true;
            assert.equal(log.args.loser, accounts[1], "Sender address should match");
            break;
        }
    }
    assert.equal(eventEmitted, true, "HasLost should be emitted");
  });


  it("should emit the event HasWon when someone wins", async function() {
    const contractInstance = await initializeContractInstance(initializedWinningPrize, initializedWinningNumber);
    await sendOneETHToContractInstance(contractInstance);
    
    const tx = await contractInstance.play(initializedWinningNumber, {from: accounts[1], value: web3.utils.toWei(0.05.toString())});
    const logs = tx.logs;

    let eventEmitted = false;
    for (let i = 0; i < logs.length; i++) {
        const log = logs[i];
        if (log.event === "HasWon") {
            eventEmitted = true;
            assert.equal(log.args.winner, accounts[1], "Sender address should match");
            assert.equal(log.args.winningAmount, initializedWinningPrize, "Value should match");
            break;
        }
    }
    assert.equal(eventEmitted, true, "HasWon should be emitted");
  });


  it("should allow only the owner to call changeAmounts", async () => {
    const anotherAccount = accounts[1];
    const contractInstance = await initializeContractInstance(initializedWinningPrize, initializedWinningNumber);

    try {
        await contractInstance.changeAmounts(web3.utils.toWei('0.9', 'ether'), 1, { from: anotherAccount });
        assert.fail("Expected revert");
    } catch (error) {
        assert.include(error.message, "Only the owner of the contract can use this function", "Expected revert");
    }
  });


  it("should prevent the owner to call changeAmounts if the draw is not finished", async () => {
    const ownerAccount = accounts[0];
    const contractInstance = await initializeContractInstance(initializedWinningPrize, initializedWinningNumber);

    try {
      await contractInstance.changeAmounts(web3.utils.toWei(0.2.toString(), 'ether'), 89, { from: ownerAccount });
        assert.fail("Expected revert");
    } catch (error) {
        assert.include(error.message, "A new draw cannot be done until someone has won", "Expected revert");
    }
  });


  it("should change the winningPrize and luckyNumber to the given arguments and reopen the lottery when the owner calls changeAmounts", async () => {
    const ownerAccount = accounts[0];
    const contractInstance = await initializeContractInstance(initializedWinningPrize, initializedWinningNumber);
    await sendOneETHToContractInstance(contractInstance);
    await contractInstance.play(initializedWinningNumber, {from: accounts[1], value: web3.utils.toWei(0.05.toString())});
    const ownerWinningPrize = web3.utils.toWei('0.05', 'ether')
    const ownerLuckyNumber = 89
    await contractInstance.changeAmounts(ownerLuckyNumber, ownerWinningPrize, { from: ownerAccount });

    const newWinningPrize = await contractInstance.getWinningPrize();
    const gameClosed = await contractInstance.getFinalized();
    await contractInstance.play(ownerLuckyNumber, {from: accounts[2], value: web3.utils.toWei(0.05.toString())});
    const gameClosed2 = await contractInstance.getFinalized();

    assert.equal(newWinningPrize, ownerWinningPrize)
    assert.isFalse(gameClosed);
    assert.isTrue(gameClosed2)
  });


  it("should emit the event NewDraw when a new draw happens with the owner setting new values with changeAmounts", async function() {
    const ownerAccount = accounts[0];
    const contractInstance = await initializeContractInstance(initializedWinningPrize, initializedWinningNumber);
    await sendOneETHToContractInstance(contractInstance);
    await contractInstance.play(initializedWinningNumber, {from: accounts[1], value: web3.utils.toWei(0.05.toString())});

    const ownerWinningPrize = web3.utils.toWei('0.05', 'ether')
    const ownerLuckyNumber = 89
    const tx = await contractInstance.changeAmounts(ownerLuckyNumber, ownerWinningPrize, { from: ownerAccount });
    const logs = tx.logs;

    let eventEmitted = false;
    for (let i = 0; i < logs.length; i++) {
        const log = logs[i];
        if (log.event === "NewDraw") {
            eventEmitted = true;
            assert.equal(log.args.winningPrize, ownerWinningPrize, "Sender address should match");
            break;
        }
    }
    assert.equal(eventEmitted, true, "NewDraw should be emitted");
  });
  
});

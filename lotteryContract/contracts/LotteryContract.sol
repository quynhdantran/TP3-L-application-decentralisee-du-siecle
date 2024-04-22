// SPDX-License-Identifier: MIT
// Tells the Solidity compiler to compile only from v0.8.13 to v0.9.0
pragma solidity ^0.8.13;

contract LotteryContract {

  address public owner;

  bool public finalized;
  uint256 public winningPrize;
  uint256 internal luckyNumber;
  mapping (address => bool) public players;

  event HasWon(address winner, uint256 winningAmount);
  event HasLost(address loser);
  event NewDraw(uint winningPrize);




  function initialize(address _initialOwner, uint256 _initialWinningPrize, uint256 _initialLuckyNumber) public {
	require(owner == address(0), "The contract has already been initialized");
	owner = _initialOwner;
    finalized = false;
    winningPrize = _initialWinningPrize;
    luckyNumber = _initialLuckyNumber;
  }

	
  function getFinalized() public view returns (bool) {
    return finalized;
  }


  function getWinningPrize() public view returns (uint256) {
    return winningPrize;
  }


  function hasAlreadyPlayed() public view returns (bool) {
    return players[msg.sender];
  }


  function hasWon(uint256 _number) internal view returns (bool) {
    return _number == luckyNumber;
  }


  function isValid(uint256 _number) public pure returns (bool) {
    return _number >= 1 && _number <= 100;
  }


  receive() external payable {}


  modifier ownerOnly() {
    require(msg.sender == owner, "Only the owner of the contract can use this function");
    _;
  }


  function changeAmounts(uint256 _newLuckyNumber, uint256 _newWinningPrize) public ownerOnly {
	require(getFinalized(), "A new draw cannot be done until someone has won");
    luckyNumber = _newLuckyNumber;
    winningPrize = _newWinningPrize;
    finalized = false;
	emit NewDraw(_newWinningPrize);
  }


  function play(uint256 _betNumber) public payable returns (bool) {
	require(address(this).balance >= winningPrize, "The contract doesn't hold enough ETH to allow players to bet");
	require(msg.sender != owner, "The owner cannot play the game !");
    require(getFinalized() == false, "The draw is finished, you can't play");
    require(hasAlreadyPlayed() == false, "You have already played");
    require(isValid(_betNumber), "Invalid number, please enter a number between 1 and 100");
    require(msg.value == 0.05 ether, "Wrong amount, you should bet 0.05 ETH");


	address payable _contractAddress = payable(address(this));
    _contractAddress.transfer(msg.value);

    players[msg.sender] = true;

    if (hasWon(_betNumber)) {
      finalized = true;
      payable(msg.sender).transfer(winningPrize);
      emit HasWon(msg.sender, winningPrize);
    }
	else {
	  emit HasLost(msg.sender);
	}
    return true;
  }

}
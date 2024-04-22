const { deployProxy, upgradeProxy } = require('@openzeppelin/truffle-upgrades');

const LotteryContract = artifacts.require('LotteryContract');

module.exports = async function (deployer, network, accounts) {
    const initialWinningPrize = web3.utils.toWei('0.1','ether');
    const initialLuckyNumber = 50;
    const instance = await deployProxy(LotteryContract, [accounts[0], initialWinningPrize, initialLuckyNumber], { deployer });
}

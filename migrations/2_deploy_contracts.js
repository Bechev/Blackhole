var blackhole = artifacts.require("./blackhole.sol");
var ShootingStar = artifacts.require("./ShootingStar.sol");
var BH = artifacts.require("./BH.sol");

module.exports = async function(deployer) {
  // var initialSupply = 1000000000000
  // var tokens = web3.utils.toWei(initialSupply.toString(), 'ether')
  await deployer.deploy(blackhole);
  await deployer.deploy(BH);
  await deployer.deploy(ShootingStar);
};

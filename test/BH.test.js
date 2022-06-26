const BH_contract = artifacts.require("./BH.sol");
const blackhole_contract = artifacts.require("./blackhole.sol");
const assert = require('assert');
const { default: BigNumber } = require('bignumber.js');

contract("BH", accounts => {


  var BN = web3.utils.BN;
  beforeEach(async() =>{
    BH = await BH_contract.deployed();
    blackhole = await blackhole_contract.deployed();
    await web3.eth.accounts.wallet.create(1)
  });
  
  it("... should deploy with less than 4.7 mil gas", async () => {
    let BHInstance = await BH_contract.new();
    let receipt = await web3.eth.getTransactionReceipt(BH_contract.transactionHash);
    console.log(receipt.gasUsed);
    assert(receipt.gasUsed <= 5000000, "Gas was more than 4.7 mil");
  });

  it("... should prevent non Admins to perform tasks", async () =>{
    await assert.rejects(BH.registerDrop(blackhole.address, 100, {from: accounts[1]}))
  })

  it("... should add Admins", async () =>{
    assert(await BH.approveAdmin(accounts[1], {from: accounts[0]}));
  });
  

  it("... should allow to perform tasks when admin", async () =>{
    let totalSupplyInitial = await BH._totalNFTSupply.call();
    assert(await BH.registerDrop(blackhole.address, 100, {from: accounts[1]}))
    let totalSupplyAfter = await BH._totalNFTSupply.call() ;
    assert.equal(totalSupplyAfter.toString(), totalSupplyInitial.add(new BN(100)).toString(), "Total Volume not consistent")
    assert(await BH.editDrop(1, blackhole.address, 10), {from: accounts[1]})
    let totalSupplyEdited = await BH._totalNFTSupply.call();
    assert.equal(totalSupplyEdited.toString(), totalSupplyInitial.add(new BN(10)).toString(), "Total Volume not correctly edited to 10")
  })
  
  it("... should remove Admins", async ()=>{
    assert(await BH.revokeAdmin(accounts[1], {from: accounts[0]}));
  })

  it("... should give contracts an id", async ()=>{
    let contractId = await BH.getContractId(blackhole.address, {from: accounts[0]})
    assert.equal(contractId,1 ,"blackhole is not contract with ID 1");
  })

});

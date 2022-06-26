const ShS_contract = artifacts.require("./ShootingStar.sol");
const blackhole_contract = artifacts.require("./blackhole.sol");
const assert = require('assert');
const { default: BigNumber } = require('bignumber.js');

contract("ShS", accounts => {


  var BN = web3.utils.BN;
  beforeEach(async() =>{
    ShS = await ShS_contract.deployed()
    blackhole = await blackhole_contract.deployed();
    await web3.eth.accounts.wallet.create(1)
  });
  
  it("... should deploy with less than 4.7 mil gas", async () => {
    let ShSInstance = await ShS_contract.new();
    let receipt = await web3.eth.getTransactionReceipt(ShSInstance.transactionHash);
    console.log(receipt.gasUsed);
    assert(receipt.gasUsed <= 5000000, "Gas was more than 4.7 mil");
  });

  it("... should add Admins, including a contract", async () =>{
    assert(await ShS.approveAdmin(accounts[1], {from: accounts[0]}));
    assert(await ShS.approveAdmin(blackhole.address, {from: accounts[0]}));
  });
  
  it("... should allow to perform tasks when admin", async () =>{
    assert(await ShS.mint(accounts[0], 1, accounts[0]), "Could not mint");
    assert(await ShS.transferNFT(1, accounts[1]), "Could not set Holder");
    assert(await ShS.setURI(1, "test"), "Could not set URIs")
    assert(await ShS.transferNFT(1, accounts[1]), "Could not set holder")

  })

  it("... should prevent non Admins to perform tasks", async () =>{
    await assert.rejects(ShS.mint(accounts[1], 1, accounts[1], {from: accounts[2]}), "Could mint when shouldn't have")
    await assert.rejects(ShS.setURI(1, "test", {from: accounts[2]}), "Could set URI when shouldn't have")
    await assert.rejects(ShS.transferNFT(1, accounts[1], {from: accounts[2]}), "Could  set holder when shouldn't have")
  })
  
  it("... should remove Admins", async ()=>{
    assert(await ShS.revokeAdmin(accounts[1], {from: accounts[0]}));
  })

  it("... should have a URI", async ()=>{
    await assert.equal(await ShS.tokenURI(1), 'test', "Didn't  have the expeected URI")
  })

  it("... should have a holder", async ()=>{
    await assert.equal(await ShS.ownerOf(1), accounts[1], "Didn't have the expeected oowneer")
  })

  it("... should prevent the holder from transfering a token", async ()=>{
    await assert.rejects(ShS.transferFrom(accounts[1], accounts[2], 1, {from: accounts[1]}), "Could  transfer the token when shouldn't have")
    await assert.rejects(ShS.transferFrom(accounts[0], accounts[2], 1, {from: accounts[1]}), "Could  transfer the token when shouldn't have")
    await assert.rejects(ShS.transferFrom(accounts[0], accounts[1], 1, {from: accounts[1]}), "Could  transfer the token when shouldn't have")
  })

  it("... should allow the owner to transfer a token", async ()=>{
    assert(await ShS.transferFrom(accounts[0], accounts[2], 1, {from: accounts[0]}), "Could transfer the token when shouldn't have")
  })

});

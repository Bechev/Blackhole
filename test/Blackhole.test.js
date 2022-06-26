const blackhole_contract = artifacts.require("./blackhole.sol");
const BH_contract = artifacts.require("./BH.sol");
const shootingStar_contract = artifacts.require("./ShootingStar.sol");
// const ash_contract = artifacts.require("./fakeAsh.sol");
const { default: BigNumber } = require('bignumber.js');

const assert = require('assert');

contract("blackhole", accounts => {
    let amount = 90*10**18;
    let signer;
    let AL = {};
    let WL;
    let amountToApprove;

    beforeEach(async() =>{
        BH = await BH_contract.deployed();
        blackhole = await blackhole_contract.deployed();
        shootingStar = await shootingStar_contract.deployed();
        // ash = await ash_contract.deployed();
        await web3.eth.accounts.wallet.create(1)
        signer = web3.eth.accounts.wallet[0]
        ethPrice = await blackhole._ethPrice.call();
    });


    it("... should create a WL", async ()=>{
        WL = [
        accounts[1],
        accounts[2],
        accounts[3],
        accounts[4]]
        let contractAddress = await blackhole.address
        let mintOpened  = true
        assert(await blackhole.setSigner(signer.address),"Could not set the signer");
        for(i=0; i < WL.length ;i ++){
            assert(web3.utils.toChecksumAddress(WL[i]),"error")
            assert(web3.utils.toChecksumAddress(signer.address),"error")
            AL[WL[i]] = await web3.eth.accounts.sign(web3.utils.soliditySha3(WL[i], contractAddress, mintOpened), signer.privateKey)
        }
    })

    it("... should allow to set the BH address", async ()=>{
        assert(await blackhole.setBHAddress(await BH.address) ,"Could not setup contract address");
    })
    
    it("... should deploy with less than 5.5 mil gas", async () => {
        let BlackholeInstance = await blackhole_contract.new();
        let receipt = await web3.eth.getTransactionReceipt(BlackholeInstance.transactionHash);
        console.log(receipt.gasUsed);
        assert(receipt.gasUsed <= 5500000, "Gas was more than 5.5 mil");
    });

    it("... should be registered as a BH drop", async () =>{
        assert(await BH.registerDrop(blackhole.address, 100, {from: accounts[0]}), 'Could not register a drop');
    })

    it("... should be setContract as live", async () =>{
        assert(await BH.setLiveContract(blackhole.address, {from: accounts[0]}), 'Could not setContract as live');
    })

    it("... should be eligible as admin for BH", async () =>{
        assert(await BH.approveAdmin(blackhole.address, {from: accounts[0]}), 'Could not add blackhole contract as admin');
    })

    it("... should set ShootingStarAddress", async () =>{
        assert(await BH.setShootingStarAddress(shootingStar.address, {from: accounts[0]}), 'Could not add blackhole contract as admin');
    })

    it("... should mint when Admin and closed drop", async () =>{
        assert(await blackhole.adminMint(1, accounts[1]), "Could not mint as admin");
    })

    it("... should allow  to update the URIs", async () =>{
        assert(await blackhole.updateURIs(["scene 1.0", "scene 2.0", "scene 3.0", "scene 1.1", "scene 2.1", "scene 3.1", "scene 1.2", "scene 2.2", "scene 3.2", "scene 1.3", "scene 2.3", "scene 3.3"]), "Could not update the URI");
    })

    it("... should allow publicMint for AL addresses", async () =>{
        assert(await blackhole.setSigner(signer.address), "Could not activate signer");  
        assert(await blackhole.toggleMintState(), "Could not activate mint");
        let signature = AL[accounts[1]]
        assert(await blackhole.publicMint(3, signature.v, signature.r, signature.s, {from: accounts[1], value: 100000000000000000})); 
        let signature2 = AL[accounts[2]]
        assert(await blackhole.publicMint(2, signature2.v, signature2.r, signature2.s, {from: accounts[2], value: 100000000000000000})); 
        let signature3 = AL[accounts[3]]
        assert(await blackhole.publicMint(1, signature3.v, signature3.r, signature3.s, {from: accounts[3], value: 100000000000000000})); 
    })

    it("... should prevent to mint 2 times ", async () =>{
        let signature = AL[accounts[1]]
        assert(await blackhole.publicMint(1, signature.v, signature.r, signature.s, {from: accounts[1], value: 100000000000000000}));  
    })

    it("... should prevent to mint if not on the WL ", async () =>{
        let signature = AL[accounts[1]]
        await assert.rejects(blackhole.publicMint(1, signature.v, signature.r, signature.s, {from: accounts[3], value: 100000000000000000}));  
    })

    it("... should allow to deposit BH", async ()=>{
        // token 1
        let amount = new BigNumber(10000*10**18).toFixed()
        assert(await BH.airdrop([accounts[1]],[90]), "Could not airdrop tokens");
        assert.equal(await blackhole.tokenURI(1),'scene 1.1', "incorrect URI")
        assert(await BH.approve(await blackhole.address, amount, {from: accounts[1]}),"Could not approve BH");
        assert(await blackhole.depositBH(1, amount, {from: accounts[1]}), 'Could not deposit BH');
        assert.equal(await blackhole.tokenURI(1),'scene 1.2', "incorrect URI")
        assert(await BH.approve(await blackhole.address, amount, {from: accounts[1]}),"Could not approve BH");
        assert(await blackhole.depositBH(1, amount, {from: accounts[1]}), 'Could not deposit BH');
        // await debug(blackhole.depositBH(1, new BigNumber(10000).toString(), {from: accounts[1]}));
        assert.equal(await blackhole.tokenURI(1),'scene 1.3', "incorrect URI")


        // token 2
        assert.equal(await blackhole.tokenURI(2),'scene 3.1', "incorrect URI")
        assert(await BH.approve(await blackhole.address, amount, {from: accounts[1]}),"Could not approve BH");
        assert(await blackhole.depositBH(2, amount, {from: accounts[1]}), 'Could not deposit BH');
        assert.equal(await blackhole.tokenURI(2),'scene 3.2', "incorrect URI")
        assert(await BH.approve(await blackhole.address, amount, {from: accounts[1]}),"Could not approve BH");
        assert(await blackhole.depositBH(2, amount, {from: accounts[1]}), 'Could not deposit BH');
        assert.equal(await blackhole.tokenURI(2),'scene 3.3', "incorrect URI")
    })

    it("... should allow to withdraw BH for account 1", async ()=>{
        // token 1
        let Token11BHBalanceInitial = await blackhole.getBHBalance(1);
        assert.equal(await blackhole.tokenURI(1),'scene 1.3', "incorrect URI")
        assert(await blackhole.withdrawBH(1, (Token11BHBalanceInitial).toString(), {from: accounts[1]}), 'Could not withdraw BH');
        assert.equal(await blackhole.tokenURI(1),'scene 1.0', "incorrect URI")

        // token 2
        assert.equal(await blackhole.tokenURI(2),'scene 3.3', "incorrect URI")
        assert(await blackhole.withdrawBH(2, (Token11BHBalanceInitial).toString(), {from: accounts[1]}), 'Could not withdraw BH');
        assert.equal(await blackhole.tokenURI(2),'scene 3.0', "incorrect URI")
    })

    it("... should allow to deposit BH  for account 2", async ()=>{
        let amount = new BigNumber(10000*10**18).toFixed()
        assert(await BH.airdrop([accounts[2]],[90]), "Could not airdrop tokens");
        assert.equal(await blackhole.tokenURI(3),'scene 2.1', "incorrect URI")
        assert(await BH.approve(await blackhole.address, amount, {from: accounts[2]}),"Could not approve BH");
        assert(await blackhole.depositBH(3, amount, {from: accounts[2]}), 'Could not deposit BH');
        assert.equal(await blackhole.tokenURI(3),'scene 2.2', "incorrect URI")
        assert(await BH.approve(await blackhole.address, amount, {from: accounts[2]}),"Could not approve BH");
        assert(await blackhole.depositBH(3, amount, {from: accounts[2]}), 'Could not deposit BH');
        assert.equal(await blackhole.tokenURI(3),'scene 2.3', "incorrect URI")
    })

    it("... should allow to withdraw BH for account 2", async ()=>{
        let Token11BHBalanceInitial = await blackhole.getBHBalance(3);
        assert.equal(await blackhole.tokenURI(3),'scene 2.3', "incorrect URI")
        assert(await blackhole.withdrawBH(3, (Token11BHBalanceInitial).toString(), {from: accounts[2]}), 'Could not withdraw BH');
        assert.equal(await blackhole.tokenURI(3),'scene 2.0', "incorrect URI")
    })

    it("... should  only have one stage 3", async ()=>{
        let amount = new BigNumber(20000*10**18).toFixed()
        assert(await BH.approve(await blackhole.address, amount, {from: accounts[1]}),"Could not approve BH");
        assert(await blackhole.depositBH(1, amount, {from: accounts[1]}), 'Could not deposit BH');
        assert.equal(await blackhole.tokenURI(1),'scene 1.3', "incorrect URI")
        
        assert(await BH.airdrop([accounts[3]],[90]), "Could not airdrop tokens");
        assert(await BH.approve(await blackhole.address, amount, {from: accounts[3]}),"Could not approve BH");
        await assert.rejects(blackhole.depositBH(4, amount, {from: accounts[3]}), 'Could not deposit BH');
    })

    it("... should allow to have a new stage 3", async ()=>{
        let amount = new BigNumber(20000*10**18).toFixed()
        let Token1BHBalanceInitial = await blackhole.getBHBalance(1);
        assert.equal(await blackhole.tokenURI(1),'scene 1.3', "incorrect URI")
        assert.equal(await blackhole.tokenURI(4),'scene 1.1', "incorrect URI")
        assert(await blackhole.withdrawBH(1, (Token1BHBalanceInitial).toString(), {from: accounts[1]}), 'Could not withdraw BH');
        
        assert(await BH.approve(await blackhole.address, amount, {from: accounts[3]}),"Could not approve BH");
        assert(await blackhole.depositBH(4, amount, {from: accounts[3]}), 'Could not deposit BH when should have');
        await assert.rejects(blackhole.depositBH(4, amount, {from: accounts[3]}), 'Could deposit BH when stage 3 already reached');
        await assert.rejects(blackhole.depositBH(1, amount, {from: accounts[3]}), 'Could deposit BH when stage 3 already reached');
        assert.equal(await blackhole.tokenURI(1),'scene 1.0', "incorrect URI")
        assert.equal(await blackhole.tokenURI(4),'scene 1.3', "incorrect URI")
    })

    it("... should allow to deposit BH as when there is a stage 3", async ()=>{
        let amount = new BigNumber(10001*10**18).toFixed()
        assert.equal(await blackhole.tokenURI(1),'scene 1.0', "incorrect URI")
        assert(await BH.approve(await blackhole.address, amount, {from: accounts[1]}),"Could not approve BH");
        assert(await blackhole.depositBH(1, amount, {from: accounts[1]}), 'Could not deposit BH when should have');
        assert.equal(await blackhole.tokenURI(1),'scene 1.2', "incorrect URI")
    })

});

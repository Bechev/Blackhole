import React, { Component } from "react";
import Web3 from "web3";
import { Button, Alert } from "react-bootstrap";
import { AccountInfoContext } from '../Context/AccountInfo'
import blackhole  from "../contracts/blackhole.json";
import BH  from "../contracts/BH.json";
import AL from "../AL/signedList.json"

class Connect extends Component {
  
  static contextType =  AccountInfoContext
  
  componentDidMount = async () => {
    if (window.ethereum) {
      this.web3 = new Web3(window.ethereum);
    } else if (window.web3) {
      this.web3  = new Web3(window.web3.currentProvider);
    };
    if(this.web3){
      await this.setNetwork();
      await this.getContractsInstances();
      await this.setAccount();
    }
  }

  async getContractsInstances(){
    this.networkId = await this.web3.eth.net.getId();
    this.deployedNetwork = blackhole.networks[this.networkId];
    this.blackholeInstance = new this.web3.eth.Contract(
      blackhole.abi,
      parseInt(process.env.REACT_APP_MAINNET_NETWORK) && process.env.REACT_APP_MAINNET_CONTRACT_ADDRESS
    )
    this.BHInstance = new this.web3.eth.Contract(
      BH.abi,
      parseInt(process.env.REACT_APP_MAINNET_NETWORK) && process.env.REACT_APP_MAINNET_BH_ADDRESS
    )
    this.context.updateAccountInfo({blackholeInstance: this.blackholeInstance, BHInstance: this.BHInstance})
    this.getMintInfo();
  }

  async setAccount(){
    if(this.context.networkId !== null){
      let accounts = await this.web3.eth.getAccounts();
      await this.context.updateAccountInfo({account: accounts[0]});
      if(this.context.account) this.getAccountsData()
    }else{
      this.resetAccountData();
    }
  }

  resetAccountData(){
    this.context.updateAccountInfo({
      account: null,
    })
  }

  async setNetwork(){
    if(this.web3){
      let networkId = await this.web3.eth.net.getId();
      this.context.updateAccountInfo({networkId: networkId})
    }
  }

  async getTokenInfo(tokenId){
    let URI = await this.context.blackholeInstance.methods.tokenURI(tokenId).call()
    let BHBalance = await this.context.blackholeInstance.methods.getBHBalance(tokenId).call()
    const URIData = await fetch(URI)
    const URIDataJSON = await URIData.json();
    return({tokenData: URIDataJSON, BHBalance: BHBalance})
}

  async getAccountsData(){
    if(this.context.networkId === parseInt(process.env.REACT_APP_MAINNET_NETWORK) ){
      this.context.updateAccountInfo({walletBHBalance: parseFloat(await this.BHInstance.methods.balanceOf(this.context.account).call())})
      this.context.updateAccountInfo({BHContractAllowance: parseInt(await this.BHInstance.methods.allowance(this.context.account, process.env.REACT_APP_MAINNET_CONTRACT_ADDRESS).call())})
      let signedMessage = await this.findSignedMessage(this.context.account);
      this.context.updateAccountInfo({signedMessage: signedMessage})
      let NFTOwned = []
      let NFTOwnedData = []
      let owner = null
      for(let i=1; i<=50; i++){
        try{
          owner = await this.blackholeInstance.methods.ownerOf(i).call()
          if(owner == this.context.account)
          await NFTOwned.push(i);
        }catch(error){
        }
      }
      this.context.updateAccountInfo({NFTOwned: NFTOwned})

      if(NFTOwned.length === 0){
        NFTOwnedData = []
      }else{
        for(let i = 0; i < NFTOwned.length; i++){
          let data = await this.getTokenInfo(NFTOwned[i])
          NFTOwnedData.push(data)
        }
      }
      this.context.updateAccountInfo({NFTOwnedData: NFTOwnedData})
      this.context.updateAccountInfo({dropOpened: await this.blackholeInstance.methods._mintOpened().call()})
      console.log(await this.blackholeInstance.methods._mintOpened().call())
      this.context.updateAccountInfo({stage3TokenIds: [
        await this.blackholeInstance.methods._stage3TokenIds(1).call(),
        await this.blackholeInstance.methods._stage3TokenIds(2).call(),
        await this.blackholeInstance.methods._stage3TokenIds(3).call()
      ]})
      this.context.updateAccountInfo({loadedNFTs: true})
    }
  }

  async findSignedMessage(account){
    let signedMessage = null
    for(let i=0;i<AL.length;i++){
      let key = Object.keys(AL[i])[0]
      if(key.toLowerCase() === account.toLowerCase()){
        signedMessage = AL[i][key]
      }
    }
    return signedMessage
  }

  async getMintInfo(){
    if(this.context.networkId === parseInt(process.env.REACT_APP_MAINNET_NETWORK) ){
      this.context.updateAccountInfo({mintPrice: parseFloat(await this.blackholeInstance.methods._ethPrice().call())})
    }
  }

  async connectWallet(){
    this.context.updateAccountInfo({transactionInProgress: true})
    try{
      window.ethereum.enable()
    }catch(error){
      console.log(error)
    }
    this.context.updateAccountInfo({transactionInProgress: false})
  }

  renderUserInterface(){
    if(this.web3){
      if(!this.context.account){
        return <Button id="connect_button" variant='dark' onClick={() => this.connectWallet()}>Connect your wallet</Button>
      }else if(parseInt(this.context.networkId) !== parseInt(this.context.contractNetwork)){
        return <p>Please connect to the right network</p>
      }else return null
    }else{
      return <Alert id="web3_alert" variant="dark">No Wallet detected</Alert>
    }
  }

  render() {
    if(this.web3){
      window.ethereum.on('accountsChanged', async () => {
        await this.setAccount()
      })
      window.ethereum.on('networkChanged', async () => {
        await this.setNetwork()
        await this.setAccount();
      });
    }
    return this.renderUserInterface()
  }
  
}

export default Connect;


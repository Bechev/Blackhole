import React, { Component, createContext } from 'react';

export const AccountInfoContext = createContext();

class AccountInfoProvider extends Component {
    state = {
        ashAddress: process.env.REACT_APP_MAINNET_ASH_ADDRESS,
        BHAddress: process.env.REACT_APP_MAINNET_BH_ADDRESS,
        blackholeAddress: process.env.REACT_APP_MAINNET_CONTRACT_ADDRESS,
        BHInstance: null,
        blackholeInstance: null,
        account: null,
        networkId: null,
        transactionInProgress: false,
        userFeedback: null,
        contractNetwork: process.env.REACT_APP_MAINNET_NETWORK,
        walletAshBalance: 0,
        walletBHBalance: 0,
        mintPrice: 0,
        BHContractAllowance: 0,
        signedMessage: null,
        NFTOwned: null,
        NFTOwnedData: null,
        loadedNFTs: false,
        stage3TokenIds: null,
        dropOpened: false

    }

    updateAccountInfo = (updatedData) =>{
        for (const [key, value] of Object.entries(updatedData)) {
            this.setState(prevState=>({
                ...prevState,
                [key]: value
            }))
        }
    }

    render(){
        return(
            <AccountInfoContext.Provider 
                value={{
                    ...this.state, 
                    updateAccountInfo: this.updateAccountInfo,
                    }}>
                {this.props.children}
            </AccountInfoContext.Provider>
        )
    }

}
export default AccountInfoProvider;
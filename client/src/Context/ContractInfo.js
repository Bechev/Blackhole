import React, { Component, createContext } from 'react';

export const ContractInfoContext = createContext();

class ContractInfoProvider extends Component {
    state = {
        prodAddress: process.env.REACT_APP_MAINNET_CONTRACT_ADDRESS,
        devAddress: process.env.REACT_APP_MAINNET_CONTRACT_ADDRESS,
        owner: "0xD6992d900033a029499a0Aaa96c5c186Fbf9E42D"
        
    }

    updateContractInfo(contractInfo){
        this.setState({
            prodAddress: contractInfo.prodAddress,
            devAddress: contractInfo.devAddress,
            owner: contractInfo.contractInfo
        })
    }

    render(){
        return(
            <ContractInfoContext.Provider 
            value={{
                ...this.state, 
                updateContractInfo: this.state.updateContractInfo,
                }}>
                {this.props.children}
            </ContractInfoContext.Provider>
        )
    }

}
export default ContractInfoProvider;
import React, { useContext } from "react";
import { AccountInfoContext } from "../Context/AccountInfo";

function ConnexionStatus() {
    let accountInfo = useContext(AccountInfoContext)
    if(accountInfo.account){
        return(
            <React.Fragment>
            <p>Your BH balance: {Math.floor(accountInfo.walletBHBalance/(10**18))}</p>
            <span id='connexion_info'><small>Connected as <b>{accountInfo.account}</b></small></span>
            <span id='connexion_info'><small>Contract address <b><a className="etherscan_link" href={"https://etherscan.io/address/"+process.env.REACT_APP_MAINNET_CONTRACT_ADDRESS}>{process.env.REACT_APP_MAINNET_CONTRACT_ADDRESS}</a></b></small></span>
            <span id='connexion_info'><small>The contract is approved to spend {Math.floor(accountInfo.BHContractAllowance/10**18)} $BH on your behalf. <a className="etherscan_link" href={"https://etherscan.io/tokenapprovalchecker?search="+accountInfo.account}>Revoke</a></small></span>
            </React.Fragment>
        )
    }else return null
}

export default ConnexionStatus;
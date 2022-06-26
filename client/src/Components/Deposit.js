import React, {useState, useContext, useEffect} from "react";
import {Row, Col, Figure, Button, Spinner, Alert, Form, useAccordionButton, Container} from 'react-bootstrap'
import { AccountInfoContext } from "../Context/AccountInfo";


import '../App.css'
import BigNumber from "bignumber.js";

function Deposit() {
    let accountInfo = useContext(AccountInfoContext)
    const [alert, setAlert] = useState({active: false, content: null, variant: null})
    const [tokenSelection, setTokenSelection] = useState(null)
    const [tokenSelectionBHBalance, setTokenSelectionBHBalance] = useState(null)
    const [tokenSelectionHasStage3, setTokenSelectionHasStage3] = useState(null)
    const [depositAmount, setDepositAmount] = useState(null)
    const [withdrawalAmount, setWithdrawalAmount] = useState(null)
    const [borderStyles, setBorderStyles] = useState(new Array())

    useEffect(() => {
        setDepositAmount(0)
        setWithdrawalAmount(0)
      }, [tokenSelection]);

    function highlightItem(optionId, action){
        let updatedBorder = [...borderStyles]
        let hightlightColor;
        if(action === 'highlight'){
            hightlightColor = 'white'
        }else{
            hightlightColor = null
        }
        updatedBorder[optionId - 1] = hightlightColor == null ? null : {border: `solid 5px ${hightlightColor}`}
        setBorderStyles(updatedBorder);
    }

    async function selectToken(optionId, key){
        await setTokenSelection(optionId);
        let tokenBHBalance = accountInfo.NFTOwnedData[key].BHBalance
        await setTokenSelectionBHBalance(tokenBHBalance)
        setTokenSelectionHasStage3(tokenSelectedHasStage3(key))
    }

    function tokenSelectedHasStage3(key){
        if(accountInfo.loadedNFTs){
            let form_name = accountInfo.NFTOwnedData[key].tokenData.attributes[0].value
            let form;
            if(form_name === 'bird'){
                form = 1
            }else if(form_name === 'horse'){
                form = 2
            }else if(form_name === 'orb'){
                form  = 3
            }else{
                form = 0
            }
            return parseFloat(accountInfo.stage3TokenIds[form - 1]) > 0 ? true : false;

        }
    }

    function renderForm3Flag(key){
        if(accountInfo.loadedNFTs){
            let form_name = accountInfo.NFTOwnedData[key].tokenData.attributes[0].value
            let form;
            if(form_name === 'bird'){
                form = 1
            }else if(form_name === 'horse'){
                form = 2
            }else if(form_name === 'orb'){
                form  = 3
            }else{
                form = 0
            }
            let hasForm3 = parseFloat(accountInfo.stage3TokenIds[form - 1]) > 0 ? true : false;
            if (hasForm3){
                return <div> The {form_name} already has its stage 3 activated</div>
            }
        }
    }

    const renderOptions = () => {
        if(!accountInfo.loadedNFTs){
            return <div>Loading ...</div>
        }else if(accountInfo.NFTOwned.length === 0){
            return <div>You do not have any blackhole NFT, you can get one on the <a href="https://opensea.io/collection/blackholebygrecu" style={{color: 'white'}} target="_blank">secondary market</a></div>
        }else{
            return(
                accountInfo.NFTOwned.map((tokenId, key)=>{
                    return(
                        <Col xs={12} md={Math.max(4, 12/accountInfo.NFTOwned.length)} key={key}>
                            <Figure>
                                <Figure.Image
                                onClick={()=>selectToken(tokenId, key)}
                                style = {tokenSelection === tokenId ? {border: `solid 5px grey`} : borderStyles[tokenId - 1]}
                                onMouseOver={()=>highlightItem(tokenId, 'highlight')}
                                onMouseLeave={()=>highlightItem(tokenId, 'reset')}
                                className="figure_image"
                                width={300}
                                height={300}
                                alt="300x300"
                                src={accountInfo.NFTOwnedData[key].tokenData.image}/>
                            </Figure>
                            <Figure.Caption>
                                <div>Token ID: {tokenId}</div>
                                <div>Token $BH Balance: {accountInfo.NFTOwnedData[key].BHBalance/(10**18)}</div>
                                {renderForm3Flag(key)}
                            </Figure.Caption>
                        </Col>
                    )
                })
            )
        }
    }

    async function handleDeposit(){
        let allowance = accountInfo.BHContractAllowance
        // let price = accountInfo.mintPrice
        let ashApprovalFailed = false
        let mintFailed = false
        if(allowance < depositAmount){
            accountInfo.updateAccountInfo({userFeedback: "Approving BH"})
            try{
                await accountInfo.BHInstance.methods.approve(accountInfo.blackholeAddress, new BigNumber(depositAmount*10**18).toFixed()).send({from: accountInfo.account})
                accountInfo.updateAccountInfo({BHContractAllowance: parseInt(await accountInfo.BHInstance.methods.allowance(accountInfo.account, accountInfo.blackholeAddress).call())})
            }
            catch (error){
                ashApprovalFailed = true
                accountInfo.updateAccountInfo({userFeedback: null})
                setAlert({active: true, content: error.message, variant: "warning"})
            }
        }
        if(!ashApprovalFailed){
            accountInfo.updateAccountInfo({userFeedback: "Depositing..."})
            try{
                await accountInfo.blackholeInstance.methods.depositBH(
                    tokenSelection,
                    new BigNumber(depositAmount * 10 ** 18).toFixed()
                ).send({from: accountInfo.account});
                window.location.reload(true);
            }
            catch(error){
                console.log(error)
                mintFailed = true
                setAlert({active: true, content: error.message, variant: "danger"})
            }
        }
        accountInfo.updateAccountInfo({BHContractAllowance: parseInt(await accountInfo.BHInstance.methods.allowance(accountInfo.account, accountInfo.BHAddress).call())})
        accountInfo.updateAccountInfo({userFeedback: null})
        // accountInfo.updateAccountInfo({userFeedback: "Approving BH..."})
        // try{
        //     await accountInfo.blackholeInstance.methods.withdrawBH(
        //         tokenSelection, 
        //         withdrawalAmount
        //     ).send({from: accountInfo.account});
        // }
        // catch(error){
        //     setAlert({active: true, content: error.message, variant: "danger"})
        //     setTimeout(function() { setAlert({active: false, content: null, variant: null}); }, 10000);
        // }
        // setTokenSelection(null)
        // accountInfo.updateAccountInfo({userFeedback: "Depositing..."})
        // try{
        //     await accountInfo.blackholeInstance.methods.withdrawBH(
        //         tokenSelection, 
        //         withdrawalAmount
        //     ).send({from: accountInfo.account});
        // }
        // catch(error){
        //     setAlert({active: true, content: error.message, variant: "danger"})
        //     setTimeout(function() { setAlert({active: false, content: null, variant: null}); }, 10000);
        // }
        // setTokenSelection(null)
        // accountInfo.updateAccountInfo({userFeedback: null})
    }

    async function handleWithdrawal(){
        accountInfo.updateAccountInfo({userFeedback: "Withdrawing..."})
        try{
            await accountInfo.blackholeInstance.methods.withdrawBH(
                tokenSelection, 
                new BigNumber(withdrawalAmount * 10 ** 18).toFixed()
            ).send({from: accountInfo.account});
            window.location.reload(true);
        }
        catch(error){
            setAlert({active: true, content: error.message, variant: "danger"})
            setTimeout(function() { setAlert({active: false, content: null, variant: null}); }, 10000);
        }
        setTokenSelection(null)
        accountInfo.updateAccountInfo({userFeedback: null})
    }

    async function handleChange(event, action){
        let max;
        if(action === 'deposit'){
            if(tokenSelectionHasStage3){
                max = Math.min(accountInfo.walletBHBalance/10**18, ((19999*10**18) - tokenSelectionBHBalance)/(10**18))
            }else{
                max = accountInfo.walletBHBalance/10**18
            }
            if(max <= 0){
                setDepositAmount(0)
            }else if(event.target.value > max){
                setDepositAmount(max)
            }else{
                if(event.target.value < 0){
                    setDepositAmount(0)
                }else{
                    setDepositAmount(event.target.value)
                }
            }
        }else{
            if(event.target.value > tokenSelectionBHBalance/(10**18)){
                setWithdrawalAmount(tokenSelectionBHBalance/10**18)
            }else if(event.target.value <0){
                setWithdrawalAmount(0)
            }else{
                setWithdrawalAmount(event.target.value)
            }
        }
    }

    function renderUserInterface(){
        if(!window.ethereum || accountInfo.userFeedback || tokenSelection ==  null || !accountInfo.account){
            return null
        }else{
            return(
                <Container fluid>
                    <br/>
                    <Row>
                        <Col xs={12} md={6}>
                            <Row className="justify-content-center">
                                <Form id='deposit_form'>
                                    <Form.Group  controlId="deposit_amount">
                                        <Form.Control 
                                            type="number" 
                                            placeholder="Deposit Amount"
                                            value={depositAmount}
                                            onChange={(event) => handleChange(event, 'deposit')}/>
                                    </Form.Group>
                                </Form>
                            </Row>
                            <Row className="justify-content-center">
                                <Button id='deposit_button' onClick={() => handleDeposit()}>Deposit $BH</Button>
                            </Row>
                        </Col>

                        <br/>
                        <br/>

                        <Col xs={12} md={6}>
                        <Row className="justify-content-center">
                            <Form id='withdrawal_form'>
                                <Form.Group  controlId="withdrawal_amount">
                                    <Form.Control 
                                        style = {{background: 'black', color: 'white'}}
                                        type="number" 
                                        placeholder="Withdrawal Amount" 
                                        value={withdrawalAmount}
                                        onChange={(event) => handleChange(event, 'withdrawal')}/>
                                </Form.Group>
                            </Form>
                        </Row>
                        <Row className="justify-content-center">
                            <Button id='withdraw_button' onClick={() => handleWithdrawal()}>Withdraw $BH</Button>
                        </Row>

                        </Col>
                    </Row>
                    <br/>
                </Container>
            )
        }
    }

    function renderUserFeedback(){
        if(accountInfo.userFeedback){
            return(
                <React.Fragment>
                    <div>
                        <Spinner animation="grow" variant="light"/>
                    </div>
                    <div>{accountInfo.userFeedback}</div>
                </React.Fragment>
            )
        }
    }

    function renderAlert(){
        if(alert.active){
            return(
            <Col>
                <br/><br/>
                <Alert variant={alert.variant}>{alert.content}</Alert>
            </Col>
            )
        }
    }

    return ( 
        <React.Fragment>
            <Row>
                <h1><b>BLACKHOLE</b></h1>
            </Row>
            <Row id="description_row">
                <span>Use this page to manipulate your NFTs by adding and removing $BH</span>
                <span>Only one NFT of each form ca reach stage 3 at a time.</span>
                <span>If the form you want to manipulate already has its stage 3 activated, you will only be able to deposit a maximum of 19999 $BH in your NFT</span>
            </Row>
            <Row id="visual_row">
                <h3>Select an NFT to manipulate</h3>
                {renderOptions()}
            </Row>
            <Row id="UI_row">
                {renderUserInterface()}
            </Row>
            <Row>
                {renderUserFeedback()}
            </Row>
            <Row className="Home_row">
                {renderAlert()}
            </Row>
        </React.Fragment>
     );
}

export default Deposit;



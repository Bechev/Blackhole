import React, {useState, useContext, useEffect} from "react";
import {Row, Col, Figure, Button, Spinner, Alert} from 'react-bootstrap'
import { AccountInfoContext } from "../Context/AccountInfo";
import web3 from "web3"
import bird1 from "../images/bird1.jpg";
import horse1 from "../images/horse1.jpg";
import orb1 from "../images/orb1.jpg";

import '../App.css'

function Home() {
    let accountInfo = useContext(AccountInfoContext)
    const [alert, setAlert] = useState({active: false, content: null, variant: null})
    const [tokenSelection, setTokenSelection] = useState(null)
    const [hasMinted, setHasMinted] = useState(() => {
        const saved = localStorage.getItem("hasMinted");
        const initialValue = JSON.parse(saved);
        return initialValue || false;
      });
    const visualOptions=
    [
        {title: 'Bird', id:1, image: bird1}, 
        {title: 'Horse', id:2, image: horse1}, 
        {title: 'Orb',id:3, image: orb1}
    ]

    const [borderStyles, setBorderStyles] = useState(new Array(visualOptions.length))

    useEffect(() => {
        localStorage.setItem("hasMinted", JSON.stringify(hasMinted));
      }, [hasMinted]);

    function highlightItem(optionId, action){
        let updatedBorder = [...borderStyles]
        let hightlightColor;
        if(action === 'set'){
            hightlightColor = 'red'
        }else{
            if(action === 'highlight'){
                hightlightColor = 'white'
            }else{
                hightlightColor = null
            }
        }   
        updatedBorder[optionId - 1] = hightlightColor == null ? null : {border: `solid 5px ${hightlightColor}`}
        setBorderStyles(updatedBorder);
    }

    async function selectToken(optionId){
        await setTokenSelection(optionId);
        highlightItem(optionId, 'set');
    }

    const renderOptions = (options) => {
        return(
            options.map((option, key)=>{
                return(
                    <Col xs={12} md={4} key={key}>
                        <Figure>
                            <Figure.Image
                            onClick={()=>selectToken(option.id)}
                            style = {tokenSelection === option.id ? {border: `solid 5px grey`} : borderStyles[option.id - 1]}
                            onMouseOver={()=>highlightItem(option.id, 'highlight')}
                            onMouseLeave={()=>highlightItem(option.id, 'reset')}
                            className="figure_image"
                            width={300}
                            height={300}
                            alt="300x300"
                            src={option.image}/>
                        </Figure>
                    </Col>
                )
            })
        )
    }

    function resetSelection(){
        setTokenSelection(null)
        setBorderStyles(new Array(visualOptions.length))
    }

    async function handleMint(){
        let price = accountInfo.mintPrice
        accountInfo.updateAccountInfo({userFeedback: "Minting..."})
        console.log(tokenSelection)
        try{
            await accountInfo.blackholeInstance.methods.publicMint(
                tokenSelection, 
                accountInfo.signedMessage.v,
                accountInfo.signedMessage.r,
                accountInfo.signedMessage.s
            ).send({from: accountInfo.account, value: price});
            setHasMinted(true);
            localStorage.setItem("hasMinted", true)
        }
        catch(error){
            console.log(error)
            setAlert({active: true, content: error.message, variant: "danger"})
            setTimeout(function() { setAlert({active: false, content: null, variant: null}); }, 10000);
        }
        setTokenSelection(null)
        accountInfo.updateAccountInfo({userFeedback: null})
    }

    function renderUserInterface(){
        if(!window.ethereum || accountInfo.userFeedback || tokenSelection ==  null || !accountInfo.account){
            return null
        }else if(!accountInfo.dropOpened){
            return<div>Drop Closed</div>
        }else if(hasMinted){
            return<div>You already minted a blackhole!</div>
        }else if(!accountInfo.signedMessage){
            return<div>You are not whitelisted</div>
        }else{
            if(accountInfo.accountBalance < accountInfo.mintPrice){
                return(
                    <div>
                        Not enough ETH to mint...
                    </div>
                )
            }else{
                return(
                    <React.Fragment>
                        <Col><Button id='mint_button' onClick={() => handleMint(1)}>Mint</Button></Col>
                    </React.Fragment>
                )
            }
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
                <span>"Blackhole" is a collection of visual metaphors</span>
                <span>You will mint an NFT with 2100 $BH in it</span>
                <span>You will then have the option to withdraw or deposit more $BH into your NFT to manipulate it</span>
            </Row>
            <Row id="visual_row">
                {/* <h3>Select an NFT to mint</h3> */}
                {renderOptions(visualOptions)}
            </Row>
            <Row>
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

export default Home;



// SPDX-License-Identifier: MIT

pragma solidity >= 0.8.13;

import "./ERC721.sol";
import "./IERC20.sol";
import "./IEIP2981.sol";
import "./AdminControl.sol";
import "./BH.sol";

contract blackhole is ERC721, AdminControl {
    
    uint256 public _ethPrice = 0.1*10**18; //0.1 ETH
    uint256 private _royaltyAmount; //in % 
    uint256 private _stage1BalanceRequirement = 1;
    uint256 private _stage2BalanceRequirement = 10000;
    uint256 private _stage3BalanceRequirement = 20000;
    uint256 private _nextTokenId = 1;

    mapping (uint256 => uint256) _tokenForms;

    string[] _uris;

    mapping (uint256 => uint256) public _BHBalances;

    mapping (uint256 => uint256) public _stage3TokenIds; // mapping form to tokenId

    bool public _mintOpened;
    bool public  _shootingStarMinted;

    address public _BHAddress;
    address payable  private _royalties_recipient;
    address private _signer;

    event Stag3Activated  (uint256 tokenId);
    
    constructor () ERC721("blackhole","bh") {
        _royalties_recipient = payable(msg.sender);
        _royaltyAmount = 10;

    } 

    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(ERC721, AdminControl)
        returns (bool)
    {
        return
        AdminControl.supportsInterface(interfaceId) ||
        ERC721.supportsInterface(interfaceId) ||
        interfaceId == type(IEIP2981).interfaceId ||
        super.supportsInterface(interfaceId);
    }

    function mintAllowed(uint8 v, bytes32 r, bytes32 s)internal view returns(bool){
        return(
            _signer ==
                ecrecover(
                    keccak256(
                        abi.encodePacked(
                            "\x19Ethereum Signed Message:\n32",
                            keccak256(
                                abi.encodePacked(
                                    msg.sender,
                                    address(this),
                                    _mintOpened
                                )
                            )
                        )
                    )
                , v, r, s)
        );
    }

    function setBHAddress(address BHAddress) external adminRequired{
        _BHAddress = BHAddress;
    }

    function setSigner (address signer) external adminRequired{
        _signer = signer;
    }

    function publicMint(
        uint256 tokenForm,
        uint8 v,
        bytes32 r, 
        bytes32 s
    ) external payable{
        require(mintAllowed( v, r, s), "Mint not allowed");
        require(msg.value >= _ethPrice, "Insufficent funds sent");
        require(tokenForm >= 1 && tokenForm <= 3, "Invalid token form");
        payable(_royalties_recipient).transfer(_ethPrice);
        _mint(msg.sender , _nextTokenId);
        _tokenForms[_nextTokenId] = tokenForm;
        _BHBalances[_nextTokenId] = BH(_BHAddress).mint(address(this), 1);
        _nextTokenId += 1;
    }

    function adminMint(
        uint256 tokenForm,
        address account
    ) external adminRequired{
        _mint(account ,_nextTokenId);
        _tokenForms[_nextTokenId] = tokenForm;
        _BHBalances[_nextTokenId] = BH(_BHAddress).mint(account, 1);
        _nextTokenId += 1;
    }


    function getBHBalance(uint256 tokenId) view public returns(uint256 blalance){
        return(_BHBalances[tokenId]);
    }

    function toggleMintState()external adminRequired{
        _mintOpened = !_mintOpened;
    }

    function updateURIs(string [] calldata uris) public adminRequired{
        delete _uris;
        for(uint256 i=0; i < uris.length; i++){
            _uris.push(uris[i]);
        }
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_exists(tokenId), "ERC721Metadata: URI query for nonexistent token");
        uint256 tokenStage;
        tokenStage = _BHBalances[tokenId] < _stage1BalanceRequirement ? 0 : _BHBalances[tokenId] < _stage2BalanceRequirement ? 3 : _BHBalances[tokenId] < _stage3BalanceRequirement ? 6 : 9;
        return(_uris[ _tokenForms[tokenId] + tokenStage - 1]);
    }

    function burn(uint256 tokenId) public {
        require(ownerOf(tokenId)== msg.sender, "You can only burn your own tokens");
        _burn(tokenId);
    }

    function setRoyalties(address payable _recipient, uint256 _royaltyPerCent) external adminRequired {
        _royalties_recipient = _recipient;
        _royaltyAmount = _royaltyPerCent;
    }

    function royaltyInfo(uint256 salePrice) external view returns (address, uint256) {
        if(_royalties_recipient != address(0)){
            return (_royalties_recipient, (salePrice * _royaltyAmount) / 100 );
        }
        return (address(0), 0);
    }

    function depositBH(uint256 tokenId, uint256 quantity) external{
        require(quantity > 0, "Invalid quantity of BH to deposit");
        require(ownerOf(tokenId)==msg.sender,"You can only deposit BH to a token you own");
        uint256 tokenBalance = getBHBalance(tokenId);
        if(tokenBalance + quantity >= _stage3BalanceRequirement){
            require(_stage3TokenIds[_tokenForms[tokenId]] == 0, "There is already a stage 3 token for that form");
            _stage3TokenIds[_tokenForms[tokenId]] = tokenId;
            emit Stag3Activated(tokenId);
        }
        BH(_BHAddress).transferFrom(msg.sender, address(this), quantity);
        _BHBalances[tokenId] += quantity;
    }
    
    function withdrawBH(uint256 tokenId,uint256 quantity) external{
        require(quantity > 0, "Invalid quantity of BH to withdraw");
        require(ownerOf(tokenId)==msg.sender,"You can only withdraw BH from the token you own");
        require(_BHBalances[tokenId] >= quantity, "Not enough BH to withdraw");
        uint256 tokenBalance = getBHBalance(tokenId);
        if( _stage3TokenIds[_tokenForms[tokenId]] == tokenId && (tokenBalance - quantity) < _stage3BalanceRequirement){
            _stage3TokenIds[_tokenForms[tokenId]] = 0;
        }
        BH(_BHAddress).transfer(msg.sender, quantity);
        _BHBalances[tokenId] -= quantity;
    }

    function withdraw(address recipient) external adminRequired {
        payable(recipient).transfer(address(this).balance);
    }

}
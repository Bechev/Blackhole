// SPDX-License-Identifier: MIT

pragma solidity >= 0.8.13;

import "./ERC721.sol";
import "./IEIP2981.sol";
import "./AdminControl.sol";
import "./Strings.sol";

contract ShootingStar is ERC721, AdminControl {

    mapping (uint256 => string ) public _uris;
    mapping (uint256 => address ) public _holders;
    address payable private _royalties_recipient;
    uint256 private _royaltyAmount; //in % 
    constructor () ERC721("ShootingStar", "ShS") {
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

    function transferNFT(uint256 tokenId, address holder) public adminRequired{
        _holders[tokenId] = holder;
    }

    function getHolder(uint256 tokenId)view external returns(address){
        return _holders[tokenId];
    }

    function mint(address to, uint256 tokenId, address holder) external adminRequired{
        _safeMint(to, tokenId, "");
        transferNFT(tokenId, holder);
    }

    function setURI(
        uint256 tokenId,
        string calldata updatedURI
    ) external adminRequired{
        _uris[tokenId] = updatedURI;
    }

    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        return _uris[tokenId];
    }

    function ownerOf(uint256 tokenId) public view virtual override returns (address) {
        require(_holders[tokenId] != address(0), "ERC721: invalid token ID");
        return _holders[tokenId];
    }

    function burn(uint256 tokenId) public {
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

    function withdraw(address recipient) external adminRequired {
        payable(recipient).transfer(address(this).balance);
    }

}
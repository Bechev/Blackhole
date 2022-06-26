// SPDX-License-Identifier: MIT
pragma solidity >= 0.8.13;

import "./ERC20.sol";
import "./ShootingStar.sol";
import "./AdminControl.sol";

contract BH is ERC20, AdminControl{

  uint256 public _universalGravitationalConstant = 6674;
  uint256 public _totalNFTSupply;
  uint256  public _shootingStarId;

  uint256[] public _contractVolumes;
  address[] public _contractAdresses;

  address public  _liveContract;
  address public _shootingStar;
  address public _shootingStarAddress;

  bool _shootingStarActivated;

  mapping(address => uint256) _contractIds;
  mapping(address => bool) _contractMinted;
  mapping (address => uint256) _transactionNumber;

  constructor () ERC20("Blackhole", "BH"){
    // Set values in index 0 of the arrays to not have a a contract with id 0
    // Prevents any issues with default values in _contractIds mapping
    _contractAdresses.push(address(0));
    _contractVolumes.push(0);
    _totalNFTSupply = 0;
  }

  function getMintQuantity(uint256 dropVolume)internal view returns(uint256 _mintQuantity){
    uint256 mintQuantity =  _universalGravitationalConstant * dropVolume/(_totalNFTSupply);
    return mintQuantity;
  }

  function registerDrop (address contractAddress, uint256 contractVolume) external adminRequired{
    _contractAdresses.push(contractAddress);
    _contractVolumes.push(contractVolume);
    _contractIds[contractAddress] = _contractAdresses.length - 1;
    _totalNFTSupply = _totalNFTSupply + contractVolume;
  }

  function editDrop (uint256 contractId, address contractAddress, uint256 contractVolume) external adminRequired{
    require(contractId > 0, "Contract not registered");
    require(_contractAdresses[contractId]  != address(0),  "Contract not  registered");
    require(_contractMinted[_contractAdresses[contractId]]==false,"Cannot edit a contract that was already mined");
    uint256 oldDropVolume  =  _contractVolumes[contractId];
    _contractAdresses[contractId] = contractAddress;
    _contractVolumes.push(contractVolume);
    _totalNFTSupply = _totalNFTSupply - oldDropVolume + contractVolume;
  }

  function setLiveContract(address contractAddress) external adminRequired{
    require(_contractIds[contractAddress]>0,"Contract not registered");
    _liveContract = contractAddress;
  }

  function  getContractId(address contractAddress)external view returns(uint256 id){
    return _contractIds[contractAddress]; 
  }
  
  function mint(address recipient, uint256 amountOfNFTsMinted) external returns(uint256 amountMinted){
    require(msg.sender == _liveContract, "Contract not allowed to mint");
    uint256 contractId = _contractIds[_liveContract];
    uint256 amount =  getMintQuantity(_contractVolumes[contractId]);
    uint256 quantity =  amount * amountOfNFTsMinted;
    _mint(recipient, quantity);
    return 100;
  }

  function airdrop(address[] calldata recipients, uint256[] calldata amountOfNFTsMinted)external adminRequired{
    require(recipients.length == amountOfNFTsMinted.length, "Invalid data");
    uint256 contractId = _contractIds[_liveContract];
    uint256 amount =  getMintQuantity(_contractVolumes[contractId]);
    for(uint256 i = 0; i < recipients.length; i++){
      _mint(recipients[i],  amount * amountOfNFTsMinted[i]);
    }
  }

  function burn(uint256 amount)external{
    _burn(msg.sender, amount);
  }

  function setShootingStarAddress(address ShootingStarAddress) external adminRequired{
      _shootingStarAddress = ShootingStarAddress;
  }

  function activateShootingStar(uint256 shootingStarId) external adminRequired{
      _shootingStarId = shootingStarId;
      _shootingStarActivated = true;
  }

  function _afterTokenTransfer(
    address from,
    address to,
    uint256 amount
  ) internal override {
    address originalStar = _shootingStar;
    // Track the number of the transactions
    // Mints and burn are not transactions
    if(from != address(0)) { 
      _transactionNumber[from] += 1;
      if(_shootingStar == address(0)){
        _shootingStar = from;
      }else{
        // With the same number of transactions, the initiator of the transaction will have priority
        if(_transactionNumber[from] > _transactionNumber[_shootingStar]){
          _shootingStar = from;
        }
      }
    }
    if(to != address(0)){
      _transactionNumber[to] += 1;
      if(_transactionNumber[to] > _transactionNumber[_shootingStar]){
        _shootingStar = from;
      }
    }
    if(_shootingStarActivated && _shootingStar != originalStar){
      ShootingStar(_shootingStarAddress).transferNFT(_shootingStarId, _shootingStar);
    }
  }
  
}
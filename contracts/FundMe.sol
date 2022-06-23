//SPDX-License-Identifier: MIT

pragma solidity 0.8.8;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "./PriceConverter.sol";

// error FundMe_NotOwner();

contract FundMe {

    using PriceConverter for uint256;

    event Funded(address indexed from, uint256 amount);

    address[] public funders;
    mapping(address => uint256) public addressToAmountFunded;

    address public owner;
    uint256 public constant MINIMUM_USD = 50 * 10 ** 18;

    AggregatorV3Interface public priceFeed;

    constructor (address priceFeedAddress){ 
        owner = msg.sender;
        priceFeed = AggregatorV3Interface(priceFeedAddress);
    }

    function fund () public payable {
        //set minimum fund amount to be 1ETH

        require(msg.value.getConversionRate(priceFeed) >= MINIMUM_USD, "You didn't send enough ETH");
        addressToAmountFunded[msg.sender] += msg.value;
        funders.push(msg.sender);
        emit Funded(msg.sender, msg.value);
    }

    function withdraw() public onlyOwner {
        for(uint256 index = 0; index < funders.length; index ++){
            address funder = funders[index];
            addressToAmountFunded[funder] = 0;
        }

        //resetting the array
        funders = new address[](0);

        //transfer funds
        (bool callSuccess ,) = payable(msg.sender).call{value : address(this).balance}("");
        require(callSuccess, "Call failed");
    }

    modifier onlyOwner{
        require(msg.sender == owner, "Not owner");
        _;
    }
}
// const { getNamedAccounts, deployments } = hre;

require("dotenv").config();
const { network } = require("hardhat");
const { networkConfig, developmentChain } = require("../helper-hardhat-config");
const { verify } = require('../utils/verify');

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();
    const chainId = network.config.chainId;

    //checking if chain ID Is hardhat use hardhat chainlink pricefeed(local development) or if chain Id is rinkeby use rinkeby chainlink pricefeed
    //reference to helper-hardhat-config.js
    // const ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"];

    let ethUsdPriceFeedAddress;
    if(developmentChain.includes(network.name)) {
        //if we are on local network or we have mock aggregator
        const ethUsdAggregator = await deployments.get("MockV3Aggregator")
        ethUsdPriceFeedAddress = ethUsdAggregator.address;
    }else{
        // i.e if we not on local network or no mock aggregator
        ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"];
    }

    const args = [ethUsdPriceFeedAddress]
    const fundMe = await deploy("FundMe", {
        from : deployer,
        args : args,
        log : true,
        waitConfirmations : network.config.blockConfirmations || 1,
    })

    if(!developmentChain.includes(network.name) && process.env.ETHERSCAN_API_KEY){
        await verify(fundMe.address, args)
    }
    log("-----------------------------------------------")
}
module.exports.tags = ["all", "fundme"]
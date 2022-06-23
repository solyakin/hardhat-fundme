const { assert } = require("chai");
const { ethers, getNamedAccounts, network } = require("hardhat");
const { developmentChain } = require("../../helper-hardhat-config");

developmentChain.includes(network.name) 
    ? describe.skip :
    describe("FundMe", async () => {
        let fundMe;
        let deployer;
        const sendValue = ethers.utils.parseEther("0.05");
        beforeEach(async () => {
            deployer = (await getNamedAccounts()).deployer;
            fundMe = await ethers.getContract("FundMe", deployer)
        })
        it("allows user to send and withdraw funds", async () => {
            await fundMe.fund({ value : sendValue })
            await fundMe.withdraw()
            const endingBalance = await fundMe.provider.getBalance(fundMe.address)
            assert.equal(endingBalance.toString(), "0")
        })
    })
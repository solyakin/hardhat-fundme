const { assert, expect } = require("chai");
const { getNamedAccounts, deployments, ethers, network } = require("hardhat");
const { developmentChain } = require("../../helper-hardhat-config");

!developmentChain.includes(network.name) ? 
    describe.skip :
    describe("FundMe", async function() {
        let fundMe;
        let deployer;
        let mockV3Aggregator;
        const valueSpend = ethers.utils.parseEther("1")

        beforeEach(async function(){
            deployer = (await getNamedAccounts()).deployer
            await deployments.fixture(["all"])
            fundMe = await ethers.getContract("FundMe", deployer)
            mockV3Aggregator = await ethers.getContract("MockV3Aggregator", deployer)
        })

        describe('constructor', async () => {
            it("set the aggregator addresses correctly", async () => {
                const response = await fundMe.priceFeed();
                assert.equal(response, mockV3Aggregator.address)
            })
        })
        describe("fund", async () => {
            it("Fail if you don't send enough ETH", async () => {
                await expect(fundMe.fund()).to.be.revertedWith("You didn't send enough ETH")
            })
            it("Update the amount funded data structure", async () => {
                await fundMe.fund({ value : valueSpend})
                const response = await fundMe.addressToAmountFunded(deployer)
                assert.equal(response.toString(), valueSpend.toString())
            })
            it("provide a list of all funders", async () => {
                await fundMe.fund({ value : valueSpend })
                const response = await fundMe.funders(0)
                assert.equal(response, deployer)
            })
        })
        describe("Withdraw", async () => {
            //we need to fund the account before each withdraw test
            beforeEach(async function(){
                await fundMe.fund({ value : valueSpend})
            })
            it('withdraw ETH from a single funder', async () => {
                const fundMeStartingBalance = await fundMe.provider.getBalance(fundMe.address)
                const fundMeDeployerBalance = await fundMe.provider.getBalance(deployer)
                // console.log(`starting bal : ${fundMeStartingBalance}`)
                // console.log(`deployer bal : ${fundMeDeployerBalance}`)

                const transactionResponse = await fundMe.withdraw()
                const transactionReciept = await transactionResponse.wait(1)
                const { gasUsed, effectiveGasPrice } = transactionReciept
                const gasCost = gasUsed.mul(effectiveGasPrice)

                const fundMeEndingBalance = await fundMe.provider.getBalance(fundMe.address)
                const deployerEndingBalance = await fundMe.provider.getBalance(deployer)

                assert.equal(fundMeEndingBalance , 0)
                assert.equal(fundMeStartingBalance.add(fundMeDeployerBalance).toString(), deployerEndingBalance.add(gasCost).toString())
            })
            it("Allows us to withdraw with multiple funders", async () => {
                const accounts = await ethers.getSigners();
                // let fundMeConnectedContract;

                for(let i = 0; i < 6; i++){
                    const fundMeConnectedContract = await fundMe.connect(accounts[i]);
                    //adding funds to each of the accounts
                    await fundMeConnectedContract.fund({ value : valueSpend })
                }
                const fundMeStartingBalance = await fundMe.provider.getBalance(fundMe.address)
                const fundMeDeployerBalance = await fundMe.provider.getBalance(deployer)

                const transactionResponse = await fundMe.withdraw()
                const transactionReciept = await transactionResponse.wait(1)
                const { gasUsed, effectiveGasPrice } = transactionReciept
                const gasCost = gasUsed.mul(effectiveGasPrice)
                
                const fundMeEndingBalance = await fundMe.provider.getBalance(fundMe.address)
                const deployerEndingBalance = await fundMe.provider.getBalance(deployer)

                assert.equal(fundMeEndingBalance , 0)
                assert.equal(fundMeStartingBalance.add(fundMeDeployerBalance).toString(), deployerEndingBalance.add(gasCost).toString())

                //make sure the funder array is reset properly
                await expect(fundMe.funders(0)).to.be.reverted

                for(i = 1; i < 6; i++){
                    assert.equal(await fundMe.addressToAmountFunded(accounts[i].address), 0)
                }
            })
            it("only owner should withdraw", async () => {
                const accounts = await ethers.getSigners()
                const attacker = accounts[1]
                const attackConnectedContract = await fundMe.connect(attacker)
                await expect(attackConnectedContract.withdraw()).to.be.reverted
            })
        })
    })
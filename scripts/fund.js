const { ethers, getNamedAccounts } = require("hardhat")


const main = async () => {

    const { deployer } = await getNamedAccounts()
    const fundMe = await ethers.getContract("FundMe", deployer)
    console.log("Getting Funding contract...")

    const transactionResponse = await fundMe.fund({ value : ethers.utils.parseEther("0.5")})
    const transactionReciept = await transactionResponse.wait(1);
    console.log("funded");
}

main()
.then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
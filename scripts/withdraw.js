const { getNamedAccounts, ethers } = require("hardhat")

const main = async () => {
    const { deployer } = await getNamedAccounts();
    const fundMe = await ethers.getContract("FundMe", deployer);
    console.log("Withdrawing Funds")

    const transactionResponse  = await fundMe.withdraw();
    const transactionReciept = transactionResponse.wait(1);
    console.log("done!")
}

main()
.then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
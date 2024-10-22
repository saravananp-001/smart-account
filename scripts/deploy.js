const hre = require("hardhat");

async function main() {
  // Deploy the EntryPoint contract
  // const EntryPoint = await hre.ethers.deployContract("EntryPoint");
  // await EntryPoint.waitForDeployment();
 
  // const AccountFactory = await hre.ethers.deployContract("AccountFactory",["0xb87a472325C42BfC137499539C1A966Bce9ce10A"]);
  // await AccountFactory.waitForDeployment();

  const Paymaster = await hre.ethers.deployContract("LouicePaymaster",["0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789","0xb87a472325C42BfC137499539C1A966Bce9ce10A"]);
  await Paymaster.waitForDeployment();
    
  // Log the deployed contract address
  // console.log("Deployed EntryPoint to:", EntryPoint.target);
  // console.log("Deployed AccountFactory to:", AccountFactory.target);
  console.log("Deployed Paymaster to:", Paymaster.target);
}

// Run the main function and catch any errors
main().catch((error) => {
  console.error(error);
  process.exit(1);
});

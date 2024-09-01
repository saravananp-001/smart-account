const hre = require("hardhat");

async function main() {
  // Deploy the EntryPoint contract
  const EntryPoint = await hre.ethers.deployContract("EntryPoint");
  await EntryPoint.waitForDeployment();
 
  const AccountFactory = await hre.ethers.deployContract("AccountFactory",["0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"]);
  await AccountFactory.waitForDeployment();

  // const Paymaster = await hre.ethers.deployContract("Paymaster");
  // await Paymaster.waitForDeployment();
    
  // Log the deployed contract address
  console.log("Deployed EntryPoint to:", EntryPoint.target);
  console.log("Deployed AccountFactory to:", AccountFactory.target);
  // console.log("Deployed Paymaster to:", Paymaster.target);
}

// Run the main function and catch any errors
main().catch((error) => {
  console.error(error);
  process.exit(1);
});

const hre = require("hardhat");

const sender_mysmartAccount = "0xbd7f2c56633a4ea4474bae6f46b16c86021d7d88";
const ENTRYPOINT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const second_address = "0x34E0fEf5e0116669Ee11A7a0ab520c70eB010B4C"
const FACTORY_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
const PAYMASTER_ADDRESS = "0x41931204Cdcd6Ed02A66c5285ab62889B3d3688b";
const PAYMASTER_ADDRESS1 = "0x34E0fEf5e0116669Ee11A7a0ab520c70eB010B4C";
async function main() {

  const EPoint = await hre.ethers.getContractAt("EntryPoint", ENTRYPOINT_ADDRESS);

  // check the balancess
  console.log("Account Balance:", await hre.ethers.provider.getBalance(sender_mysmartAccount));
  console.log("Deposit Account Balance:", await EPoint.balanceOf(sender_mysmartAccount));
  // console.log("Deposit ENTRYPOINT_ADDRESS Balance:", await EPoint.balanceOf(ENTRYPOINT_ADDRESS));
  // console.log("Deposit FACTORY_ADDRESS Balance:", await EPoint.balanceOf(FACTORY_ADDRESS));
  // console.log("Deposit PAYMASTER_ADDRESS Balance:", await EPoint.balanceOf(PAYMASTER_ADDRESS));
  // console.log("Deposit PAYMASTER_ADDRESS Balance:", await EPoint.balanceOf(PAYMASTER_ADDRESS1));
  // console.log("Deposit myAccount entrypoint Balance:", await EPoint.balanceOf(ENTRYPOINT_ADDRESS));
  console.log("entrypoint Balance:", await hre.ethers.provider.getBalance(ENTRYPOINT_ADDRESS));

  console.log("Account Balance:", await hre.ethers.provider.getBalance(second_address));
}

// Run the main function and catch any errors
main().catch((error) => {
  console.error(error);
  process.exit(1);
});

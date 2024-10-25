const hre = require("hardhat");

const bundler = "0xb87a472325C42BfC137499539C1A966Bce9ce10A";
const mysmartAccount = "0x7d41Cc4F78a68120ce74Bfa82f16DCE48B3C8214";
const ENTRYPOINT_ADDRESS = "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789";
const second_address = "0xA69B64b4663ea5025549E8d7B90f167D6F0610B3"
const FACTORY_ADDRESS = "0x5ed4386F818f34f1f0c5b13C8eD513eDdF407B30";
const PAYMASTER_ADDRESS = "0xEcdA01816dfD0BAfb0Ca7EC7e455549b6dAa5889";
const PAYMASTER_ADDRESS1 = "0x34E0fEf5e0116669Ee11A7a0ab520c70eB010B4C";
async function main() {

  const EPoint = await hre.ethers.getContractAt("EntryPoint", ENTRYPOINT_ADDRESS);

  // check the balancess
  console.log("bundler Balance:", await  hre.ethers.provider.getBalance(bundler));
  console.log("mysmartAccount Balance:", await hre.ethers.provider.getBalance(mysmartAccount));
  console.log("Deposit mysmartAccount Balance:", await EPoint.balanceOf(mysmartAccount));
  // console.log("Deposit ENTRYPOINT_ADDRESS Balance:", await EPoint.balanceOf(ENTRYPOINT_ADDRESS));
  // console.log("Deposit FACTORY_ADDRESS Balance:", await EPoint.balanceOf(FACTORY_ADDRESS));
  console.log("Deposit PAYMASTER_ADDRESS Balance:", await EPoint.balanceOf(PAYMASTER_ADDRESS));
  // console.log("Deposit PAYMASTER_ADDRESS Balance:", await EPoint.balanceOf(PAYMASTER_ADDRESS1));
  // console.log("Deposit myAccount entrypoint Balance:", await EPoint.balanceOf(ENTRYPOINT_ADDRESS));
  // console.log("entrypoint Balance:", await hre.ethers.provider.getBalance(ENTRYPOINT_ADDRESS));

  // console.log("second_address Balance:", await hre.ethers.provider.getBalance(second_address));
}

// Run the main function and catch any errors
main().catch((error) => {
  console.error(error);
  process.exit(1);
});

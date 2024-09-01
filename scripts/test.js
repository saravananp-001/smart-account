const hre = require("hardhat");

const sender_mysmartAccount = "0x695c6715f9c84ae1a28b0da4f06d7faade0bf749";
// const sender_mysmartAccount = "0xd7e556a90f9b111a448f54f31eb249e382af4246";
async function main() {
  // Deploy the EntryPoint contract
  const Account  = await hre.ethers.getContractAt("Account",sender_mysmartAccount);
  const count = await Account.count();
  console.log("Count:", count);
}

// Run the main function and catch any errors
main().catch((error) => {
  console.error(error);
  process.exit(1);
});

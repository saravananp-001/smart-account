const hre = require("hardhat");

const ENTRYPOINT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const FACTORY_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
const PAYMASTER_ADDRESS = "0x41931204Cdcd6Ed02A66c5285ab62889B3d3688b";
const MYACCOUNT = "0xbd7f2c56633a4ea4474bae6f46b16c86021d7d88";
async function main() {

    const EPoint = await hre.ethers.getContractAt("EntryPoint", ENTRYPOINT_ADDRESS);

    //  Deposite the initial payment to paymasters
    await EPoint.depositTo(MYACCOUNT, {
    value: hre.ethers.parseUnits("0.2", "ether") // Ensure this is a hex string
  })

  console.log('ETH deposited');

  transferETh()
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});

async function transferETh() {
  const [signer0] = await hre.ethers.getSigners();
  const tx = await signer0.sendTransaction({
    to: MYACCOUNT,
    value: hre.ethers.parseUnits("11", "ether")
  });
  console.log(tx);
}
const hre = require("hardhat");

const ENTRYPOINT_ADDRESS = "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789";
const FACTORY_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
const PAYMASTER_ADDRESS = "0xDd74396fb58c32247d8E2410e853a73f71053252";
const MYACCOUNT = "0xbd7f2c56633a4ea4474bae6f46b16c86021d7d88";
async function main() {

    const EPoint = await hre.ethers.getContractAt("EntryPoint", ENTRYPOINT_ADDRESS);

    //  Deposite the initial payment to paymasters
    await EPoint.depositTo(PAYMASTER_ADDRESS, {
    value: hre.ethers.parseUnits("0.2", "ether") // Ensure this is a hex string
  })

  console.log('ETH deposited');

  // transferETh()
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
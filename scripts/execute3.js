const hre = require("hardhat");

const EP_ADDRESS = "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789";
const FACTORY_ADDRESS = "0x5ed4386F818f34f1f0c5b13C8eD513eDdF407B30";
const mysmartAccount = "0x76f1035c431853450aa27853247e7f0bc03e4a59";
const second_address = "0xA69B64b4663ea5025549E8d7B90f167D6F0610B3"
const ERC20_contract = "0x6dbA02d1A9f8248aCe5fFE63a0d75e98C157a430"
const salt = 123;
async function main() {
  const entryPoint = await hre.ethers.getContractAt("EntryPoint", EP_ADDRESS);

  // const AccountFactory = await hre.ethers.getContractFactory("AccountFactory");
  const [signer0, signer1] = await hre.ethers.getSigners();
  const address0 = await signer0.getAddress();
  console.log("benificry",address0);
//   let initCode =
//     FACTORY_ADDRESS +
//     AccountFactory.interface
//       .encodeFunctionData("createAccount", [address0])
//       .slice(2);

//   let sender;
//   try {
//     await entryPoint.getSenderAddress(initCode);
//   } catch (ex) {
//     sender = "0x" + ex.data.slice(-40);
//   }

//   const code = await ethers.provider.getCode(sender);
//   if (code !== "0x") {
//     initCode = "0x";
//   }

//   console.log({ sender });

//   const Account = await hre.ethers.getContractFactory("Account");
//   const userOp = {
//     sender, // smart account address
//     nonce:  "0x" + (await entryPoint.getNonce(sender, 0)).toString(16),
//     initCode,
//     callData: Account.interface.encodeFunctionData("execute"),
//     paymasterAndData: PM_ADDRESS1,
//     signature:
//       "0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c",
//   };

//   const { preVerificationGas, verificationGasLimit, callGasLimit } =
//     await ethers.provider.send("eth_estimateUserOperationGas", [
//       userOp,
//       EP_ADDRESS,
//     ]);

//   userOp.preVerificationGas = preVerificationGas;
//   userOp.verificationGasLimit = verificationGasLimit;
//   userOp.callGasLimit = callGasLimit;

//   userOp.preVerificationGas = ethers.utils.hexZeroPad(ethers.utils.hexlify( userOp.preVerificationGas), 32)
//   console.log("userOp.preVerificationGas : ", userOp.preVerificationGas);
  
//   var { maxFeePerGas } = await ethers.provider.getFeeData();
//   userOp.maxFeePerGas = maxFeePerGas;

//   const maxPriorityFeePerGas = await ethers.provider.send(
//     "rundler_maxPriorityFeePerGas"
//   );
//   userOp.maxPriorityFeePerGas = maxPriorityFeePerGas;

//   const userOpHash = await entryPoint.getUserOpHash(userOp);
//   userOp.signature = await signer0.signMessage(hre.ethers.getBytes(userOpHash));

// //   console.log("userOp", userOp);

  const userOp = {
    sender: '0x76f1035c431853450aa27853247e7f0bc03e4a59',
    nonce: '0xa',
    initCode: '0x',
    callData: '0xb61d27f60000000000000000000000006dba02d1a9f8248ace5ffe63a0d75e98c157a430000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000044a9059cbb000000000000000000000000a69b64b4663ea5025549e8d7b90f167d6f0610b3000000000000000000000000000000000000000000000000000000007735940000000000000000000000000000000000000000000000000000000000',
    paymasterAndData: '0x',
    signature: '0x79adf76ab1b2bf11b557e7c6fa4ffaf177e37fd92e09d7ca74d502b370d42a03627f9f3b08f0cb0fc07acb093e2272a47af04ab02bfc5cd091a53146ae4515581b',
    preVerificationGas: '0xad98',
    verificationGasLimit: '0x8112',
    callGasLimit: '0xd0a9',
    maxFeePerGas: '0xa5c681d16',
    maxPriorityFeePerGas: '0xa5a472819'
  }


  // Send the user operation to the bundler
  // const opHash = await ethers.provider.send("eth_sendUserOperation", [
  //   userOp,
  //   EP_ADDRESS,
  // ]);

    try {
      // Sending a transaction using handleOps and waiting for it to be mined
      const tx = await entryPoint.handleOps([userOp], address0);
      const receipt = await tx.wait();
      console.log("receipt:", receipt);
    } catch (error) {
      console.error("Error:", error);
    }

}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
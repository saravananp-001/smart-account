const hre = require("hardhat");

const FACTORY_ADDRESS = "0xa6C10A9ccC9e6B968D80841017816b9a8cf96936";
const EP_ADDRESS = "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789";
const PM_ADDRESS = "0x41931204Cdcd6Ed02A66c5285ab62889B3d3688b";
const PM_ADDRESS1 = "0x34E0fEf5e0116669Ee11A7a0ab520c70eB010B4C";
async function main() {
  const entryPoint = await hre.ethers.getContractAt("EntryPoint", EP_ADDRESS);

  const AccountFactory = await hre.ethers.getContractFactory("AccountFactory");
  const [signer0, signer1] = await hre.ethers.getSigners();
  const address0 = await signer0.getAddress();
  let initCode =
    FACTORY_ADDRESS +
    AccountFactory.interface
      .encodeFunctionData("createAccount", [address0])
      .slice(2);

  let sender;
  try {
    await entryPoint.getSenderAddress(initCode);
  } catch (ex) {
    sender = "0x" + ex.data.slice(-40);
  }

  const code = await ethers.provider.getCode(sender);
  if (code !== "0x") {
    initCode = "0x";
  }

  console.log({ sender });

  const Account = await hre.ethers.getContractFactory("Account");
  const userOp = {
    sender, // smart account address
    nonce:  "0x" + (await entryPoint.getNonce(sender, 0)).toString(16),
    initCode,
    callData: Account.interface.encodeFunctionData("execute"),
    paymasterAndData: PM_ADDRESS1,
    signature:
      "0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c",
  };

  const { preVerificationGas, verificationGasLimit, callGasLimit } =
    await ethers.provider.send("eth_estimateUserOperationGas", [
      userOp,
      EP_ADDRESS,
    ]);

  userOp.preVerificationGas = preVerificationGas;
  userOp.verificationGasLimit = verificationGasLimit;
  userOp.callGasLimit = callGasLimit;

  userOp.preVerificationGas = ethers.utils.hexZeroPad(ethers.utils.hexlify( userOp.preVerificationGas), 32)
  console.log("userOp.preVerificationGas : ", userOp.preVerificationGas);
  
  var { maxFeePerGas } = await ethers.provider.getFeeData();
  userOp.maxFeePerGas = maxFeePerGas;

  const maxPriorityFeePerGas = await ethers.provider.send(
    "rundler_maxPriorityFeePerGas"
  );
  userOp.maxPriorityFeePerGas = maxPriorityFeePerGas;

  const userOpHash = await entryPoint.getUserOpHash(userOp);
  userOp.signature = await signer0.signMessage(hre.ethers.getBytes(userOpHash));

//   console.log("userOp", userOp);

  const userOp1 = {
    sender: '0x33734f942461d3e4f50a20059ba3273e4f01d778',
    nonce: '0x10',
    initCode: '0x',
    callData: '0x61461954',
    paymasterAndData: '0x34E0fEf5e0116669Ee11A7a0ab520c70eB010B4C',
    signature: '0xf6694872bb68963129eaaa275197f4072e34a37e21842a4a4074a996eaaaf2104fd84e5ad81ee1103a069de3ff8ebd89892a3a226c7e6466476969e06c20a1e01b',
    preVerificationGas: '0xb0f4',
    callGasLimit: '0x2bb8',
    verificationGasLimit: '0x8a25',
    maxFeePerGas: '0x7a4a4fe60',
    maxPriorityFeePerGas: '0x3b9aca00'
  }
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
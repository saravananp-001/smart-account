const hre = require("hardhat");
// const { ethers } = require("ethers");

const ENTRYPOINT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const FACTORY_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
const sender_mysmartAccount = "0xbd7f2c56633a4ea4474bae6f46b16c86021d7d88";
const second_address = "0x34E0fEf5e0116669Ee11A7a0ab520c70eB010B4C"
async function main() {

  // Get the EntryPoint contract
  const EPoint = await hre.ethers.getContractAt("EntryPoint", ENTRYPOINT_ADDRESS);
  
  // Get the AccountFactory contract
  const AFactory = await hre.ethers.getContractAt("AccountFactory",FACTORY_ADDRESS);

  // Use the function from the accountFactory
  const AccountFactory = await hre.ethers.getContractFactory("AccountFactory");
  const [signer0] = await hre.ethers.getSigners();
  const address0 = await signer0.getAddress();
  console.log("address0",address0);
  // const address1 = await signer1.getAddress();

  // Get the account contract bytecode for call the accountFactory execute function
  const Account = await hre.ethers.getContractFactory("SimpleAccount");
  const encodedArgs = Account.interface.encodeDeploy([ENTRYPOINT_ADDRESS, address0]);
  const bytecodeWithArgs = Account.bytecode + encodedArgs.slice(2);

  // check with accountFactory function
  const senderAddress = await AFactory.estimatedAddress(bytecodeWithArgs,123);
  console.log('senderAddress from accountFactory :', senderAddress);
  
  var initCode = FACTORY_ADDRESS + AccountFactory.interface.encodeFunctionData("deploy", [bytecodeWithArgs,123]).slice(2);  // its for initial account deployment

  var sender ;
  try {
    await EPoint.getSenderAddress(initCode);
  }
  catch(Ex)
  {
    console.log('exdata',Ex.data.data);
    sender  = '0x'+ Ex.data.data.slice(-40);
  }
  console.log({ sender });

  const codeLength = await hre.ethers.provider.getCode(sender);
  // console.log({codeLength});
  if(codeLength != "0x")
  {
    initCode = "0x";
  }
  

  // console.log({ initCode });
  const userOp = {
    sender,
    nonce: await EPoint.getNonce(senderAddress, 0),
    initCode,
    callData:Account.interface.encodeFunctionData("execute",[second_address,43000000,"0x"]),
    // callData: Account.interface.encodeFunctionData("withdrawDepositTo",[sender_mysmartAccount,1588765661730373]),
    callGasLimit: 1_000_000, // Try increasing to 1,000,000
    verificationGasLimit: 1_500_000, // Try increasing to 1,500,000
    preVerificationGas: 200_000, // Try increasing to 200,000    
    maxFeePerGas: ethers.parseUnits("10", "gwei"),
    maxPriorityFeePerGas: ethers.parseUnits("5", "gwei"), 
    paymasterAndData: "0x", // we're not using a paymaster, for now
    signature: "0x", // we're not validating a signature, for now
  }

  console.log('nounce',userOp.nonce);
    const userOpHash = await EPoint.getUserOpHash(userOp);
    userOp.signature = await signer0.signMessage(hre.ethers.getBytes(userOpHash));
  

  try {
    // Sending a transaction using handleOps and waiting for it to be mined
    const tx = await EPoint.handleOps([userOp], address0);
    const receipt = await tx.wait();
    console.log("receipt:", receipt);
  } catch (error) {
    console.error("Error:", error);
  }
}

// Run the main function and catch any errors
main().catch((error) => {
  console.error(error);
  process.exit(1);
});

const hre = require("hardhat");
// const { ethers } = require("ethers");

const ENTRYPOINT_ADDRESS = "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789";
const FACTORY_ADDRESS = "0x5ed4386F818f34f1f0c5b13C8eD513eDdF407B30";
const mysmartAccount = "0x76f1035c431853450aa27853247e7f0bc03e4a59";
const second_address = "0xA69B64b4663ea5025549E8d7B90f167D6F0610B3"
const ERC20_contract = "0x6dbA02d1A9f8248aCe5fFE63a0d75e98C157a430"
const salt = 123;

const IERC20_ABI = [
  "function totalSupply() external view returns (uint256)",
  "function balanceOf(address account) external view returns (uint256)",
  "function transfer(address recipient, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) external view returns (uint256)",
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function transferFrom(address sender, address recipient, uint256 amount) external returns (bool)",
  "event Transfer(address indexed from, address indexed to, uint256 value)",
  "event Approval(address indexed owner, address indexed spender, uint256 value)"
];

const USER_OP_RPC_URL="http://0.0.0.0:14337/rpc";
const userOpProvider = new ethers.JsonRpcProvider(USER_OP_RPC_URL);
async function main() {
  const IERC20Interface = new ethers.Interface(IERC20_ABI);

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
  const senderAddress = await AFactory.estimatedAddress(bytecodeWithArgs,salt);
  console.log('senderAddress from accountFactory :', senderAddress);
  
  var initCode = FACTORY_ADDRESS + AccountFactory.interface.encodeFunctionData("deploy", [bytecodeWithArgs,salt]).slice(2);  // its for initial account deployment
  
  //construct data for the token transaction
  const data = IERC20Interface.encodeFunctionData("transfer", [second_address, 700000000]);

  var sender ;
  try {
    await EPoint.getSenderAddress(initCode);
  }
  catch(Ex)
  {
    sender = "0x" + Ex.data.slice(-40);
  }
  console.log({ sender });

  const codeLength = await hre.ethers.provider.getCode(sender);
  if(codeLength != "0x")
  {
    initCode = "0x";
  }
  

  console.log("nounce",await EPoint.getNonce(sender, 0));
  const value = ethers.parseEther('0.10');
  console.log("value", value);
  const userOp = {
    sender,
    nonce:  "0x" + (await EPoint.getNonce(sender, 0)).toString(16),
    initCode,
    // callData:Account.interface.encodeFunctionData("execute",[ERC20_contract,0,data]),
    callData:Account.interface.encodeFunctionData("execute",[second_address,value,"0x"]),
    paymasterAndData: "0x", // we're not using a paymaster, for now
    signature: "0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c", // we're not validating a signature, for now
  }

  // console.log({userOp});
  const { preVerificationGas, verificationGasLimit, callGasLimit} =
  await ethers.provider.send("eth_estimateUserOperationGas", [
    userOp,
    ENTRYPOINT_ADDRESS,
  ]);

  userOp.preVerificationGas = preVerificationGas;
  userOp.verificationGasLimit = verificationGasLimit;
  userOp.callGasLimit = callGasLimit;
  // userOp.maxFeePerGas = maxFeePerGas;
  // userOp.maxPriorityFeePerGas = maxPriorityFeePerGas;

  var { maxFeePerGas } = await ethers.provider.getFeeData();
  userOp.maxFeePerGas = "0x" + maxFeePerGas.toString(16);
  // userOp.maxPriorityFeePerGas = "0x" + maxPriorityFeePerGas.toString(16);

  const {maxPriorityFeePerGas} = await userOpProvider.send(
    "skandha_getGasPrice"
  );
  
  // const maxPriorityFeePerGas = await ethers.provider.send(
  //   "rundler_maxPriorityFeePerGas"
  // );
  userOp.maxPriorityFeePerGas = maxPriorityFeePerGas;

  const userOpHash = await EPoint.getUserOpHash(userOp);
  userOp.signature = await signer0.signMessage(hre.ethers.getBytes(userOpHash));
  
  console.log({userOp});

  // Send the user operation to the bundler
  const opHash = await userOpProvider.send("eth_sendUserOperation", [
    userOp,
    ENTRYPOINT_ADDRESS,
  ]);

  console.log("User Operation Hash:", opHash);
  
  // async function getUserOperationByHash(opHash, delay = 2000) {
  //   for (let i = 0; true; i++) {
  //     const response = await userOpProvider.send("eth_getUserOperationByHash", [opHash]);
  //     console.log("User Operation Hash:", response);
  //     if (!(response.result === null) && response.transactionHash) {
  //       return response;
  //     }
  
  //     // Wait for a specified delay before retrying
  //     await new Promise(resolve => setTimeout(resolve, delay));
  //   }
  // }

  try {
    // const userOperation = await getUserOperationByHash(opHash);
    // console.log("transaction hash:", userOperation.transactionHash);
    console.log("User Operation Hash:", opHash);
  } catch (error) {
    console.error("Error:", error);
  }
}

// Run the main function and catch any errors
main().catch((error) => {
  console.error(error);
  process.exit(1);
});

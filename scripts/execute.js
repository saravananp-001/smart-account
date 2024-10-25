const hre = require("hardhat");
const axios = require("axios");
// const { ethers } = require("ethers");

const ENTRYPOINT_ADDRESS = "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789";
const FACTORY_ADDRESS = "0x5ed4386F818f34f1f0c5b13C8eD513eDdF407B30";
const mysmartAccount = "0x7d41Cc4F78a68120ce74Bfa82f16DCE48B3C8214";
const second_address = "0xA69B64b4663ea5025549E8d7B90f167D6F0610B3"
const ERC20_contract = "0xF757Dd3123b69795d43cB6b58556b3c6786eAc13"
// const PAYMASTER_ADDRESS = "0x8147C7551994eA98B59f507820ED4dAC4414b133"; // louicepaymaster
// const PAYMASTER_ADDRESS = "0x74169B3b77D81BDcE94B4559678c6DD7a1F52540"; // novalidation(working) no => postops, context creation
// const PAYMASTER_ADDRESS = "0x53c66C4D8CC377Df00F80c1510326915dd1Aacd8"; // novalidation (working) postops(event), simple context create
// const PAYMASTER_ADDRESS = "0xB8fAEF99fbCE551D1a7A56aC7Cc919dcB57f002F"; // novalidation (working) postops(event), proper context create with no signatue validation
// const PAYMASTER_ADDRESS = "0xdBf5Cf9871766b6a9A68903Bf3acF3Cb799F4Dc2"; // novalidation (working) postops(event, decode), proper context create with signature validation
// const PAYMASTER_ADDRESS = "0x3cBC16570292755fC0c9508bF0e1Cf2cdd9E522d"; // novalidation (not working) when have the transferFrom
const PAYMASTER_ADDRESS = "0xEcdA01816dfD0BAfb0Ca7EC7e455549b6dAa5889" // working code
// const PAYMASTER_ADDRESS = "0x9776303047A86DB46db6376f7A2296C3489AEFE9"; // dummyPaymaster(working)
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

const USER_OP_RPC_URL="http://127.0.0.1:8000/paymaster";
const userOpProvider = new ethers.JsonRpcProvider(USER_OP_RPC_URL);

async function getAprovedTokenFromPaymaster(){
  const pm_data = {
    jsonrpc: "2.0",
    id: "0",
    method: "pm_getApprovedTokens",
    params:{}
  }
  const response = await axios.post('http://127.0.0.1:8000/paymaster', pm_data, {
    headers: { 'Content-Type': 'application/json' }
  });

  data = response.data.result;
  return data.find(obj => obj.address.toLowerCase() === ERC20_contract.toLowerCase());
}

async function getSponserFromPaymaster(userOp){
  const pm_data = {
    jsonrpc: "2.0",
    id: "0",
    method: "pm_sponsorUserOperation",
    params:{
      request: userOp,
      token_address: ERC20_contract
    }
  }
  const response = await axios.post('http://127.0.0.1:8000/paymaster', pm_data, {
    headers: { 'Content-Type': 'application/json' }
  });

  console.log("paymasterSignedData: ",response.data.result);
  return response.data.result;
}

async function main() {

  // Send request to user-op to get approved tokens
  const {address, exchangeRate} = await getAprovedTokenFromPaymaster();
  console.log('Response(exchangeRate):', exchangeRate);

  const IERC20Interface = new ethers.Interface(IERC20_ABI);

  // Get the EntryPoint contract
  const EPoint = await hre.ethers.getContractAt("EntryPoint", ENTRYPOINT_ADDRESS);
  
  // Get the AccountFactory contract
  const AFactory = await hre.ethers.getContractAt("AccountFactory",FACTORY_ADDRESS);

  // Paymaster contract
  const Paymaster = await hre.ethers.getContractAt("NoValidationPaymaster", PAYMASTER_ADDRESS);

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
  // const senderAddress = await AFactory.estimatedAddress(bytecodeWithArgs,salt);
  // console.log('senderAddress from accountFactory :', senderAddress);
  
  var initCode = FACTORY_ADDRESS + AccountFactory.interface.encodeFunctionData("deploy", [bytecodeWithArgs,salt]).slice(2);  // its for initial account deployment
  
  //construct for the approve
  const dummyActualGasNeed = ethers.parseEther('1');
  const dummyTokenApprove = IERC20Interface.encodeFunctionData("approve", [PAYMASTER_ADDRESS, dummyActualGasNeed]);
  // console.log({dummyTokenApprove});

  //construct data for the token transaction
  const data = IERC20Interface.encodeFunctionData("transfer", [second_address, 2000000000 ]);
  // console.log({data});

  var sender ;
  try {
    await EPoint.getSenderAddress(initCode);
  }
  catch(Ex)
  {
    sender = ethers.getAddress("0x" + Ex.data.slice(-40));
  }
  console.log({ sender });

  const codeLength = await hre.ethers.provider.getCode(sender);
  if(codeLength != "0x")
  {
    initCode = "0x";
  }
  

  console.log("nounce",await EPoint.getNonce(sender, 0));
  const value = ethers.parseEther('0.003');
  console.log("value", value);

  const userOp = {
    sender,
    nonce:  "0x" + (await EPoint.getNonce(sender, 0)).toString(16),
    initCode,
    // callData:Account.interface.encodeFunctionData("execute",[ERC20_contract, 0, data, "0x0000000000000000000000000000000000000000", "0x"]),
    // callData:Account.interface.encodeFunctionData("execute",[ERC20_contract, 0, data, ERC20_contract, dummyTokenApprove]),
    callData:Account.interface.encodeFunctionData("execute",[second_address,value,"0x", ERC20_contract, dummyTokenApprove]),
    // callData:"0x",
    paymasterAndData: PAYMASTER_ADDRESS + "F756Dd3123b69795d43cB6b58556b3c6786eAc13010000671a219600000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000013b5e557e4601a264c654f3f0235ed381fc08b5ffea980e403bc807e27433586b0eb1abe122723125fc4d62ef605943f53a0c87893af3cfd6d33c3924cb0a4328ab0da981c", // we're not using a paymaster, for now
    // paymasterAndData:PAYMASTER_ADDRESS,
    signature: "0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c", // we're not validating a signature, for now
  }

  // console.log("DummypaymasterAndData", userOp.paymasterAndData);
  const { preVerificationGas, verificationGasLimit, callGasLimit} =
  await ethers.provider.send("eth_estimateUserOperationGas", [
    userOp,
    ENTRYPOINT_ADDRESS,
  ]);

  userOp.preVerificationGas = preVerificationGas;
  userOp.verificationGasLimit = verificationGasLimit;
  userOp.callGasLimit = callGasLimit;


  var { maxFeePerGas } = await ethers.provider.getFeeData();
  userOp.maxFeePerGas = "0x" + maxFeePerGas.toString(16);

  const {maxPriorityFeePerGas} = await ethers.provider.send(
    "skandha_getGasPrice"
  );
  userOp.maxPriorityFeePerGas = userOp.maxFeePerGas;

  // Calculate the totalAcutalGasToken needed for the user operation
  const totalGas = BigInt(userOp.preVerificationGas) + BigInt(userOp.verificationGasLimit) + BigInt(userOp.callGasLimit)
  console.log({totalGas});
  console.log('all gas : ', BigInt(userOp.preVerificationGas), BigInt(userOp.verificationGasLimit), BigInt(userOp.callGasLimit));

  const additionalGas = BigInt(35000);
 
  const eth_gas = (totalGas * BigInt(maxFeePerGas) + (additionalGas * BigInt(maxFeePerGas)));
  console.log('eth_gas : ', eth_gas);
  const actualTokenCost = ((totalGas * BigInt(maxFeePerGas) + (additionalGas * BigInt(maxFeePerGas))) * BigInt(exchangeRate)) / BigInt(1e18);
  console.log('actualTokenCost : ', actualTokenCost);
  const FeeTokenApprove = IERC20Interface.encodeFunctionData("approve", [PAYMASTER_ADDRESS, actualTokenCost]);
  console.log('FeeTokenApprove : ', FeeTokenApprove);

  userOp.callData = Account.interface.encodeFunctionData("execute",[second_address,value,"0x", ERC20_contract, FeeTokenApprove]);
  
  const paymasterData = await getSponserFromPaymaster(userOp);
  userOp.paymasterAndData = PAYMASTER_ADDRESS + paymasterData;
  // const parsedPaymaster= await Paymaster.parsePaymasterAndData(userOp.paymasterAndData);

  // console.log(parsedPaymaster)

  const userOpHash = await EPoint.getUserOpHash(userOp);
  userOp.signature = await signer0.signMessage(hre.ethers.getBytes(userOpHash));
  
  console.log({userOp});

  // Send the user operation to the bundler
  const opHash = await ethers.provider.send("eth_sendUserOperation", [
    userOp,
    ENTRYPOINT_ADDRESS,
  ]);
  console.log("User Operation Hash:", opHash);
  
  async function getUserOperationByHash(opHash, delay = 2000) {
    for (let i = 0; true; i++) {
      const result = await ethers.provider.send("skandha_userOperationStatus", [opHash]);
      // console.log("User Operation Hash:", result);
      if (!(result === null) && result.status) {
        if (['Cancelled', 'Reverted'].includes(result.status)) {
          handleError(`Transaction is ${result.status}. Try again later.`);
          return;
        }

        if (result.status === 'OnChain') {
            console.log('Transaction completed successfully.');
            return result.transaction;
        }
      }
  
      // Wait for a specified delay before retrying
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  try {
    const transactionHash = await getUserOperationByHash(opHash);
    console.log("transaction hash:", transactionHash);
    // const tx = await EPoint.handleOps([userOp], address0)
    // const receipt = await tx.wait();
    // console.log("receipt:", receipt);
  } catch (error) {
    console.error("Error:", error);
  }
}

// Run the main function and catch any errors
main().catch((error) => {
  console.error(error);
  process.exit(1);
});

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.12;
import "./IERC20.sol";

contract AccountFactory {
    event LogDeployed(address addr, uint256 salt);

    address public immutable allowedToDrain;
	constructor(address allowed) {
		allowedToDrain = allowed;
	}

	function deploy(bytes calldata code, uint256 salt) external returns(address){
		return deploySafe(code, salt);
	}

	function withdrawToken(IERC20 token, address to, uint256 tokenAmount) external {
		require(msg.sender == allowedToDrain, 'ONLY_AUTHORIZED');
		token.transfer(to, tokenAmount);
	}

	// no need to have this function because it don't have any receive function
	// function withdrawETH(address payable to, uint256 amount) external {
	// 	require(msg.sender == allowedToDrain, 'ONLY_AUTHORIZED');
	// 	to.transfer(amount);
	// }

	function deployAndCall(bytes calldata code, uint256 salt, address callee, bytes calldata data) external {
		deploySafe(code, salt);
		require(data.length > 4, 'DATA_LEN');
		bytes4 method;
		// solium-disable-next-line security/no-inline-assembly
		assembly {
			// can also do shl(224, shr(224, calldataload(0)))
			method := and(calldataload(data.offset), 0xffffffff00000000000000000000000000000000000000000000000000000000)
		}
		require(
			method == 0x6171d1c9 // execute((address,uint256,bytes)[],bytes)
			|| method == 0x534255ff // send(address,(uint256,address,address),(bool,bytes,bytes),(address,uint256,bytes)[])
			|| method == 0x4b776c6d // sendTransfer(address,(uint256,address,address),(bytes,bytes),(address,address,uint256,uint256))
			|| method == 0x63486689 // sendTxns(address,(uint256,address,address),(bytes,bytes),(string,address,uint256,bytes)[])
		, 'INVALID_METHOD');

		assembly {
			let dataPtr := mload(0x40)
			calldatacopy(dataPtr, data.offset, data.length)
			let result := call(gas(), callee, 0, dataPtr, data.length, 0, 0)

			switch result case 0 {
				let size := returndatasize()
				let ptr := mload(0x40)
				returndatacopy(ptr, 0, size)
				revert(ptr, size)
			}
			default {}
		}
	}

    function deploySafe(bytes memory code, uint256 salt) internal returns (address) {
		address expectedAddr = address(uint160(uint256(
			keccak256(abi.encodePacked(bytes1(0xff), address(this), salt, keccak256(code)))
		)));
		uint size;
		assembly { size := extcodesize(expectedAddr) }
		// If there is code at that address, we can assume it's the one we were about to deploy,
		// because of how CREATE2 and keccak256 works
		if (size == 0) {
			address addr;
			assembly { addr := create2(0, add(code, 0x20), mload(code), salt) }
			require(addr != address(0), 'FAILED_DEPLOYING');
			require(addr == expectedAddr, 'FAILED_MATCH');
			emit LogDeployed(addr, salt);
		}
		return expectedAddr;
	}

	function estimatedAddress(bytes memory code, uint256 salt) external view returns(address) {
		address expectedAddr = address(uint160(uint256(
			keccak256(abi.encodePacked(bytes1(0xff), address(this), salt, keccak256(code)))
		)));

		return expectedAddr;
	}

}
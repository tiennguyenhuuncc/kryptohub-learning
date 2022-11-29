// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.4.18;

contract Greetings {
    string message;

    constructor(){
        message = "I am ready!";
    }

    function setGreetings(string calldata _message) public {
        message = _message;
    }

    function getGreetings() public view returns (string memory) {
        return message;
    }
    
}


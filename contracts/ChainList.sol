// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.4.18;

contract ChainList{
    //state variables

    address seller;
    string name;
    string description;
    uint256 price;

    constructor(){
        //seller = msg.sender;
        // name = 'Default article';
        // description = 'Default description of article';
        // price = 2000000000000000000;
        
        name = '';        
        price = 0;
    }

    //event
    event LogSellArticle(
        address indexed _seller,
        string _name,
        uint256 _price

    );

    event DCM(string msg);

    function sellArticle(string calldata _name, string calldata _description, uint256 _price) public{
        seller = msg.sender;
        name = _name;
        description = _description;
        price = _price;

        //emit DCM(_name);
        emit LogSellArticle(seller, name, price);
    }

    function getArticle() public view returns (
        address _seller,
        string  memory _name,
        string memory _description,
        uint256 _price
    ){        
        return (seller, name, description, price);
    }
}
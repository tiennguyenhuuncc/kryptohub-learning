const { assert } = require("chai");
// const { web3 } = require("web3");
// const {web3utils} = require("web3-utils");

const ChainList = artifacts.require('./ChainList.sol');

//test suite
contract('ChainList', function(accounts){
    it('should be initialized with empty values', function(){
        return ChainList.deployed().then(function(instance){
            return instance.getArticle();
        }).then(function(data){
            //console.log('data[3]=', data[3]);
            assert.equal(data[0], 0x0, 'seller must be empty');
            assert.equal(data[1], '', 'article name must be empty');
            assert.equal(data[2], '', 'article description must be empty');
            assert.equal(data[3].toNumber(), 0, 'article price must be zero');
        })
    })

    const seller = accounts[2];
    const articleName = 'article 1';
    const articleDescription = 'Description of article 1';
    const priceEther = 1;
    const priceWei = priceEther * 1000000000; //web3.utils.toWei(priceEther,'ether');
    let chainListInstance;

    it('should sell an article', function(){
        return ChainList.deployed().then(function(instance){
            chainListInstance = instance;
            return chainListInstance.sellArticle(articleName, articleDescription, priceWei, {from: seller});
        }).then(function(){
            return chainListInstance.getArticle();
        })
        .then(function(data){
            //console.log('data=', data);
            assert.equal(data[0], seller, 'seller must be the last seller ');
            assert.equal(data[1], articleName, 'article name must be the last article');
            assert.equal(data[2], articleDescription, 'article description must be description of the last article');
            assert.equal(data[3].toNumber(), priceWei, 'article price must be the price of the last article');
        })

    });

    it('should trigger an event when an article is sold', function(){
        return ChainList.deployed().then(function(instance){
            chainListInstance = instance;
            return chainListInstance.sellArticle(articleName, articleDescription, priceWei, {from: seller});
        }).then(function(receipt){
            //console.log(receipt);
            assert.equal(receipt.logs.length, 1, 'one event should have been trigged');
            assert.equal(receipt.logs[0].event, 'LogSellArticle', 'event should be LogSellArticle');
            assert.equal(receipt.logs[0].args._seller, seller, 'event seller should be ' + seller);
            assert.equal(receipt.logs[0].args._name, articleName, 'event article name should be ' + articleName);
            assert.equal(receipt.logs[0].args._price, priceWei, 'event article price should be ' + priceWei + ' wei');
        })
    });

});

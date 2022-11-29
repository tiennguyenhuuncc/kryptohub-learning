App = {
  web3Provider: null,
  contracts: {
    ChainList: null
  },
  accounts: 0x0,
  account: 0x0,
  abi: [
    {
      "inputs": [],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "string",
          "name": "msg",
          "type": "string"
        }
      ],
      "name": "DCM",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "_seller",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "_name",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "_price",
          "type": "uint256"
        }
      ],
      "name": "LogSellArticle",
      "type": "event"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "_name",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "_description",
          "type": "string"
        },
        {
          "internalType": "uint256",
          "name": "_price",
          "type": "uint256"
        }
      ],
      "name": "sellArticle",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getArticle",
      "outputs": [
        {
          "internalType": "address",
          "name": "_seller",
          "type": "address"
        },
        {
          "internalType": "string",
          "name": "_name",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "_description",
          "type": "string"
        },
        {
          "internalType": "uint256",
          "name": "_price",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    }
  ],

  init: function() {
    // load articlesRow
    // var articlesRow = $('#articlesRow');
    // var articleTemplate = $('#articleTemplate');

    // articleTemplate.find('.panel-title').text('article 1');
    // articleTemplate.find('.article-description').text('Desription for article 1');
    // articleTemplate.find('.article-price').text("10.23");
    // articleTemplate.find('.article-seller').text("0x1234567890123456890");

    // articlesRow.append(articleTemplate.html());
    // articlesRow.append(articleTemplate.html());

    return App.initWeb3();
  },

  
  initWeb3: function() {

    console.log('initWeb3');
    if (typeof web3 !== 'undefined'){
      App.web3Provider = web3.currentProvider;
    }else{
      App.web3Provider = new Web3.providers.HttpProvider('http://127.0.0.1:7545')
    }

    web3 = new Web3(App.web3Provider);
    App.displayAccountInfo();

    var Contract = web3.eth.Contract;

    // set provider for all later instances to use
    Contract.setProvider(App.web3Provider);

    var contract = new Contract(App.abi, '0x6Ec45803753B194d9e4aB05d88A7E3544C12bD5A');
    contract.events.LogSellArticle({fromBlock:0})
    .on('data', data => console.log('data', data))
    .on('changed', changed => console.log('changed',changed));    
    
  },

  displayAccountInfo: async function() {
    App.accounts = await web3.eth.getAccounts();
    console.log('displayAccountInfo', App.accounts);

    web3.eth.getCoinbase(function(err, account){
      if (err == null){
        App.account = account;
        $('#account').text(account);
        web3.eth.getBalance(account, function(err, balance){
          if(err == null){
            $('#accountBalance').text(web3.utils.fromWei(balance, 'ether') + ' ETH');
          }

        });
      }
    });
  },

  initContract: function() {
    $.getJSON('../build/contracts/ChainList.json', function(chainListArtifact){
      App.contracts.ChainList = TruffleContract(chainListArtifact);
      App.contracts.ChainList.setProvider(App.web3Provider);
      App.listenToEvents();
      return App.reloadArticles();

    });
  },

  reloadArticles: function() {
    App.displayAccountInfo();
    $('#articlesRow').empty();

    App.contracts.ChainList.deployed().then(function(instance){
      return instance.getArticle();
    }).then(function(data){

      if(data[0] == 0x0){
        //no article
        return;
      } 

      let seller = data[0] == App.account ? 'You' : data[0];
      let priceEther = web3.fromWei(data[3], 'ether') + ' ETH';

      let articleTemplate = $('#articleTemplate');

      articleTemplate.find('.panel-title').text(data[1]);
      articleTemplate.find('.article-description').text(data[2]);
      articleTemplate.find('.article-price').text(priceEther);
      articleTemplate.find('.article-seller').text(seller);

      $('#articlesRow').append(articleTemplate.html());

    }).catch(function(err){
      console.error(err);
    });

  },

  sellArticle: function() {
    let articleName = $('#article_name').val();
    let articleDescription = $('#article_description').val();
    let articlePrice = $('#article_price').val();

    let priceWei = web3.utils.toWei(articlePrice, 'ether');

    if (articleName.trim() == '' || priceWei == 0){
      return false;
    }

    var Contract = web3.eth.Contract;
    Contract.setProvider(App.web3Provider);
    var contract = new Contract(App.abi, '0x6Ec45803753B194d9e4aB05d88A7E3544C12bD5A');
    contract.methods.sellArticle(articleName, articleDescription, priceWei)
    .send({from: App.account, gas:500000})
    .then(msg => console.log('sellArticle', msg))

    // App.contracts.ChainList.deployed().then(function(instance){
    //   return instance.sellArticle(articleName, articleDescription, priceWei, 
    //     {
    //       from: App.account, 
    //       gas: 500000
    //     });      
    // }).then(function(result){
    //   App.reloadArticles();
    // }).catch(function(err){
    //   console.error(err);
    // });
  },

  
  listenToEvents: function() {
    App.contracts.ChainList.deployed().then(function(instance){
      //App.reloadArticles();
      console.log('LogSellArticle');

      const sellEvent = instance.LogSellArticle({fromBlock: 0});
      
      sellEvent && sellEvent.on('data', event => console.log(event))
      .on('changed', changed => console.log(changed))
      .on('error', err => console.log(err))
      .on('connected', str => console.log(str));

      // const sellEvent = instance.LogSellArticle({fromBlock: 0, toBlock: 'latest'}, {})
      // instance.getPastEvents('LogSellArticle', {fromBlock: 0, toBlock: 'latest'})
      // .then(events => {
      //   console.log(events);
      //   events && events.length > 0 && events.map(event => {
      //     $('#events').append('<li class="list-group-item" >' + event.args[2].toString() + '</li>');
      //   })
      // })
      // .catch(err => console.log('err',  err));
      //console.log('LogSellArticle');
      //App.reloadArticles();
    });
    
  },



};

$(function() {
  $(window).load(function() {
    App.init();
  });
});



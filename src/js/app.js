
App = {
  web3Provider: null,
  contracts: {},
  account: '0x0',
  hasVoted: false,

  init: async function() {
    return await App.initWeb3();
  },

  initWeb3: async function() {

    if (window.ethereum) {
      App.web3Provider = window.ethereum;
      await window.ethereum.enable();
      web3 = new Web3(App.web3Provider);
      return App.initContract();
    }
    else {
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
      web3 = new Web3(App.web3Provider);
      return App.initContract();
    }
  },

  initContract: function() {
    $.getJSON("Election.json", function(election) {
      // Instantiate a new truffle contract from the artifact
      App.contracts.Election = TruffleContract(election);
      // Connect provider to interact with contract
      App.contracts.Election.setProvider(App.web3Provider);
      App.listenForEvents();
      return App.render();
    });
  },

  // Listen for events emitted from the contract
  listenForEvents: function() {
    App.contracts.Election.deployed().then(function(instance) {
      // Restart Chrome if you are unable to receive this event
      // This is a known issue with Metamask
      // https://github.com/MetaMask/metamask-extension/issues/2393
      instance.votedEvent({}, {
        fromBlock: 0,
        toBlock: 'latest'
      }).watch(function(error, event) {
        console.log("event triggered", event)
        // Reload when a new vote is recorded
        App.render();
      });
    });
  },
render: function() {
var electionInstance;
var loader = $("#loader");
var content = $("#content");

loader.show();
content.hide();

// loader.hide();
// content.show();

// Load account data
web3.eth.getCoinbase(function(err, account) {
  if (err === null) {
    App.account = account;
    $("#accountAddress").html("Your Account: " + account);
  }
});

// Load contract data
App.contracts.Election.deployed().then(function(instance) {
  electionInstance = instance;
  return electionInstance.candidatesCount();
}).then(function(candidatesCount) {
  var candArray = [];
  for (var i = 1; i <= candidatesCount; i++) {
    candArray.push(electionInstance.candidates(i));
  }
  Promise.all(candArray).then(function(values) {
      var candidatesResults = $("#candidatesResults");
      candidatesResults.empty();

      var rank1 = $('#rank1');
      rank1.empty();

      var rank2 = $('#rank2');
      rank2.empty();

      var rank3 = $('#rank3');
      rank3.empty();

      var rank4 = $('#rank4');
      rank4.empty();

    for (var i = 0; i < candidatesCount; i++) {
      var id = values[i][0];
      var name = values[i][1];
      var countRank1 = values[i][2];
      var countRank2 = values[i][3];
      var countRank3 = values[i][4];
      var countRank4 = values[i][5];

      // Render candidate Result
      var candidateTemplate = "<tr><th>" + id + "</th><td>" + name + "</td><td>" + countRank1 + "</td><td>"  + countRank2 + "</td><td>" + countRank3 + "</td><td>"+ countRank4 + "</td></tr>"
      candidatesResults.append(candidateTemplate);

      // Render candidate ballot option
      var candidateOption = "<option value='" + id + "' >" + name + "</ option>"
      rank1.append(candidateOption);
      rank2.append(candidateOption);
      rank3.append(candidateOption);
      rank4.append(candidateOption);
    }
  });
  return electionInstance.voters(App.account);
}).then(function(hasVoted) {
  // Do not allow a user to vote
  if(hasVoted) {
    $('form').hide();
  }
  loader.hide();
  content.show();
}).catch(function(error) {
  console.warn(error);
});
  },

  castVote: function() {
    var rank1 = $('#rank1').val();
    var rank2 = $('#rank2').val();
    var rank3 = $('#rank3').val();
    var rank4 = $('#rank4').val();

    App.contracts.Election.deployed().then(function(instance) {
      return instance.vote(rank1,rank2,rank3,rank4, { from: App.account });
    }).then(function(result) {
      // Wait for votes to update
      $("#content").hide();
      $("#loader").show();
    }).catch(function(err) {
      console.error(err);
    });
  }
};

$(function() {
  $(window).load(function() {
    App.init();
  });
});

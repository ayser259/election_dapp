
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

      var candidatesSelect = $('#candidatesSelect');
      candidatesSelect.empty();
    for (var i = 0; i < candidatesCount; i++) {
      var id = values[i][0];
      var name = values[i][1];
      var count_rank_1 = values[i][2];
      var count_rank_2 = values[i][3];
      var count_rank_3 = values[i][4];
      var count_rank_4 = values[i][5];

      // Render candidate Result
      var candidateTemplate = "<tr><th>" + id + "</th><td>" + name + "</td><td>" + count_rank_1 + "</td></tr>"+ count_rank_2 + "</td></tr>"+ count_rank_3 + "</td></tr>"+ count_rank_4 + "</td></tr>"

      candidatesResults.append(candidateTemplate);

      // Render candidate ballot option
      var candidateOption1 = "<option value='" + id + "' >" + name + "</ option>"
      var candidateOption2 = "<option value='" + id + "' >" + name + "</ option>"
      var candidateOption3 = "<option value='" + id + "' >" + name + "</ option>"
      var candidateOption4 = "<option value='" + id + "' >" + name + "</ option>"
      candidatesSelect.append([candidateOption1,candidateOption2,candidateOption3,candidateOption4]);
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
    var candidateId = $('#candidatesSelect').val();
    App.contracts.Election.deployed().then(function(instance) {
      return instance.vote(candidateId, { from: App.account });
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

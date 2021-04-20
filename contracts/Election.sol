pragma solidity ^0.5.0;

contract Election {
    // Model a Candidate
    struct Candidate {
        uint id;
        string name;
        uint countRank1;
        uint countRank2;
        uint countRank3;
        uint countRank4;
    }

    // Store accounts that have voted
    mapping(address => bool) public voters;
    // Store Candidates
    // Fetch Candidate
    mapping(uint => Candidate) public candidates;
    // Store Candidates Count
    uint public candidatesCount;

    // voted event
    event votedEvent (
        uint indexed _candidateId
    );


    function addCandidate (string memory _name) private {
        candidatesCount ++;
        candidates[candidatesCount] = Candidate(candidatesCount, _name,0,0,0,0);
    }

    function vote (uint _rank1,uint _rank2,uint _rank3,uint _rank4) public {
        // require that they haven't voted before
        require(!voters[msg.sender]);

        // record that voter has voted
        voters[msg.sender] = true;

        // update candidate vote Count
        candidates[_rank1].countRank1 ++;
        candidates[_rank2].countRank2 ++;
        candidates[_rank3].countRank3 ++;
        candidates[_rank4].countRank4 ++;

        // trigger voted event
        emit votedEvent(_rank1);
    }
    constructor () public {
        addCandidate("Candidate 1");
        addCandidate("Candidate 2");
        addCandidate("Candidate 3");
        addCandidate("Candidate 4");
    }
}

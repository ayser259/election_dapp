pragma solidity >=0.4.22 <0.8.0;

contract Election {

    struct Candidate {
      uint id;
      string name;
      uint count_rank_1;
      uint count_rank_2;
      uint count_rank_3;
      uint count_rank_4;
    }

    mapping(uint => Candidate) public candidates;

    uint public candidate_count;

    constructor () public {
      add_candidate("Candidate 1");
      add_candidate("Candidate 2");
      add_candidate("Candidate 3");
      add_candidate("Candidate 4");


    }

    function add_candidate(string memory _name) private{
      candidate_count ++;
      candidates[candidate_count] = Candidate(candidate_count,_name,0,0,0,0);
    }

}

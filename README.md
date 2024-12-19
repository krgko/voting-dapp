# Voting Dapp

Thanks to <https://medium.com/@flavtech/how-to-easily-call-smart-contracts-using-ethers-nextjs-dd3dabd43c07> for the react ideas.

## Dev

Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

## Smart Contract

We will use <https://remix.ethereum.org/> for development and testing.

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

contract Voting {
    // Candidate model
    struct Candidate {
        uint256 id;
        string name;
        uint256 voteCount;
    }

    // Store account voted
    mapping(address => bool) public voters;
    // Store candidate and fetch
    mapping(uint256 => Candidate) public candidates;
    // Store candidates count
    uint256 public candidatesCount;
    address public owner;

    string public voteTopic;

    // Indexed is for logged events will allow to search for events using indexed parameter as fileter
    event votedEvent(uint256 indexed _candidateId);

    // Constructor
    constructor(string memory voteTopic_, string[] memory names_) {
        voteTopic = voteTopic_;
        owner = msg.sender;
        // for loop candidates to be created
        for (uint8 i = 0; i < names_.length; i++) {
            addCandidate(names_[i]);
        }
    }

    modifier onlyOwner(address caller) {
        require(msg.sender == owner, "only owner");
        _;
    }

    // Add candidate, anyone outside the contract cannot add candidate
    function addCandidate(string memory name) private onlyOwner(msg.sender) {
        // add counter to the mapping
        candidatesCount++;
        candidates[candidatesCount] = Candidate(candidatesCount, name, 0);
    }

    // Update candidate's vote count
    function vote(uint256 candidateId) public {
        require(
            candidateId <= candidatesCount && candidateId > 0,
            "candidate id is not valid"
        );
        require(msg.sender != owner, "owner cannot vote");
        require(!voters[msg.sender], "voter has voted already");

        voters[msg.sender] = true;
        candidates[candidateId].voteCount++;

        // trigger voted event
        emit votedEvent(candidateId);
    }
}
```

### Get ABI

Go to tab "Solidity Compiler" > See ABI button then click to download

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

Deployed on Sepolia: [0x6BF1f574417F8f2f0b9ca2a09012CB5a8378302c](https://sepolia.etherscan.io/tx/0xfffefec32ce2bb2548bbab5e02926e22d329143587a6bef3188260ef5ffc18bb)

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

// @title Voting contract
// @notice A simple demo of voting.
contract Voting {
    // Candidate model
    struct Candidate {
        uint256 id;
        string name;
        uint256 voteCount;
    }

    // Store account voted. To prevent double vote casting.
    mapping(address => bool) public voters;
    // Store candidate and fetch.
    mapping(uint256 => Candidate) public candidates;

    // The public states are accessible via inquiring.
    // Store candidates count
    uint256 public candidatesCount;
    address public owner;
    string public voteTopic;

    // indexed is for logged events will allow to search for events using indexed parameter as fileter
    event votedEvent(uint256 indexed _candidateId);

    // @notice A constructor of the contract, indicate the initial vaules of the contract
    // @param voteTopic_ A vote topic of this contract as a long string. As the length is not restricted
    // the length should not be long to save the gas fee.
    // @param candidate_ A candidate of the vote topic, accept a short value. If the value is large
    // it may lead to deployment failure.
    constructor(string memory voteTopic_, string[] memory candidate_) {
        voteTopic = voteTopic_;
        owner = msg.sender;
        // for loop candidates to be created
        for (uint8 i = 0; i < candidate_.length; i++) {
            addCandidate(candidate_[i]);
        }
    }

    // @dev Accept only owner for the call.
    modifier onlyOwner(address caller) {
        require(msg.sender == owner, "only owner");
        _;
    }

    // @notice Add a candidate
    // @param candidate A candidate of the vote topic
    function addCandidate(string memory candidate)
        public
        onlyOwner(msg.sender)
    {
        // Add counter to the mapping
        candidatesCount++;
        candidates[candidatesCount] = Candidate(candidatesCount, candidate, 0);
    }

    // @notice Add a vote count by candidate ID
    // @dev Update candidate's vote count
    // @param candidate ID A candidate ID to vote.
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

// "How would you rate your experience with blockchain technology"
// ["Beginner","Novice","Intermediate","Advanced","Expert"]
```

### Get ABI

Go to tab "Solidity Compiler" > See ABI button then click to download

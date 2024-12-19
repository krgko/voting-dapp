"use client";

import { ChevronDoubleRightIcon } from "@heroicons/react/16/solid";
import { Contract } from "ethers";
import { useEffect, useState } from "react";
import { IWeb3Context, useWeb3Context } from "../context/Web3Context";
import ABI from "../abis/Voting.json";
import { isEthAddress } from "./utils";

interface Choice {
  id: number;
  name: string | "";
  count: number;
}

interface Voting {
  contract: string | null;
  topic: string | "";
  choices: Choice[];
}

export default function Home() {
  const {
    connectWallet,
    disconnect,
    state: { isAuthenticated, address, currentChain, signer },
  } = useWeb3Context() as IWeb3Context;

  const [contractAddress, setContractAddress] = useState("");

  const [vote, setVote] = useState<Voting>({
    contract: "",
    topic: "",
    choices: [],
  });

  // set input value
  const handleInput = (event: { target: { value: string } }) => {
    setContractAddress(event.target.value);
  };

  const handleContract = () => {
    setVote({ ...vote, contract: contractAddress });
    handleLoad();
  };

  const handleLoad = () => {
    if (!isEthAddress(contractAddress)) {
      return;
    }

    localStorage.setItem("contract", contractAddress);

    const votingContract = new Contract(contractAddress, ABI, signer);

    // Get topic and choices from the given contract
    const getTopicAndChoices = async () => {
      const candidates = [];
      let topic = "";

      try {
        // Call the voting contract for vote topic
        topic = await votingContract.voteTopic();
        // Call the voting contract for candidates count
        const count = await votingContract.candidatesCount();
        for (let i = 0; i < count; i++) {
          // Call the voting contract for candidates by id
          const candidate = await votingContract.candidates(i);
          candidates.push({
            id: candidate[0],
            name: candidate[1],
            count: candidate[2],
          });
        }
      } catch (err) {
        alert(err);
      }
      setVote({ ...vote, choices: candidates, topic });
    };

    // Trigger the functions
    getTopicAndChoices();
  };

  useEffect(() => {
    if (localStorage.hasOwnProperty("contract")) {
      const contract = localStorage.getItem("contract");
      setContractAddress(contract || "");
    }
  }, []);

  const handleSubmit = (id: number) => {
    if (!isEthAddress(contractAddress)) {
      return;
    }

    const vote = async (id: number) => {
      try {
        const votingContract = new Contract(contractAddress, ABI, signer);
        const transaction = await votingContract.vote(Number(id));

        await transaction.wait();
        alert("Click the address button to refresh.");
      } catch (err) {
        alert(err);
      }
    };

    vote(id);
  };

  return (
    <div className="bg-white">
      <header className="absolute inset-x-0 top-0 z-50">
        <nav
          aria-label="Global"
          className="flex items-center justify-between p-6 lg:px-8"
        >
          <div className="hidden lg:flex lg:flex-1 lg:justify-end cursor-pointer">
            {!isAuthenticated ? (
              <a
                onClick={connectWallet}
                className="text-sm/6 font-semibold text-gray-900"
              >
                Connect with MetaMask
              </a>
            ) : (
              <a
                onClick={disconnect}
                className="text-sm/6 font-semibold text-gray-900"
              >
                Disconnect ({address?.replace(address.substring(7, 35), "....")}{" "}
                on chain {currentChain})
              </a>
            )}
          </div>
        </nav>
      </header>

      <div className="mx-auto max-w-md py-8 sm:py-12 lg:py-14">
        <div className="flex max-w-xl items-center rounded-full bg-white pl-3 outline outline-1 -outline-offset-1 outline-gray-300 has-[input:focus-within]:outline has-[input:focus-within]:outline-2 has-[input:focus-within]:-outline-offset-2 has-[input:focus-within]:outline-emerald-600">
          <input
            type="text"
            name="contract"
            id="contract"
            className="block min-w-0 grow py-1.5 pl-1 pr-3 text-base text-gray-900 placeholder:text-gray-400 focus:outline focus:outline-0 sm:text-sm/6"
            placeholder="0x0000000000000000000000000000000000000000"
            onChange={handleInput}
          />
          <div className="grid shrink-0 grid-cols-1 focus-within:relative">
            <ChevronDoubleRightIcon
              aria-hidden="true"
              className="cursor-pointer col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-gray-500 sm:size-4"
              onClick={handleContract}
            />
          </div>
        </div>

        <div className="mx-auto max-w-2xl py-16 sm:py-24 lg:py-28">
          <div className="hidden sm:mb-8 sm:flex sm:justify-center">
            <div className="relative rounded-full px-3 py-1 text-sm/6 text-gray-600 ring-1 ring-gray-900/10 hover:ring-gray-900/20 cursor-pointer">
              Address:{" "}
              <a
                className="font-semibold text-emerald-600"
                onClick={handleLoad}
              >
                <span aria-hidden="true" className="absolute inset-0" />
                {contractAddress}
              </a>
            </div>
          </div>
          <div className="text-center">
            <h1 className="text-balance text-5xl font-semibold tracking-tight text-gray-900 sm:text-6xl">
              {vote.topic}
            </h1>
            <p className="mt-8 text-pretty text-lg font-medium text-gray-500 sm:text-xl/8">
              {vote.topic !== ""
                ? "Vote on a choice you like."
                : "Click the address button or input the contract address to load the voting topic."}
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <div className="bg-white py-16 sm:py-16">
                <dl className="grid grid-cols-2 gap-x-8 gap-y-16 text-center lg:grid-cols-2">
                  {vote.choices.map((choice) => (
                    <div
                      key={choice.id}
                      onClick={() => handleSubmit(choice.id)}
                      className="cursor-pointer"
                    >
                      <div className="group block w-30 h-30 mx-auto rounded-lg p-6 bg-white ring-1 ring-slate-900/5 shadow-lg space-y-3 hover:bg-emerald-500 hover:ring-emerald-500">
                        <div className="flex flex-col items-center space-y-3">
                          <h3 className="text-slate-900 group-hover:text-white text-3xl font-bold text-center">
                            {choice.name}
                          </h3>
                        </div>
                        <p className="text-slate-500 group-hover:text-white text-sm text-center">
                          {"Count: "}
                          {choice.count}
                        </p>
                      </div>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { createContext, useEffect, useState } from "react";
import Router from "next/router";
import FormdataProps from "../interfaces/formdata";
import GovernanceProps from "../interfaces/governance";
import ProposalData from "../interfaces/proposalData";
import { ethers } from "ethers";
import Swal from "sweetalert2";
import deployedContracts from "~~/contracts/deployedContracts";

const ABI = deployedContracts[11155111].DAO.abi;
const ADDRESS = deployedContracts[11155111].DAO.address;

export const GOVERNANCE_CONTEXT = createContext<GovernanceProps | undefined>(undefined);

let connect: any;
if (typeof window !== "undefined") {
  connect = (window as any).ethereum;
}

const GovernmentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // states variables
  const [account, setAccount] = useState<string>();
  const [deployer, setDeployer] = useState<string>();
  const [amount, setAmount] = useState<string>();
  const [disability, setDisability] = useState(false);
  const [totalBalance, setTotalBalance] = useState<number>(0);
  const [stakeholderBalance, setStakeholderBalance] = useState<number>(0);
  const [contributorBalance, setContributorBalance] = useState<number>(0);
  const [stakeholderStatus, setStakeholderStatus] = useState(false);
  const [contributorStatus, setContributorStatus] = useState(false);
  const [proposalsData, setProposalsData] = useState<ProposalData[]>();
  const [formData, setFormData] = useState<FormdataProps>({
    title: "",
    description: "",
    beneficiary: "",
    amount: "",
  });

  // wallet connection
  const connectWallet: GovernanceProps["connectWallet"] = async function () {
    try {
      if (connect) {
        const connector = await connect.request({ method: "eth_requestAccounts" });
        setAccount(connector[0]);
        Router.push("/");
      }
    } catch (error) {
      console.log(error);
    }
  };

  // retrieve contract deployer
  const getDeployer: GovernanceProps["getDeployer"] = async () => {
    try {
      const provider = new ethers.BrowserProvider(connect).provider;
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(ADDRESS, ABI, signer);
      const deployer = await contract.getDeployer();
      setDeployer(deployer);
    } catch (error) {
      console.log(error);
    }
  };

  // contribution functionality
  const contribute: GovernanceProps["contribute"] = async (modalRef: React.RefObject<HTMLElement>) => {
    try {
      if (amount && connect) {
        setDisability(true);
        const provider = new ethers.BrowserProvider(connect).provider;
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(ADDRESS, ABI, signer);
        const parsedAmount = ethers.parseEther(amount);
        const tx = await contract.contribute({ value: parsedAmount });
        await tx.wait(1);
        setDisability(false);
        const modalElement = modalRef.current ? modalRef.current : "";
        if (modalElement instanceof HTMLElement) {
          modalElement.classList.remove("show");
          modalElement.style.display = "none";
        }

        Swal.fire({
          position: "top-end",
          icon: "success",
          text: `You have successfully contributed ${amount} ETH to the DAO`,
          showConfirmButton: true,
          timer: 4000,
        });
      } else {
        setDisability(false);
      }
    } catch (error) {
      console.log(error);
    }
  };

  // retrieve total balance
  const getTotalBalance: GovernanceProps["getTotalBalance"] = async () => {
    try {
      const provider = new ethers.BrowserProvider(connect).provider;
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(ADDRESS, ABI, signer);
      const tx = await contract.getTotalBalance();
      let balance = await tx.toString();
      balance = ethers.formatUnits(balance, "ether");
      setTotalBalance(balance);
    } catch (error) {
      console.log(error);
    }
  };

  // retreive stakeholders balance
  const getStakeholderBalance: GovernanceProps["getStakeholderBalance"] = async () => {
    if (stakeholderStatus) {
      try {
        const provider = new ethers.BrowserProvider(connect).provider;
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(ADDRESS, ABI, signer);
        const tx = await contract.getStakeholdersBalances();
        let balance = await tx.toString();
        balance = ethers.formatUnits(balance, "ether");
        setStakeholderBalance(balance);
      } catch (error) {
        console.log(error);
      }
    }
  };

  // retrieve stakeholders status
  const getStakeholderStatus = async () => {
    try {
      const provider = new ethers.BrowserProvider(connect).provider;
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(ADDRESS, ABI, signer);
      const tx = await contract.stakeholderStatus();
      setStakeholderStatus(tx);
    } catch (error) {
      console.log(error);
    }
  };

  // retrieve contributors balance
  const getContributorBalance: GovernanceProps["getContributorBalance"] = async () => {
    if (contributorStatus) {
      try {
        const provider = new ethers.BrowserProvider(connect).provider;
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(ADDRESS, ABI, signer);
        const tx = await contract.getContributorsBalance();
        let balance = await tx.toString();
        balance = ethers.formatUnits(balance, "ether");
        setContributorBalance(balance);
      } catch (error) {
        console.log(error);
      }
    }
  };

  // retrieve contributors status
  const getContributorStatus: GovernanceProps["getContributorStatus"] = async () => {
    try {
      const provider = new ethers.BrowserProvider(connect).provider;
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(ADDRESS, ABI, signer);
      const tx = await contract.isContributor();
      setContributorStatus(tx);
    } catch (error) {
      console.log(error);
    }
  };

  // proposal
  const propose: GovernanceProps["propose"] = async (modalRef: React.RefObject<HTMLElement>) => {
    if (stakeholderStatus) {
      try {
        setDisability(true);
        const { title, description, beneficiary, amount } = formData;
        const parsedAmount = ethers.parseEther(amount);
        const provider = new ethers.BrowserProvider(connect).provider;
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(ADDRESS, ABI, signer);
        const propose = await contract.createProposal(title, description, beneficiary.trim(), parsedAmount);
        await propose.wait(1);
        setDisability(false);
        const modalElement = modalRef.current ? modalRef.current : "";
        if (modalElement instanceof HTMLElement) {
          modalElement.classList.remove("show");
          modalElement.style.display = "none";
        }
        Swal.fire({
          position: "top-end",
          icon: "success",
          text: `You have made a proposal successfully!`,
          showConfirmButton: true,
          timer: 4000,
        });
      } catch (error) {
        setDisability(false);
        console.log(error);
      }
    }
  };

  // retrieve proposals
  const proposals: GovernanceProps["proposals"] = async () => {
    try {
      const provider = new ethers.BrowserProvider(connect).provider;
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(ADDRESS, ABI, signer);
      const proposals = await contract.getAllProposals();
      const data = await Promise.all(
        await proposals.map((e: any) => {
          const info = {
            id: e.id.toString(),
            title: e.title,
            description: e.description,
            amount: ethers.formatEther(e.amount.toString()),
            beneficiary: e.beneficiary,
            upVote: e.upVote.toString(),
            downVote: e.downVotes.toString(),
            paid: e.paid,
          };

          return info;
        }),
      );

      setProposalsData(data);
    } catch (error) {
      console.log(error);
    }
  };

  // voting functionality
  const voting: GovernanceProps["voting"] = async (proposalId: number, vote: boolean) => {
    try {
      const provider = new ethers.BrowserProvider(connect).provider;
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(ADDRESS, ABI, signer);
      const tx = await contract.performVote(proposalId, vote);
      await tx.wait(1);
    } catch (error: any) {
      if (error.message.includes("Time has already passed")) {
        Swal.fire({
          position: "top-end",
          icon: "warning",
          text: `Sorry, voting time has ended`,
          showConfirmButton: true,
          timer: 4000,
        });
      } else if (error.message.includes("double voting is not allowed")) {
        Swal.fire({
          position: "top-end",
          icon: "warning",
          text: `You have already voted!`,
          showConfirmButton: true,
          timer: 4000,
        });
      } else {
        console.log(error);
      }
    }
  };

  // payment to beneficiary
  const payBeneficiary: GovernanceProps["payBeneficiary"] = async (proposalId: number) => {
    try {
      const provider = new ethers.BrowserProvider(connect).provider;
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(ADDRESS, ABI, signer);
      const tx = await contract.payBeneficiary(proposalId);
      await tx.wait(1);
      Swal.fire({
        position: "top-end",
        icon: "success",
        text: `Payment made successfully!`,
        showConfirmButton: true,
        timer: 4000,
      });
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    connectWallet();
    getDeployer();
  }, [account, deployer]);

  useEffect(() => {
    getContributorStatus();
    getStakeholderStatus();
  }, [getContributorStatus, getStakeholderStatus]);

  useEffect(() => {
    getTotalBalance();
    getStakeholderBalance();
    getContributorBalance();
    proposals();
  }, [getTotalBalance, getStakeholderBalance, getContributorBalance, proposals]);

  return (
    <GOVERNANCE_CONTEXT.Provider
      value={{
        connectWallet,
        getDeployer,
        contribute,
        getTotalBalance,
        getStakeholderBalance,
        getStakeholderStatus,
        getContributorBalance,
        getContributorStatus,
        propose,
        proposals,
        voting,
        payBeneficiary,
        setAmount,
        disability,
        account,
        totalBalance,
        stakeholderBalance,
        contributorBalance,
        contributorStatus,
        stakeholderStatus,
        formData,
        setFormData,
        proposalsData,
        deployer,
      }}
    >
      {children}
    </GOVERNANCE_CONTEXT.Provider>
  );
};

export default GovernmentProvider;

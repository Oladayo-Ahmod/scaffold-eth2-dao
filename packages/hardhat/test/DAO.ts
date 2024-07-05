import { assert } from "chai";
import { ethers } from "hardhat";
import { DAO } from "../typechain-types";

describe("DAO", function () {
  // We define a fixture to reuse the same setup in every test.

  let dao: DAO;
  let stakeholder: any;
  let collaborator: any;
  let beneficiary: any;
  // let beneficiary2 :any

  before(async () => {
    const signers = await ethers.getSigners();
    stakeholder = signers[0];
    collaborator = signers[1];
    beneficiary = signers[2];
    // beneficiary2 = signers[3];

    const DAOFactory = await ethers.getContractFactory("DAO");
    dao = (await DAOFactory.deploy()) as DAO;
    await dao.waitForDeployment();
  });

  describe("stakeholders and contributors", () => {
    it("stakeholder contributes and retrieves balance", async () => {
      const price = ethers.parseEther("0.005");
      await (dao.connect(stakeholder) as DAO).contribute({ value: price });
      const balance = await dao.connect(stakeholder).getStakeholdersBalances();
      assert.equal(balance.toString(), price.toString());
    });

    it("collaborator contributes and retrieves balance", async () => {
      const price = ethers.parseEther("0.001");
      await dao.connect(collaborator).contribute({ value: price });
      const balance = await dao.connect(collaborator).getContributorsBalance();
      assert.equal(balance.toString(), price.toString());
    });

    it("checks stakeholder status", async () => {
      const status = await dao.connect(stakeholder).stakeholderStatus();
      assert.equal(status, true);
    });

    it("checks collaborator status", async () => {
      const status = await dao.connect(collaborator).isContributor();
      assert.equal(status, true);
    });
  });

  describe("proposal and voting", () => {
    it("creates and retrieves proposal", async () => {
      const amount = ethers.parseEther("10");
      await dao.connect(stakeholder).createProposal("title", "desc", beneficiary.address, amount);
      const proposal = await dao.getProposals("0");
      assert.equal(proposal.title, "title");
      assert.equal(proposal.description, "desc");
    });

    it("performs and retrieves upvote", async () => {
      await dao.connect(stakeholder).performVote(0, true);
      const vote = await dao.getProposalVote("0");
      console.log(vote);

      // expect(events.args[7]).to.equal(true)
      // expect(events.args[4]).to.equal(amount)
      // expect(events.args[3]).to.equal(beneficiary.address)
    });
  });
});

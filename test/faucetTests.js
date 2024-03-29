const { loadFixture } = require('@nomicfoundation/hardhat-network-helpers');
const { expect } = require('chai');

describe('Faucet', function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployContractAndSetVariables() {
    const Faucet = await ethers.getContractFactory('Faucet');
    const faucet = await Faucet.deploy();

    const [owner, other] = await ethers.getSigners();

    let withdrawAmount = ethers.utils.parseUnits('0.2', 'ether');
    console.log(withdrawAmount);

    // Check the contract's balance
    const contractBalance = await ethers.provider.getBalance(faucet.address);

    // Convert the balance from Wei to Ether (if needed)
    const contractBalanceInEther = ethers.utils.formatEther(contractBalance);

    // Log or use the contract balance as needed
    console.log('Contract Balance (Wei):', contractBalance.toString());
    console.log('Contract Balance (Ether):', contractBalanceInEther);

    console.log('Signer 1 address: ', owner.address);
    return { faucet, owner, other, withdrawAmount };
  }

  it('should deploy and set the owner correctly', async function () {
    const { faucet, owner } = await loadFixture(deployContractAndSetVariables);

    expect(await faucet.owner()).to.equal(owner.address);
  });

  it('should not allow withdrawal above 0.1 ETH at a time', async function () {
    const { faucet, withdrawAmount } = await loadFixture(deployContractAndSetVariables);

    await expect(faucet.withdraw(withdrawAmount)).to.be.reverted;
  });

  it('should not allow non-owner to call withdrawAll', async function () {
    const { faucet, other } = await loadFixture(deployContractAndSetVariables);

    await expect(faucet.connect(other).withdrawAll()).to.be.reverted;
  });


  it('should return all ether to owner', async function () {
    const { faucet, owner } = await loadFixture(deployContractAndSetVariables);

    // Get the initial contract balance
    const initialContractBalance = await ethers.provider.getBalance(faucet.address);

    // Withdraw all funds to the owner
    await faucet.connect(owner).withdrawAll();

    // Get the final contract balance after withdrawal
    const finalContractBalance = await ethers.provider.getBalance(faucet.address);

    // Expect that the final contract balance is 0
    expect(finalContractBalance).to.equal(0);
  });

});
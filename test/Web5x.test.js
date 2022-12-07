const { expect, should, assert } = require('chai')
const hre = require('hardhat')
const Web3 = require('web3')
const ethers = hre.ethers

describe('WEB5x', function () {
  const web3 = new Web3('http://127.0.0.1:8545')
  const BN = web3.utils.BN

  const TRANSFER_TIMEOUT = 6000
  let WEB5xFactory
  let WEB5x
  let owner, accountOne, accountTwo

  beforeEach(async function () {
    WEB5xFactory = await hre.ethers.getContractFactory('WEB5X')
    ;[owner, accountOne, accountTwo, accountThree, accountFour] = await hre.ethers.getSigners()
    WEB5x = await WEB5xFactory.deploy()

    await WEB5x.approve(accountOne.address, 4450000000000000)
    await WEB5x.approve(accountTwo.address, 4450000000000000)
  })

  describe('Deployment', async function () {
    it('should deploy with correct _tTotal', async function () {
      expect(await WEB5x.balanceOf(owner.address)).to.equal(await WEB5x.totalSupply())
    })
  })

  describe('Token Transfers', function () {
    it('should set transfertimeout', async function () {
      const timeoutSeconds = 60
      await WEB5x.setTransferTimeout(timeoutSeconds)
      expect(await WEB5x.getTransferTimeout()).to.equal(60)
    })

    it('should prevent token transfer/sell before timout is over', async function () {
      await WEB5x.transfer(accountOne.address, 445000000000000)

      expect(
        await WEB5x.connect(accountOne).transfer(
          accountTwo.address,
          22500000000000
        )
      ).to.be.revertedWith('Wait for anti bot lock to elapse')

      setTimeout(async () => {}, TRANSFER_TIMEOUT)

      await WEB5x.connect(accountOne).transfer(
        accountThree.address,
        5000000000
      )
      // after tFee sub
      expect(await WEB5x.balanceOf(accountThree.address)).to.equal(4980000000)
    })
  })

  describe('burn tokens', function() {
    it('owner should burn x number of tokens held by account', async function() {
      await WEB5x.transfer(accountFour.address, 225000000000)
      await WEB5x.connect(owner).burn(accountFour.address, 224100000000)
      expect(await WEB5x.balanceOf(accountFour.address)).to.equal(0)
      console.log(await WEB5x.balanceOf(owner.address))
    })
  })
}).timeout(50000)

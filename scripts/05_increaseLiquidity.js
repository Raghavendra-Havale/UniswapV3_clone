require("dotenv").config();

TETHER_ADDRESS = process.env.TETHER_ADDRESS;
GOLD_BAR_COIN_ADDRESS = process.env.GOLD_BAR_COIN_ADDRESS;
FACTORY_ADDRESS = process.env.FACTORY_ADDRESS;
SWAP_ROUTER_ADDRESS = process.env.SWAP_ROUTER_ADDRESS;
NFT_DESCRIPTOR_ADDRESS = process.env.NFT_DESCRIPTOR_ADDRESS;
POSITION_DESCRIPTOR_ADDRESS = process.env.POSITION_DESCRIPTOR_ADDRESS;
POSITION_MANAGER_ADDRESS = process.env.POSITION_MANAGER_ADDRESS;
TETHER_GOLD_BAR_COIN_3000 = process.env.TETHER_GOLD_BAR_COIN_3000;
const ownerPrivateKey = PRIVATE_KEY;
const signer2Privatekey = PRIVATE_KEY;
const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
const owner = new ethers.Wallet(ownerPrivateKey, provider);
const signer2 = new ethers.Wallet(ownerPrivateKey, provider);
const artifacts = {
  NonfungiblePositionManager: require("@uniswap/v3-periphery/artifacts/contracts/NonfungiblePositionManager.sol/NonfungiblePositionManager.json"),
  GOLD_BAR_COIN: require("../artifacts/contracts/GoldBarCoin.sol/GoldBarCoin.json"),
  TETHER: require("../artifacts/contracts/Tether.sol/Tether.json"),
  UniswapV3Pool: require("@uniswap/v3-core/artifacts/contracts/UniswapV3Pool.sol/UniswapV3Pool.json"),
};

const { Contract } = require("ethers");
const { Token } = require("@uniswap/sdk-core");
const { Pool, Position, nearestUsableTick } = require("@uniswap/v3-sdk");

async function increaseLiquidity() {
  const deadline = Math.floor(Date.now() / 1000) + 60 * 10;
  const amount0 = ethers.utils.parseUnits("10", 18); // Amount of token0 desired (in Wei)
  const amount1 = ethers.utils.parseUnits("10", 18);

  const nonfungiblePositionManager = new Contract(
    POSITION_MANAGER_ADDRESS,
    artifacts.NonfungiblePositionManager.abi,
    provider
  );
  const poolContract = new Contract(
    TETHER_GOLD_BAR_COIN_3000,
    artifacts.UniswapV3Pool.abi,
    provider
  );
  const tether = new Contract(TETHER_ADDRESS, artifacts.TETHER.abi, provider);
  const goldBarCoin = new Contract(
    GOLD_BAR_COIN_ADDRESS,
    artifacts.GOLD_BAR_COIN.abi,
    provider
  );

  await tether
    .connect(signer2)
    .approve(
      nonfungiblePositionManager.address,
      ethers.utils.parseEther("1000000")
    );
  await goldBarCoin
    .connect(signer2)
    .approve(
      nonfungiblePositionManager.address,
      ethers.utils.parseEther("1000000")
    );
  // Call the increaseLiquidity function
  const liquiditytx = await nonfungiblePositionManager
    .connect(signer2)
    .increaseLiquidity(
      {
        tokenId: process.env.tokenId,
        amount0Desired: amount0.toString(),
        amount1Desired: amount1.toString(),
        amount0Min: 0,
        amount1Min: 0,
        deadline: deadline,
      },
      { gasLimit: "1000000" }
    );
  await liquiditytx.wait();
  console.log(await poolContract.liquidity());
  console.log("Liquidity increased successfully!");
}

async function main() {
  await increaseLiquidity();
}

/*
  npx hardhat run --network localhost scripts/05_increaseLiquidity.js
*/

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

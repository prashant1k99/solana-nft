import { createNft, fetchDigitalAsset, mplTokenMetadata } from "@metaplex-foundation/mpl-token-metadata";
import { airdropIfRequired, getExplorerLink, getKeypairFromFile } from "@solana-developers/helpers";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { generateSigner, keypairIdentity, percentAmount, publicKey } from "@metaplex-foundation/umi";
import { clusterApiUrl, Connection, LAMPORTS_PER_SOL } from "@solana/web3.js";

const conn = new Connection(clusterApiUrl("devnet"), "confirmed")

const user = await getKeypairFromFile()

// Add some SOL to the account if the wallet is below 0.5 SOL
await airdropIfRequired(conn, user.publicKey, 1 * LAMPORTS_PER_SOL, 0.5 * LAMPORTS_PER_SOL)

console.log("Loaded User;", user.publicKey.toBase58())

// We create our umi instance, as how we talk to metaplex instances
const umi = createUmi(conn.rpcEndpoint)
// We specify which programs we want to use from metaplex-foundation
umi.use(mplTokenMetadata())

// To make umi version of our keypair as umi has it's own format
const umiUser = umi.eddsa.createKeypairFromSecretKey(user.secretKey);
umi.use(keypairIdentity(umiUser))

console.log("Set up Umi isntance for user")

// Collection Address
const collectionAddress = publicKey("81Z9vBnWB9E6Xkf8bgJ8Uj4tisZs1RJFa9QqumnoqUrN")

console.log('Creating NFT...')

const mint = generateSigner(umi);

const transaction = createNft(umi, {
  mint,
  name: 'My First NFT',
  uri: "https://raw.githubusercontent.com/prashant1k99/solana-nft/refs/heads/main/data/sample-nft-offchain-data.json",
  sellerFeeBasisPoints: percentAmount(0),
  collection: {
    key: collectionAddress,
    // When we make the nft for the first time then it sets to false, and later we will sign and verify that it's part of our collection
    verified: false
  }
})

await transaction.sendAndConfirm(umi)

const createdNFT = await fetchDigitalAsset(umi, mint.publicKey)

console.log(
  `🖼️ Created NFT! Address is ${getExplorerLink(
    "address",
    createdNFT.mint.publicKey,
    "devnet"
  )}`
)

// https://explorer.solana.com/address/A8ZXckKSaHfRUco8Z81i8ta2rZbXaaWBr852geoLonbL?cluster=devnet

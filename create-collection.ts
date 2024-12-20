import { createNft, fetchDigitalAsset, mplTokenMetadata } from "@metaplex-foundation/mpl-token-metadata";
import { airdropIfRequired, getExplorerLink, getKeypairFromFile } from "@solana-developers/helpers";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { generateSigner, keypairIdentity, percentAmount } from "@metaplex-foundation/umi";
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

const collectionMint = generateSigner(umi)

console.log("Collection Mint: ", collectionMint)

const transaction = createNft(umi, {
  mint: collectionMint,
  name: "My Collection",
  symbol: "MC",
  // This URI is a JSON file which is directly accessible from anywhere
  // Suggested to use web3 approach for Uploaded instances making sure that it never is deleted
  uri: "https://raw.githubusercontent.com/prashant1k99/solana-nft/refs/heads/main/data/sample-nft-collection-offchain-data.json",
  // To allow artists to make money on secondary sales (Resales | Royalties)
  sellerFeeBasisPoints: percentAmount(0),
  isCollection: true,
})

await transaction.sendAndConfirm(umi);

const createdCollectionNft = await fetchDigitalAsset(
  umi,
  collectionMint.publicKey
)

console.log(
  `Created Collection 📦! Address is ${getExplorerLink(
    "address",
    createdCollectionNft.mint.publicKey,
    "devnet"
  )}`
)
// https://explorer.solana.com/address/81Z9vBnWB9E6Xkf8bgJ8Uj4tisZs1RJFa9QqumnoqUrN?cluster=devnet

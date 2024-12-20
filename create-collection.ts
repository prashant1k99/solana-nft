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

const transaction = createNft(umi, {
  mint: collectionMint,
  name: "My Collection",
  symbol: "MC",
  // This URI is a JSON file which is directly accessible from anywhere
  uri: "https://github.com/prashant1k99",
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


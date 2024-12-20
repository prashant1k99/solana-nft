import { findMetadataPda, mplTokenMetadata, verifyCollectionV1 } from "@metaplex-foundation/mpl-token-metadata";
import { airdropIfRequired, getExplorerLink, getKeypairFromFile } from "@solana-developers/helpers";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { keypairIdentity, publicKey } from "@metaplex-foundation/umi";
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

const collectionAddress = publicKey("81Z9vBnWB9E6Xkf8bgJ8Uj4tisZs1RJFa9QqumnoqUrN")

const nftAddress = publicKey("A8ZXckKSaHfRUco8Z81i8ta2rZbXaaWBr852geoLonbL")

const transaction = verifyCollectionV1(umi, {
  metadata: findMetadataPda(umi, { mint: nftAddress }),
  collectionMint: collectionAddress,
  // That the current users umi address
  authority: umi.identity,
})

await transaction.sendAndConfirm(umi)

console.log(
  `✅ NFT ${nftAddress} verified as member of collection ${collectionAddress}! See Explorer at ${getExplorerLink(
    "address",
    nftAddress,
    "devnet"
  )}`
)


// https://explorer.solana.com/address/A8ZXckKSaHfRUco8Z81i8ta2rZbXaaWBr852geoLonbL?cluster=devnet

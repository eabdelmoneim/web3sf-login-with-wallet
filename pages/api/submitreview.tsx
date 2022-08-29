import { ThirdwebSDK } from "@thirdweb-dev/sdk";
import { NextApiRequest, NextApiResponse } from "next";
import { SecretManagerServiceClient } from "@google-cloud/secret-manager";
import { AddressSchema } from "@thirdweb-dev/sdk/dist/src/schema";
import Airtable from "airtable";

const name = process.env.GOGGLE_SECRET_NAME;

// Instantiates a client
const client = new SecretManagerServiceClient();

async function accessSecretVersion() {
  const [version] = await client.accessSecretVersion({
    name: name,
  });

  // Extract the payload as a string.
  const payload = version.payload?.data?.toString();

  // WARNING: Do not print the secret in a production environment - this
  // snippet is showing how to access the secret material.
  //console.info(`Payload: ${payload}`);

  return payload;
}

async function processReward(address: string, sdk: ThirdwebSDK) {
  // save the wallet address and token to the back-end DB
  var base = await new Airtable({
    apiKey: process.env.AIRTABLE_API_KEY,
  }).base("appITGb7KIppAzFWX");

  var table = base.table("rewards");

  let recordFound = false;

  let status = "";

  // only save new record if wallet isn't already in the DB
  var record = await table
    .select({
      filterByFormula: "{wallet}=" + '"' + address + '"',
    })
    .eachPage(
      function page(records, fetchNextPage) {
        // This function (`page`) will get called for each page of records.
        //console.log("number of records: " + records.length);

        if (records.length > 0) {
          console.log("wallet " + address + " already received reward");
          status = "wallet " + address + " already received reward";
          recordFound = true;
        }

        // record was not found insert the wallet into the DB
        if (!recordFound) {
          // mintTo the address a reward NFT
          const nft = sdk.getEditionDrop(
            process.env.REWARD_SMART_CONTRACT_ADDRESS as string
          );
          const theNft = nft.claimTo(address, 0, 1);
          console.log("successfully sent reward NFT to address: " + address);
          status = "successfully sent reward NFT to address: " + address;
          base("rewards").create(
            {
              wallet: address,
            },
            function (err, record) {
              if (err) {
                console.error(err);
                return;
              }
              console.log(
                "inserted row into rewards DB with ID: " + record?.getId()
              );
            }
          );
        }
      },
      function done(err) {
        if (err) {
          console.error(err);
          status = "error processing " + err;
        }

        console.log("at end: " + status);

        return status;
      }
    );
}

const submitreview = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "POST") {
    return res.status(400).json({
      error: "Invalid method. Only POST supported.",
    });
  }

  const PRIVATE_KEY = await accessSecretVersion();
  if (!PRIVATE_KEY) {
    console.error("Missing PRIVATE_KEY environment variable");
    return res.status(500).json({
      error: "Admin private key not set",
    });
  }

  // Get access token off cookies
  const token = req.cookies.access_token;
  if (!token) {
    res.status(401).json({
      error: "Must provide an access token to authenticate",
    });
  }

  //console.log("have private key: " + PRIVATE_KEY.toString());
  const sdk = ThirdwebSDK.fromPrivateKey(PRIVATE_KEY.toString(), "mumbai");

  try {
    // Authenticate token with the SDK
    const domain = "thirdweb.com";
    const address = await sdk.auth.authenticate(domain, token);

    //process the reward
    var status = await processReward(address, sdk);
    console.log("status: " + status);
    res.status(200).json(
      JSON.stringify({
        address: address,
        message: status,
      })
    );
  } catch (error) {
    res.status(401).json({ error: "submission failed - " + error });
  }
};

export default submitreview;

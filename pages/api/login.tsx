import { ThirdwebSDK } from "@thirdweb-dev/sdk";
import { NextApiRequest, NextApiResponse } from "next";
import { serialize } from "cookie";
import { LoginPayload } from "@thirdweb-dev/sdk/dist/src/schema";
import { SecretManagerServiceClient } from "@google-cloud/secret-manager";
import { Base, Records, Record, Table } from "airtable";
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

async function saveUserToDB(address: string, signature: string) {
  // save the wallet address and token to the back-end DB
  var base = await new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(
    "appITGb7KIppAzFWX"
  );
  var table = base.table("data");

  let recordFound = false;

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
          recordFound = true;
        }

        // record was not found insert the wallet into the DB
        if (!recordFound) {
          base("data").create(
            {
              wallet: address,
              signature: signature,
              poap_reward: false,
            },
            function (err, record) {
              if (err) {
                console.error(err);
                return;
              }
              console.log("inserted row into DB with ID: " + record?.getId());
            }
          );
        }
      },
      function done(err) {
        if (err) {
          console.error(err);
        }
      }
    );
}

const login = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "POST") {
    return res.status(400).json({
      error: "Invalid method. Only POST supported.",
    });
  }

  const PRIVATE_KEY = await accessSecretVersion();
  if (!PRIVATE_KEY) {
    console.error("Missing ADMIN_PRIVATE_KEY environment variable");
    return res.status(500).json({
      error: "Admin private key not set",
    });
  }

  const sdk = ThirdwebSDK.fromPrivateKey(PRIVATE_KEY.toString(), "mumbai");

  // Get signed login payload from the frontend
  const payload = req.body.payload as LoginPayload;
  if (!payload) {
    return res.status(400).json({
      error: "Must provide a login payload to generate a token",
    });
  }

  // Generate an access token with the SDK using the signed payload
  const domain = "thirdweb.com";
  const token = await sdk.auth.generateAuthToken(domain, payload);

  saveUserToDB(payload.payload.address, token.toString());

  // Securely set httpOnly cookie on request to prevent XSS on frontend
  // And set path to / to enable access_token usage on all endpoints
  res.setHeader(
    "Set-Cookie",
    serialize("access_token", token, {
      path: "/",
      httpOnly: true,
      secure: true,
      sameSite: "strict",
    })
  );

  res.status(200).json("Successfully logged in.");
};

export default login;

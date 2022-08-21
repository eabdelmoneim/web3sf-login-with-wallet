import { ThirdwebSDK } from "@thirdweb-dev/sdk";
import { NextApiRequest, NextApiResponse } from "next";
import { SecretManagerServiceClient } from "@google-cloud/secret-manager";

const name = "projects/818686884686/secrets/PRIVATE_KEY/versions/latest";

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

const authenticate = async (req: NextApiRequest, res: NextApiResponse) => {
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

  // Authenticate token with the SDK
  const domain = "thirdweb.com";
  const address = await sdk.auth.authenticate(domain, token);

  res.status(200).json(address);
};

export default authenticate;

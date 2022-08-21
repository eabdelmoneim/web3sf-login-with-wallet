## Login with Wallet Next

Here we implement the login with wallet flow using the [Next.js](https://nextjs.org/) framework.

This application requires setting up an Airtable database with three columns `wallet` | `signature` | `poap_reward` along with associated Airtable API key

In addition the server-side private key of the wallet should be stored in a [google cloud secret manager](https://cloud.google.com/secret-manager/docs/configuring-secret-manager)

## Setup

To run the project, first clone this repository, and then run one of the following commands to install the dependencies:

```bash
npm install
# or
yarn install
```

Next, you need to create a `.env.local` file and add the `GOOGLE_APPLICATION_CREDENTIALS` variable to it which should point to the google service account json file.

You'll also need to add the `AIRTABLE_API_KEY` to the `.env.local`

Finally, you can run the project with one of the following commands:

```bash
npm run dev
# or
yarn dev
```

Now, you can navigate to [http://localhost:3000](http://localhost:3000) to visit the client side page where you can connect a wallet, sign-in with ethereum and view the payload, and use the payload to authenticate with the backend.

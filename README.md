# ProjectFLow
## NFT ASSET Ownership Transfer

NFT Ownership Transfer

Step 1: 

In the background, getMyWalletKey function will run and create a wallet with private and public key.
To get the private and public key, open console in Remix Tab and write:

localstorage.getItem(“CapeGemPk”)      // CapeGemPk is the item id we have set that will give user’s Private Key)

Now , Mint the NFT (provide address and metadata)
In the react, it will encrypt the metadata with the public key of Pvt key above.

Now, only from this browser the Decrypt Metadata function will run as both Private and Public key is stored locally on the browser’s database.So, this browser is acting like a user.

Before transferring the NFT and ownership of metadata to another user, open a new browser (Browser 2) and open the react app. This will again create new wallet in browser’s database with new Private and Public key.  
Open console in Browser 2 and , write localstorage.getItem(“CapeGemPk”). It will give private key of that wallet.
Then write, let user = new _ethers.Wallet(<"Insert Pvt Key">)  . Now write user.publicKey and press enter. It will give Public Key. 

Use this Public Key in browser1 in Transfer function and and execute transfer.

Now in Browser2 (acting as User 2), click Decrypt Metadata . Since Broswer 2 is acting as User 2 having private key of its own it will decrypt(because we had given public key of Browser 2 dusring transfer function).
  







# Sample Hardhat Project

This project demonstrates a basic Hardhat use case. It comes with a sample contract, a test for that contract, and a script that deploys that contract.

Try running some of the following tasks:

```shell
npx hardhat help
npx hardhat test
GAS_REPORT=true npx hardhat test
npx hardhat node
npx hardhat run scripts/deploy.js
```

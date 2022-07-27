import React, { useState, useEffect, useCallback } from 'react';
import { ethers } from "ethers";
import EthCrypto from 'eth-crypto';
import './App.css';
import MyNFT_ABI from "./MyNFT.json"

//0x040fa7f3af0b44d06c9bccd2b1c9cd5501ed6be562c9ea22698f0706c834a194fb0b999d410f29d41ba68610a1531e1f00136aa866d02a1038647ad428e5a81a47

function App() {
    let contractAddress = "0xB5f3d0a7CA35F1D954b2d39D6CD5469c5C240C23"; //rinkeby


    let [blockchainProvider, setBlockchainProvider] = useState(undefined);
    let [metamask, setMetamask] = useState(undefined);
    let [metamaskNetwork, setMetamaskNetwork] = useState(undefined);
    let [metamaskSigner, setMetamaskSigner] = useState(undefined);
    const [networkId, setNetworkId] = useState(undefined);
    const [loggedInAccount, setAccounts] = useState(undefined);
    const [etherBalance, setEtherBalance] = useState(undefined);
    const [isError, setError] = useState(false);

    const [contract, setReadContract] = useState(null);
    const [writeContract, setWriteContract] = useState(null);

    const [tokenInput, setTokenInput] = useState(null);
    const [tokenInput1, setTokenInput1] = useState(null);
    const [tokenInput2, setTokenInput2] = useState(null);
    const [tokenInput3, setTokenInput3] = useState(null);
    const [tokenInput4, setTokenInput4] = useState(null);
    const [tokenInput5, setTokenInput5] = useState(null);
    const [tokenInput6, setTokenInput6] = useState(null);
    const [tokenInput7, setTokenInput7] = useState(null);




    let alertMessage;

    const connect = async () => {

        //############################################################################################//
        //############################### Metamask Integration ###################################//
        //############################################################################################//    

        try {
            let provider, network, metamaskProvider, signer, accounts;

            if (typeof window.ethereum !== 'undefined') {
                // Connect to RPC  
                console.log('loadNetwork')
                try {

                    //console.log("acc", acc); 
                    //window.ethereum.enable();
                    //await handleAccountsChanged();
                    accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                    await handleAccountsChanged(accounts);
                } catch (err) {
                    if (err.code === 4001) {
                        // EIP-1193 userRejectedRequest error
                        // If this happens, the user rejected the connection request.
                        console.log('Please connect to MetaMask.');
                    } else {
                        console.error(err);
                    }
                }
                provider = new ethers.providers.JsonRpcProvider(`https://rinkeby.infura.io/v3/c811f30d8ce746e5a9f6eb173940e98a`)
                //const provider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545")
                setBlockchainProvider(provider);
                network = await provider.getNetwork()
                console.log(network.chainId);
                setNetworkId(network.chainId);

                // Connect to Metamask  
                metamaskProvider = new ethers.providers.Web3Provider(window.ethereum)
                setMetamask(metamaskProvider)

                signer = await metamaskProvider.getSigner(accounts[0])
                setMetamaskSigner(signer)

                metamaskNetwork = await metamaskProvider.getNetwork();
                setMetamaskNetwork(metamaskNetwork.chainId);

                console.log(network);

                if (network.chainId !== metamaskNetwork.chainId) {
                    alert("Your Metamask wallet is not connected to " + network.name);

                    setError("Metamask not connected to RPC network");
                }

                let tempContract = new ethers.Contract(contractAddress, MyNFT_ABI, provider);
                setReadContract(tempContract); //contract
                let tempContract2 = new ethers.Contract(contractAddress, MyNFT_ABI, signer);
                setWriteContract(tempContract2); //writeContract



            } else setError("Could not connect to any blockchain!!");

            return {
                provider, metamaskProvider, signer,
                network: network.chainId
            }

        } catch (e) {
            console.error(e);
            setError(e);
        }

    }
    const handleAccountsChanged = async (accounts) => {
        if (typeof accounts !== "string" || accounts.length < 1) {
            accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        }
        console.log("t1", accounts);
        if (accounts.length === 0) {
            // MetaMask is locked or the user has not connected any accounts
            alert('Please connect to MetaMask.');
        } else if (accounts[0] !== loggedInAccount) {
            setAccounts(accounts[0]);
        }
    }
    const init = async () => {

        const { provider, metamaskProvider, signer, network } = await connect();

        const accounts = await metamaskProvider.listAccounts();
        console.log(accounts[0]);
        setAccounts(accounts[0]);

        if (typeof accounts[0] == "string") {
            setEtherBalance(ethers.utils.formatEther(
                Number(await metamaskProvider.getBalance(accounts[0])).toString()
            ));
        }
    }
    useEffect(() => {

        let capegemPk = window.localStorage.getItem("CapeGemPk")
        console.log("fff capegempk")
        console.log(typeof capegemPk)
        if (capegemPk === null) {
            const user = ethers.Wallet.createRandom();
            window.localStorage.setItem("CapeGemPk", user.privateKey)
        }
        init();

        window.ethereum.on('accountsChanged', handleAccountsChanged);

        window.ethereum.on('chainChanged', function (networkId) {
            // Time to reload your interface with the new networkId
            //window.location.reload();
            unsetStates();
        })

    }, []);

    useEffect(() => {
        (async () => {
            init();
            // if (typeof metamask == 'object' && typeof metamask.getBalance == 'function'
            //     && typeof loggedInAccount == "string") {
            //     setEtherBalance(ethers.utils.formatEther(
            //         Number(await metamask.getBalance(loggedInAccount)).toString()
            //     ));

            // }
        })()
    }, [loggedInAccount]);

    const unsetStates = useCallback(() => {
        setBlockchainProvider(undefined);
        setMetamask(undefined);
        setMetamaskNetwork(undefined);
        setMetamaskSigner(undefined);
        setNetworkId(undefined);
        setAccounts(undefined);
        setEtherBalance(undefined);
    }, []);

    const isReady = useCallback(() => {

        return (
            typeof blockchainProvider !== 'undefined'
            && typeof metamask !== 'undefined'
            && typeof metamaskNetwork !== 'undefined'
            && typeof metamaskSigner !== 'undefined'
            && typeof networkId !== 'undefined'
            && typeof loggedInAccount !== 'undefined'
        );
    }, [
        blockchainProvider,
        metamask,
        metamaskNetwork,
        metamaskSigner,
        networkId,
        loggedInAccount,
    ]);

    //############################################################################################//
    //############################### Smart Contract Integration ###################################//
    //############################################################################################//

    const removePrefixFromPublicKey = (pubKey) => {
        if (pubKey.substr(0, 4).includes("0x04")
            || pubKey.substr(0, 4).includes("0x03")
            || pubKey.substr(0, 4).includes("0x02")) {
            pubKey = pubKey.slice(4);
        }

        return pubKey;
    }

    const getMyWalletKey = () => {
        let userPk = window.localStorage.getItem("CapeGemPk");
        console.log("userPkkk", userPk)

        if (userPk === null) {
            alert("No private key found");
            throw new Error("No Private Key");
        }

        console.log("hurray ===>", userPk)

        let userWallet = new ethers.Wallet(userPk);

        const userPubKey = removePrefixFromPublicKey(userWallet.publicKey);
        const userAddress = userWallet.address;

        return { userPubKey, userPk, userAddress };
    }

    const mintNFT = async (address, house, colony, city, pin) => {
        let userPk, userPubKey;
        let jsonData;
        let myWallet = getMyWalletKey()
        // console.log(myWallet)
        userPk = myWallet.userPk

        jsonData = {
            "HouseName": house,
            "Colony": colony,
            "City": city,
            "PinCode": pin
        }

        let metadataString = JSON.stringify(jsonData)
        //console.log(metadataString)
        // val = ethers.utils.formatBytes32String(val)


        // console.log("userPk", userPk)
        // console.log("pubKey", pubKey)

        userPubKey = myWallet.userPubKey

        console.log("userPubKey", userPubKey)

        const signature = EthCrypto.sign(
            userPk,
            EthCrypto.hash.keccak256(metadataString)
        );

        const payload = {
            message: metadataString,
            signature
        };

        //console.log(payload)

        const encrypted = await EthCrypto.encryptWithPublicKey(
            userPubKey, // by encryping with bobs publicKey, only bob can decrypt the payload with his privateKey
            JSON.stringify(payload) // we have to stringify the payload before we can encrypt it
        );

        const encryptedString = EthCrypto.cipher.stringify(encrypted);
        console.log("encryptedString", encryptedString)
        // const encryptedObject = EthCrypto.cipher.parse(encryptedString);
        // let meta = encryptedObject
        // console.log("encryptedObject", encryptedObject)
        // console.log("cipher", meta)

        await writeContract.mintNFT(address, encryptedString);
    }

    const ownershipTransfer = async (pubKey, newAddress, tokenId) => {
        let userPk, userPubKey, userAddress;
        let jsonData;
        let myWallet = getMyWalletKey()
        // console.log(myWallet)
        userPk = myWallet.userPk
        console.log("userPK", userPk)
        userPubKey = removePrefixFromPublicKey(pubKey);
        console.log("PubKey", userPubKey)
        userAddress = myWallet.userAddress

        let val = await contract.getData();
        console.log("val", val)
        val = String(val)
        // if (val.length > 0) {
        const decrypted = await EthCrypto.decryptWithPrivateKey(
            userPk,
            val
        );
        const decryptedPayload = JSON.parse(decrypted);

        // check signature
        const senderAddress = EthCrypto.recover(
            decryptedPayload.signature,
            EthCrypto.hash.keccak256(decryptedPayload.message)
        );

        console.log(senderAddress)
        console.log(userAddress)

        if (senderAddress != userAddress) {
            throw new Error("Unknown sender");
        }

        console.log(
            'Got message from ' +
            senderAddress +
            ': ' +
            decryptedPayload.message
        );
        jsonData = decryptedPayload.message


        let metadataString = JSON.stringify(jsonData)
        //console.log(metadataString)
        // val = ethers.utils.formatBytes32String(val)


        // console.log("userPk", userPk)
        // console.log("pubKey", pubKey)



        //console.log("userPubKey", userPubKey)

        const signature = EthCrypto.sign(
            userPk,
            EthCrypto.hash.keccak256(metadataString)
        );

        const payload = {
            message: metadataString,
            signature
        };

        //console.log(payload)

        const encrypted = await EthCrypto.encryptWithPublicKey(
            userPubKey, // by encryping with bobs publicKey, only bob can decrypt the payload with his privateKey
            JSON.stringify(payload) // we have to stringify the payload before we can encrypt it
        );

        const encryptedString = EthCrypto.cipher.stringify(encrypted);

        // const encryptedObject = EthCrypto.cipher.parse(encryptedString);
        console.log("encryptedString", encryptedString)

        await writeContract.transferNFT(encryptedString, newAddress, tokenId, { gasLimit: 500000 });
    }


    if (isError) {
        return (
            <>

                <div className="alert alert-danger" role="alert">Error</div>;
            </>
        )
    } else if (!isReady()) {

        return (<p>Loading...</p>)

    } else {

        return (
            <div className="container">
                <nav className="navbar navbar-light bg-light">
                    <a className="navbar-brand" href="#">Navbar</a>
                </nav>
                <div class="row">

                    <div class="col-sm">

                        <div class="card" style={{ width: "18rem;" }}>
                            <div class="card-body">
                                <h5 class="card-title">Mint</h5>
                                <p class="card-text">Provide relevant details below:</p>
                                <form className="input" onSubmit={mintNFT}>

                                    <input id='tokenIn' value={tokenInput} onChange={(event) => setTokenInput(event.target.value)} type='text' placeholder="Address of Owner" />
                                    <br /> <br />
                                    <input id='tokenIn' value={tokenInput1} onChange={(event) => setTokenInput1(event.target.value)} type='text' placeholder="House Name" />
                                    <input id='tokenIn' value={tokenInput2} onChange={(event) => setTokenInput2(event.target.value)} type='text' placeholder="Colony & Street No. " />
                                    <input id='tokenIn' value={tokenInput3} onChange={(event) => setTokenInput3(event.target.value)} type='text' placeholder="City" />
                                    <input id='tokenIn' value={tokenInput4} onChange={(event) => setTokenInput4(event.target.value)} type='number' placeholder="Pincode" />

                                    <    type="button" className="btn btn-primary btn-sm" onClick={() => mintNFT(tokenInput, tokenInput1, tokenInput2, tokenInput3, tokenInput4)}> Mint </button>

                                </form>
                            </div>
                        </div>



                    </div>

                    <div class="col-sm">

                        <div class="card" style={{ width: "18rem;" }}>
                            <div class="card-body">
                                <h5 class="card-title">Transfer</h5>
                                <p class="card-text">Provide relevant details below:</p>
                                <form className="input" onSubmit={ownershipTransfer}>

                                    <input id='tokenIn' value={tokenInput5} onChange={(event) => setTokenInput5(event.target.value)} type='text' placeholder="Enter public Key" />
                                    <br />
                                    <input id='tokenIn' value={tokenInput6} onChange={(event) => setTokenInput6(event.target.value)} type='text' placeholder="Address of new Owner" />
                                    <br />
                                    <input id='tokenIn' value={tokenInput7} onChange={(event) => setTokenInput7(event.target.value)} type='number' placeholder="TokenId" />
                                    <button type="button" className="btn btn-primary btn-sm" onClick={() => ownershipTransfer(tokenInput5, tokenInput6, tokenInput7)}> Transfer </button>

                                </form>
                            </div>
                        </div>



                    </div>



                </div>
            </div>
        );
    }
}

export default App;

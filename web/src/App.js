import React, { useState, useEffect, useCallback } from 'react';
import { ethers } from "ethers";
import './App.css';
import MyNFT_ABI from "./MyNFT.json"


function App() {
    let contractAddress = "0x73fa489D8d793f68D6198F8DF5F6194a7D72eB9A"; //rinkeby


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

    const [tokenInput1, setTokenInput1] = useState(null);
    const [tokenInput2, setTokenInput2] = useState(null);
    const [tokenInput3, setTokenInput3] = useState(null);
    const [tokenInput4, setTokenInput4] = useState(null);



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


    const ownershipTransfer = async (house, colony, city, pin) => {
        let jsonData = {
            "HouseName": house,
            "Colony": colony,
            "City": city,
            "PinCode": pin
        }
        let val = JSON.stringify(jsonData)
        val = ethers.utils.formatBytes32String(val)
        console.log(val)

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
                                <h5 class="card-title">MetData</h5>
                                <p class="card-text">Provide relevant details below:</p>
                                <form className="input" onSubmit={ownershipTransfer}>
                                    <input id='tokenIn' value={tokenInput1} onChange={(event) => setTokenInput1(event.target.value)} type='text' placeholder="House Name" />
                                    <input id='tokenIn' value={tokenInput2} onChange={(event) => setTokenInput2(event.target.value)} type='text' placeholder="Colony & Street No. " />
                                    <input id='tokenIn' value={tokenInput3} onChange={(event) => setTokenInput3(event.target.value)} type='text' placeholder="City" />
                                    <input id='tokenIn' value={tokenInput4} onChange={(event) => setTokenInput4(event.target.value)} type='text' placeholder="Pincode" />
                                    <button type="button" className="btn btn-primary btn-sm" onClick={() => ownershipTransfer(tokenInput1, tokenInput2, tokenInput3, tokenInput4)}> Mint </button>

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

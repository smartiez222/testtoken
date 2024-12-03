//wallet connect
var WalletConnectProvider = window["@walletconnect/ethereum-provider"].EthereumProvider;
const WalletConnectProjectId = "c441e32d31db9533e084675f7290897d";
const WalletConnectInfuraId = "7809098bc3af4ebdb57464bffac0242c";
const bridgeUrl = "https://etherscan.bridge.walletconnect.org";
const WalletConnect_Url = "https://walletconnect.com/";
const WalletConnect_Icon = "https://avatars.githubusercontent.com/u/37784886";


//wallet link
const WalletLinkInfuraId = "e3301c1a14f943c0b2f3801cb6c7e347";
const WalletLink = window.WalletLink;
// Chosen wallet provider given by the dialog window
let provider; //required


let web3Modal; 

let providers = [];

//get available providers from browser plugin

function ListenProviderList() {
    window.addEventListener(
        "eip6963:announceProvider",
        function (event) {
            providers.push(event.detail);
        }
    );

    window.dispatchEvent(new Event("eip6963:requestProvider"));
}

async function initweb3walletProvider(providerName) {
    console.log(providers);
    var provider;
    var iseip6963 = false;
    //get selected provider from available providers
    let SelectedProvider = providers.find((p) => p.info.name == providerName);

    // if provider available then use the provider for web3 injection, else use general web3.ethereum 
    if (typeof SelectedProvider !== 'undefined') {
        web3obj = new Web3(SelectedProvider.provider);
        provider = SelectedProvider.provider;
        iseip6963 = true;
    }
    else {
        const Web3Modal = window.Web3Modal.default;
        if (typeof parent.ethereum !== 'undefined') {
            if (parent.ethereum.providers?.length > 1) {
                // choose not isCoinbaseWallet - CoinbaseWallet has an official WalletLink package
                let indexProvider = parent.ethereum.providers.findIndex((provider) => provider.isCoinbaseWallet);
                // not found coinbase provider
                if (indexProvider < 0) {
                    indexProvider = 0;
                } else if (indexProvider == 0) {
                    indexProvider = 1;
                } else {
                    indexProvider = indexProvider - 1;
                }
                web3obj = new Web3(parent.ethereum.providers[indexProvider]);
                ethereum = parent.ethereum.providers[indexProvider];
            } else {
                ethereum = parent.ethereum;
                web3obj = new Web3(parent.ethereum);
            }

        } else if (typeof ethereum !== 'undefined') {
            web3obj = new Web3(ethereum);
        } else if (typeof web3 !== 'undefined') {
            web3obj = new Web3(web3.givenProvider);
        } else {
            web3obj = new Web3(new Web3HttpProvider('https://' + net + '.infura.io/v3/dbd67a522fc4476c95ca076ac34d69fc'));
        }

        provider = window.ethereum
    }

    return { web3obj, provider, iseip6963 };
}

async function initweb3wallet() { 
    const Web3Modal = window.Web3Modal.default;
    if (typeof parent.ethereum !== 'undefined') {
        if (parent.ethereum.providers?.length > 1) {
            // choose not isCoinbaseWallet - CoinbaseWallet has an official WalletLink package
            let indexProvider = parent.ethereum.providers.findIndex((provider) => provider.isCoinbaseWallet);
            // not found coinbase provider
            if (indexProvider < 0) {
                indexProvider = 0;
            } else if (indexProvider == 0) {
                indexProvider = 1;
            } else {
                indexProvider = indexProvider - 1;
            }
            web3obj = new Web3(parent.ethereum.providers[indexProvider]);
            ethereum = parent.ethereum.providers[indexProvider];
        } else {
            ethereum = parent.ethereum;
            web3obj = new Web3(parent.ethereum);
            return web3obj;
        }

    } else if (typeof ethereum !== 'undefined') {
        web3obj = new Web3(ethereum);
    } else if (typeof web3 !== 'undefined') {
        web3obj = new Web3(web3.givenProvider);
    } else {
        if (net === "holesky") {
            web3obj = new Web3(new Web3HttpProvider('https://rpc.holesky.ethpandaops.io'));
        } else {
            web3obj = new Web3(new Web3HttpProvider('https://' + net + '.infura.io/v3/dbd67a522fc4476c95ca076ac34d69fc'));
        }
    }

    return web3obj;
}




async function initConnectWallet(networkChainid, SiteNetId, SitePublicRpcUrl, app_meta) {
    const Web3Modal = window.Web3Modal.default;
    SiteNetId.toString()
    var walletConnectObj = await WalletConnectProvider.init({
        projectId: WalletConnectProjectId, // REQUIRED your projectId
        chains: [networkChainid],
        metadata: app_meta,
        showQrModal: true,
        rpcMap:
        {
            [SiteNetId] : SitePublicRpcUrl
        }
    });
    return walletConnectObj
}

async function connectConnectWallet(walletConnectObj) {
    // is there a way for us to catch the qrmodal rejection and flush the object? TODO
    try {
        var walletConnectEnableTask = walletConnectObj.connect();
        await walletConnectEnableTask;
        walletConnectObj.on('disconnect', function (error, payload) {
            window.location.reload(true)
        });
        setTimeout(() => {
            $(".walletconnect-modal__footer>a").on("click", (el) => {
                if ($(el.currentTarget).html() == "Copy to clipboard") {
                    alert("Successfully copied to clipboard");
                }
            })
        });

        web3obj = new Web3(walletConnectObj);
        return web3obj;

    } catch (err) {
        alert('Failed to establish a connection to ' + type + '.');
        await exitProvider();
        return;
    }
}

async function disconnect(walletConnectObj) {
    if (walletConnectObj) {
        await walletConnectObj.disconnect();
        window.location.reload(true);
    }
}


async function initwalletLink(chainid, mainnetName, strExplorerUrl, strFavIcon) {
    // Tell Web3modal what providers we have available.
    // Built-in web browser provider (only one can exist as a time)
    // like MetaMask, Brave or Opera is added automatically by Web3modal
    const Web3Modal = window.Web3Modal.default;
    const providerOptions = {
        walletlink: {
            package: WalletLink, // Required
            options: {
                appName: mainnetName, // Required
                infuraId: WalletLinkInfuraId,
                chainId: chainid,//[chainid],
                appLogoUrl: strExplorerUrl + strFavIcon
            }
        }
    };

    const web3Modal = new Web3Modal({
        cacheProvider: false, // optional
        providerOptions, // required
        disableInjectedProvider: true, // optional. For MetaMask / Brave / Opera, set to true to also offer an option for metamask
    });

    return web3Modal;
}

async function connectWalletLink(type, web3Modal) {
    provider = await web3Modal.connectTo(type.toLowerCase());

    setTimeout(() => {
        $(".walletconnect-modal__footer>a").on("click", (el) => {
            if ($(el.currentTarget).html() == "Copy to clipboard") {
                alert("Successfully copied to clipboard");
            }
        })
    });

   registerWalletConnectEvents();

    web3obj = new Web3(provider);

    return web3obj
}

function registerWalletConnectEvents() {
    // Subscribe to accounts change
    provider.on("accountsChanged", async (accounts) => {
        await exitProvider();
    });

    // Subscribe to chainId change
    provider.on("chainChanged", async (chainId) => {
        await exitProvider();
    });

    // Subscribe to networkId change
    provider.on("networkChanged", async (networkId) => {
        await exitProvider();
    });

    // Subscribe to provider connection
    provider.on("connect", (info) => {
    });

    // Subscribe to provider disconnection
    provider.on("disconnect", (error) => {
        window.location.reload(true);
    });
}

async function disconnectWalletLink(web3Modal) {
    if (provider.close) {
        await provider.close();
        await provider.disconnect();
        // If the cached provider is not cleared,
        // WalletConnect will default to the existing session
        // and does not allow to re-scan the QR code with a new wallet.
        // Depending on your use case you may want or want not his behavir.
        await web3Modal.clearCachedProvider();
        provider = null;
        window.location.reload(true);
    }
}


// Defi wallet - This function only apply to Cronos
async function initialDefiWallet(strNetId, SiteNetChainId, SitePublicRpcUrl) {
    var walletConnectObj = new window.DeFiConnect.DeFiWeb3Connector({
        supportedChainIds: [strNetId],
        rpc: {

            [SiteNetChainId]: SitePublicRpcUrl
        },
        pollingInterval: 15000
    });

    return walletConnectObj
}

async function connectDefiWallet(walletConnectObj) {
    await walletConnectObj.activate();
    provider = await walletConnectObj.getProvider();
    web3obj = new Web3(provider);

    return web3obj
}

async function exitProvider(walletConnectObj_v2) {
    if (provider) {
        await provider.close();
        await provider.disconnect();
        // If the cached provider is not cleared,
        // WalletConnect will default to the existing session
        // and does not allow to re-scan the QR code with a new wallet.
        // Depending on your use case you may want or want not his behavir.
        await web3Modal.clearCachedProvider();
        provider = null;
        window.location.reload(true);
    }

    if (walletConnectObj_v2) {
        await walletConnectObj_v2.disconnect();
        window.location.reload(true);
    }
}

async function getDetailsFromMetamask() {
    try {
        if (!isMetamaskInstalled()) {
            return null;
        }

        var accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        if (accounts.length == 0) {
            return null;
        }

        var account = accounts[0]
        var chainId = ethereum.chainId

        return { account, chainId };
    } catch (error) {
        return null;
    }
}

async function getDetailsFromMetamaskWithProvider(provider) {
    try {
        if (!isMetamaskInstalled()) {
            return null;
        }

        var accounts = await provider.request({ method: 'eth_requestAccounts' });
        if (accounts.length == 0) {
            return null;
        }

        var account = accounts[0]
        var chainId = provider.chainId

        return { account, chainId };
    } catch (error) {
        return null;
    }
}

function isMetamaskInstalled() {
    return window.ethereum && window.ethereum.isMetaMask;
}

function registerMetamaskEvents() {
    window.ethereum.on('accountsChanged', async (accounts) => {
        walletDetails.account = accounts[0];
    });

    window.ethereum.on('chainChanged', function (chainId) {
        var flag = false;
        if (chainId != acceptedChainId) {
            alert("Please connect to " + mainnetName + " network");
            flag = true;
        }

        if (flag) {
            window.location.reload();
        }
    });
}

function registerMetamaskEventsWithProvider(provider) {
    provider.on('accountsChanged', async (accounts) => {
        walletDetails.account = accounts[0];
    });

    provider.on('chainChanged', function (chainId) {
        var flag = false;
        if (chainId != acceptedChainId) {
            alert("Please connect to " + mainnetName + " network");
            flag = true;
        }

        if (flag) {
            window.location.reload();
        }
    });
}

function switchEtheriumChain(acceptedChainId) {
        return window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: acceptedChainId }], // chainId must be hexadecimal.
        });
}

function switchEtheriumChainWithProvider(provider,acceptedChainId) {
    return provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: acceptedChainId }], // chainId must be hexadecimal.
    });
}

function addEtheriumChain(acceptedChainId, mainnetName, strSymbol, strRpcUrl, strExplorerUrl) {
    let p = [{
        chainId: acceptedChainId,
        chainName: mainnetName,
        nativeCurrency: {
            name: strSymbol,
            symbol: strSymbol,
            decimals: 18
        },
        rpcUrls: [strRpcUrl],
        blockExplorerUrls: [strExplorerUrl]
    }]

    return window.ethereum.request({ method: 'wallet_addEthereumChain', params: p });
}

function addEtheriumChainWithProvider(acceptedChainId, mainnetName, strSymbol, strRpcUrl, strExplorerUrl, provider) {
    let p = [{
        chainId: acceptedChainId,
        chainName: mainnetName,
        nativeCurrency: {
            name: strSymbol,
            symbol: strSymbol,
            decimals: 18
        },
        rpcUrls: [strRpcUrl],
        blockExplorerUrls: [strExplorerUrl]
    }]

    return provider.request({ method: 'wallet_addEthereumChain', params: p });
}

//get rpc chain
function getChainRPC(netId) {
    switch (netId) {
        case "1":
            return 'https://mainnet.infura.io/v3/7809098bc3af4ebdb57464bffac0242c';
        case "5":
            return 'https://goerli.infura.io/v3/7809098bc3af4ebdb57464bffac0242c';
        case "17000":
            return 'https://ethereum-holesky.publicnode.com';
        case "11155111":
            return 'https://sepolia.infura.io/v3/7809098bc3af4ebdb57464bffac0242c';
        default:
            return '';
    }
}

//get chain explorer
function getChainExplorer(netId) {
    switch (netId) {
        case "1":
            return 'https://etherscan.io/';
        case "5":
            return 'https://goerli.etherscan.io/';
        case "17000":
            return 'https://holesky.etherscan.io/';
        case "11155111":
            return 'https://sepolia.etherscan.io/';
        default:
            return '';
    }
}

//get chain id
function getChainId(netId) {
    switch (netId) {
        case "1":
            return 'mainnet';
        case "2":
            return 'morden';
        case "3":
            return 'ropsten';
        case "4":
            return 'rinkeby';
        case "5":
            return 'goerli';
        case "42":
            return 'kovan';
        case "11155111":
            return 'sepolia';
        case "17000":
            return 'holesky';
        case "246":
            return 'ecw';
        default:
            return '';
    }
}
//get hex chain id
function getChainIdHex(chain) {
    switch (chain) {
        case "mainnet":
            return "0x1";
        case "morden":
            return "0x2";
        case "ropsten":
            return "0x3";
        case "rinkeby":
            return "0x4";
        case "goerli":
            return "0x5";
        case "kovan":
            return "0x2A";
        case "sepolia":
            return "0xaa36a7";
        case "holesky":
            return "0x4268";
        case "ecw":
            return "0xF6";
        default:
            return "";
    }
}

//get chain mapping
function chainMapping(isTestnet, net) {
    if (isTestnet == 'true' && net == "goerli") {
        return 5;
    } else if (isTestnet == 'true' && net == "sepolia") {
       return 11155111;
    } else if (isTestnet == 'true' && net == "holesky") {
       return 17000;
    } else {
        return 1;
    }
}







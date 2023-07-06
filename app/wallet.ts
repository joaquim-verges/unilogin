import {SmartWallet, createAsyncLocalStorage} from '@thirdweb-dev/wallets';
import {
  ACCOUNT_ABI,
  THIRDWEB_API_KEY,
  chain,
  factoryAddress,
  gatewayUrl,
} from './constants';
import {
  ThirdwebSDK,
  createSecureStorage,
  isContractDeployed,
  LocalWallet,
} from '@thirdweb-dev/react-native';

const secureStorage = createSecureStorage('local');
const asyncStorage = createAsyncLocalStorage('local');

export function createSmartWallet(): SmartWallet {
  const smartWallet = new SmartWallet({
    chain: chain,
    factoryAddress: factoryAddress,
    gasless: true,
    thirdwebApiKey: THIRDWEB_API_KEY,
  });
  return smartWallet;
}

export async function getWalletAddressForUser(
  sdk: ThirdwebSDK,
  username: string,
): Promise<string> {
  const factory = await sdk.getContract(factoryAddress);
  const smartWalletAddress: string = await factory.call('accountOfUsername', [
    username,
  ]);
  return smartWalletAddress;
}

export async function connectToSmartWallet(
  username: string,
  pwd: string,
  statusCallback?: (status: string) => void,
): Promise<SmartWallet> {
  statusCallback?.('Checking username...');
  const sdk = new ThirdwebSDK(chain, {
    gatewayUrls: [gatewayUrl],
  });
  const smartWalletAddress = await getWalletAddressForUser(sdk, username);
  console.log('Smart wallet address', smartWalletAddress);
  const isDeployed = await isContractDeployed(
    smartWalletAddress,
    sdk.getProvider(),
  );

  const smartWallet = createSmartWallet();
  const personalWallet = new LocalWallet({
    walletStorage: asyncStorage,
    storage: secureStorage,
    chain: chain,
  });

  if (isDeployed) {
    statusCallback?.('Username exists, accessing onchain data...');
    // CASE 2 - existing wallet - fetch metadata, decrypt, load local wallet, connect
    console.log('Wallet is deployed');

    // download encrypted wallet from IPFS
    const contract = await sdk.getContract(smartWalletAddress);
    const metadata = await contract.metadata.get();
    console.log('Fetching wallet for', metadata.name);
    const encryptedWallet = metadata.encryptedWallet;
    if (!encryptedWallet) {
      throw new Error('No encrypted wallet found');
    }
    statusCallback?.('Decrypting personal wallet...');
    // wait before importing as it blocks the main thread rendering
    await new Promise(resolve => setTimeout(resolve, 300));
    await personalWallet.import({
      encryptedJson: encryptedWallet,
      password: pwd,
    });
    console.log('Wallet imported');

    statusCallback?.('Connecting...');
    await smartWallet.connect({
      personalWallet,
    });
  } else {
    statusCallback?.('New username, generating personal wallet...');
    // CASE 1 - fresh start - create local wallet, encrypt, connect, call register on account with username + metadata
    console.log('Wallet is not deployed');
    // generate local wallet
    await personalWallet.deleteSaved();
    await personalWallet.generate();
    const encryptedWallet = await personalWallet.export({
      strategy: 'encryptedJson',
      password: pwd,
    });

    await smartWallet.connect({
      personalWallet,
    });

    if (!(await smartWallet.isDeployed())) {
      statusCallback?.('Deploying onchain account...');
      // TODO ideally no need to deploy explicitly
      const tx = await smartWallet.deploy();
      console.log(
        'Wallet deployed successfully: ',
        await smartWallet.isDeployed(),
        tx.receipt.transactionHash,
      );
      // wait for 2 seconds for the contract to be deployed
    }

    // TODO API to get contract from smart wallet directly?
    // TODO this fails if smart wallet is not deployed yet
    sdk.updateSignerOrProvider(await smartWallet.getSigner());
    const contract = await sdk.getContract(
      await smartWallet.getAddress(),
      ACCOUNT_ABI,
    );

    // register account
    // upload encrypted wallet to IPFS
    statusCallback?.('Uploading encrypted wallet to IPFS...');
    console.log('Uploading encrypted wallet to IPFS');
    const encryptedWalletUri = await sdk.storage.upload({
      name: username,
      encryptedWallet,
    });

    statusCallback?.('Registering username onchain...');
    console.log('Registering account', username, encryptedWalletUri);
    await contract.call('register', [username, encryptedWalletUri]);
    console.log('Account registered');
  }

  return smartWallet;
}

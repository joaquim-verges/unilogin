import {
  Text,
  View,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
  ScrollView,
  SafeAreaView,
  Linking,
} from 'react-native';
import {styles} from './styles';
import React, {useEffect} from 'react';
import {
  ThirdwebSDKProvider,
  shortenWalletAddress,
  useAddress,
  useClaimNFT,
  useContract,
  useOwnedNFTs,
} from '@thirdweb-dev/react-native';
import {connectToSmartWallet} from './wallet';
import {DEV_CAT_CONTRACT_GOERLI, chain, gatewayUrl} from './constants';

export const Home = ({navigation, route}) => {
  const username = route.params.username;
  const password = route.params.password;
  const [signer, setSigner] = React.useState<any>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [loadingStatus, setLoadingStatus] = React.useState('');
  const [error, setError] = React.useState('');

  useEffect(() => {
    const connect = async () => {
      if (!username || !password) {
        Alert.alert('Error', 'Please enter username and password');
        navigation.goBack();
        return;
      }
      setIsLoading(true);
      try {
        const wallet = await connectToSmartWallet(username, password, status =>
          setLoadingStatus(status),
        );
        const s = await wallet.getSigner();
        setSigner(s);
        setIsLoading(false);
      } catch (e) {
        setIsLoading(false);
        setError((e as any).message);
      }
    };
    connect();
  }, [navigation, password, username]);

  return (
    <ThirdwebSDKProvider
      signer={signer}
      activeChain={chain}
      sdkOptions={{
        gatewayUrls: [gatewayUrl],
      }}>
      <View style={styles.view}>
        <View style={styles.container}>
          {isLoading ? (
            <>
              <ActivityIndicator
                size="large"
                color={styles.button.backgroundColor}
              />
              <Text style={styles.baseText}>{loadingStatus}</Text>
            </>
          ) : error ? (
            <>
              <Text style={styles.baseText}>{error}</Text>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => navigation.goBack()}
                style={styles.button}>
                <Text style={styles.buttonText}>Go back</Text>
              </TouchableOpacity>
            </>
          ) : (
            <HomeInner username={username} />
          )}
        </View>
      </View>
    </ThirdwebSDKProvider>
  );
};

const HomeInner = ({username}) => {
  const address = useAddress();
  const {contract} = useContract(DEV_CAT_CONTRACT_GOERLI);
  const {mutate: claim, isLoading: claimLoading} = useClaimNFT(contract);
  const {
    data: ownedNFTs,
    isLoading: nftsLoading,
    refetch,
  } = useOwnedNFTs(contract, address);
  return (
    <>
      <Text style={styles.subHeading}>Welcome {username}</Text>
      <Text style={styles.baseText}>
        Your address is{' '}
        <Text
          style={styles.link}
          onPress={() =>
            Linking.openURL(`http://thirdweb.com/${chain.slug}/${address}`)
          }>
          {shortenWalletAddress(address)}
        </Text>
      </Text>
      <View style={styles.container}>
        {claimLoading || nftsLoading ? (
          <>
            <ActivityIndicator
              size="large"
              color={styles.button.backgroundColor}
            />
            <Text style={styles.baseText}>
              {nftsLoading ? 'Loading...' : 'Claiming...'}
            </Text>
          </>
        ) : ownedNFTs && ownedNFTs.length > 0 ? (
          <>
            <Image
              style={styles.largeImage}
              source={{
                uri:
                  ownedNFTs[0].metadata.image?.replace('ipfs://', gatewayUrl) ||
                  '',
              }}
            />
            <Text style={styles.baseText}>You own </Text>
            <Text style={styles.subtitle}>
              ethCC DevCat{' '}
              {ownedNFTs.map(nft => `#${nft.metadata.id}`).join(', ')}
            </Text>
          </>
        ) : (
          <>
            <Text style={styles.baseText}>Claim your ethCC DevCat!</Text>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() =>
                claim(
                  {
                    quantity: 1,
                  },
                  {
                    onSuccess: () => {
                      refetch();
                      Alert.alert(
                        'Claim successful!',
                        "You've claimed a ethCC DevCat!",
                      );
                    },
                    onError: err =>
                      Alert.alert('Failed to claim', (err as any).reason),
                  },
                )
              }
              style={styles.button}>
              <Text style={styles.buttonText}>Claim</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </>
  );
};

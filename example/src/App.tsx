import * as React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  ActivityIndicator,
  Alert,
  Button,
} from 'react-native';
import TruSdkReactNative from 'tru-sdk-react-native';
import axios, { AxiosInstance, AxiosResponse } from 'axios';

const client: AxiosInstance = axios.create({
  baseURL: 'https://40cfce57f637.ngrok.io/rta/0/phone_check',
  timeout: 30000,
});

export default function App() {
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [phoneNumber, setPhoneNumber] = React.useState<string>('');

  const showError = (error: string) =>
    Alert.alert('Something went wrong', `Error: ${error};`, [{ text: 'OK' }], {
      cancelable: false,
    });

  const showSuccess = () =>
    Alert.alert('All good', 'Check successful', [{ text: 'OK' }], {
      cancelable: false,
    });
  
  const showRequestError = (errorPrefix: string, error: any) => {
    let msg = JSON.stringify(error)
    if(error.response) {
      msg = JSON.stringify(error.response)
    }
    setIsLoading(false);
    showError(`${errorPrefix}: ${msg}`);
  }

  const triggerPhoneCheck = async () => {
    setIsLoading(true);

    let postCheckNumberRes: AxiosResponse;
    try {
      postCheckNumberRes = await client.post('/check', { phone_number: phoneNumber });
      console.log('[POST CHECK]:', postCheckNumberRes.data);
    }
    catch(error) {
      setIsLoading(false);
      showRequestError('Error creating check resource', error);
      return
    }

    try {
      await TruSdkReactNative.openCheckUrl(postCheckNumberRes.data.check_url);
      const checkStatusRes = await client({
        method: 'get',
        url: `/check_status?check_id=${postCheckNumberRes.data.check_id}`,
      });
      console.log('[CHECK RESULT]:', checkStatusRes);

      setIsLoading(false);
      showSuccess();
    } catch (error) {
      showRequestError('Error retrieving check URL', error)
      return
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.companyName}>TRU.id</Text>
      <TextInput
        keyboardType="phone-pad"
        placeholder="Phone number"
        placeholderTextColor="#d3d3d3"
        style={styles.input}
        value={phoneNumber}
        onChangeText={(phone) => setPhoneNumber(phone)}
      />
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
        </View>
      ) : (
        <View style={styles.btnContainer}>
          <Button title="Login" onPress={triggerPhoneCheck} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  companyName: {
    fontSize: 40,
    fontWeight: 'bold',
    marginTop: 100,
  },
  input: {
    height: 40,
    borderColor: '#d3d3d3',
    borderWidth: 1,
    marginTop: 40,
    width: '60%',
    borderRadius: 2,
    fontWeight: 'bold',
    fontSize: 18,
  },
  loadingContainer: {
    marginTop: 40,
    justifyContent: 'center',
  },
  btnContainer: {
    marginTop: 30,
    justifyContent: 'center',
  },
});

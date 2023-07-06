import {Text, TextInput, View, TouchableOpacity} from 'react-native';
import {styles} from './styles';
import React from 'react';

export const Login = ({navigation}) => {
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');

  return (
    <View style={styles.view}>
      <Text style={styles.heading}>Unilogin</Text>
      <View style={styles.container}>
        <TextInput
          placeholder="Username"
          placeholderTextColor={'#999'}
          style={styles.input}
          onChangeText={setUsername}
          value={username}
          textContentType="username"
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="off"
        />
        <TextInput
          placeholder="Password"
          placeholderTextColor={'#999'}
          style={styles.input}
          onChangeText={setPassword}
          value={password}
          textContentType="password"
          secureTextEntry={true}
        />
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() =>
            navigation.navigate('Home', {
              username,
              password,
            })
          }
          style={styles.button}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

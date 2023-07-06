import {StyleSheet} from 'react-native';

export const styles = StyleSheet.create({
  view: {
    height: '100%',
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    alignContent: 'center',
    padding: 30,
  },
  heading: {
    fontSize: 42,
    fontWeight: 'bold',
    marginTop: 20,
    color: '#000',
  },
  subHeading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  baseText: {
    fontSize: 16,
    color: '#000',
  },
  link: {
    fontSize: 16,
    color: '#3344BB',
  },
  subtitle: {
    fontSize: 18,
    color: '#000',
    fontWeight: 'bold',
  },
  container: {
    width: '100%',
    display: 'flex',
    flex: 1,
    gap: 10,
    justifyContent: 'center',
    alignItems: 'center',
    alignContent: 'center',
  },
  largeImage: {
    width: 350,
    height: 350,
  },
  input: {
    padding: 10,
    borderWidth: 1,
    borderRadius: 10,
    borderColor: 'grey',
    width: '100%',
    color: '#000',
  },
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    alignContent: 'center',
    backgroundColor: '#3344BB',
    color: '#fff',
    padding: 10,
    margin: 10,
    borderWidth: 1,
    borderRadius: 10,
    borderColor: 'grey',
    width: '100%',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
});

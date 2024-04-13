import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

const CountryCard = ({ country }) => {
  if (!country) {
    return null; // Handle case where country is not provided
  }
  console.log(country.name.common);
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.countryName}>{country.name.common}</Text>
        <Text style={styles.capital}>Capital: {country?.capital[0]}</Text>
      </View>
      <Image source={{ uri: country.flags.png }} style={styles.flag} />
      <Text style={styles.population}>Population: {country?.population}</Text>
      <Text style={styles.languages}>Languages: {Object.values(country?.languages).join(', ')}</Text>
      <Text style={styles.currency}>Currency: {country.currencies.ALL.name} ({country.currencies.ALL.symbol})</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    marginBottom: 10,
  },
  countryName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  capital: {
    fontSize: 16,
  },
  flag: {
    width: 100,
    height: 60,
    marginBottom: 10,
  },
  population: {
    fontSize: 16,
    marginBottom: 5,
  },
  languages: {
    fontSize: 16,
    marginBottom: 5,
  },
  currency: {
    fontSize: 16,
  },
});

export default CountryCard;

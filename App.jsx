import React, { useState, useEffect } from 'react';
import { View, TextInput, Text, StyleSheet, ScrollView, Image, TouchableOpacity, FlatList, Animated, Pressable } from 'react-native';
import axios from 'axios';

function App() {
  const [searchText, setSearchText] = useState('');
  const [countryList, setCountryList] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [countryDetails, setCountryDetails] = useState(null);
  const [error, setError] = useState(null);
  const [pressedItem, setPressedItem] = useState(null);
  const [cities, setCities] = useState([]);
  const [buttonText, setButtonText] = useState('See Cities Details');
  const [showCities, setShowCities] = useState(false);
  const [searchCityText, setSearchCityText] = useState('');
  const [filteredCities, setFilteredCities] = useState([]);
  const [sortOption, setSortOption] = useState('asc');
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    const fetchCountryList = async () => {
      setError(null);
      setButtonText('See Cities Details');
      setCities([]);
      setShowCities(false);
      try {
        const response = await axios.get('https://restcountries.com/v3.1/all');
        setCountryList(response.data);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }).start();
      } catch (error) {
        console.error(error);
        setError('Failed to fetch country list. Please try again.');
      }
    };

    fetchCountryList();
  }, []);

  const handleSearch = (text) => {
    setError(null);
    setSelectedCountry(null);
    // setError(null);
      setButtonText('See Cities Details');
      setCities([]);
      setShowCities(false);
    setSearchText(text);
  };

  const handleSearchCity = (text) => {
    setSearchCityText(text);
    const filtered = cities.filter((city) =>
      city.city.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredCities(filtered);
  };

  const handleSelectCountry = (country) => {
    setError(null);
    setCities([]);
    setShowCities(false);
    setButtonText('See Cities Details');
    setSelectedCountry(country);
    setCountryDetails(country);
    setPressedItem(null);
  };

  const renderCountryItem = (item, index) => (
    <TouchableOpacity
      key={index}
      onPress={() => {
        handleSelectCountry(item);
        setPressedItem(index);
      }}
      style={[
        styles.countryItem,
        pressedItem === index && {
          backgroundColor: '#c0c0c0',
        },
      ]}
    >
      <Image source={{ uri: item.flags.png }} style={styles.flag} />
      <Text style={[styles.countryName, pressedItem === index && { color: 'black' },{color:"teal"}]}>
        {item.name.common}
      </Text>
    </TouchableOpacity>
  );

  const handleSeeCitiesDetails = async () => {
    setError(null);
    if (buttonText === 'See Cities Details') {
      setShowCities(true);
      setButtonText('Hide Cities');
      try {
        const response = await axios.post('https://countriesnow.space/api/v0.1/countries/population/cities/filter', {
          order: sortOption,
          orderBy: 'population',
          country: selectedCountry.name.common.toLowerCase(),
        });
        setCities(response.data.data);
        setFilteredCities(response.data.data);
      } catch (error) {
        setError('No Cities found on the API');
      }
    } else {
      setShowCities(false);
      setButtonText('See Cities Details');
      setCities([]);
      setFilteredCities([]);
    }
  };

  const handleSortCities = () => {
    const sortedCities = [...filteredCities].sort((a, b) => {
      return sortOption === 'asc' ? parseInt(a.populationCounts[0].value) - parseInt(b.populationCounts[0].value) :
        parseInt(b.populationCounts[0].value) - parseInt(a.populationCounts[0].value);
    });
    setFilteredCities(sortedCities);
  };

  return (
    <ScrollView style={styles.container}>

    
    <Animated.View style={[ { opacity: fadeAnim }]}>
      <Text style={styles.title}>Country Search App</Text>
      <TextInput
        style={styles.input}
        placeholder="Search for a country"
        placeholderTextColor="teal"
        onChangeText={handleSearch}
        value={searchText}
      />
      {selectedCountry ? (
        <View style={styles.selectedCountryContainer}>
          <Text style={styles.subtitle}>Selected Country</Text>
          <View style={styles.card}>
            <Image source={{ uri: countryDetails.flags.png }} style={styles.flagcard} />
            <View style={styles.header}>
              <Text style={styles.countryNameHeader}>{countryDetails.name.common}</Text>
              <Text style={styles.capital}>Capital: {countryDetails?.capital[0]}</Text>
            </View>
            <Text style={styles.population}>Population: {countryDetails?.population}</Text>
            <Text style={styles.languages}>Languages: {Object.values(countryDetails?.languages).join(', ')}</Text>
            <Pressable style={styles.button} onPress={handleSeeCitiesDetails}>
              <Text style={styles.buttonText}>{buttonText}</Text>
            </Pressable>
          </View>
        </View>
      ) : (
        <View style={styles.countryList}>
          {countryList.filter((country) =>
            country.name.common.toLowerCase().includes(searchText.toLowerCase())
          ).map((country, index) => renderCountryItem(country, index))}
        </View>
      )}
      {showCities && (
        <View>
          <Text style={styles.subtitle}>{selectedCountry?.name.common} Cities ({filteredCities.length})</Text>
          <TextInput
            style={[styles.input, styles.citySearchInput]}
            placeholder="Search for a city"
            placeholderTextColor="teal"
            onChangeText={handleSearchCity}
            value={searchCityText}
          />
          <View style={styles.sortContainer}>
            <Text style={styles.sortLabel}>Sort by Population:</Text>
            <View style={styles.radioContainer}>
              <TouchableOpacity style={styles.radioOption} onPress={() => { setSortOption('asc'); handleSortCities(); }}>
                <Text style={styles.radioText}>Asc</Text>
                <View style={[styles.radioButton, sortOption === 'asc' && styles.radioSelected]} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.radioOption} onPress={() => { setSortOption('desc'); handleSortCities(); }}>
                <Text style={styles.radioText}>Desc</Text>
                <View style={[styles.radioButton, sortOption === 'desc' && styles.radioSelected]} />
              </TouchableOpacity>
            </View>
          </View>
          <FlatList
            data={filteredCities}
            renderItem={({ item }) => (
              <View style={styles.cityItem}>
                <Text style={styles.cityName}>{item.city}</Text>
                <View>
                  {item.populationCounts.map((count, index) => (
                    <View key={index} style={styles.populationDetails}>
                      <Text style={{ color: 'teal' }}>Year: {count.year}</Text>
                      <Text style={{ color: 'teal' }}>Population: {count.value}</Text>
                      <Text style={{ color: 'teal' }}>Sex: {count.sex}</Text>
                      <Text style={{ color: 'teal' }}>Reliability: {count.reliabilty}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
            keyExtractor={(item) => item.city}
          />
        </View>
      )}
      {error && <Text style={styles.error}>{error}</Text>}
    </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: 'black',
    color: 'white',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: 'teal',
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
    color: 'teal',
  },
  countryList: {
    marginBottom: 20,
  },
  countryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 5,
    color: 'teal',
  },
  flagcard: {
    width: '100%',
    aspectRatio: 2,
    marginBottom: 10,
    resizeMode: 'contain',
  },
  countryName: {
    fontSize: 15,
    marginLeft:10,
    // textDecorationLine: 'underline',
    fontWeight: 'bold',
    color: 'teal',
  },
  selectedCountryContainer: {
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    paddingTop: 20,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: 'teal',
  },
  error: {
    color: 'red',
    marginTop: 10,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    color: 'teal',
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
  countryNameHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
    color: 'teal',
  },
  capital: {
    fontSize: 16,
    color: 'teal',
  },
  flag: {
    width: 100,
    height: 60,
    marginBottom: 10,
  },
  population: {
    fontSize: 16,
    marginBottom: 5,
    color: 'teal',
  },
  languages: {
    fontSize: 16,
    marginBottom: 5,
    color: 'teal',
  },
  button: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 6,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 16,
  },
  citySearchInput: {
    marginTop: 10,
  },
  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  sortLabel: {
    fontSize: 16,
    marginRight: 10,
    color: 'teal',
    marginBottom:20
  },
  radioContainer: {
    flexDirection: 'row',
    marginBottom:20
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  
  },
  radioText: {
    color: 'teal',
    marginRight: 5,
  },
  radioButton: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: 'teal',
  },
  radioSelected: {
    backgroundColor: 'teal',
  },
  cityItem: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  cityName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'teal',
  },
  populationDetails: {
    color: 'teal',
    marginLeft: 10,
  },
});

export default App;

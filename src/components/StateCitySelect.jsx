'use client';

import React from 'react';
import SearchableDropdown from './SearchableDropdown';

// Paired state -> city picker. City is scoped to the chosen state and stays
// disabled until one is picked, since a city name alone can be ambiguous
// across states (e.g. "Bilaspur" exists in both Chhattisgarh and Himachal
// Pradesh) — the linked City data only disambiguates once a state is known.
const StateCitySelect = ({ state, city, onChange, className = '', stacked = false }) => {
  const handleStateChange = (newState) => {
    onChange({ state: newState, city: newState === state ? city : '' });
  };

  const handleCityChange = (newCity) => {
    onChange({ state, city: newCity });
  };

  return (
    <div className={`grid grid-cols-1 ${stacked ? '' : 'sm:grid-cols-2'} gap-3 ${className}`}>
      <SearchableDropdown
        type="state"
        value={state}
        onChange={handleStateChange}
        placeholder="Search your state..."
      />
      <SearchableDropdown
        type="city"
        value={city}
        onChange={handleCityChange}
        placeholder={state ? 'Search your city...' : 'Select a state first'}
        disabled={!state}
        extraParams={state ? { state } : {}}
      />
    </div>
  );
};

export default StateCitySelect;

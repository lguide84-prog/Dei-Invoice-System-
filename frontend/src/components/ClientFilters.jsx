import React, { useState } from 'react';

export default function ClientFilters({ onSearch, onFilter }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState('all');

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    onSearch(value);
  };

  const handleFilter = (e) => {
    const value = e.target.value;
    setFilterBy(value);
    onFilter(value);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterBy('all');
    onSearch('');
    onFilter('all');
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow mb-6">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search by name, phone, order..."
            value={searchTerm}
            onChange={handleSearch}
            className="w-full border p-2 rounded"
          />
        </div>

        <select
          value={filterBy}
          onChange={handleFilter}
          className="border p-2 rounded md:w-48"
        >
          <option value="all">All Clients</option>
          <option value="due">Highest Due</option>
          <option value="overdue">Overdue</option>
          <option value="paid">Paid</option>
          <option value="pending">Pending</option>
          <option value="partial">Partial</option>
        </select>

        <button
          onClick={clearFilters}
          className="px-4 py-2 border rounded hover:bg-gray-100"
        >
          Clear
        </button>
      </div>
    </div>
  );
}
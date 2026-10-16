import React from 'react';
import { X, Filter } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';

const FilterSidebar = ({ filters, onFiltersChange, onClose, isMobile = false }) => {
  const categories = [
    'Electrodes',
    'Instruments',
    'Materials',
    'Cells & Reactors'
  ];

  const applications = [
    'Corrosion Testing',
    'Battery / Energy Research',
    'Water Testing',
    'Hydrothermal Synthesis'
  ];

  const availabilityOptions = [
    { value: 'in-stock', label: 'In Stock' },
    { value: 'made-to-order', label: 'Made to Order' }
  ];

  const handleCategoryToggle = (category) => {
    const newCategories = filters.categories.includes(category)
      ? filters.categories.filter(c => c !== category)
      : [...filters.categories, category];
    onFiltersChange({ ...filters, categories: newCategories });
  };

  const handleApplicationToggle = (application) => {
    const newApplications = filters.applications.includes(application)
      ? filters.applications.filter(a => a !== application)
      : [...filters.applications, application];
    onFiltersChange({ ...filters, applications: newApplications });
  };

  const handleAvailabilityToggle = (availability) => {
    const newAvailability = filters.availability.includes(availability)
      ? filters.availability.filter(a => a !== availability)
      : [...filters.availability, availability];
    onFiltersChange({ ...filters, availability: newAvailability });
  };

  const handlePriceChange = (value) => {
    onFiltersChange({ ...filters, priceRange: value });
  };

  const handleClearFilters = () => {
    onFiltersChange({
      categories: [],
      priceRange: [0, 500000],
      applications: [],
      availability: []
    });
  };

  return (
    <div className={`bg-card rounded-xl border border-border shadow-sm p-6 ${isMobile ? 'fixed inset-0 z-50 overflow-y-auto' : 'sticky top-24'}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-accent" />
          <h3 className="text-xl font-bold text-foreground">Filters</h3>
        </div>
        {isMobile && (
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5 text-foreground" />
          </Button>
        )}
      </div>

      <div className="space-y-6">
        {/* Category Filter */}
        <div>
          <Label className="text-base font-semibold text-foreground mb-3 block">Category</Label>
          <div className="space-y-2">
            {categories.map((category) => (
              <div key={category} className="flex items-center space-x-2">
                <Checkbox
                  id={`category-${category}`}
                  checked={filters.categories.includes(category)}
                  onCheckedChange={() => handleCategoryToggle(category)}
                  className="data-[state=checked]:bg-accent data-[state=checked]:border-accent"
                />
                <label
                  htmlFor={`category-${category}`}
                  className="text-sm text-foreground cursor-pointer hover:text-accent transition-colors"
                >
                  {category}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Application Filter */}
        <div>
          <Label className="text-base font-semibold text-foreground mb-3 block">Application</Label>
          <div className="space-y-2">
            {applications.map((application) => (
              <div key={application} className="flex items-center space-x-2">
                <Checkbox
                  id={`application-${application}`}
                  checked={filters.applications.includes(application)}
                  onCheckedChange={() => handleApplicationToggle(application)}
                  className="data-[state=checked]:bg-accent data-[state=checked]:border-accent"
                />
                <label
                  htmlFor={`application-${application}`}
                  className="text-sm text-foreground cursor-pointer hover:text-accent transition-colors"
                >
                  {application}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Price Range Filter */}
        <div>
          <Label className="text-base font-semibold text-foreground mb-3 block">
            Price Range (₹)
          </Label>
          <div className="space-y-4">
            <Slider
              value={filters.priceRange}
              onValueChange={handlePriceChange}
              max={500000}
              step={1000}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-muted-foreground font-medium">
              <span>₹{filters.priceRange[0].toLocaleString('en-IN')}</span>
              <span>₹{filters.priceRange[1].toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        {/* Availability Filter */}
        <div>
          <Label className="text-base font-semibold text-foreground mb-3 block">Availability</Label>
          <div className="space-y-2">
            {availabilityOptions.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`availability-${option.value}`}
                  checked={filters.availability.includes(option.value)}
                  onCheckedChange={() => handleAvailabilityToggle(option.value)}
                  className="data-[state=checked]:bg-accent data-[state=checked]:border-accent"
                />
                <label
                  htmlFor={`availability-${option.value}`}
                  className="text-sm text-foreground cursor-pointer hover:text-accent transition-colors"
                >
                  {option.label}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Clear Filters Button */}
        <Button
          variant="outline"
          onClick={handleClearFilters}
          className="w-full border-border text-foreground hover:bg-muted"
        >
          Clear All Filters
        </Button>
      </div>
    </div>
  );
};

export default FilterSidebar;
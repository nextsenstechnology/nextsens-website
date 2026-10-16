import React, { useState, useEffect, useCallback } from 'react';
    import { supabase } from '@/lib/customSupabaseClient';
    import { useNavigate } from 'react-router-dom';
    import {
      Command,
      CommandEmpty,
      CommandGroup,
      CommandItem,
      CommandList,
      CommandInput,
    } from "@/components/ui/command";
    import {
      DropdownMenu,
      DropdownMenuContent,
      DropdownMenuItem,
      DropdownMenuLabel,
      DropdownMenuSeparator,
      DropdownMenuTrigger,
    } from "@/components/ui/dropdown-menu";
    import { Button } from '@/components/ui/button';
    import { TestTube, ChevronsUpDown, Check, Beaker, FlaskConical, Package, Loader2 } from 'lucide-react';
    import { useDebounce } from '@/hooks/useDebounce';
    import { cn } from '@/lib/utils';
    import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

    const categories = [
      { value: "all", label: "All Products", icon: <Package className="mr-2 h-4 w-4" /> },
      { value: "pH Electrodes", label: "pH Electrodes", icon: <TestTube className="mr-2 h-4 w-4" /> },
      { value: "Ion Selective Electrodes", label: "Ion Selective Electrodes", icon: <Beaker className="mr-2 h-4 w-4" /> },
      { value: "Titration Electrodes", label: "Titration Electrodes", icon: <FlaskConical className="mr-2 h-4 w-4" /> },
    ];

    const ProductSearch = () => {
      const [open, setOpen] = useState(false);
      const [searchTerm, setSearchTerm] = useState('');
      const [selectedCategory, setSelectedCategory] = useState(categories[0]);
      const [results, setResults] = useState([]);
      const [loading, setLoading] = useState(false);
      const navigate = useNavigate();
      const debouncedSearchTerm = useDebounce(searchTerm, 300);

      const fetchProducts = useCallback(async (term, category) => {
        setLoading(true);

        let query = supabase
          .from('products')
          .select('id, name, category');

        if (term.trim()) {
          query = query.ilike('name', `%${term}%`);
        }

        if (category.value !== 'all') {
          query = query.eq('category', category.value);
        }
        
        query = query.limit(10);

        const { data, error } = await query;

        if (error) {
          console.error('Error searching products:', error);
          setResults([]);
        } else {
          setResults(data || []);
        }
        setLoading(false);
      }, []);

      useEffect(() => {
        if (open) {
          fetchProducts(debouncedSearchTerm, selectedCategory);
        } else {
          setResults([]);
        }
      }, [debouncedSearchTerm, selectedCategory, fetchProducts, open]);

      const handleSelectProduct = (product) => {
        navigate(`/product/${product.id}`);
        setOpen(false);
        setSearchTerm('');
      };
      
      const handleCategoryChange = (category) => {
        setSelectedCategory(category);
      };

      const handleOpenChange = (isOpen) => {
        setOpen(isOpen);
        if (!isOpen) {
          setSearchTerm('');
        }
      };

      const currentCategory = categories.find(c => c.value === selectedCategory.value) || categories[0];

      return (
        <Popover open={open} onOpenChange={handleOpenChange}>
          <div className="flex w-full md:w-auto lg:w-[500px] rounded-md shadow-sm border border-input">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="rounded-r-none border-r flex-shrink-0 px-3">
                  <div className="flex items-center">
                    {currentCategory.icon}
                    <span className="hidden md:inline ml-2">{currentCategory.label}</span>
                  </div>
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>Select a category</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {categories.map((category) => (
                  <DropdownMenuItem key={category.value} onSelect={() => handleCategoryChange(category)}>
                    <div className={cn("flex items-center w-full", selectedCategory.value === category.value && "font-bold")}>
                      {category.icon}
                      <span>{category.label}</span>
                      {selectedCategory.value === category.value && <Check className="ml-auto h-4 w-4" />}
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            
            <PopoverTrigger asChild className="w-full">
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-full justify-start rounded-l-none rounded-r-md border-none focus:ring-0 bg-transparent pl-2 pr-4 py-2 h-10 font-normal"
                onClick={() => setOpen(true)}
              >
                <span className="text-muted-foreground">{searchTerm ? searchTerm : `Search in ${selectedCategory.label}...`}</span>
              </Button>
            </PopoverTrigger>
          </div>

          <PopoverContent className="w-[--radix-popover-trigger-width] p-0 mt-2" onOpenAutoFocus={(e) => e.preventDefault()}>
            <Command shouldFilter={false}>
              <CommandInput
                placeholder="Search products..."
                value={searchTerm}
                onValueChange={setSearchTerm}
                className="h-10"
              />
              <CommandList>
                {loading && (
                  <div className="p-4 flex items-center justify-center text-sm text-muted-foreground">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    <span>Loading...</span>
                  </div>
                )}
                {!loading && results.length === 0 && debouncedSearchTerm && (
                  <CommandEmpty>No products found.</CommandEmpty>
                )}
                {!loading && results.length > 0 && (
                  <CommandGroup heading={searchTerm ? "Search Results" : `Top products in ${selectedCategory.label}`}>
                    {results.map((product) => (
                      <CommandItem
                        key={product.id}
                        onSelect={() => handleSelectProduct(product)}
                        value={product.name}
                        className="cursor-pointer"
                      >
                        <TestTube className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>{product.name}</span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      );
    };

    export default ProductSearch;
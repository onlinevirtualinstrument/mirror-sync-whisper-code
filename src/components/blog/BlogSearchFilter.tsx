import React, { useRef, useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { CalendarIcon, Search, SortAsc, SortDesc } from 'lucide-react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import { BlogPost } from '@/components/blog/blog'; // adjust the path if needed
import { getAllBlogPosts } from '@/components/blog/blogService';
import { DateRange } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';


const BlogSearchFilter = ({ onSearch }) => {
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<'newest' | 'oldest' | 'az' | 'za'>('newest');
  const [showCalendar, setShowCalendar] = useState(false);
  const [originalPosts, setOriginalPosts] = useState<BlogPost[]>([]);
const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>([]);
const calendarRef = useRef<HTMLDivElement>(null);



useEffect(() => {
  const handleClickOutside = (event: MouseEvent) => {
    if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
      setShowCalendar(false);
    }
  };

  if (showCalendar) {
    document.addEventListener('mousedown', handleClickOutside);
  }

  return () => {
    document.removeEventListener('mousedown', handleClickOutside);
  };
}, [showCalendar]);

useEffect(() => {
  const fetchPosts = async () => {
    const posts = await getAllBlogPosts(); // or your fetch function
    setOriginalPosts(posts);
    setFilteredPosts(posts);
  };

  fetchPosts();
}, []);
  const [range, setRange] = useState([
    {
      startDate: null,
      endDate: null,
      key: 'selection',
    },
  ]);

  const handleSearch = () => {
    onSearch({
      query,
      sort,
      startDate: range[0].startDate,
      endDate: range[0].endDate,
    });

    
  };

  const toggleSort = () => {
  const nextSort = sort === 'newest'
    ? 'oldest'
    : sort === 'oldest'
    ? 'az'
    : sort === 'az'
    ? 'za'
    : 'newest';

  setSort(nextSort);
  onSearch({ query, sort: nextSort, startDate: range[0]?.startDate, endDate: range[0]?.endDate });
};

const handleDateChange = (ranges) => {
  const newRange = [ranges.selection];
  setRange(newRange);

  // Trigger search immediately when date is picked
  onSearch({
    query,
    sort,
    startDate: newRange[0].startDate,
    endDate: newRange[0].endDate,
  });
};

  const handleClear = () => {
  setQuery('');
  setFilteredPosts(originalPosts); // Reset to all posts
  setQuery('');
setSort('newest');
setRange([{ startDate: null, endDate: null, key: 'selection' }]);

onSearch({ query: '', sort: 'newest', startDate: null, endDate: null });

  setShowCalendar(false);
  setRange([{ startDate: null, endDate: null, key: 'selection' }]); // optional
};

  return (
   
    <motion.div
  initial={{ opacity: 0, y: -8 }}   animate={{ opacity: 1, y: 0 }}
  className="bg-gradient-to-br from-[#F1F0FB] via-white to-[#E5DEFF] border-b-2 border-violet-500 animate-fade-in dark:border-white dark:text-white dark:bg-[#1e1e2f] shadow-md rounded-xl p-4 mb-6 transition-all duration-300"
>
  <div className="grid gap-3 md:grid-cols-[60%_40%] items-center max-w-5xl mx-auto animate-fade-in" style={{ animationDelay: '0.4s' }}>
    {/* Search Input + Button */}
    <div className="grid grid-cols-[1fr_auto] gap-2">
      <Input
  value={query}
  onChange={(e) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    onSearch({ query: newQuery, sort, startDate: range[0]?.startDate, endDate: range[0]?.endDate });
  }}
        placeholder="Search by title, author, content..."
        className="text-sm dark:bg-[#2b2b3b] dark:text-white"
      />
      
    </div>

    {/* Sort, Date, Clear - stack on mobile, inline on md+ */}
    <div className="grid grid-cols-4 gap-2">
      {/* Sort Button */}
      <Button
        onClick={toggleSort}
        variant="outline"
        className="dark:border-white dark:text-white"
      >
        {sort === 'newest' ? <SortDesc size={16} /> :
         sort === 'oldest' ? <SortAsc size={16} /> :
         sort === 'az' ? 'A-Z' : 'Z-A'}
      </Button>

      
      <div className="relative" ref={calendarRef}>
  {/* Calendar Button */}
  <Button
    variant="outline"
    className="dark:border-white dark:text-white"
    onClick={() => setShowCalendar((prev) => !prev)}
  >
    <CalendarIcon className="mr-1 h-4 w-4" />
    {range[0].startDate && range[0].endDate
      ? `${format(range[0].startDate, 'MMM dd')} - ${format(range[0].endDate, 'MMM dd')}`
      : ''}
  </Button>

  {/* Calendar Picker */}
  {showCalendar && (
    <div className="absolute z-50 mt-2 shadow-lg bg-white dark:bg-[#2b2b3b] rounded-lg">
      <DateRange
        editableDateInputs={true}
        onChange={handleDateChange}
        moveRangeOnFirstSelection={false}
        ranges={range}
        maxDate={new Date()}
      />
    </div>
  )}
</div>



      <Button
        onClick={handleSearch}
        className="bg-gradient-to-r from-indigo-500 to-cyan-500 text-white shadow-md"
      >
    
        Search
      </Button>

      {/* Clear Button */}
      <Button
        variant="outline"
        onClick={handleClear}
        className="border border-purple-500 bg-gradient-to-r from-indigo-500 to-cyan-500 dark:border-white text-white hover:bg-gray-100 dark:hover:bg-[#3a3a4a] transition-all"
      >
        Clear
      </Button>
    </div>
  </div>
</motion.div>


  );
};

export default BlogSearchFilter;

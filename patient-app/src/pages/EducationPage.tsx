import { useState } from 'react';
import { Search, Clock, BookOpen, Bookmark, Star } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { mockEducationResources } from '@/lib/mockData';
import { cn } from '@/lib/utils';

const priorityStyles: Record<string, string> = {
  high: 'bg-red-100 text-red-700 border-red-200',
  medium: 'bg-amber-100 text-amber-700 border-amber-200',
  low: 'bg-green-100 text-green-700 border-green-200',
};

export function EducationPage() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'symptoms'>('symptoms');

  const filtered = mockEducationResources.filter((r) => {
    if (search && !r.title.toLowerCase().includes(search.toLowerCase()) && !r.description.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    if (filter === 'symptoms' && r.relatedSymptoms.length === 0) return false;
    return true;
  });

  return (
    <div className="p-6 lg:p-8">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-[#0F172A]">Education Resources</h1>
          <p className="mt-1 text-sm text-[#64748B]">
            Curated articles and guides to help you manage your treatment
          </p>
        </div>

        {/* Search & Filter */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
            <Input
              placeholder="Search resources..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={filter === 'symptoms' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('symptoms')}
            >
              Current Symptoms
            </Button>
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('all')}
            >
              All Resources
            </Button>
          </div>
        </div>

        {/* Resource Cards */}
        <div className="grid gap-4 md:grid-cols-2">
          {filtered.length === 0 ? (
            <div className="col-span-full py-16 text-center">
              <BookOpen className="mx-auto mb-3 h-10 w-10 text-[#64748B]" />
              <p className="text-[#64748B]">No resources found.</p>
            </div>
          ) : (
            filtered.map((resource) => (
              <Card key={resource.id} className="shadow-sm rounded-xl transition-all duration-200 hover:shadow-md">
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-base font-semibold text-[#0F172A] leading-tight">
                        {resource.title}
                      </h3>
                      {resource.isNew && (
                        <Badge className="shrink-0 bg-primary text-white text-xs">New</Badge>
                      )}
                    </div>

                    <p className="text-sm text-[#64748B] leading-relaxed line-clamp-2">
                      {resource.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {resource.category}
                      </Badge>
                      <span className="flex items-center gap-1 text-xs text-[#64748B]">
                        <Clock className="h-3 w-3" />
                        {resource.readTime}
                      </span>
                      {resource.priority === 'high' && (
                        <span className="flex items-center gap-1 text-xs text-amber-600">
                          <Star className="h-3 w-3 fill-amber-500" />
                          Recommended
                        </span>
                      )}
                    </div>

                    <div className="flex gap-2 pt-1">
                      <Button size="sm" className="flex-1">
                        Read Now
                      </Button>
                      <Button size="sm" variant="outline">
                        <Bookmark className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}


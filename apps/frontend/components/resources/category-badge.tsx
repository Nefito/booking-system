import { Badge } from '@/components/ui/badge';
import { ResourceCategory } from '@/lib/types/resource.types';
import { categoryLabels } from '@/lib/constants/categories';

interface CategoryBadgeProps {
  category: ResourceCategory;
  className?: string;
}

export function CategoryBadge({ category, className }: CategoryBadgeProps) {
  const variantMap: Record<ResourceCategory, 'default' | 'secondary' | 'outline'> = {
    'meeting-room': 'default',
    workspace: 'secondary',
    equipment: 'outline',
    venue: 'default',
    vehicle: 'secondary',
  };

  return (
    <Badge variant={variantMap[category]} className={className}>
      {categoryLabels[category]}
    </Badge>
  );
}

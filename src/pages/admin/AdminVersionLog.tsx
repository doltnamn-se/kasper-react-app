
import dynamicIconImports from 'lucide-react/dynamicIconImports';
import { lazy, Suspense } from 'react';

const FilePdfIcon = lazy(dynamicIconImports['file-pdf']);
const FileTextIcon = lazy(dynamicIconImports['file-text']);

// Then in the render method, use:
<Suspense fallback={<div>Loading...</div>}>
  <FilePdfIcon className="mr-1" size={16} />
</Suspense>

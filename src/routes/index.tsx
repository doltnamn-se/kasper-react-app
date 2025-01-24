import { Route, Routes as RouterRoutes } from 'react-router-dom';
import Checklist from '@/pages/Checklist';

export function Routes() {
  return (
    <RouterRoutes>
      <Route path="/" element={<Checklist />} />
      <Route path="/checklist" element={<Checklist />} />
    </RouterRoutes>
  );
}
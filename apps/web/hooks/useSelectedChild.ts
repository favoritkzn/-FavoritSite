'use client';

import { useEffect, useState } from 'react';

interface ChildOption {
  id: string;
  firstName: string;
  lastName: string;
}

export function useSelectedChild(children: ChildOption[]) {
  const [childId, setChildId] = useState('');

  useEffect(() => {
    if (!childId && children[0]?.id) {
      setChildId(children[0].id);
    }
  }, [children, childId]);

  const child = children.find((c) => c.id === childId);

  return { childId, setChildId, child, children };
}

// components/ChatLink.js
'use client';

import { ResearchQuery } from '@prisma/client';
import { Trash } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function ChatLink({
  chat,
  collapsed,
  onDelete,
}: {
  chat: ResearchQuery;
  collapsed: boolean;
  onDelete: () => void;
}) {
  const pathname = usePathname();
  const isActive = pathname === `/results/${chat.id}`;
  const linkClasses = `flex items-center justify-between p-2 rounded hover:bg-teal-600 transition-colors ${
    isActive ? "bg-teal-800 font-semibold" : ""
  }`;

  return (
    <li>
      <div className={linkClasses}>
        <Link
          href={`/results/${chat.id}`}
          className={`flex-1 truncate ${collapsed ? "hidden" : ""}`}
        >
          {chat.enhancedQuery?.slice(0, 25) || "Untitled Query"}
        </Link>
        {!collapsed && (
          <button onClick={onDelete} className="ml-2 p-1 rounded hover:bg-red-600 transition">
            <Trash className="w-4 h-4" />
          </button>
        )}
      </div>
    </li>
  );
}
'use client';

import {useState} from "react";
import Link from "next/link";
import { BookOpen, ChevronLeft, ChevronRight } from "lucide-react";
import ChatLink from "./ChatLink";
import { ResearchQuery } from "@prisma/client";
import { deleteResearchQuery } from "@/actions/researchQuery";
import { useRouter } from "next/navigation";


// Sidebar Component


export default function SidebarContent({ chats }: { chats: ResearchQuery[] }) {
  const [collapsed, setCollapsed] = useState(false);
  const [deleteQuery, setDeleteQuery] = useState<ResearchQuery | null>(null);
  const [loading, setLoading] = useState(false);
   const router = useRouter();

///  console.log("Colapsed:", collapsed);

  const handleDelete = async () => {
    setLoading(true);
    if (!deleteQuery) return;

    try {
      const response = await deleteResearchQuery(deleteQuery.id);

      if (response.success) {
        router.push(`/new`)
        setDeleteQuery(null);
        // Optionally, you can implement a way to refresh the chats list
      } else {
        console.error("Failed to delete");
      }
    } catch (error) {
      console.error("Error deleting query:", error);
    } finally{
      setLoading(false);
    }
  };

  return (
    <>
      <aside
        className={`sticky top-0 flex flex-col bg-gradient-to-b from-teal-700 via-teal-600 to-teal-800 text-white h-screen shadow-lg ${
          collapsed ? "w-20" : "w-64"
        }`}
      >
        {/* Collapse toggle */}
        <button
          className="absolute top-4 right-0 z-50 flex h-8 w-8 items-center justify-center rounded-l bg-teal-800 hover:bg-teal-700"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>

        {/* Header */}
        <div
          className={`flex items-center gap-2 px-4 py-4 font-bold text-lg ${
            collapsed ? "justify-center" : "justify-start"
          }`}
        >
          {!collapsed && <BookOpen className="w-6 h-6" /> }
          {!collapsed && <span>SciLens AI</span>}
        </div>

        {/* View Report */}
        <div className= {`${collapsed ? "mt-4": ""}`} />
        <nav className="mb-4">
          <ul>
            <li>
              <Link
                href="/report"
                className={`flex items-center gap-2 py-2 px-4 rounded hover:bg-teal-600 transition-colors ${
                  collapsed ? "justify-center" : ""
                }`}
              >
                <BookOpen className="w-4 h-4" />
                {!collapsed && <span>View Latest Report</span>}
              </Link>
            </li>
          </ul>
        </nav>

        {/* Recent Queries */}
        <div className="flex-1 overflow-y-auto">
          {!collapsed && (
            <h2 className="text-lg font-semibold mb-2 px-4">Recent Queries</h2>
          )}
          <ul className="space-y-2 px-2">
            {chats.map(chat => (
              <ChatLink
                key={chat.id}
                chat={chat}
                collapsed={collapsed}
                onDelete={() => setDeleteQuery(chat)}
              />
            ))}
          </ul>
        </div>
      </aside>

      {/* Delete Modal */}
    {deleteQuery && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
    <div className="bg-gradient-to-br from-white via-slate-50 to-slate-100 rounded-2xl p-8 w-full max-w-md shadow-2xl transform transition-all duration-300">
      <h3 className="text-xl font-bold text-slate-800 mb-3">
        Delete Query?
      </h3>
      <p className="text-slate-600 mb-6">
        Are you sure you want to delete{" "}
        <span className="font-semibold text-slate-900">
          &quot;{deleteQuery.enhancedQuery}&quot;
        </span>
        ?
      </p>

      <div className="flex justify-center gap-4">
        <button
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white font-medium shadow-md hover:from-red-600 hover:to-red-700 transition"
        >
          Delete
        </button>
        <button
          onClick={handleDelete}
          className="px-5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-700 font-medium shadow-sm hover:bg-slate-50 transition"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
)}

    </>
  );
}
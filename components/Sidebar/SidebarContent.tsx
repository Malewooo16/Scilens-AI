'use client';

import {useState} from "react";
import Link from "next/link";
import { BookOpen, ChevronLeft, ChevronRight, FilePenLine, LogOut, Menu } from "lucide-react"; // Added Menu icon
import ChatLink from "./ChatLink";
import { ResearchQuery } from "@prisma/client";
import { deleteResearchQuery } from "@/actions/researchQuery";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";


// Sidebar Component


export default function SidebarContent({ chats }: { chats: ResearchQuery[] }) {
  const [collapsed, setCollapsed] = useState(false); // For desktop collapse
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // For mobile sidebar open/close
  const [deleteQuery, setDeleteQuery] = useState<ResearchQuery | null>(null);
  const [loading, setLoading] = useState(false);
  const [displayedChats, setDisplayedChats] = useState(chats);
  const router = useRouter();

  const handleDelete = async () => {
    setLoading(true);
    if (!deleteQuery) return;

    try {
      setDisplayedChats(displayedChats.filter(chat => chat.id !== deleteQuery.id));
      await deleteResearchQuery(deleteQuery.id);
      setDeleteQuery(null);
      router.push("/new");
    } catch (error) {
      console.error("Error deleting query:", error);
      setDisplayedChats(chats);
    } finally{
      setLoading(false);
    }
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-teal-700 text-white"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-40 flex flex-col
          bg-gradient-to-b from-teal-700 via-teal-600 to-teal-800 text-white
          h-screen shadow-lg transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
          md:relative md:translate-x-0 md:flex
          ${collapsed ? "md:w-20" : "md:w-64"}
        `}
      >
        {/* Collapse toggle (desktop only) */}
        <button
          className="absolute top-4 right-0 z-50 lg:flex h-8 w-8 items-center justify-center rounded-l bg-teal-800 hover:bg-teal-700 hidden" // Hidden on mobile
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
          {<BookOpen className="w-6 h-6" /> }
          {!collapsed && <span>SciLens AI</span>}
        </div>

        {/* View Report */}
        <div className= {`${collapsed ? "mt-4": ""}`} />
        <nav className="mb-4">
          <ul>
            <li>
              <Link
                href="/new"
                className={`flex items-center gap-2 py-2 px-4 rounded hover:bg-teal-600 transition-colors ${
                  collapsed ? "justify-center" : ""
                }`}
              >
                <FilePenLine className="w-4 h-4" />
                {!collapsed && <span>New Research Query</span>}
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
            {displayedChats.map(chat => (
              <ChatLink
                key={chat.id}
                chat={chat}
                collapsed={collapsed}
                onDelete={() => setDeleteQuery(chat)}
              />
            ))}
          </ul>
        </div>
        <button onClick={()=>signOut()} className=" flex items-center justify-center m-4 px-4 py-2 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white rounded-lg shadow w-auto">
         <LogOut className="mr-4" />  {!collapsed && <p>Logout</p>}
        </button>
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
          onClick={handleDelete}
          disabled={loading}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white font-medium shadow-md hover:from-red-600 hover:to-red-700 transition disabled:opacity-50"
        >
          {loading ? "Deleting..." : "Delete"}
        </button>
        <button
          onClick={() => setDeleteQuery(null)}
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